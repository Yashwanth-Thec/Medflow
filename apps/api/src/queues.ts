import crypto from "node:crypto";
import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { config } from "./config.js";

type QueueAddResult = { id?: string };

type QueueLike = {
  add(name: string, data: unknown): Promise<QueueAddResult>;
};

class LocalQueue implements QueueLike {
  constructor(private readonly queueName: string) {}

  async add(name: string, data: unknown) {
    console.log(`[local-queue:${this.queueName}] accepted ${name}`, data);
    return { id: typeof data === "object" && data && "jobId" in data ? String(data.jobId) : crypto.randomUUID() };
  }
}

export const redisConnection = config.useRedis
  ? new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
    })
  : null;

export const verificationQueue: QueueLike = redisConnection
  ? new Queue("verification-calls", { connection: redisConnection })
  : new LocalQueue("verification-calls");

export const extractionQueue: QueueLike = redisConnection
  ? new Queue("transcript-extraction", { connection: redisConnection })
  : new LocalQueue("transcript-extraction");
