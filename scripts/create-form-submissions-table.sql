-- Create form_submissions table to store submissions from embedded forms
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES creative_assets(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  source_url TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index for faster lookups
  CONSTRAINT fk_form FOREIGN KEY (form_id) REFERENCES creative_assets(id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_tenant_id ON form_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions(created_at DESC);

-- Enable RLS
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view submissions for forms in their tenant
CREATE POLICY "Users can view their tenant's form submissions"
  ON form_submissions
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Anyone can insert (for public form submissions)
CREATE POLICY "Anyone can submit to forms"
  ON form_submissions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can delete submissions in their tenant
CREATE POLICY "Users can delete their tenant's form submissions"
  ON form_submissions
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );
