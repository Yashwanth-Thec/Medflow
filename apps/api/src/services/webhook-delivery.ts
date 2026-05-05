import crypto from "node:crypto";

export function signWebhookPayload(rawBody: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

export async function deliverClinicWebhook(url: string, secret: string, payload: unknown) {
  const rawBody = JSON.stringify(payload);
  const signature = signWebhookPayload(rawBody, secret);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-phonetree-signature": signature,
    },
    body: rawBody,
  });

  if (!response.ok) {
    throw new Error(`Webhook delivery failed with ${response.status}`);
  }
}
