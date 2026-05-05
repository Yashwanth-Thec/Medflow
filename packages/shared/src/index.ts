export const JOB_STATUSES = [
  "queued",
  "calling",
  "on_hold",
  "processing",
  "complete",
  "failed",
  "needs_review",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export interface VerificationJobInput {
  patient_name: string;
  patient_dob: string;
  member_id: string;
  group_number?: string;
  payer_name: string;
  payer_phone?: string;
  cpt_codes: string[];
  service_type?: string;
  dos?: string;
  webhook_url?: string;
}

export interface VerificationResult {
  policy_status: "active" | "inactive" | "terminated" | null;
  policy_status_confidence: number | null;
  individual_deductible_total: number | null;
  individual_deductible_met: number | null;
  family_deductible_total: number | null;
  family_deductible_met: number | null;
  oop_max_individual: number | null;
  oop_max_met: number | null;
  copay: number | null;
  coinsurance_pct: number | null;
  prior_auth_required: boolean | null;
  prior_auth_number: string | null;
  effective_date: string | null;
  termination_date: string | null;
  reference_number: string | null;
  rep_name: string | null;
  extraction_notes: string | null;
}

export interface JobWithResult {
  job_id: string;
  status: JobStatus;
  created_at: string;
  call_duration_s?: number | null;
  recording_url?: string | null;
  transcript?: string | null;
  error_message?: string | null;
  results?: VerificationResult | null;
}
