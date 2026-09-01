/**
 * Self-Hosted Baileys WhatsApp Socket Gateway
 * Replaces UltraMsg REST API implementation with @whiskeysockets/baileys
 */

import type { WASocket } from "@whiskeysockets/baileys";
import path from "path";
import { generateDynamicCarVoucherBase64, generateCarBookingCard, generateUmrahBookingCard } from "./dynamicVoucherGenerator";

// Declare global type augmentation to maintain singleton across Next.js HMR
export type WhatsAppConnectionStatus = "connecting" | "qr_pending" | "connected" | "disconnected";

declare global {
  var baileysSocketPromise: Promise<WASocket> | null;
  var baileysSocket: WASocket | null;
  var whatsappQR: string | null;
  var whatsappStatus: WhatsAppConnectionStatus;
  var whatsappUser: { id?: string; name?: string } | null;
  var whatsappLastDisconnectReason: string | null;
}

if (!globalThis.whatsappStatus) {
  globalThis.whatsappStatus = "disconnected";
}
if (globalThis.whatsappQR === undefined) {
  globalThis.whatsappQR = null;
}
if (globalThis.whatsappUser === undefined) {
  globalThis.whatsappUser = null;
}

/**
 * Get current in-memory WhatsApp Gateway status and raw QR code
 */
export function getWhatsAppGatewayState() {
  return {
    status: globalThis.whatsappStatus || "disconnected",
    rawQr: globalThis.whatsappQR || null,
    user: globalThis.whatsappUser || null,
    error: globalThis.whatsappLastDisconnectReason || null,
  };
}

/**
 * Reset and restart the Baileys WhatsApp Gateway socket (optionally clearing auth session)
 */
export async function restartWhatsAppGateway(clearSession = false) {
  try {
    if (globalThis.baileysSocket) {
      try {
        globalThis.baileysSocket.end(undefined);
      } catch {}
    }
  } catch {}

  globalThis.baileysSocket = null;
  globalThis.baileysSocketPromise = null;
  globalThis.whatsappQR = null;
  globalThis.whatsappStatus = "connecting";
  globalThis.whatsappUser = null;

  if (clearSession) {
    try {
      const fs = eval("require")("fs");
      const authFolder = path.join(process.cwd(), "auth_info_baileys");
      if (fs.existsSync(authFolder)) {
        fs.rmSync(authFolder, { recursive: true, force: true });
        console.log("[WhatsApp Baileys] Auth session directory cleared:", authFolder);
      }
    } catch (err) {
      console.warn("[WhatsApp Baileys] Could not remove auth folder:", err);
    }
  }

  return getWhatsAppSocket();
}

/**
 * Format phone number into WhatsApp JID (e.g. "923060112606@s.whatsapp.net")
 * Automatically converts local Pakistani 03XXXXXXXXX to 923XXXXXXXXX@s.whatsapp.net
 */
export function formatJid(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.trim().replace(/[^\d]/g, "");

  // If user entered local Pakistani format e.g. "03060112606" (11 digits starting with 03)
  if (/^03\d{9}$/.test(cleaned)) {
    cleaned = "92" + cleaned.slice(1);
  }

  if (!cleaned.endsWith("@s.whatsapp.net")) {
    cleaned = `${cleaned}@s.whatsapp.net`;
  }
  return cleaned;
}

/**
 * Helper to ensure the socket WebSocket state is fully OPEN (readyState === 1) before sending
 */
async function ensureSocketConnected(sock: WASocket, timeoutMs = 4000): Promise<boolean> {
  if ((sock as any)?.ws?.readyState === 1) return true;

  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), timeoutMs);
    const handler = (update: any) => {
      if (update.connection === "open") {
        clearTimeout(timer);
        sock.ev.off("connection.update", handler);
        resolve(true);
      }
    };
    sock.ev.on("connection.update", handler);
  });
}

/**
 * Initialize Baileys WhatsApp Socket Connection (Singleton Pattern)
 */
