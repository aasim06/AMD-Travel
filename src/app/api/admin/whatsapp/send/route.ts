import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage, getWhatsAppGatewayState } from "@/lib/whatsappService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, message, customerName } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: "Phone number and message text are required" },
        { status: 400 }
      );
    }

    // Clean phone number: remove non-digits
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "92" + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith("00")) {
      cleanPhone = cleanPhone.slice(2);
    }

    const encodedText = encodeURIComponent(message);
    const directWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

    // Check Baileys Gateway state
    const gatewayState = getWhatsAppGatewayState();
    let sentViaSocket = false;
    let socketError = null;

    if (gatewayState.status === "connected") {
      try {
        const res = await sendWhatsAppMessage({ to: cleanPhone, body: message });
        sentViaSocket = res.success;
        if (!res.success) {
          socketError = res.error;
        }
      } catch (err: any) {
        socketError = err?.message || String(err);
      }
    }

    return NextResponse.json({
      success: true,
      sentViaSocket,
      gatewayStatus: gatewayState.status,
      socketError,
      phone: cleanPhone,
      whatsappUrl: directWhatsAppUrl,
      message: sentViaSocket
        ? `WhatsApp message sent directly to ${customerName || cleanPhone}!`
        : `WhatsApp prepared for ${customerName || cleanPhone}.`,
    });
  } catch (error: any) {
    console.error("[WhatsApp Send API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process WhatsApp dispatch" },
      { status: 500 }
    );
  }
}
