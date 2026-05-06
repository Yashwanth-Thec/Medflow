"use client";

import { FormEvent, useEffect, useState } from "react";

type ApiJob = {
  job_id: string;
  status: string;
  created_at: string;
  input?: { patient_name?: string; payer_name?: string; cpt_codes?: string[] };
  results?: {
    policy_status: string | null;
    individual_deductible_total: number | null;
    individual_deductible_met: number | null;
    coinsurance_pct: number | null;
    prior_auth_required: boolean | null;
    reference_number: string | null;
  } | null;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const apiKey = process.env.NEXT_PUBLIC_DEV_API_KEY ?? "pk_dev_local";
const statuses = ["queued", "calling", "processing", "complete", "needs_review"];

export default function HomePage() {
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [message, setMessage] = useState("Ready to submit a local demo verification.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function refreshJobs() {
    const response = await fetch(`${apiBaseUrl}/v1/jobs`, {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    const data = await response.json();
    setJobs(data.jobs ?? []);
  }

  useEffect(() => {
    refreshJobs().catch(() => setMessage("Start the API server to load jobs."));
    const interval = window.setInterval(() => {
      refreshJobs().catch(() => undefined);
    }, 1_500);

    return () => window.clearInterval(interval);
  }, []);

  async function submitVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("Queueing verification...");

    const form = new FormData(event.currentTarget);
    const cptCodes = String(form.get("cpt_codes") ?? "")
      .split(",")
      .map((code) => code.trim())
      .filter(Boolean);

    const response = await fetch(`${apiBaseUrl}/v1/verify`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        patient_name: form.get("patient_name"),
        patient_dob: form.get("patient_dob"),
        member_id: form.get("member_id"),
        payer_name: form.get("payer_name"),
        payer_phone: form.get("payer_phone"),
        cpt_codes: cptCodes,
        service_type: form.get("service_type"),
      }),
    });

    if (!response.ok) {
      setMessage(`API error: ${response.status}`);
      setIsSubmitting(false);
      return;
    }

    const job = await response.json();
    setMessage(`Queued job ${job.job_id}. Demo completion will appear automatically.`);
    setIsSubmitting(false);
    await refreshJobs();
  }

  const counts = Object.fromEntries(statuses.map((status) => [status, jobs.filter((job) => job.status === status).length]));

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Phonetree MVP</p>
        <h1>AI-assisted insurance verification for outpatient clinics</h1>
        <p>
          Submit verification jobs, monitor call status, and review structured benefits results from one clinic dashboard.
        </p>
      </section>

      <section className="grid">
        <form className="card" onSubmit={submitVerification}>
          <h2>Submit a verification</h2>
          <label>
            Patient name
            <input name="patient_name" defaultValue="Jane Smith" required />
          </label>
          <label>
            Date of birth
            <input name="patient_dob" defaultValue="1985-03-22" required />
          </label>
          <label>
            Member ID
            <input name="member_id" defaultValue="XYZ123456789" required />
          </label>
          <label>
            Payer
            <input name="payer_name" defaultValue="Blue Cross Blue Shield" required />
          </label>
          <label>
            Payer phone
            <input name="payer_phone" defaultValue="18006762583" required />
          </label>
          <label>
            Service type
            <input name="service_type" defaultValue="Physical Therapy" />
          </label>
          <label>
            CPT codes
            <input name="cpt_codes" defaultValue="97110, 97530" required />
          </label>
          <button disabled={isSubmitting}>{isSubmitting ? "Queueing..." : "Queue job"}</button>
          <p className="message">{message}</p>
        </form>

        <section className="card">
          <h2>Job status</h2>
          <ul className="statusList">
            {statuses.map((status) => (
              <li key={status}>
                <span>{status}</span>
                <strong>{counts[status] ?? 0}</strong>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <section className="card jobsCard">
        <div className="sectionHeader">
          <h2>Recent jobs</h2>
          <button type="button" onClick={refreshJobs}>Refresh</button>
        </div>
        {jobs.length === 0 ? (
          <p>No jobs yet. Submit the demo form to create one.</p>
        ) : (
          <div className="jobsTable">
            {jobs.map((job) => (
              <article key={job.job_id} className="jobRow">
                <div>
                  <strong>{job.input?.patient_name ?? "Unknown patient"}</strong>
                  <span>{job.input?.payer_name ?? "Unknown payer"} · {job.input?.cpt_codes?.join(", ")}</span>
                </div>
                <span className={`badge ${job.status}`}>{job.status}</span>
                <div className="resultSummary">
                  {job.results ? (
                    <>
                      <span>Policy: {job.results.policy_status}</span>
                      <span>Deductible: ${job.results.individual_deductible_met} / ${job.results.individual_deductible_total}</span>
                      <span>Coinsurance: {Math.round((job.results.coinsurance_pct ?? 0) * 100)}%</span>
                      <span>Ref: {job.results.reference_number}</span>
                    </>
                  ) : (
                    <span>Waiting for local demo result...</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
