import "dotenv/config";

export const config = {
  port: Number(process.env.API_PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  vapiApiKey: process.env.VAPI_API_KEY ?? "",
  vapiWebhookSecret: process.env.VAPI_WEBHOOK_SECRET ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  useRedis: process.env.USE_REDIS === "true",
  devApiKey: process.env.DEV_API_KEY ?? "pk_dev_local",
};