export async function getWhatsAppSocket(): Promise<WASocket> {
  if (globalThis.baileysSocket) {
    return globalThis.baileysSocket;
  }

  if (globalThis.baileysSocketPromise) {
    return globalThis.baileysSocketPromise;
  }

  globalThis.whatsappStatus = "connecting";

  globalThis.baileysSocketPromise = (async () => {
    try {
      const baileys = eval("require")("@whiskeysockets/baileys");
      const makeWASocket = baileys.default || baileys;
      const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = baileys;

      const authFolder = path.join(process.cwd(), "auth_info_baileys");
      const { state, saveCreds } = await useMultiFileAuthState(authFolder);
      const { version } = await fetchLatestBaileysVersion();

      console.log(`[WhatsApp Baileys] Initializing socket from [${authFolder}] version [${version.join(".")}]...`);

      const pino = eval("require")("pino");

      const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        browser: ["AMD Global Travel Admin Gateway", "Chrome", "1.0.0"],
      });

      sock.ev.on("creds.update", saveCreds);

      sock.ev.on("connection.update", async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          globalThis.whatsappQR = qr;
          globalThis.whatsappStatus = "qr_pending";
          console.log("📲 [WhatsApp Baileys] New QR Code generated for Admin UI display.");
        }

        if (connection === "open") {
          console.log("🟢 [WhatsApp Baileys] Gateway Connected Successfully!");
          globalThis.whatsappQR = null;
          globalThis.whatsappStatus = "connected";
          globalThis.baileysSocket = sock;
          try {
            globalThis.whatsappUser = (sock as any).user || null;
          } catch {
            globalThis.whatsappUser = null;
          }
        }

        if (connection === "close") {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          console.warn(
            `[WhatsApp Baileys] Connection closed:`,
            lastDisconnect?.error?.message || lastDisconnect?.error || "Unknown error",
            `| Reconnecting: ${shouldReconnect}`
          );

          globalThis.whatsappQR = null;
          globalThis.whatsappStatus = shouldReconnect ? "connecting" : "disconnected";
          globalThis.whatsappLastDisconnectReason = lastDisconnect?.error?.message || "Connection closed";
          globalThis.baileysSocket = null;
          globalThis.baileysSocketPromise = null;
          globalThis.whatsappUser = null;

          if (shouldReconnect) {
            setTimeout(() => {
              getWhatsAppSocket().catch((e) =>
                console.error("[WhatsApp Baileys] Reconnection failed:", e)
              );
            }, 3000);
          }
        }
      });

      globalThis.baileysSocket = sock;
      return sock;
    } catch (error) {
      console.error("[WhatsApp Baileys] Socket initialization error:", error);
      globalThis.baileysSocketPromise = null;
      globalThis.whatsappStatus = "disconnected";
      throw error;
    }
  })();

  return globalThis.baileysSocketPromise;
}

// ─── Core Message Helpers ───────────────────────────────────────────────────

export interface SendWhatsAppParams {
  to: string;
  body: string;
}

export interface SendWhatsAppImageParams {
  to: string;
  image: string | Buffer; // URL, Base64 data URI, or Buffer
  caption?: string;
}

/**
 * Send WhatsApp text message via Baileys Socket Gateway
 */
