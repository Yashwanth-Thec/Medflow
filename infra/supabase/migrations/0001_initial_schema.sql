CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  api_key TEXT UNIQUE NOT NULL DEFAULT ('pk_live_' || replace(gen_random_uuid()::text, '-', '')),
  webhook_url TEXT,
  webhook_secret TEXT,
  provider_npi TEXT,
  tax_id TEXT,
  plan TEXT DEFAULT 'trial',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE verification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'calling', 'on_hold', 'processing', 'complete', 'failed', 'needs_review')),
  patient_name TEXT NOT NULL,
  patient_dob DATE NOT NULL,
  member_id TEXT NOT NULL,
  group_number TEXT,
  payer_name TEXT NOT NULL,
  payer_phone TEXT NOT NULL,
  cpt_codes TEXT[] NOT NULL,
  service_type TEXT,
  dos DATE,
  vapi_call_id TEXT,
  call_started_at TIMESTAMPTZ,
  call_ended_at TIMESTAMPTZ,
  call_duration_s INTEGER,
  recording_url TEXT,
  transcript TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE verification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES verification_jobs(id) ON DELETE CASCADE,
  policy_status TEXT CHECK (policy_status IN ('active', 'inactive', 'terminated') OR policy_status IS NULL),
  policy_status_confidence NUMERIC CHECK (policy_status_confidence BETWEEN 0 AND 1 OR policy_status_confidence IS NULL),
  individual_deductible_total NUMERIC,
  individual_deductible_met NUMERIC,
  family_deductible_total NUMERIC,
  family_deductible_met NUMERIC,
  oop_max_individual NUMERIC,
  oop_max_met NUMERIC,
  copay NUMERIC,
  coinsurance_pct NUMERIC,
  prior_auth_required BOOLEAN,
  prior_auth_number TEXT,
  effective_date DATE,
  termination_date DATE,
  reference_number TEXT,
  rep_name TEXT,
  extraction_notes TEXT,
  extracted_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payer_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payer_name TEXT UNIQUE NOT NULL,
  phone_number TEXT NOT NULL,
  ivr_path TEXT,
  avg_hold_min INTEGER,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX verification_jobs_clinic_created_idx ON verification_jobs (clinic_id, created_at DESC);
CREATE INDEX verification_jobs_status_idx ON verification_jobs (status);
CREATE INDEX verification_results_job_idx ON verification_results (job_id);
