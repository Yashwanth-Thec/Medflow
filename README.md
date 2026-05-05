# Phonetree MVP

Phonetree is an AI-assisted insurance verification workflow for outpatient clinics. The MVP focuses on a complete verification loop: create a job, place a payer call, capture a transcript, extract structured benefits data, and return results through an API, dashboard, and webhook.

## VS Code quick start

1. Open this folder in VS Code: `File > Open Folder... > /workspace/Medflow`.
2. Install Node.js 20+ and npm.
3. Copy `.env.example` to `.env` and fill in vendor credentials.
4. Install dependencies: `npm install`.
5. Start the full local demo: `npm run dev`.
6. Open the dashboard at `http://localhost:3000`. The API runs at `http://localhost:4000`.

## Local demo mode

By default, `USE_REDIS=false` and `DEV_API_KEY=pk_dev_local`, so the app runs without Redis, Supabase, Vapi, or Anthropic credentials. Submitted jobs move through `queued` → `calling` → `processing` → `complete` with a demo extracted result so you can use the dashboard immediately. Set `USE_REDIS=true` and add vendor credentials when you are ready to connect real workers and calls.

## MVP scope

- Express API for `POST /v1/verify`, `GET /v1/jobs/:id`, and `POST /v1/webhooks/vapi`.
- BullMQ workers for call initiation and post-call extraction.
- Supabase/Postgres schema for clinics, jobs, extraction results, payer configs, and audit logs.
- Next.js dashboard placeholder for job submission and status review.
- Versioned prompts for the live call agent and transcript extraction.

## Repository layout

```text
apps/
  api/                  Express API and workers
  dashboard/            Next.js clinic dashboard
packages/
  shared/               Shared TypeScript types and constants
prompts/                Versioned AI prompts
evals/                  Transcript fixtures and future extraction evals
infra/supabase/         Database migrations
docs/                   Product and implementation documentation
```

## Compliance note

This repository is a technical scaffold, not legal advice. Before handling real PHI, sign BAAs with covered entities and vendors, complete a HIPAA security review, configure access controls and audit logging, and confirm automated calling and call recording requirements with counsel.
