-- Add AI configuration fields to user_settings table
-- Each user gets their own unique AI assistant configuration

-- Add new columns to user_settings for AI personalization
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS ai_name TEXT DEFAULT 'AgyntSynq',
ADD COLUMN IF NOT EXISTS ai_description TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS ai_instructions TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS business_description TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS ai_goals TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS business_goals TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS personal_goals TEXT DEFAULT '';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_ai_name ON user_settings(ai_name);

-- Add comment for documentation
COMMENT ON COLUMN user_settings.ai_name IS 'Custom name for the AI assistant (default: AgyntSynq)';
COMMENT ON COLUMN user_settings.ai_description IS 'User-defined description of their AI assistant';
COMMENT ON COLUMN user_settings.ai_instructions IS 'Custom instructions for how the AI should behave';
COMMENT ON COLUMN user_settings.business_description IS 'Description of the user business for AI context';
COMMENT ON COLUMN user_settings.ai_goals IS 'Goals for using the AI assistant';
COMMENT ON COLUMN user_settings.business_goals IS 'Business goals for AI to help achieve';
COMMENT ON COLUMN user_settings.personal_goals IS 'Personal development goals';
