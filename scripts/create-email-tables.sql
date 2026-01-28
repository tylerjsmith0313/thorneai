-- Email Messages and Automation Tables Migration
-- Uses tenant-based isolation (matches multi-tenant-schema.sql)

-- 1. EMAIL MESSAGES TABLE - Stores all email messages (incoming and outgoing)
CREATE TABLE IF NOT EXISTS email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  -- Email metadata
  message_id TEXT, -- Mailgun message ID
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  to_name TEXT,
  subject TEXT,
  
  -- Email content
  body_plain TEXT,
  body_html TEXT,
  stripped_text TEXT, -- Text without signature/quoted replies
  stripped_signature TEXT,
  
  -- Direction and status
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'sent', 'delivered', 'failed', 'opened', 'clicked', 'bounced', 'complained')),
  
  -- Threading
  in_reply_to TEXT,
  references_header TEXT,
  thread_id TEXT,
  
  -- Attachments stored as JSON array
  attachments JSONB DEFAULT '[]',
  
  -- Mailgun specific data
  mailgun_variables JSONB DEFAULT '{}',
  
  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SCHEDULED TASKS TABLE - For cron job automation
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  
  -- Task details
  task_type TEXT NOT NULL CHECK (task_type IN (
    'send_email', 'send_sms', 'follow_up', 'nurture', 
    'check_engagement', 'update_status', 'send_gift', 'ai_response'
  )),
  payload JSONB NOT NULL DEFAULT '{}',
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  
  -- Execution tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  result JSONB,
  
  -- Metadata
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SEQUENCES TABLE - Email/outreach sequences
CREATE TABLE IF NOT EXISTS sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Sequence configuration
  steps JSONB NOT NULL DEFAULT '[]', -- Array of step objects with templates, delays, channels
  is_active BOOLEAN DEFAULT true,
  
  -- Stats
  total_enrolled INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  total_replied INTEGER DEFAULT 0,
  
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CONTACT SEQUENCES TABLE - Links contacts to sequences
CREATE TABLE IF NOT EXISTS contact_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  
  -- Progress tracking
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'replied', 'bounced', 'unsubscribed')),
  
  -- Timing
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  next_step_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Stats
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(contact_id, sequence_id)
);

-- 5. CONVERSATION EVENTS TABLE - Track all events in conversations
CREATE TABLE IF NOT EXISTS conversation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL CHECK (event_type IN (
    'email_received', 'email_sent', 'email_opened', 'email_clicked',
    'sms_received', 'sms_sent', 'call_logged', 'meeting_scheduled',
    'status_changed', 'note_added', 'task_created', 'ai_action'
  )),
  
  event_data JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NOTIFICATIONS TABLE - User notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'action_required')),
  
  -- Related entities
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Action
  action_url TEXT,
  action_label TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_messages_tenant_id ON email_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_contact_id ON email_messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_conversation_id ON email_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_direction ON email_messages(direction);
CREATE INDEX IF NOT EXISTS idx_email_messages_received_at ON email_messages(received_at);
CREATE INDEX IF NOT EXISTS idx_email_messages_thread_id ON email_messages(thread_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_tenant_id ON scheduled_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON scheduled_tasks(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_scheduled_for ON scheduled_tasks(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_task_type ON scheduled_tasks(task_type);

CREATE INDEX IF NOT EXISTS idx_sequences_tenant_id ON sequences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contact_sequences_tenant_id ON contact_sequences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contact_sequences_contact_id ON contact_sequences(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_sequences_status ON contact_sequences(status);
CREATE INDEX IF NOT EXISTS idx_contact_sequences_next_step_at ON contact_sequences(next_step_at);

CREATE INDEX IF NOT EXISTS idx_conversation_events_tenant_id ON conversation_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversation_events_conversation_id ON conversation_events(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_events_created_at ON conversation_events(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable RLS
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_messages
DROP POLICY IF EXISTS "Tenant users can view email messages" ON email_messages;
CREATE POLICY "Tenant users can view email messages" ON email_messages
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

DROP POLICY IF EXISTS "Tenant users can insert email messages" ON email_messages;
CREATE POLICY "Tenant users can insert email messages" ON email_messages
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

DROP POLICY IF EXISTS "Tenant users can update email messages" ON email_messages;
CREATE POLICY "Tenant users can update email messages" ON email_messages
  FOR UPDATE USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

-- RLS Policies for scheduled_tasks
DROP POLICY IF EXISTS "Tenant users can view scheduled tasks" ON scheduled_tasks;
CREATE POLICY "Tenant users can view scheduled tasks" ON scheduled_tasks
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

DROP POLICY IF EXISTS "Tenant users can manage scheduled tasks" ON scheduled_tasks;
CREATE POLICY "Tenant users can manage scheduled tasks" ON scheduled_tasks
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

-- RLS Policies for sequences
DROP POLICY IF EXISTS "Tenant users can view sequences" ON sequences;
CREATE POLICY "Tenant users can view sequences" ON sequences
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

DROP POLICY IF EXISTS "Tenant users can manage sequences" ON sequences;
CREATE POLICY "Tenant users can manage sequences" ON sequences
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

-- RLS Policies for contact_sequences
DROP POLICY IF EXISTS "Tenant users can view contact sequences" ON contact_sequences;
CREATE POLICY "Tenant users can view contact sequences" ON contact_sequences
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

DROP POLICY IF EXISTS "Tenant users can manage contact sequences" ON contact_sequences;
CREATE POLICY "Tenant users can manage contact sequences" ON contact_sequences
  FOR ALL USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

-- RLS Policies for conversation_events
DROP POLICY IF EXISTS "Tenant users can view conversation events" ON conversation_events;
CREATE POLICY "Tenant users can view conversation events" ON conversation_events
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

DROP POLICY IF EXISTS "Tenant users can insert conversation events" ON conversation_events;
CREATE POLICY "Tenant users can insert conversation events" ON conversation_events
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid())
    OR tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Updated at triggers (uses existing update_updated_at_column function)
DROP TRIGGER IF EXISTS update_email_messages_updated_at ON email_messages;
CREATE TRIGGER update_email_messages_updated_at BEFORE UPDATE ON email_messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scheduled_tasks_updated_at ON scheduled_tasks;
CREATE TRIGGER update_scheduled_tasks_updated_at BEFORE UPDATE ON scheduled_tasks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sequences_updated_at ON sequences;
CREATE TRIGGER update_sequences_updated_at BEFORE UPDATE ON sequences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_sequences_updated_at ON contact_sequences;
CREATE TRIGGER update_contact_sequences_updated_at BEFORE UPDATE ON contact_sequences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
