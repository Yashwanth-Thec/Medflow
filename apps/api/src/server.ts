import cors from "cors";
import express from "express";
import { ZodError } from "zod";
import { config } from "./config.js";
import { jobsRouter } from "./routes/jobs.js";
import { verifyRouter } from "./routes/verify.js";
import { vapiWebhookRouter } from "./routes/webhooks/vapi.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "phonetree-api" });
});

app.use("/v1/verify", verifyRouter);
app.use("/v1/jobs", jobsRouter);
app.use("/v1/webhooks/vapi", vapiWebhookRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: "Invalid request body", details: error.flatten() });
    return;
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  res.status(500).json({ error: message });
});

app.listen(config.port, () => {
  console.log(`Phonetree API listening on :${config.port}`);
});
