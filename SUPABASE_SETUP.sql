
-- AGYNT OS: CORE NEURAL BACKEND INITIALIZATION (v2.8)
-- Enhanced for Identity Mapping and Organization Association

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES
CREATE TABLE IF NOT EXISTS public.tenants (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    subdomain text UNIQUE,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
    first_name text,
    last_name text,
    email text,
    job_title text,
    company_name text,
    role text DEFAULT 'User' CHECK (role IN ('Admin', 'VP', 'Director', 'Manager', 'User', 'IT', 'Marketing')),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contacts (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    organization_id uuid DEFAULT uuid_generate_v4(), -- Identity grouping key
    association_id uuid DEFAULT uuid_generate_v4(),  -- Secondary association key
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text,
    company text,
    job_title text,
    website_url text,
    linkedin_url text,
    twitter_handle text,
    instagram_handle text,
    street_address text, -- Added for location mapping
    city text,           -- Added for location mapping
    -- Persona Telemetry
    demeanor text CHECK (demeanor IN ('Analytical', 'Driver', 'Amiable', 'Expressive', 'Not set')),
    pace text CHECK (pace IN ('Slow', 'Moderate', 'Fast', 'Not set')),
    tags text[] DEFAULT '{}',
    -- Intelligence Logic
    executive_summary text,
    research_notes text,
    dynamic_segments jsonb DEFAULT '{}'::jsonb,
    -- Reliability Scoring
    node_integrity integer DEFAULT 0,
    risk_score integer DEFAULT 0,
    last_contacted_at timestamptz,
    status text DEFAULT 'New',
    added_date date DEFAULT CURRENT_DATE,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.research_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text DEFAULT 'Manual Entry',
    status text DEFAULT 'Verified',
    url text,
    details text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.opportunities (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
    title text NOT NULL,
    value numeric DEFAULT 0,
    status text DEFAULT 'Open',
    stage text DEFAULT 'Discovery',
    heat text DEFAULT 'Warm',
    is_recurring boolean DEFAULT false,
    expected_close date,
    notes text,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.system_signals (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    sender_email text,
    target_tenant uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    target_user_email text NOT NULL,
    signal_type text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb
);

-- 3. INTEGRITY LOGIC
CREATE OR REPLACE FUNCTION public.calculate_node_integrity()
RETURNS trigger AS $$
DECLARE
    score integer := 0;
    total_fields integer := 7;
BEGIN
    IF NEW.email IS NOT NULL AND NEW.email != '' THEN score := score + 1; END IF;
    IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN score := score + 1; END IF;
    IF NEW.company IS NOT NULL AND NEW.company != '' THEN score := score + 1; END IF;
    IF NEW.job_title IS NOT NULL AND NEW.job_title != '' THEN score := score + 1; END IF;
    IF NEW.linkedin_url IS NOT NULL AND NEW.linkedin_url != '' THEN score := score + 1; END IF;
    IF NEW.demeanor IS NOT NULL AND NEW.demeanor != 'Not set' THEN score := score + 1; END IF;
    IF NEW.pace IS NOT NULL AND NEW.pace != 'Not set' THEN score := score + 1; END IF;
    
    NEW.node_integrity := ROUND((score::float / total_fields::float) * 100);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_calculate_integrity
    BEFORE INSERT OR UPDATE ON public.contacts
    FOR EACH ROW EXECUTE PROCEDURE public.calculate_node_integrity();

-- 4. REAL-TIME PUBLICATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.research_logs;

-- 5. RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation" ON public.contacts FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
);

CREATE POLICY "Research log isolation" ON public.research_logs FOR ALL USING (
    contact_id IN (SELECT id FROM public.contacts WHERE tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()))
);
