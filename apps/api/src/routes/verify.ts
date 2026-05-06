import { Router } from "express";
import { z } from "zod";
import { createLocalJob, toApiJob } from "../db/memory-store.js";
import { requireApiKey, type AuthenticatedRequest } from "../middleware/auth.js";
import { verificationQueue } from "../queues.js";

const verifySchema = z.object({
  patient_name: z.string().min(1),
  patient_dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  member_id: z.string().min(1),
  group_number: z.string().optional(),
  payer_name: z.string().min(1),
  payer_phone: z.string().min(7).optional(),
  cpt_codes: z.array(z.string().min(1)).min(1),
  service_type: z.string().optional(),
  dos: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  webhook_url: z.string().url().optional(),
});

export const verifyRouter = Router();

verifyRouter.post("/", requireApiKey, async (req: AuthenticatedRequest, res, next) => {
  try {
    const payload = verifySchema.parse(req.body);
    const job = createLocalJob(req.clinic?.id ?? "local-demo-clinic", payload);

    await verificationQueue.add("start-call", {
      jobId: job.id,
      clinicId: req.clinic?.id,
      payload,
    });

    res.status(202).json(toApiJob(job));
  } catch (error) {
    next(error);
  }
});
