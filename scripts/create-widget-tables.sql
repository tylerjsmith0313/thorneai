-- Widget Chatbots table - stores configuration for embeddable chatbots
CREATE TABLE IF NOT EXISTS widget_chatbots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL DEFAULT 'Website Chat',
  -- Appearance settings
  theme_color VARCHAR(7) DEFAULT '#6366f1',
  position VARCHAR(20) DEFAULT 'bottom-right', -- bottom-right, bottom-left
  welcome_message TEXT DEFAULT 'Hi there! How can I help you today?',
  placeholder_text VARCHAR(255) DEFAULT 'Type your message...',
  bot_name VARCHAR(100) DEFAULT 'Support',
  bot_avatar_url TEXT,
  -- AI settings
  ai_instructions TEXT,
  -- Embed settings
  embed_key VARCHAR(64) NOT NULL UNIQUE,
  -- Behavior settings
  auto_open_delay INTEGER DEFAULT 0, -- seconds, 0 = don't auto open
  collect_email BOOLEAN DEFAULT true,
  require_email BOOLEAN DEFAULT false,
  -- Status
  is_active BOOLEAN DEFAULT true,
  allowed_domains TEXT[] DEFAULT '{}', -- empty = allow all
  -- Analytics
  total_conversations INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Widget Sessions - tracks unique visitors/sessions
CREATE TABLE IF NOT EXISTS widget_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID NOT NULL REFERENCES widget_chatbots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  -- Visitor info
  visitor_id VARCHAR(255) NOT NULL, -- browser fingerprint or generated ID
  visitor_email VARCHAR(255),
  visitor_name VARCHAR(255),
  -- Metadata
  source_url TEXT,
  user_agent TEXT,
  ip_address VARCHAR(45),
  -- Link to contact if matched
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, ended, archived
  unread_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Widget Messages - stores chat messages from the widget
CREATE TABLE IF NOT EXISTS widget_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES widget_sessions(id) ON DELETE CASCADE,
  chatbot_id UUID NOT NULL REFERENCES widget_chatbots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  -- Message content
  content TEXT NOT NULL,
  sender_type VARCHAR(20) NOT NULL, -- 'visitor', 'agent', 'ai'
  -- For agent messages
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Metadata
  metadata JSONB DEFAULT '{}',
  -- Read status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_widget_chatbots_user ON widget_chatbots(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_chatbots_embed_key ON widget_chatbots(embed_key);
CREATE INDEX IF NOT EXISTS idx_widget_sessions_chatbot ON widget_sessions(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_widget_sessions_user ON widget_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_sessions_visitor ON widget_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_widget_sessions_contact ON widget_sessions(contact_id);
CREATE INDEX IF NOT EXISTS idx_widget_sessions_status ON widget_sessions(status);
CREATE INDEX IF NOT EXISTS idx_widget_messages_session ON widget_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_widget_messages_chatbot ON widget_messages(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_widget_messages_created ON widget_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE widget_chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for widget_chatbots
CREATE POLICY "Users can view their own chatbots" ON widget_chatbots
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own chatbots" ON widget_chatbots
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own chatbots" ON widget_chatbots
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own chatbots" ON widget_chatbots
  FOR DELETE USING (user_id = auth.uid());

-- Public access for embed script lookup (by embed_key only)
CREATE POLICY "Public can view chatbots by embed_key" ON widget_chatbots
  FOR SELECT USING (is_active = true);

-- RLS Policies for widget_sessions
CREATE POLICY "Users can view their own sessions" ON widget_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert sessions" ON widget_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own sessions" ON widget_sessions
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for widget_messages
CREATE POLICY "Users can view their own messages" ON widget_messages
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can insert messages" ON widget_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own messages" ON widget_messages
  FOR UPDATE USING (user_id = auth.uid());

-- Enable realtime for widget_messages
ALTER PUBLICATION supabase_realtime ADD TABLE widget_messages;

-- Function to update widget stats
CREATE OR REPLACE FUNCTION update_widget_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update message count
  UPDATE widget_chatbots 
  SET 
    total_messages = total_messages + 1,
    updated_at = NOW()
  WHERE id = NEW.chatbot_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats on new message
DROP TRIGGER IF EXISTS on_widget_message_insert ON widget_messages;
CREATE TRIGGER on_widget_message_insert
  AFTER INSERT ON widget_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_widget_stats();

-- Function to increment conversation count
CREATE OR REPLACE FUNCTION increment_widget_conversations()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE widget_chatbots 
  SET 
    total_conversations = total_conversations + 1,
    updated_at = NOW()
  WHERE id = NEW.chatbot_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on new session
DROP TRIGGER IF EXISTS on_widget_session_insert ON widget_sessions;
CREATE TRIGGER on_widget_session_insert
  AFTER INSERT ON widget_sessions
  FOR EACH ROW
  EXECUTE FUNCTION increment_widget_conversations();
