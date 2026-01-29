-- Seed sample data for AgyntSynq CRM
-- This script inserts realistic sample data for testing and demonstration
-- Run this AFTER running create-tables.sql

-- Note: This script uses a placeholder user_id that should be replaced
-- with actual auth user IDs after users sign up. For development, we'll
-- create sample data that references the first authenticated user.

-- First, let's create a function to get or create a demo user
-- This will be used if no auth users exist yet
DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  -- Try to get an existing user
  SELECT id INTO demo_user_id FROM auth.users LIMIT 1;
  
  -- If no user exists, we'll skip seeding (user needs to sign up first)
  IF demo_user_id IS NULL THEN
    RAISE NOTICE 'No authenticated users found. Please sign up first, then run this seed script.';
    RETURN;
  END IF;

  -- Ensure user exists in users table
  INSERT INTO users (id, email, first_name, last_name, company, job_title)
  SELECT 
    demo_user_id,
    (SELECT email FROM auth.users WHERE id = demo_user_id),
    'Demo',
    'User',
    'AgyntSynq Solutions',
    'Sales Director'
  ON CONFLICT (id) DO NOTHING;

  -- Insert sample contacts
  INSERT INTO contacts (user_id, first_name, last_name, email, company, job_title, phone, status, source, engagement_score, added_date, last_contact_date) VALUES
    (demo_user_id, 'Sarah', 'Chen', 'sarah.chen@acmecorp.com', 'Acme Corp', 'VP of Sales', '+1 (555) 123-4567', 'Hot', 'LinkedIn', 85, '2024-01-05', NOW() - INTERVAL '2 days'),
    (demo_user_id, 'Michael', 'Torres', 'm.torres@techventures.io', 'TechVentures LLC', 'CTO', '+1 (555) 234-5678', 'Withering', 'Referral', 45, '2023-12-15', NOW() - INTERVAL '20 days'),
    (demo_user_id, 'Emily', 'Watson', 'emily.w@globalstart.com', 'GlobalStart Inc', 'CEO', '+1 (555) 345-6789', 'New', 'Trade Show', 60, '2024-01-18', NOW() - INTERVAL '1 day'),
    (demo_user_id, 'James', 'Park', 'jpark@innovatepartners.co', 'Innovate Partners', 'Director of Operations', '+1 (555) 456-7890', 'Withering', 'Cold Outreach', 30, '2023-11-28', NOW() - INTERVAL '25 days'),
    (demo_user_id, 'Rachel', 'Kumar', 'r.kumar@summitsolutions.net', 'Summit Solutions', 'Product Manager', '+1 (555) 567-8901', 'Dead', 'Website', 10, '2023-10-15', NOW() - INTERVAL '50 days'),
    (demo_user_id, 'David', 'Martinez', 'david.m@nexgenlabs.io', 'NexGen Labs', 'Founder', '+1 (555) 678-9012', 'Hot', 'Conference', 90, '2024-01-02', NOW() - INTERVAL '1 day'),
    (demo_user_id, 'Lisa', 'Anderson', 'l.anderson@dataflow.com', 'DataFlow Systems', 'VP Engineering', '+1 (555) 789-0123', 'Retouch', 'LinkedIn', 55, '2023-12-10', NOW() - INTERVAL '12 days'),
    (demo_user_id, 'Kevin', 'Nguyen', 'k.nguyen@cloudscale.pro', 'CloudScale Pro', 'Head of Growth', '+1 (555) 890-1234', 'Recapture', 'Referral', 40, '2023-11-05', NOW() - INTERVAL '18 days'),
    (demo_user_id, 'Anna', 'Petrov', 'anna.p@enterprise.co', 'Enterprise Solutions', 'CMO', '+1 (555) 901-2345', 'Hot', 'Webinar', 88, '2024-01-12', NOW() - INTERVAL '2 days'),
    (demo_user_id, 'Tom', 'Williams', 't.williams@scaleup.io', 'ScaleUp Inc', 'Sales Manager', '+1 (555) 012-3456', 'Needs Update', 'Website', 50, '2023-12-20', NOW() - INTERVAL '15 days'),
    (demo_user_id, 'Maria', 'Garcia', 'maria.g@fusion.tech', 'Fusion Technologies', 'COO', '+1 (555) 111-2222', 'New', 'LinkedIn', 70, '2024-01-19', NOW());

  -- Insert sample deals (referencing contacts by getting their IDs)
  INSERT INTO deals (user_id, contact_id, client_name, amount, status, is_monthly_recurring, expected_close_date, actual_close_date, notes) VALUES
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'sarah.chen@acmecorp.com' AND user_id = demo_user_id), 'Acme Corp', 25000.00, 'closed-won', false, '2024-01-15', '2024-01-12', 'Enterprise license deal'),
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'm.torres@techventures.io' AND user_id = demo_user_id), 'TechVentures LLC', 15500.00, 'open', true, '2024-02-28', NULL, 'Monthly SaaS subscription'),
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'emily.w@globalstart.com' AND user_id = demo_user_id), 'GlobalStart Inc', 32000.00, 'closed-won', false, '2024-01-20', '2024-01-18', 'Consulting engagement'),
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'jpark@innovatepartners.co' AND user_id = demo_user_id), 'Innovate Partners', 8500.00, 'open', false, '2024-03-10', NULL, 'Pilot program'),
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'r.kumar@summitsolutions.net' AND user_id = demo_user_id), 'Summit Solutions', 12000.00, 'closed-lost', false, '2024-01-08', NULL, 'Lost to competitor'),
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'david.m@nexgenlabs.io' AND user_id = demo_user_id), 'NexGen Labs', 45000.00, 'open', false, '2024-04-15', NULL, 'Large enterprise deal'),
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'l.anderson@dataflow.com' AND user_id = demo_user_id), 'DataFlow Systems', 18000.00, 'closed-won', true, '2024-01-25', '2024-01-22', 'Annual contract'),
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'k.nguyen@cloudscale.pro' AND user_id = demo_user_id), 'CloudScale Pro', 22000.00, 'closed-lost', false, '2024-01-30', NULL, 'Budget constraints');

  -- Insert sample conversations
  INSERT INTO conversations (user_id, contact_id, channel, status, unread_count, last_message, last_active) VALUES
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'sarah.chen@acmecorp.com' AND user_id = demo_user_id), 'Email', 'responded', 0, 'Looking forward to the demo tomorrow!', NOW() - INTERVAL '2 hours'),
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'david.m@nexgenlabs.io' AND user_id = demo_user_id), 'LinkedIn', 'awaiting_reply', 1, 'Can we schedule a follow-up call?', NOW() - INTERVAL '6 hours'),
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'anna.p@enterprise.co' AND user_id = demo_user_id), 'SMS', 'active', 0, 'AI is handling the initial outreach...', NOW() - INTERVAL '1 day'),
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'l.anderson@dataflow.com' AND user_id = demo_user_id), 'Email', 'awaiting_reply', 2, 'Let me review the proposal and get back to you.', NOW() - INTERVAL '3 days'),
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'emily.w@globalstart.com' AND user_id = demo_user_id), 'WhatsApp', 'responded', 0, 'Thanks for the quick response!', NOW() - INTERVAL '4 hours');

  -- Insert sample messages for conversations
  INSERT INTO messages (conversation_id, sender_type, content, message_type, is_read, created_at)
  SELECT 
    c.id,
    'user',
    'Hi, I wanted to follow up on our previous discussion about the enterprise package.',
    'email',
    true,
    NOW() - INTERVAL '3 days'
  FROM conversations c
  JOIN contacts ct ON c.contact_id = ct.id
  WHERE ct.email = 'sarah.chen@acmecorp.com' AND c.user_id = demo_user_id;

  INSERT INTO messages (conversation_id, sender_type, content, message_type, is_read, created_at)
  SELECT 
    c.id,
    'contact',
    'Looking forward to the demo tomorrow!',
    'email',
    true,
    NOW() - INTERVAL '2 hours'
  FROM conversations c
  JOIN contacts ct ON c.contact_id = ct.id
  WHERE ct.email = 'sarah.chen@acmecorp.com' AND c.user_id = demo_user_id;

  -- Insert sample products
  INSERT INTO products (user_id, name, pitch_context, classification, retail_price, cost, volume, billing_interval, is_deployed) VALUES
    (demo_user_id, 'AgyntSynq Pro', 'Enterprise-grade AI sales assistant with full automation capabilities', 'SaaS', 499.00, 50.00, 1, 'monthly', true),
    (demo_user_id, 'AgyntSynq Starter', 'Perfect for small teams getting started with AI-powered sales', 'SaaS', 99.00, 20.00, 1, 'monthly', true),
    (demo_user_id, 'Implementation Package', 'Full onboarding and training for enterprise clients', 'Service', 5000.00, 2000.00, 1, 'one-time', true),
    (demo_user_id, 'Annual Enterprise License', 'Unlimited users with dedicated support', 'Subscription', 4999.00, 500.00, 1, 'annual', true),
    (demo_user_id, 'Sales Strategy Consulting', '4-week intensive sales optimization program', 'Consulting', 15000.00, 5000.00, 1, 'one-time', false);

  -- Insert sample knowledge sources
  INSERT INTO knowledge_sources (user_id, name, type, source_url, content, is_active) VALUES
    (demo_user_id, 'Company Overview', 'document', NULL, 'AgyntSynq is a leading provider of AI-powered sales automation solutions...', true),
    (demo_user_id, 'Product Documentation', 'url', 'https://docs.agyntsynq.com', NULL, true),
    (demo_user_id, 'Sales Playbook', 'pdf', 'https://files.agyntsynq.com/playbook.pdf', NULL, true),
    (demo_user_id, 'Competitor Analysis', 'text', NULL, 'Key differentiators: AI-first approach, seamless CRM integration, autonomous outreach...', true);

  -- Insert sample activities
  INSERT INTO activities (user_id, contact_id, deal_id, type, title, detail, created_at) VALUES
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'sarah.chen@acmecorp.com' AND user_id = demo_user_id), (SELECT id FROM deals WHERE client_name = 'Acme Corp' AND user_id = demo_user_id), 'Human', 'Deal Closed', 'Successfully closed the Acme Corp deal for $25,000', NOW() - INTERVAL '10 days'),
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'david.m@nexgenlabs.io' AND user_id = demo_user_id), NULL, 'AI', 'AI Outreach Sent', 'AI sent personalized LinkedIn message', NOW() - INTERVAL '1 day'),
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'anna.p@enterprise.co' AND user_id = demo_user_id), NULL, 'Gift', 'Gift Sent', 'Personalized gift box delivered to Anna', NOW() - INTERVAL '5 days'),
    (demo_user_id, (SELECT id FROM contacts WHERE email = 'm.torres@techventures.io' AND user_id = demo_user_id), NULL, 'System', 'Status Changed', 'Contact status changed from Hot to Withering', NOW() - INTERVAL '3 days'),
    (demo_user_id, NULL, NULL, 'Update', 'Settings Updated', 'Automation mode changed to Full Auto', NOW() - INTERVAL '7 days');

  -- Ensure user_settings exists for demo user
  INSERT INTO user_settings (user_id)
  VALUES (demo_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE 'Sample data seeded successfully for user %', demo_user_id;
END $$;
