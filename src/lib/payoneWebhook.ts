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
 * Validates PAYONE webhook signature (MD5 of portal key) and portal ID.
 */
export function verifyPayoneWebhookSignature(
  data: PayoneTransactionStatusPayload
): { valid: boolean; reason?: string } {
  const config = getPayoneConfig();

  // 1. Verify Portal ID if supplied
  if (data.portalid && config.portalId && data.portalid !== config.portalId) {
    if (config.mode === "live") {
      return {
        valid: false,
        reason: `Portal ID mismatch: expected ${config.portalId}, received ${data.portalid}`,
      };
    }
  }

  // 2. Verify Key / MD5 Hash if supplied by PAYONE
  if (data.key && config.key) {
    const expectedMd5 = crypto
      .createHash("md5")
      .update(config.key)
      .digest("hex")
      .toLowerCase();

    const receivedKey = data.key.trim().toLowerCase();

    // Check against expected MD5 or literal key
    const matchesMd5 = receivedKey === expectedMd5;
    const matchesRaw = receivedKey === config.key.trim().toLowerCase();

    if (!matchesMd5 && !matchesRaw) {
      if (config.mode === "live") {
        return {
          valid: false,
          reason: "PAYONE MD5 security key hash verification failed",
        };
      } else {
        console.warn(
          `[PAYONE Webhook Warning] Signature key hash mismatch in test mode (received: ${receivedKey}, expected MD5: ${expectedMd5}). Continuing in test mode.`
        );
      }
    }
  }

  return { valid: true };
}

/**
 * Extracts and parses key-value pairs from multiple request payload formats:
 * - application/x-www-form-urlencoded
 * - multipart/form-data
 * - application/json
 * - raw text body
 */
export async function parsePayoneRequestPayload(
  req: Request
): Promise<PayoneTransactionStatusPayload> {
  const contentType = req.headers.get("content-type") || "";
  const data: Record<string, string> = {};

  try {
    if (contentType.includes("application/json")) {
      const json = await req.json();
      for (const [k, v] of Object.entries(json)) {
        data[k] = String(v ?? "");
      }
    } else {
      const text = await req.text();
      if (text) {
        const params = new URLSearchParams(text);
        params.forEach((value, key) => {
          data[key] = value;
        });
      }
    }
  } catch (err) {
    console.error("[PAYONE Webhook Payload Parse Error]:", err);
  }

  return {
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
