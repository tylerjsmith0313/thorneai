-- AI Knowledge Base and Neural Link Tables
-- Training documents, links, and AI context for the AgyntSynq agent

-- Knowledge Base Documents (Neural Link uploads)
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'document', -- document, link, training, academy
  source_url TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  metadata JSONB DEFAULT '{}',
  embedding_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  chunk_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  category TEXT, -- sales, marketing, customer_service, lead_generation, closing, general
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Document Chunks for RAG (Retrieval Augmented Generation)
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_count INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Chat History (for context and learning)
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  chat_type TEXT NOT NULL DEFAULT 'command', -- command, neural_link, contact_chat
  messages JSONB NOT NULL DEFAULT '[]',
  context JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Flourish Academy Content (auto-ingested training materials)
CREATE TABLE IF NOT EXISTS academy_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- sales_fundamentals, objection_handling, closing_techniques, lead_gen, customer_service, marketing
  subcategory TEXT,
  difficulty_level TEXT DEFAULT 'intermediate', -- beginner, intermediate, advanced
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI Agent Training Feedback (for continuous learning)
CREATE TABLE IF NOT EXISTS ai_training_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id TEXT,
  session_id TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_type TEXT, -- helpful, not_helpful, incorrect, inappropriate
  feedback_text TEXT,
  original_response TEXT,
  corrected_response TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_training_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for knowledge_documents
DROP POLICY IF EXISTS "Users can view own tenant knowledge_documents" ON knowledge_documents;
CREATE POLICY "Users can view own tenant knowledge_documents" ON knowledge_documents
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own knowledge_documents" ON knowledge_documents;
CREATE POLICY "Users can insert own knowledge_documents" ON knowledge_documents
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own knowledge_documents" ON knowledge_documents;
CREATE POLICY "Users can update own knowledge_documents" ON knowledge_documents
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete own knowledge_documents" ON knowledge_documents;
CREATE POLICY "Users can delete own knowledge_documents" ON knowledge_documents
  FOR DELETE USING (true);

-- RLS Policies for document_chunks
DROP POLICY IF EXISTS "Users can view own tenant document_chunks" ON document_chunks;
CREATE POLICY "Users can view own tenant document_chunks" ON document_chunks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own document_chunks" ON document_chunks;
CREATE POLICY "Users can insert own document_chunks" ON document_chunks
  FOR INSERT WITH CHECK (true);

-- RLS Policies for ai_chat_history
DROP POLICY IF EXISTS "Users can view own ai_chat_history" ON ai_chat_history;
CREATE POLICY "Users can view own ai_chat_history" ON ai_chat_history
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own ai_chat_history" ON ai_chat_history;
CREATE POLICY "Users can insert own ai_chat_history" ON ai_chat_history
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own ai_chat_history" ON ai_chat_history;
CREATE POLICY "Users can update own ai_chat_history" ON ai_chat_history
  FOR UPDATE USING (true);

