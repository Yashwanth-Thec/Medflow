import { Router } from "express";
import { markLocalJobFromVapi } from "../../db/memory-store.js";
import { verifyVapiWebhook } from "../../middleware/webhook-verify.js";
import { extractionQueue } from "../../queues.js";

export const vapiWebhookRouter = Router();

vapiWebhookRouter.post("/", verifyVapiWebhook, async (req, res, next) => {
  try {
    const event = req.body;

    if (event?.type === "call-ended" || event?.message?.type === "end-of-call-report") {
      const vapiCallId = event.call?.id ?? event.message?.call?.id;
      const transcript = event.transcript ?? event.message?.transcript;
      const recordingUrl = event.recordingUrl ?? event.message?.recordingUrl;
      const job = markLocalJobFromVapi({ vapiCallId, transcript, recordingUrl });

      await extractionQueue.add("extract-transcript", {
        jobId: job?.id,
        vapiCallId,
        transcript,
        recordingUrl,
      });
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});
