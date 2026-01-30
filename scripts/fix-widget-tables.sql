-- Drop existing tables if they exist (to fix schema mismatch)
DROP TABLE IF EXISTS widget_messages CASCADE;
DROP TABLE IF EXISTS widget_sessions CASCADE;
DROP TABLE IF EXISTS widget_chatbots CASCADE;

-- Widget Chatbots table - stores configuration for embeddable chatbots
CREATE TABLE widget_chatbots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL DEFAULT 'Website Chat',
  -- Appearance settings
  theme_color VARCHAR(7) DEFAULT '#6366f1',
  welcome_message TEXT DEFAULT 'Hi there! How can I help you today?',
  -- AI settings
  ai_instructions TEXT,
  -- Embed settings
  embed_key VARCHAR(64) NOT NULL UNIQUE,
  -- Status
  is_active BOOLEAN DEFAULT true,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Widget Sessions - tracks unique visitors/sessions
CREATE TABLE widget_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID NOT NULL REFERENCES widget_chatbots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Visitor info
  visitor_id VARCHAR(255) NOT NULL,
  visitor_email VARCHAR(255),
  visitor_name VARCHAR(255),
  -- Metadata
  source_url TEXT,
  user_agent TEXT,
  ip_address VARCHAR(45),
  -- Link to contact if matched
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  unread_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Widget Messages - stores chat messages from the widget
CREATE TABLE widget_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES widget_sessions(id) ON DELETE CASCADE,
  chatbot_id UUID NOT NULL REFERENCES widget_chatbots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Message content
  content TEXT NOT NULL,
  sender_type VARCHAR(20) NOT NULL, -- 'visitor', 'agent', 'ai'
  -- Read status
  is_read BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_widget_chatbots_user ON widget_chatbots(user_id);
CREATE INDEX idx_widget_chatbots_embed_key ON widget_chatbots(embed_key);
CREATE INDEX idx_widget_sessions_chatbot ON widget_sessions(chatbot_id);
CREATE INDEX idx_widget_sessions_user ON widget_sessions(user_id);
CREATE INDEX idx_widget_sessions_contact ON widget_sessions(contact_id);
CREATE INDEX idx_widget_messages_session ON widget_messages(session_id);
CREATE INDEX idx_widget_messages_chatbot ON widget_messages(chatbot_id);
CREATE INDEX idx_widget_messages_created ON widget_messages(created_at DESC);

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