export async function sendWhatsAppMessage({ to, body }: SendWhatsAppParams) {
  try {
    const formattedJid = formatJid(to);
    if (!formattedJid) {
      console.warn("[WhatsApp Baileys] Missing or invalid recipient phone number.");
      return { success: false, error: "Invalid phone number" };
    }

    const sock = await getWhatsAppSocket();
    await ensureSocketConnected(sock);

    console.log(`[WhatsApp Baileys] Dispatching text message to ${formattedJid}...`);

    const result = await sock.sendMessage(formattedJid, { text: body });
    console.log(`[WhatsApp Baileys OK] Message sent successfully. Message ID: ${result?.key?.id}`);

    return { success: true, messageId: result?.key?.id, data: result };
  } catch (err: any) {
    console.error("[WhatsApp Baileys Error] Exception sending text message:", err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Send WhatsApp Image Message with optional caption via Baileys Socket Gateway
 */
export async function sendWhatsAppImage({ to, image, caption }: SendWhatsAppImageParams) {
  try {
    const formattedJid = formatJid(to);
    if (!formattedJid) {
      console.warn("[WhatsApp Baileys Image] Missing or invalid recipient phone number.");
      return { success: false, error: "Invalid phone number" };
    }

    const sock = await getWhatsAppSocket();
    await ensureSocketConnected(sock);

    let imageContent: Buffer | { url: string };

    if (typeof image === "string") {
      if (image.startsWith("data:image/")) {
        // Base64 data URI
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        imageContent = Buffer.from(base64Data, "base64");
      } else if (image.startsWith("http://") || image.startsWith("https://")) {
        // URL
        imageContent = { url: image };
      } else {
        // Assume base64 string
        imageContent = Buffer.from(image, "base64");
      }
    } else {
      imageContent = image;
    }

    console.log(`[WhatsApp Baileys Image] Dispatching image voucher to ${formattedJid}...`);

    const result = await sock.sendMessage(formattedJid, {
      image: imageContent as any,
      caption: caption || "",
    });

    console.log(`[WhatsApp Baileys Image OK] Image sent successfully. Message ID: ${result?.key?.id}`);
    return { success: true, messageId: result?.key?.id, data: result };
  } catch (err: any) {
    console.error("[WhatsApp Baileys Image Error] Exception sending image:", err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}

// ─── 1. Visa Submission WhatsApp Notification ────────────────────────────────

export interface VisaWhatsAppNotificationData {
  applicationNo: string;
  applicantName: string;
  country: string;
  visaType: string;
  phone: string;
}

export async function sendVisaSubmissionWhatsApp(data: VisaWhatsAppNotificationData) {
  if (!data.phone) return { success: false, error: "No phone number provided" };

  const message = `*AMD Global Travel - Visa Application Received*

Dear *${data.applicantName}*,

Thank you for submitting your visa application with AMD Global Travel.

*Application Reference:* #${data.applicationNo}
*Destination Country:* ${data.country}
*Visa Type:* ${data.visaType}
*Status:* PENDING (Under Review)

Our visa processing team is verifying your uploaded documents. We will update you as soon as your application is processed.

For assistance, reply directly to this chat or visit our portal.
Thank you for choosing *AMD Global Travel*.`;

  return sendWhatsAppMessage({ to: data.phone, body: message });
}

// ─── 2. Umrah Booking WhatsApp Notification ─────────────────────────────────

export interface UmrahWhatsAppNotificationData {
  pnr: string;
  pilgrimName: string;
  packageTitle: string;
  packagePhotoUrl?: string;
  departureCity: string;
  departureDate: string;
  totalAmount: number | string;
  currency?: string;
  phone: string;
}

export async function sendUmrahBookingWhatsApp(data: UmrahWhatsAppNotificationData) {
  if (!data.phone) return { success: false, error: "No phone number provided" };

  const curr = data.currency === "EUR" ? "€" : "$";

  // Dynamically render a high-resolution PNG Voucher Card with customer's live data
  try {
    const cardResult = await generateUmrahBookingCard({
      companyName: "AMD Global Travel",
      companyTagline: "Umrah Packages & Pilgrimage Services",
      umrahPhotoUrl: data.packagePhotoUrl || "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80",
      packageTitle: data.packageTitle,
      customerName: data.pilgrimName,
      departureCity: data.departureCity,
      departureDate: data.departureDate,
      totalPrice: `${curr}${data.totalAmount}`,
      bookingId: data.pnr,
      companyPhone: "+92 306 0112606",
      companyWebsite: "www.amdglobaltravel.com",
      thankYouMessage: "May Allah accept your Umrah & pilgrimage! Thank you for choosing AMD Global Travel.",
    });

    // Dispatch ONLY the dynamic voucher image via Baileys without text caption
    return sendWhatsAppImage({ to: data.phone, image: cardResult.buffer, caption: "" });
  } catch (err) {
    console.warn("[Baileys Umrah Voucher Generation Warning] Falling back to text message:", err);
  }

  const message = `*AMD Global Travel - Umrah Package Reservation*\n\nSalam *${data.pilgrimName}*,\n\n*Booking Reference (PNR):* #${data.pnr}\n*Umrah Package:* ${data.packageTitle}\n*Departure City:* ${data.departureCity}\n*Departure Date:* ${data.departureDate}\n*Total Amount:* ${curr}${data.totalAmount}\n*Status:* CONFIRMED\n\nOur Umrah services team will contact you shortly.\n\nBest regards,\n*AMD Global Travel*`;

  return sendWhatsAppMessage({ to: data.phone, body: message });
}

// ─── 3. Car Rental Booking WhatsApp Notification (Baileys Dynamic Voucher Image) ──

export interface CarWhatsAppNotificationData {
  pnr: string;
  driverName: string;
  carName: string;
  carCategory?: string;
  carImage?: string;
  pickupLocation: string;
  pickupDate: string;
  returnDate?: string;
  totalDays?: number;
  totalAmount: number | string;
  currency?: string;
  driverLicense?: string;
  phone: string;
}

export async function sendCarBookingWhatsApp(data: CarWhatsAppNotificationData) {
  if (!data.phone) return { success: false, error: "No phone number provided" };

  const curr = data.currency === "EUR" ? "€" : "$";

  // Dynamically render high-resolution PNG Voucher Card with customer's live data + selected car image
  try {
    const cardResult = await generateCarBookingCard({
      companyName: "AMD Global Travel",
      companyTagline: "Rent a Car & Luxury Fleet",
      carPhotoUrl: data.carImage || null,
      carName: data.carName,
      customerName: data.driverName,
      pickupDateTime: data.pickupDate,
      returnDateTime: data.returnDate || data.pickupDate,
      pickupLocation: data.pickupLocation,
      totalPrice: `${curr}${data.totalAmount}`,
      bookingId: data.pnr,
      companyPhone: "+92 306 0112606",
      companyWebsite: "www.amdglobaltravel.com",
      thankYouMessage: "Thank you for booking with AMD Global Travel!",
    });

    // Dispatch ONLY the dynamic voucher image via Baileys without text caption
    return sendWhatsAppImage({ to: data.phone, image: cardResult.buffer, caption: "" });
  } catch (err) {
    console.warn("[Baileys Voucher Generation Warning] Falling back to text message:", err);
  }

  const fallbackText = `*AMD Global Travel - Official ${data.carName} Reservation Voucher*\n\nDear *${data.driverName}*,\n\n*PNR Reference:* #${data.pnr}\n*Vehicle:* ${data.carName}\n*Pickup Location:* ${data.pickupLocation}\n*Rental Period:* ${data.pickupDate}${data.returnDate ? ` TO ${data.returnDate}` : ""}\n*Total Price:* ${curr}${data.totalAmount}\n*Status:* CONFIRMED`;

  return sendWhatsAppMessage({ to: data.phone, body: fallbackText });
}

// ─── 4. Flight Booking WhatsApp Notification ─────────────────────────────────

export interface FlightWhatsAppNotificationData {
  pnr: string;
  passengerName: string;
  origin: string;
  destination: string;
  airline?: string;
  departureDate: string;
  totalAmount?: number | string;
  currency?: string;
  phone: string;
}

export async function sendFlightBookingWhatsApp(data: FlightWhatsAppNotificationData) {
  if (!data.phone) return { success: false, error: "No phone number provided" };

  const message = `*AMD Global Travel - Flight Ticket Booking*

Dear *${data.passengerName}*,

Your flight booking record (PNR) has been generated successfully.

*Record Locator / PNR:* #${data.pnr}
*Route:* ${data.origin} TO ${data.destination}
*Airline:* ${data.airline || "Scheduled Flight"}
*Departure Date:* ${data.departureDate}
${data.totalAmount ? `*Total Amount:* ${data.currency || "$"}${data.totalAmount}\n` : ""}*Status:* CONFIRMED

Wish you a happy & safe flight.
*AMD Global Travel Team*`;

  return sendWhatsAppMessage({ to: data.phone, body: message });
}

// Eagerly pre-warm WhatsApp socket connection in memory on server load (0ms connection delay on request)
if (typeof window === "undefined") {
  getWhatsAppSocket().catch((e) =>
    console.warn("[WhatsApp Baileys Pre-warm Warning]:", e?.message || e)
  );
}
