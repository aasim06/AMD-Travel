import { NextRequest, NextResponse } from "next/server";
import { getPayoneConfig } from "@/lib/payone";
import {
  parsePayoneRequestPayload,
  processPayoneTransactionStatus,
  verifyPayoneWebhookSignature,
} from "@/lib/payoneWebhook";

export const dynamic = "force-dynamic";

/**
 * PAYONE TransactionStatus Webhook Handler (POST)
 *
 * Receives server-to-server notifications from the PAYONE payment engine whenever
 * a payment state changes (e.g., appointed, paid, capture, underpaid, cancelation, failed).
 *
 * PAYONE strictly requires a plain text HTTP 200 response of "TSOK".
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await parsePayoneRequestPayload(req);

    console.log("[PAYONE Webhook Route] Incoming event:", {
      txid: payload.txid,
      reference: payload.reference,
      txaction: payload.txaction,
      portalid: payload.portalid,
      amount: payload.price,
      currency: payload.currency,
    });

    // Verify PAYONE security signature / MD5 hash
    const signatureCheck = verifyPayoneWebhookSignature(payload);
    if (!signatureCheck.valid) {
      console.error(
        `[PAYONE Webhook Security Warning] Signature rejected: ${signatureCheck.reason}`
      );
      // In live mode with invalid signature, decline
      const config = getPayoneConfig();
      if (config.mode === "live") {
        return new Response("TSKO", { status: 403 });
      }
    }

    // Process database updates and notifications
    await processPayoneTransactionStatus(payload);

    // PAYONE protocol requires exactly "TSOK" in plain text
    return new Response("TSOK", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error: any) {
    console.error("[PAYONE Webhook Exception]:", error);

    // Always respond with TSOK so PAYONE does not get stuck in a retry storm
    return new Response("TSOK", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}

/**
 * PAYONE Webhook Diagnostics & Health Status (GET)
 * Useful for verifying that the webhook URL is reachable from the browser or PMI.
 */
export async function GET(req: NextRequest) {
  const config = getPayoneConfig();
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const webhookUrl = `${protocol}://${host}/api/payment/payone/webhook`;

  return NextResponse.json({
    status: "online",
    service: "PAYONE TransactionStatus Webhook Gateway",
    merchantId: config.merchantId,
    portalId: config.portalId,
    mode: config.mode,
    environment: config.environment,
    webhookUrl,
    expectedResponse: "TSOK",
    acceptedMethods: ["POST"],
    instructions: {
      step1: "Log in to your PAYONE Merchant Interface (PMI) at https://pmi.payone.de",
      step2: "Go to: Configuration -> Payment Portals -> Select Portal -> Tab 'Extended'",
      step3: `Paste this Webhook URL into 'TransactionStatus URL': ${webhookUrl}`,
      step4: "Ensure 'Send TransactionStatus' is enabled and save changes.",
    },
  });
}
