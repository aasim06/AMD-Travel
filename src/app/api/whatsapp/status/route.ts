import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import {
  getWhatsAppGatewayState,
  getWhatsAppSocket,
  restartWhatsAppGateway,
  sendWhatsAppMessage,
} from "@/lib/whatsappService";

export const dynamic = "force-dynamic";

/**
 * Check if the incoming request has a valid admin session cookie
 */
function isAuthorized(request: NextRequest): boolean {
  const adminCookie = request.cookies.get("admin_session");
  return adminCookie?.value === "true";
}

// GET /api/whatsapp/status
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  try {
    // Trigger socket initialization if not already initialized
    getWhatsAppSocket().catch((err) =>
      console.warn("[WhatsApp Status GET]: Socket init warning:", err?.message || err)
    );

    const state = getWhatsAppGatewayState();
    let qrCodeDataUrl: string | null = null;

    if (state.rawQr) {
      qrCodeDataUrl = await QRCode.toDataURL(state.rawQr, {
        errorCorrectionLevel: "M",
        margin: 2,
        scale: 8,
        color: {
          dark: "#111827",
          light: "#FFFFFF",
        },
      });
    }

    return NextResponse.json({
      success: true,
      status: state.status,
      qrCodeDataUrl,
      rawQr: state.rawQr,
      user: state.user,
      error: state.error,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("[WhatsApp Status API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to retrieve WhatsApp status" },
      { status: 500 }
    );
  }
}

// POST /api/whatsapp/status (Actions: reconnect, clear_session, test_message)
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || "reconnect";

    if (action === "clear_session") {
      await restartWhatsAppGateway(true);
      return NextResponse.json({
        success: true,
        message: "WhatsApp session credentials cleared. Generating fresh QR code...",
      });
    }

    if (action === "reconnect" || action === "restart") {
      await restartWhatsAppGateway(false);
      return NextResponse.json({
        success: true,
        message: "Restarting WhatsApp socket connection...",
      });
    }

    if (action === "test_message") {
      const { phone, text } = body;
      if (!phone) {
        return NextResponse.json(
          { success: false, error: "Recipient phone number is required" },
          { status: 400 }
        );
      }

      const result = await sendWhatsAppMessage({
        to: phone,
        body: text || "🔔 *AMD Global Travel*: This is a test notification from your Admin WhatsApp Gateway!",
      });

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: `Unsupported action: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[WhatsApp Action API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to execute WhatsApp action" },
      { status: 500 }
    );
  }
}
