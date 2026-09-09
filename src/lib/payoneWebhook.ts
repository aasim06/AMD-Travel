import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getPayoneConfig } from "@/lib/payone";
import {
  sendFlightBookingWhatsApp,
  sendCarBookingWhatsApp,
  sendUmrahBookingWhatsApp,
} from "@/lib/whatsappService";

export interface PayoneTransactionStatusPayload {
  txid: string;
  reference: string;
  txaction: string;
  transaction_status?: string;
  price?: string;
  currency?: string;
  clearingtype?: string;
  portalid?: string;
  aid?: string;
  mode?: string;
  key?: string;
  param?: string;
  sequencenumber?: string;
  reminder?: string;
  failedcause?: string;
  [key: string]: string | undefined;
}

export interface PayoneWebhookResult {
  success: boolean;
  message: string;
  txid?: string;
  reference?: string;
  bookingUpdated?: boolean;
  bookingPnr?: string;
  newBookingStatus?: string;
  newPaymentStatus?: string;
}

/**
 * Validates PAYONE webhook signature:
 * 1. Checks modern HMAC signature from Developer Portal using secretWebhookKey
 * 2. Checks traditional MD5 key hash from Post-Gateway
 * 3. Verifies portal ID if present
 */
export function verifyPayoneWebhookSignature(
  data: PayoneTransactionStatusPayload,
  rawBody?: string,
  signatureHeader?: string | null
): { valid: boolean; reason?: string } {
  const config = getPayoneConfig();

  // 1. Check Modern Webhook HMAC-SHA256 Signature from PAYONE Developer Portal
  if (signatureHeader && rawBody && config.secretWebhookKey) {
    try {
      const hmacSha256 = crypto
        .createHmac("sha256", config.secretWebhookKey)
        .update(rawBody)
        .digest("hex");

      const hmacSha384 = crypto
        .createHmac("sha384", config.secretWebhookKey)
        .update(rawBody)
        .digest("hex");

      const cleanSig = signatureHeader.trim().toLowerCase();
      if (cleanSig === hmacSha256.toLowerCase() || cleanSig === hmacSha384.toLowerCase()) {
        return { valid: true };
      }
    } catch (e) {
      console.warn("[PAYONE HMAC Check Error]:", e);
    }
  }

  // 2. Verify Portal ID if supplied
  if (data.portalid && config.portalId && data.portalid !== config.portalId) {
    if (config.mode === "live") {
      return {
        valid: false,
        reason: `Portal ID mismatch: expected ${config.portalId}, received ${data.portalid}`,
      };
    }
  }

  // 3. Verify Key / MD5 Hash if supplied in payload
  if (data.key && (config.key || config.secretWebhookKey)) {
    const expectedMd5PortalKey = config.key
      ? crypto.createHash("md5").update(config.key).digest("hex").toLowerCase()
      : "";
    const expectedMd5WebhookKey = config.secretWebhookKey
      ? crypto.createHash("md5").update(config.secretWebhookKey).digest("hex").toLowerCase()
      : "";

    const receivedKey = data.key.trim().toLowerCase();

    const matchesMd5 =
      receivedKey === expectedMd5PortalKey ||
      receivedKey === expectedMd5WebhookKey;
    const matchesRaw =
      receivedKey === config.key.trim().toLowerCase() ||
      receivedKey === config.secretWebhookKey.trim().toLowerCase() ||
      receivedKey === config.webhookKeyId.trim().toLowerCase();

    if (!matchesMd5 && !matchesRaw) {
      if (config.mode === "live") {
        return {
          valid: false,
          reason: "PAYONE MD5 security key hash verification failed",
        };
      } else {
        console.warn(
          `[PAYONE Webhook Warning] Signature key hash mismatch in test mode (received: ${receivedKey}). Continuing in test mode.`
        );
      }
    }
  }

  return { valid: true };
}

/**
 * Extracts and parses key-value pairs from multiple request payload formats:
 * - Modern PAYONE Developer Webhooks (JSON with nested data / status)
 * - Classic Post-Gateway (application/x-www-form-urlencoded)
 * - multipart/form-data
 */