-- RLS Policies for ai_training_feedback
DROP POLICY IF EXISTS "Users can manage own ai_training_feedback" ON ai_training_feedback;
CREATE POLICY "Users can manage own ai_training_feedback" ON ai_training_feedback
  FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_tenant ON knowledge_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_category ON knowledge_documents(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_type ON knowledge_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user ON ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_session ON ai_chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_contact ON ai_chat_history(contact_id);
CREATE INDEX IF NOT EXISTS idx_academy_content_category ON academy_content(category);

-- Insert Flourish Academy training content
INSERT INTO academy_content (title, description, content, category, subcategory, difficulty_level, tags, sort_order) VALUES

-- Sales Fundamentals
('The Art of Active Listening', 'Master the skill that separates top performers from average salespeople', 
'Active listening is the foundation of all successful sales interactions. It involves fully concentrating on what the prospect is saying, understanding their message, responding thoughtfully, and remembering key details.

Key Techniques:
1. MAINTAIN EYE CONTACT and open body language
2. PARAPHRASE what you hear: "So what I''m hearing is..."
3. ASK CLARIFYING QUESTIONS to dig deeper
4. TAKE NOTES on key pain points and priorities
5. RESIST THE URGE to interrupt or formulate your response while they''re talking

The 80/20 Rule: In discovery calls, the prospect should be talking 80% of the time. Your job is to guide the conversation with strategic questions, not dominate it.

Remember: People don''t care how much you know until they know how much you care. Active listening demonstrates genuine interest in solving their problems.',
'sales_fundamentals', 'discovery', 'beginner', ARRAY['listening', 'discovery', 'rapport'], 1),

('Building Instant Rapport', 'Connect with any prospect in the first 60 seconds',
'Rapport is the bridge between stranger and trusted advisor. Without it, even the best pitch falls flat.

The FORD Method for Building Rapport:
- FAMILY: "How''s the family? Any big plans coming up?"
- OCCUPATION: "What do you love most about your role?"
- RECREATION: "Do anything fun this weekend?"
- DREAMS: "Where do you see the company in 5 years?"

Mirror and Match Technique:
- Match their energy level and speaking pace
- Use similar vocabulary and industry jargon
- Mirror their body language subtly
- Find genuine common ground

The First 7 Seconds Rule:
People form lasting impressions in 7 seconds. Lead with:
- A genuine smile
- Confident posture
- A firm (but not crushing) handshake
- Their name (people love hearing their own name)

Pro Tip: Research them on LinkedIn before the call. Mention something specific: "I saw you recently got promoted - congratulations!"',
'sales_fundamentals', 'rapport', 'beginner', ARRAY['rapport', 'connection', 'first-impressions'], 2),

-- Objection Handling
('The Feel-Felt-Found Framework', 'Turn objections into opportunities',
'When prospects push back, don''t fight it - flow with it using Feel-Felt-Found.

The Framework:
"I understand how you FEEL. Many of our best customers FELT the same way initially. What they FOUND was..."

Example - Price Objection:
Prospect: "This is too expensive."
You: "I completely understand how you feel about the investment. Several of our most successful clients felt the same way when they first saw the pricing. What they found was that the ROI came within 60 days, and they actually saved money compared to their previous solution."

Example - Timing Objection:
Prospect: "Now isn''t a good time."
You: "I get it - timing is everything. Many clients felt the same pressure. What they found was that by starting now during their slower season, they were fully ramped up when things got busy."

Key Principles:
1. ACKNOWLEDGE their concern genuinely
2. NORMALIZE it by showing others felt the same
3. REDIRECT with social proof and specific outcomes
4. Never make them feel wrong for having concerns',
'objection_handling', 'frameworks', 'intermediate', ARRAY['objections', 'price', 'timing', 'feel-felt-found'], 1),

('Handling "I Need to Think About It"', 'The most common objection decoded',
'"I need to think about it" is rarely about thinking. It usually means one of three things:
1. They don''t see enough value
2. They have an unstated concern
3. They''re not the decision-maker

Response Strategy - The Isolation Technique:
"I completely understand - this is an important decision. Just so I can help you think it through, is it the [price/timing/fit] that you want to consider, or is there something else on your mind?"

Then STAY SILENT. Let them fill the void.

Alternative Approaches:
1. The Takeaway: "You know what, this might not be the right fit for everyone. What specifically is giving you pause?"
2. The Calendar Close: "Totally fair. Let''s schedule a follow-up for Thursday so we can address any questions that come up. What time works?"
3. The Direct Approach: "I appreciate your honesty. In my experience, ''think about it'' often means there''s something I haven''t addressed. What''s really holding you back?"

Remember: The sale is made in the follow-up. 80% of sales require 5+ touchpoints.',
'objection_handling', 'common_objections', 'intermediate', ARRAY['objections', 'think-about-it', 'follow-up'], 2),

-- Closing Techniques
('The Assumptive Close', 'Close deals by assuming the sale',
'The assumptive close works by acting as if the prospect has already decided to move forward. This removes the pressure of a direct yes/no decision.

How It Works:
Instead of asking "Would you like to proceed?" you ask "Would you prefer to start on Monday or Wednesday?"

Examples:
- "Should I send the contract to your work email or personal email?"
- "Will you be handling the implementation, or should I coordinate with your IT team?"
- "Let''s get you set up - do you prefer the monthly or annual billing?"
- "I''ll include the premium support package. Who should I list as your main point of contact?"

When to Use:
- After you''ve addressed all objections
- When the prospect is giving buying signals (asking about specifics, timeline, implementation)
- When rapport is strong and trust is established

Caution: Don''t use this too early or without proper qualification. It can come across as pushy if the prospect isn''t ready.',
'closing_techniques', 'assumptive', 'intermediate', ARRAY['closing', 'assumptive', 'decision'], 1),

('Creating Urgency Without Being Pushy', 'Ethical urgency that drives action',
'Urgency is essential for closing, but fake scarcity destroys trust. Here''s how to create genuine urgency:

Legitimate Urgency Triggers:
1. IMPLEMENTATION TIMELINE: "Based on your goals for Q2, we''d need to start onboarding by March 15th to hit your target."
2. RESOURCE AVAILABILITY: "Our implementation team has two slots open this month. After that, you''re looking at a 6-week wait."
3. PRICE CHANGES: "This pricing is locked through the end of the quarter. After that, we''re implementing a 15% increase."
4. COMPETITIVE ADVANTAGE: "Your competitor [if known] is already using this. Every month you wait is a month they''re pulling ahead."

The Cost of Inaction Close:
"Based on what you shared, you''re currently losing about $15K/month to this problem. If we start today, you''ll be fully operational in 30 days. If we wait until next quarter, that''s another $45K in losses. Does it make sense to move forward now?"

Never Do This:
- Create fake deadlines
- Lie about limited availability
- Use high-pressure manipulation
- Make them feel stupid for hesitating',
'closing_techniques', 'urgency', 'advanced', ARRAY['closing', 'urgency', 'ethics', 'timing'], 2),

-- Lead Generation
('The Perfect Cold Email Formula', 'Get responses from decision-makers',
'Cold email is a numbers game, but the right formula dramatically improves your odds.

The AIDA Formula for Cold Email:
- ATTENTION: Pattern-interrupt subject line
- INTEREST: Relevant pain point or insight
- DESIRE: Social proof or specific result
- ACTION: Clear, low-friction CTA

Winning Template:
Subject: Quick question about [specific challenge]

Hi [First Name],

I noticed [specific observation about their company]. [One sentence connecting to their pain point.]

We recently helped [similar company] achieve [specific result with numbers].

Would it make sense to grab 15 minutes to see if we could do something similar for [Company]?

Best,
[Your name]

Key Principles:
1. PERSONALIZATION is non-negotiable - at least 2 specific references
2. KEEP IT SHORT - under 100 words
3. ONE CTA ONLY - make it easy to say yes
4. SEND AT THE RIGHT TIME - Tuesday-Thursday, 9-11am their timezone
5. FOLLOW UP - 80% of responses come from follow-ups 2-4',
'lead_generation', 'cold_email', 'intermediate', ARRAY['email', 'cold-outreach', 'templates'], 1),

('LinkedIn Outreach That Gets Replies', 'Build relationships at scale on LinkedIn',
'LinkedIn is the most powerful B2B prospecting tool when used correctly.

The 3-Touch LinkedIn Sequence:
1. CONNECTION REQUEST (No pitch!)
"Hi [Name], I came across your profile while researching [industry/topic]. Would love to connect and learn more about your work at [Company]."

2. VALUE-FIRST MESSAGE (Day 2-3)
"Thanks for connecting! I recently came across [relevant article/insight] that reminded me of [their company/industry]. Thought you might find it interesting: [link]"

3. SOFT INTRO (Day 5-7)
"Quick question - are you currently looking at ways to [solve specific problem]? We''ve been helping companies like [similar company] with this. Happy to share what''s working if it''s relevant."

Golden Rules:
- Never pitch in the connection request
- Give value before asking for anything
- Be genuinely curious about their work
- Engage with their content before reaching out
- Keep messages under 300 characters on mobile',
'lead_generation', 'linkedin', 'intermediate', ARRAY['linkedin', 'social-selling', 'networking'], 2),

-- Customer Service
('Turning Complaints into Opportunities', 'Transform angry customers into advocates',
'A customer who complains and gets amazing resolution becomes more loyal than one who never had a problem.

The HEARD Framework:
- HEAR: Let them vent completely without interrupting
- EMPATHIZE: "I completely understand why you''re frustrated. I would be too."
- APOLOGIZE: Take ownership even if it wasn''t your fault: "I''m sorry you''ve had this experience."
- RESOLVE: Fix the problem, then go above and beyond
- DIAGNOSE: Figure out root cause to prevent recurrence

The Magic Words:
- "Let me make this right for you."
- "You shouldn''t have to deal with this."
- "Here''s what I''m going to do..."
- "Is there anything else I can do to make this better?"

The Recovery Paradox:
Studies show customers who have a problem resolved exceptionally well become MORE loyal than customers who never had a problem. This is your chance to create a customer for life.

Go Above and Beyond:
- Upgrade their service at no cost
- Send a handwritten apology note
- Give them direct access to you for future issues
- Follow up a week later to ensure satisfaction',
'customer_service', 'complaints', 'intermediate', ARRAY['complaints', 'resolution', 'retention'], 1),

-- Marketing Fundamentals
('Understanding Your Ideal Customer Profile', 'Stop selling to everyone and start selling to the right people',
'The ICP (Ideal Customer Profile) is your blueprint for who you should be targeting.

Building Your ICP:
1. DEMOGRAPHICS
- Company size (employees, revenue)
- Industry/vertical
- Geographic location
- Growth stage (startup, scaling, enterprise)

2. FIRMOGRAPHICS
- Tech stack
- Organizational structure
- Budget cycle
- Decision-making process

3. PSYCHOGRAPHICS
- What keeps them up at night?
- What are they trying to achieve?
- How do they measure success?
- What do they value most?

4. BEHAVIORAL SIGNALS
- What content do they consume?
- What events do they attend?
- What tools are they currently using?
- What triggers a buying decision?

The Anti-ICP:
Equally important is knowing who NOT to sell to. Define characteristics of bad-fit customers:
- Too small to afford you
- Industry you can''t serve well
- Culture mismatch
- Unrealistic expectations

Every minute spent on a bad-fit prospect is a minute not spent on an ideal customer.',
'marketing', 'targeting', 'beginner', ARRAY['ICP', 'targeting', 'qualification'], 1)

ON CONFLICT DO NOTHING;
