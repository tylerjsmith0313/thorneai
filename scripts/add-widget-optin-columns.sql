-- Add opt-in columns to widget_sessions table
ALTER TABLE widget_sessions 
ADD COLUMN IF NOT EXISTS visitor_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS opt_in_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS opt_in_sms BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS opt_in_phone BOOLEAN DEFAULT false;

-- Add opt-in columns to contacts table if they don't exist
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS opt_in_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS opt_in_sms BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS opt_in_phone BOOLEAN DEFAULT false;

-- Add source column to contacts if it doesn't exist
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS source VARCHAR(50);
