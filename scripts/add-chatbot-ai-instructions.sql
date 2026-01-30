-- Add ai_instructions column to widget_chatbots if it doesn't exist
ALTER TABLE widget_chatbots ADD COLUMN IF NOT EXISTS ai_instructions TEXT;
