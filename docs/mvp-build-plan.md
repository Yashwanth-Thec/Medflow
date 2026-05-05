# Phonetree MVP Build Plan

## Executive summary

Phonetree is an AI-assisted phone workflow that helps outpatient clinics verify insurance benefits before appointments. Clinic staff submit a verification job with patient, payer, provider, and CPT-code context. The system queues the job, initiates a payer call, captures a transcript, extracts structured benefits fields, and returns results in a dashboard and webhook.

## MVP success metrics

| Metric | Target | Definition |
| --- | --- | --- |
| Verification completion rate | >85% | Calls yielding all required fields without human escalation |
| Average call duration | <12 minutes | Dial to structured result stored in the database |
| Field extraction accuracy | >95% | Manual-check sample vs extracted fields |
| Pilot clinic NPS | >40 | Pilot clinic feedback after 30 days |
| Cost per verification | <$0.80 | Infra + AI API cost per completed verification |

## In scope

- Job submission by REST API and dashboard form.
- Job queue and call worker integration point for Vapi.
- IVR and representative conversation prompt templates.
- Call recording URL and transcript storage.
- Post-call extraction into a validated benefits result object.
- Clinic webhook delivery with HMAC signature.
- Single-user clinic dashboard with job list/detail views.
- CSV import/export support in the dashboard.

## Out of scope for MVP

- Native EHR integrations.
- Prior authorization submission.
- Patient-facing messaging.
- Multi-seat clinic accounts.
- Eligibility-only portal scraping.
- Mobile app.
- Fully automated BAA workflow.

## Six-week sprint plan

### Week 1 — working call

- Configure voice vendor accounts.
- Create the first Vapi assistant using the versioned call prompt.
- Implement a call worker that can start a call from a queued job.
- Run the initial database migration.

Definition of done: a test call reaches the intended test line and stores transcript metadata.

### Week 2 — extraction pipeline

- Implement transcript extraction worker.
- Validate extracted JSON with shared schemas.
- Store results in `verification_results`.
- Start a small transcript fixture set in `evals/transcripts`.

Definition of done: extraction produces a valid result object within 60 seconds of call completion in local/dev.

### Week 3 — API and queue

- Implement API key authentication.
- Implement `POST /v1/verify` and `GET /v1/jobs/:id`.
- Implement Vapi webhook ingestion.
- Implement clinic webhook delivery with HMAC signatures.

Definition of done: an HTTP client can create a job, poll it, and receive a completion webhook in a test environment.

### Week 4 — dashboard

- Build login, job submission, job list, and job detail screens.
- Add CSV upload and export.
- Add transcript and recording display areas.

Definition of done: non-technical pilot staff can submit a job and read results without using the API.

### Week 5 — reliability and payer coverage

- Add payer config hints for top payers.
- Add retry logic and failure categorization.
- Add `needs_review` status for low-confidence or incomplete extractions.
- Add basic operational alerts.

Definition of done: every failed job has a visible status and `error_message`.

### Week 6 — compliance, billing, pilot launch

- Complete HIPAA and call recording review with counsel.
- Sign pilot BAAs before processing PHI.
- Add usage tracking and billing hooks.
- Onboard two pilot clinics.

Definition of done: pilots are live only after compliance prerequisites are complete.
