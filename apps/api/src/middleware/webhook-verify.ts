import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export function verifyVapiWebhook(req: Request, res: Response, next: NextFunction) {
  if (!config.vapiWebhookSecret) {
    next();
    return;
  }

  const signature = req.header("x-vapi-signature");
  if (!signature) {
    res.status(401).json({ error: "Missing Vapi signature" });
    return;
  }

  const expected = crypto
    .createHmac("sha256", config.vapiWebhookSecret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  const valid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) {
    res.status(401).json({ error: "Invalid Vapi signature" });
    return;
  }

  next();
}
