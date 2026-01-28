-- Multi-Tenant Schema Migration
-- This creates the tenant-based isolation system with per-seat pricing

-- 1. TENANTS TABLE - Each company/organization
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  seat_count INTEGER DEFAULT 1,
  max_seats INTEGER DEFAULT 5,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TENANT_USERS TABLE - Links users to tenants with roles
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  permissions JSONB DEFAULT '{"contacts": {"view": true, "edit": true, "delete": false}, "deals": {"view": true, "edit": true, "delete": false}, "settings": {"view": false, "edit": false}}',
  is_active BOOLEAN DEFAULT true,
  invited_by UUID,
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id),
  UNIQUE(tenant_id, email)
);

-- 3. INVITATIONS TABLE - Pending user invites
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  invited_by UUID NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

-- 4. Add tenant_id to existing tables
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS assigned_to UUID;

ALTER TABLE deals ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS assigned_to UUID;

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE activities ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE products ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_tenant_id ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON contacts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deals_tenant_id ON deals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activities_tenant_id ON activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id);

-- 6. RLS Policies for multi-tenancy

-- Tenants policies
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their tenants" ON tenants;
CREATE POLICY "Users can view their tenants" ON tenants
  FOR SELECT USING (
    id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR id = '00000000-0000-0000-0000-000000000001'::uuid -- Preview tenant
  );

DROP POLICY IF EXISTS "Admins can update their tenant" ON tenants;
CREATE POLICY "Admins can update their tenant" ON tenants
  FOR UPDATE USING (
    id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Tenant users policies
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tenant members" ON tenant_users;
CREATE POLICY "Users can view tenant members" ON tenant_users
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users tu WHERE tu.user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

DROP POLICY IF EXISTS "Admins can manage tenant users" ON tenant_users;
CREATE POLICY "Admins can manage tenant users" ON tenant_users
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users tu WHERE tu.user_id = auth.uid() AND tu.role = 'admin')
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

-- Update contacts RLS for tenant isolation
DROP POLICY IF EXISTS "Tenant users can view contacts" ON contacts;
CREATE POLICY "Tenant users can view contacts" ON contacts
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
    OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

DROP POLICY IF EXISTS "Tenant users can insert contacts" ON contacts;
CREATE POLICY "Tenant users can insert contacts" ON contacts
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
    OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

DROP POLICY IF EXISTS "Tenant users can update contacts" ON contacts;
CREATE POLICY "Tenant users can update contacts" ON contacts
  FOR UPDATE USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
    OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

DROP POLICY IF EXISTS "Tenant users can delete contacts" ON contacts;
CREATE POLICY "Tenant users can delete contacts" ON contacts
  FOR DELETE USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users tu WHERE tu.user_id = auth.uid() 
      AND (tu.role = 'admin' OR (tu.permissions->'contacts'->>'delete')::boolean = true))
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
    OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

-- Similar policies for deals
DROP POLICY IF EXISTS "Tenant users can view deals" ON deals;
CREATE POLICY "Tenant users can view deals" ON deals
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
    OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

DROP POLICY IF EXISTS "Tenant users can insert deals" ON deals;
CREATE POLICY "Tenant users can insert deals" ON deals
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
    OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

DROP POLICY IF EXISTS "Tenant users can update deals" ON deals;
CREATE POLICY "Tenant users can update deals" ON deals
  FOR UPDATE USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
    OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
  );

-- 7. Create preview tenant for development
INSERT INTO tenants (id, name, slug, subscription_status, plan, seat_count, max_seats)
VALUES ('00000000-0000-0000-0000-000000000001', 'Preview Organization', 'preview', 'active', 'professional', 5, 10)
ON CONFLICT (id) DO NOTHING;

-- 8. Create preview tenant user
INSERT INTO tenant_users (id, tenant_id, user_id, email, full_name, role)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'preview@example.com',
  'Preview User',
  'admin'
)
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- 9. Update existing contacts to belong to preview tenant
UPDATE contacts SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE deals SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE conversations SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE activities SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;
UPDATE products SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;

-- 10. Function to get current user's tenant
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT tenant_id FROM tenant_users 
    WHERE user_id = auth.uid() 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
