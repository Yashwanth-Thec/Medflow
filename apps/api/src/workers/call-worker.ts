import { Worker } from "bullmq";
import { config } from "../config.js";
import { redisConnection } from "../queues.js";

if (!redisConnection) {
  throw new Error("Set USE_REDIS=true and REDIS_URL before running BullMQ workers");
}

export const callWorker = new Worker(
  "verification-calls",
  async (job) => {
    // TODO: create database job row before queueing, fetch payer config, then call Vapi.
    // This placeholder keeps the queue contract explicit while vendor credentials are configured.
    if (!config.vapiApiKey) {
      throw new Error("VAPI_API_KEY is required to start real calls");
    }

    return {
      queuedJobId: job.id,
      status: "ready_for_vapi_integration",
    };
  },
  { connection: redisConnection, concurrency: 3 },
);
