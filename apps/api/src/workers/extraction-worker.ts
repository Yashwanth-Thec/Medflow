import { Worker } from "bullmq";
import { config } from "../config.js";
import { redisConnection } from "../queues.js";

if (!redisConnection) {
  throw new Error("Set USE_REDIS=true and REDIS_URL before running BullMQ workers");
}

export const extractionWorker = new Worker(
  "transcript-extraction",
  async (job) => {
    // TODO: call Claude Sonnet with prompts/extraction-v1.txt and validate the JSON result.
    if (!config.anthropicApiKey) {
      throw new Error("ANTHROPIC_API_KEY is required to extract real transcripts");
    }

    return {
      vapiCallId: job.data.vapiCallId,
      status: "ready_for_extraction_integration",
    };
  },
  { connection: redisConnection, concurrency: 5 },
);
