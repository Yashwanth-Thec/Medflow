import crypto from "node:crypto";

type JobStatus = "queued" | "calling" | "on_hold" | "processing" | "complete" | "failed" | "needs_review";

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

interface VerificationResult {
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

export interface LocalVerificationJob {
  id: string;
  clinic_id: string;
  status: JobStatus;
  input: VerificationJobInput;
  created_at: string;
  updated_at: string;
  call_duration_s: number | null;
  recording_url: string | null;
  transcript: string | null;
  error_message: string | null;
  results: VerificationResult | null;
}

const jobs = new Map<string, LocalVerificationJob>();

export function createLocalJob(clinicId: string, input: VerificationJobInput) {
  const now = new Date().toISOString();
  const job: LocalVerificationJob = {
    id: crypto.randomUUID(),
    clinic_id: clinicId,
    status: "queued",
    input,
    created_at: now,
    updated_at: now,
    call_duration_s: null,
    recording_url: null,
    transcript: null,
    error_message: null,
    results: null,
  };

  jobs.set(job.id, job);
  scheduleDemoCompletion(job.id);
  return job;
}

export function listLocalJobs(clinicId: string) {
  return [...jobs.values()]
    .filter((job) => job.clinic_id === clinicId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getLocalJob(jobId: string, clinicId: string) {
  const job = jobs.get(jobId);
  if (!job || job.clinic_id !== clinicId) {
    return null;
  }

  return job;
}

export function markLocalJobFromVapi(params: {
  vapiCallId?: string;
  transcript?: string;
  recordingUrl?: string;
}) {
  const latest = [...jobs.values()].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  if (!latest) {
    return null;
  }

  latest.status = "processing";
  latest.transcript = params.transcript ?? latest.transcript;
  latest.recording_url = params.recordingUrl ?? latest.recording_url;
  latest.updated_at = new Date().toISOString();
  return latest;
}

export function toApiJob(job: LocalVerificationJob) {
  return {
    job_id: job.id,
    status: job.status,
    created_at: job.created_at,
    call_duration_s: job.call_duration_s,
    recording_url: job.recording_url,
    transcript: job.transcript,
    error_message: job.error_message,
    input: job.input,
    results: job.results,
  };
}

function scheduleDemoCompletion(jobId: string) {
  setTimeout(() => updateStatus(jobId, "calling"), 500);
  setTimeout(() => updateStatus(jobId, "processing"), 1_500);
  setTimeout(() => completeDemoJob(jobId), 2_500);
}

function updateStatus(jobId: string, status: JobStatus) {
  const job = jobs.get(jobId);
  if (!job || job.status === "complete") {
    return;
  }

  job.status = status;
  job.updated_at = new Date().toISOString();
}

function completeDemoJob(jobId: string) {
  const job = jobs.get(jobId);
  if (!job) {
    return;
  }

  job.status = "complete";
  job.call_duration_s = 487;
  job.recording_url = "https://example.com/demo-recording.mp3";
  job.transcript = buildDemoTranscript(job.input);
  job.results = buildDemoResult();
  job.updated_at = new Date().toISOString();
}

function buildDemoTranscript(input: VerificationJobInput) {
  return [
    "Agent: This call may be recorded for quality and verification purposes.",
    `Agent: I am verifying benefits for ${input.patient_name}, DOB ${input.patient_dob}, member ID ${input.member_id}.`,
    "Rep: The policy is active, effective 2026-01-01. No termination date is listed.",
    "Rep: Individual deductible is $1,500 with $340 met. Family deductible is $3,000 with $680 met.",
    "Rep: Individual out-of-pocket max is $5,000 with $900 met. PT has 20 percent coinsurance after deductible.",
    "Rep: No prior authorization is required. My name is Marcus and the reference number is REF20260505-884421.",
  ].join("\n");
}

function buildDemoResult(): VerificationResult {
  return {
    policy_status: "active",
    policy_status_confidence: 0.96,
    individual_deductible_total: 1500,
    individual_deductible_met: 340,
    family_deductible_total: 3000,
    family_deductible_met: 680,
    oop_max_individual: 5000,
    oop_max_met: 900,
    copay: null,
    coinsurance_pct: 0.2,
    prior_auth_required: false,
    prior_auth_number: null,
    effective_date: "2026-01-01",
    termination_date: null,
    reference_number: "REF20260505-884421",
    rep_name: "Marcus",
    extraction_notes: "Demo result generated locally so the MVP can be used before vendor credentials are configured.",
  };
}
