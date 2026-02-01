-- Comprehensive schema update for full app functionality
-- Adds missing fields for contacts, calendar events, research, opportunities

-- ============================================
-- 1. CONTACT PROFILE FIELDS
-- ============================================

-- Add profile/summary fields to contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS hobbies TEXT[] DEFAULT '{}';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS demeanor TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS communication_pace TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS preferred_channel TEXT DEFAULT 'Email';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS outreach_budget INTEGER DEFAULT 100;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS outreach_channels TEXT[] DEFAULT '{"Email", "LinkedIn"}';

-- Address fields
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS street_address TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'USA';

-- Social media fields
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS instagram_handle TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tiktok_handle TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS website_url TEXT;

-- ============================================
-- 2. CALENDAR/EVENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  user_id UUID NOT NULL,
  contact_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'call', 'zoom', 'task', 'reminder', 'follow_up')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 30,
  location TEXT,
  meeting_url TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  attendees JSONB DEFAULT '[]',
  heat_score INTEGER DEFAULT 50,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_tenant_id ON calendar_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_contact_id ON calendar_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);

-- RLS for calendar_events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their calendar events" ON calendar_events;
CREATE POLICY "Users can view their calendar events" ON calendar_events
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert calendar events" ON calendar_events;
CREATE POLICY "Users can insert calendar events" ON calendar_events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their calendar events" ON calendar_events;
CREATE POLICY "Users can update their calendar events" ON calendar_events
  FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete their calendar events" ON calendar_events;
CREATE POLICY "Users can delete their calendar events" ON calendar_events
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- 3. RESEARCH TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS contact_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  contact_id UUID NOT NULL,
  source TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('linkedin', 'press_release', 'email_verification', 'company_news', 'social_media', 'manual', 'api')),
  status TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('verified', 'pending', 'rejected', 'needs_review')),
  detail TEXT,
  source_url TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_research_contact_id ON contact_research(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_research_tenant_id ON contact_research(tenant_id);

-- RLS for contact_research
ALTER TABLE contact_research ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view contact research" ON contact_research;
CREATE POLICY "Users can view contact research" ON contact_research
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert contact research" ON contact_research;
CREATE POLICY "Users can insert contact research" ON contact_research
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update contact research" ON contact_research;
CREATE POLICY "Users can update contact research" ON contact_research
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ============================================
-- 4. OPPORTUNITIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  user_id UUID NOT NULL,
  contact_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  value DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  stage TEXT NOT NULL DEFAULT 'discovery' CHECK (stage IN ('discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  probability INTEGER DEFAULT 50,
  expected_close_date DATE,
  actual_close_date DATE,
  product_id UUID,
  notes TEXT,
  heat_status TEXT DEFAULT 'warm' CHECK (heat_status IN ('hot', 'warm', 'cold')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_tenant_id ON opportunities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_contact_id ON opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);

-- RLS for opportunities
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view opportunities" ON opportunities;
CREATE POLICY "Users can view opportunities" ON opportunities
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can insert opportunities" ON opportunities;
CREATE POLICY "Users can insert opportunities" ON opportunities
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update opportunities" ON opportunities;
CREATE POLICY "Users can update opportunities" ON opportunities
  FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete opportunities" ON opportunities;
CREATE POLICY "Users can delete opportunities" ON opportunities
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================
-- 5. USER SETTINGS - Add missing fields
-- ============================================

ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS response_time TEXT DEFAULT '5-10 Minutes';
