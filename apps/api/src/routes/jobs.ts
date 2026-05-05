import { Router } from "express";
import { getLocalJob, listLocalJobs, toApiJob } from "../db/memory-store.js";
import { requireApiKey, type AuthenticatedRequest } from "../middleware/auth.js";

export const jobsRouter = Router();

jobsRouter.get("/", requireApiKey, async (req: AuthenticatedRequest, res) => {
  const clinicId = req.clinic?.id ?? "local-demo-clinic";
  res.json({ jobs: listLocalJobs(clinicId).map(toApiJob) });
});

jobsRouter.get("/:id", requireApiKey, async (req: AuthenticatedRequest, res) => {
  const clinicId = req.clinic?.id ?? "local-demo-clinic";
  const job = getLocalJob(req.params.id, clinicId);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(toApiJob(job));
});
