-- Add contact_id to form_submissions table for linking submissions to contacts
ALTER TABLE form_submissions 
ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_submissions_contact_id ON form_submissions(contact_id);

-- Add user_id if it doesn't exist (for linking to form owner)
ALTER TABLE form_submissions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add index for user_id
CREATE INDEX IF NOT EXISTS idx_form_submissions_user_id ON form_submissions(user_id);
