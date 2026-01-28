-- Email Messages Table (for storing incoming/outgoing emails)
CREATE TABLE IF NOT EXISTS email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  subject TEXT,
  body_plain TEXT,
  body_html TEXT,
  in_reply_to TEXT,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for email_messages
CREATE INDEX IF NOT EXISTS idx_email_messages_contact_id ON email_messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_organization_id ON email_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_message_id ON email_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_direction ON email_messages(direction);
CREATE INDEX IF NOT EXISTS idx_email_messages_received_at ON email_messages(received_at);

-- Scheduled Tasks Table (for follow-ups, reminders, etc.)
CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('follow_up', 'reminder', 'sequence_step', 'breakup')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for scheduled_tasks
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_organization_id ON scheduled_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_contact_id ON scheduled_tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_status ON scheduled_tasks(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_scheduled_for ON scheduled_tasks(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_task_type ON scheduled_tasks(task_type);

-- Sequences Table (email sequences/campaigns)
CREATE TABLE IF NOT EXISTS sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sequence_type TEXT DEFAULT 'nurture' CHECK (sequence_type IN ('nurture', 'onboarding', 'breakup', 're-engagement')),
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for sequences
CREATE INDEX IF NOT EXISTS idx_sequences_organization_id ON sequences(organization_id);
CREATE INDEX IF NOT EXISTS idx_sequences_is_active ON sequences(is_active);

-- Contact Sequences Table (tracks contact enrollment in sequences)
CREATE TABLE IF NOT EXISTS contact_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES sequences(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  sequence_type TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  current_step INTEGER DEFAULT 0,
  next_step_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contact_id, sequence_id)
);

-- Create indexes for contact_sequences
CREATE INDEX IF NOT EXISTS idx_contact_sequences_contact_id ON contact_sequences(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_sequences_sequence_id ON contact_sequences(sequence_id);
CREATE INDEX IF NOT EXISTS idx_contact_sequences_status ON contact_sequences(status);
CREATE INDEX IF NOT EXISTS idx_contact_sequences_next_step_at ON contact_sequences(next_step_at);

-- Conversation Events Table (tracks all interactions)
CREATE TABLE IF NOT EXISTS conversation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('email_sent', 'email_received', 'email_opened', 'email_clicked', 'call_made', 'call_received', 'meeting_scheduled', 'meeting_completed', 'note_added', 'status_changed')),
  channel TEXT CHECK (channel IN ('email', 'phone', 'meeting', 'chat', 'social')),
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for conversation_events
CREATE INDEX IF NOT EXISTS idx_conversation_events_contact_id ON conversation_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversation_events_organization_id ON conversation_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversation_events_event_type ON conversation_events(event_type);
CREATE INDEX IF NOT EXISTS idx_conversation_events_created_at ON conversation_events(created_at);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Add columns to contacts table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'last_response_at') THEN
    ALTER TABLE contacts ADD COLUMN last_response_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'last_activity_at') THEN
    ALTER TABLE contacts ADD COLUMN last_activity_at TIMESTAMPTZ;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_messages
CREATE POLICY "Users can view their organization's emails" ON email_messages
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert emails for their organization" ON email_messages
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

-- RLS Policies for scheduled_tasks
CREATE POLICY "Users can view their organization's tasks" ON scheduled_tasks
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage their organization's tasks" ON scheduled_tasks
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

-- RLS Policies for sequences
CREATE POLICY "Users can view their organization's sequences" ON sequences
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage their organization's sequences" ON sequences
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

-- RLS Policies for contact_sequences
CREATE POLICY "Users can view their organization's contact sequences" ON contact_sequences
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can manage their organization's contact sequences" ON contact_sequences
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

-- RLS Policies for conversation_events
CREATE POLICY "Users can view their organization's conversation events" ON conversation_events
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert conversation events for their organization" ON conversation_events
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (
    user_id = auth.uid() OR
    organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
