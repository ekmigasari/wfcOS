import crypto from "crypto";

// Get the webhook secret from environment variables
const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET || "";

// Define the webhook payload interface
export interface PolarWebhookPayload {
  id: string;
  type: string;
  data: Record<string, unknown>;
  created_at: string;
  [key: string]: unknown;
}

/**
 * Verifies the signature of incoming Polar webhooks
 * @param payload The webhook payload
 * @param signature The signature header from the request
 * @param timestamp The timestamp header from the request
 * @returns boolean indicating if the signature is valid
 */
export function verifyPolarWebhookSignature(
  payload: PolarWebhookPayload,
  signature: string,
  timestamp: string
): boolean {
  try {
    // Combine the timestamp and payload
    const payloadString = JSON.stringify(payload);
    const signedPayload = `${timestamp}.${payloadString}`;

    // Generate the expected signature
    const expectedSignature = crypto
      .createHmac("sha256", POLAR_WEBHOOK_SECRET)
      .update(signedPayload)
      .digest("hex");

    // Compare signatures using a timing-safe method to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}
