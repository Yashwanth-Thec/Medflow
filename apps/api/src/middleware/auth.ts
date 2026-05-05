import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export interface AuthenticatedRequest extends Request {
  clinic?: {
    id: string;
    apiKey: string;
  };
}

export async function requireApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ error: "Missing bearer API key" });
    return;
  }

  // MVP local mode: accept the development API key and attach a demo clinic.
  // TODO: replace this with a clinics table lookup before handling production PHI.
  if (token !== config.devApiKey && process.env.NODE_ENV === "production") {
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  req.clinic = {
    id: process.env.DEV_CLINIC_ID ?? "00000000-0000-0000-0000-000000000000",
    apiKey: token,
  };

  next();
}