export async function parsePayoneRequestPayload(
  req: Request
): Promise<{ payload: PayoneTransactionStatusPayload; rawBody: string; signatureHeader: string | null }> {
  const contentType = req.headers.get("content-type") || "";
  const signatureHeader =
    req.headers.get("payone-hmac") ||
    req.headers.get("x-payone-signature") ||
    req.headers.get("payone-signature") ||
    req.headers.get("x-signature") ||
    null;

  const data: Record<string, string> = {};
  let rawBody = "";

  try {
    rawBody = await req.text();

    if (contentType.includes("application/json") || rawBody.trim().startsWith("{")) {
      const json = JSON.parse(rawBody || "{}");

      // Check if modern nested structure: { event: "...", data: { ... } }
      const subData = json.data || json.payload || json.event_data || {};

      for (const [k, v] of Object.entries(json)) {
        if (typeof v !== "object") {
          data[k] = String(v ?? "");
        }
      }

      for (const [k, v] of Object.entries(subData)) {
        if (typeof v !== "object") {
          data[k] = String(v ?? "");
        }
      }

      // Map modern Developer API fields to common PAYONE status fields
      if (subData.reference) data.reference = String(subData.reference);
      if (subData.paymentId) data.txid = String(subData.paymentId);
      if (subData.id && !data.txid) data.txid = String(subData.id);

      if (subData.status) {
        const s = String(subData.status).toLowerCase();
        data.txaction = s === "completed" || s === "paid" ? "paid" : s;
      } else if (json.type) {
        const t = String(json.type).toLowerCase();
        if (t.includes("paid") || t.includes("completed") || t.includes("succeeded")) {
          data.txaction = "paid";
        } else if (t.includes("failed") || t.includes("cancelled")) {
          data.txaction = "failed";
        }
      }

      if (subData.amount?.value) {
        data.price = (Number(subData.amount.value) / 100).toString();
      }
      if (subData.amount?.currency) {
        data.currency = String(subData.amount.currency);
      }
    } else {
      // urlencoded, formData, or raw text fallback
      if (rawBody) {
        const params = new URLSearchParams(rawBody);
        params.forEach((value, key) => {
          data[key] = value;
        });
      }
    }
  } catch (err) {
    console.error("[PAYONE Webhook Payload Parse Error]:", err);
  }

  const payload: PayoneTransactionStatusPayload = {
    txid: data.txid || "",
    reference: data.reference || "",
    txaction: (data.txaction || "").toLowerCase(),
    transaction_status: data.transaction_status,
    price: data.price,
    currency: data.currency || "EUR",
    clearingtype: data.clearingtype,
    portalid: data.portalid,
    aid: data.aid,
    mode: data.mode,
    key: data.key,
    param: data.param,
    sequencenumber: data.sequencenumber,
    reminder: data.reminder,
    failedcause: data.failedcause,
    ...data,
  };

  return { payload, rawBody, signatureHeader };
}

/**
 * Core business processor for PAYONE TransactionStatus events.
 * Updates Database (Booking & Payment) and triggers customer alerts.
 */
export async function processPayoneTransactionStatus(
  payload: PayoneTransactionStatusPayload
): Promise<PayoneWebhookResult> {
  const { txid, reference, txaction, price, currency, param } = payload;

  console.log(
    `[PAYONE Webhook Processing]: txid=${txid}, ref=${reference}, action=${txaction}, amount=${price} ${currency}`
  );

  if (!txid && !reference) {
    return {
      success: false,
      message: "Missing both txid and reference in PAYONE payload",
    };
  }

  // Parse custom parameters if present
  let customParamData: Record<string, any> = {};
  if (param) {
    try {
      customParamData = JSON.parse(param);
    } catch {
      // not JSON formatted
    }
  }

  const lookupPnr = reference || customParamData.pnr || "";

  // 1. Locate Booking in Database
  let booking: any = null;

  if (lookupPnr) {
    booking = await prisma.booking.findUnique({
      where: { pnr: lookupPnr },
      include: {
        payment: true,
        passengers: true,
      },
    });
  }

  // Fallback: search by existing payment transaction ID
  if (!booking && txid) {
    const existingPayment = await prisma.payment.findFirst({
      where: { transactionId: txid },
      include: {
        booking: {
          include: {
            payment: true,
            passengers: true,
          },
        },
      },
    });
    if (existingPayment?.booking) {
      booking = existingPayment.booking;
    }
  }

  // Determine new statuses based on PAYONE txaction
  let newBookingStatus: "CONFIRMED" | "PENDING" | "CANCELLED" | undefined;
  let newPaymentStatus: "PAID" | "PENDING" | "FAILED" | "REFUNDED" | undefined;

  switch (txaction) {
    case "paid":
    case "capture":
    case "invoice":
      newBookingStatus = "CONFIRMED";
      newPaymentStatus = "PAID";
      break;

    case "appointed":
    case "vauthorisation":
      newBookingStatus = "CONFIRMED";
      newPaymentStatus = "PENDING";
      break;

    case "cancelation":
    case "failed":
      newBookingStatus = "CANCELLED";
      newPaymentStatus = "FAILED";
      break;

    case "refund":
    case "debit":
      newBookingStatus = "CANCELLED";
      newPaymentStatus = "REFUNDED";
      break;

    case "underpaid":
      newPaymentStatus = "PENDING";
      break;

    default:
      console.log(`[PAYONE Webhook] Informational txaction: ${txaction}`);
      break;
  }

  let bookingUpdated = false;

  // 2. Update DB records if booking found
  if (booking) {
    try {
      const parsedAmount = price ? parseFloat(price) : booking.totalAmount;

      // Update or create payment
      if (booking.payment) {
        await prisma.payment.update({
          where: { id: booking.payment.id },
          data: {
            status: newPaymentStatus || booking.payment.status,
            transactionId: txid || booking.payment.transactionId,
            gateway: "PAYONE",
            amount: parsedAmount || booking.payment.amount,
            currency: currency || booking.payment.currency,
          },
        });
      } else {
        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: parsedAmount || booking.totalAmount,
            currency: currency || booking.currency,
            gateway: "PAYONE",
            transactionId: txid || `PAYONE-${Date.now()}`,
            status: newPaymentStatus || "PAID",
          },
        });
      }

      // Update booking status
      if (newBookingStatus) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: newBookingStatus },
        });
        bookingUpdated = true;
      }

      console.log(
        `[PAYONE Webhook DB Success] Booking ${booking.pnr} set to ${newBookingStatus}, Payment set to ${newPaymentStatus}`
      );

      // 3. Trigger WhatsApp & Email Alerts if payment completed
      if (newPaymentStatus === "PAID" && booking.status !== "CONFIRMED") {
        triggerBookingConfirmationAlerts(booking, txid).catch((notifErr) =>
          console.error("[PAYONE Webhook Notification Error]:", notifErr)
        );
      }
    } catch (dbError) {
      console.error("[PAYONE Webhook Database Error]:", dbError);
    }
  } else {
    console.warn(
      `[PAYONE Webhook] No matching booking found in database for reference: ${lookupPnr || "N/A"}, txid: ${txid}`
    );
  }

  return {
    success: true,
    message: "TransactionStatus processed successfully",
    txid,
    reference: lookupPnr,
    bookingUpdated,
    bookingPnr: booking?.pnr,
    newBookingStatus,
    newPaymentStatus,
  };
}

/**
 * Dispatches automated customer notification via WhatsApp upon confirmed payment.
 */
async function triggerBookingConfirmationAlerts(booking: any, txid: string) {
  try {
    const passenger = booking.passengers?.[0];
    const customerPhone = passenger?.phone;

    if (!customerPhone) {
      console.log(`[PAYONE Notification] No phone number on file for booking ${booking.pnr}`);
      return;
    }

    const customerName = passenger
      ? `${passenger.firstName} ${passenger.lastName}`
      : "Valued Traveler";

    if (booking.type === "car") {
      await sendCarBookingWhatsApp({
        pnr: booking.pnr,
        driverName: customerName,
        carName: booking.airline || "Luxury Rental Car",
        pickupLocation: booking.origin,
        pickupDate: booking.departureDate?.toISOString?.()?.split("T")?.[0] || "Confirmed",
        returnDate: booking.returnDate?.toISOString?.()?.split("T")?.[0],
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        phone: customerPhone,
      });
    } else if (booking.type === "umrah") {
      await sendUmrahBookingWhatsApp({
        pnr: booking.pnr,
        pilgrimName: customerName,
        packageTitle: booking.airline || "Executive Umrah Package",
        departureCity: booking.origin,
        departureDate: booking.departureDate?.toISOString?.()?.split("T")?.[0] || "Confirmed",
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        phone: customerPhone,
      });
    } else {
      await sendFlightBookingWhatsApp({
        pnr: booking.pnr,
        passengerName: customerName,
        origin: booking.origin,
        destination: booking.destination,
        airline: booking.airline,
        departureDate: booking.departureDate?.toISOString?.()?.split("T")?.[0] || "Scheduled",
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        phone: customerPhone,
      });
    }

    console.log(`[PAYONE Notification Sent] Automated WhatsApp confirmation sent for ${booking.pnr}`);
  } catch (err) {
    console.error("[PAYONE Notification Error]:", err);
  }
}
