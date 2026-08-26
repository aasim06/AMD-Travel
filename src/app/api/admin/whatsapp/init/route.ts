import { NextResponse } from "next/server";
import { getWhatsAppSocket } from "@/lib/whatsappService";

export async function GET() {
  try {
    await getWhatsAppSocket();
    return NextResponse.json({
      success: true,
      message: "Baileys WhatsApp Socket Gateway initialized. Check terminal for QR Code or connection status.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || String(error) }, { status: 500 });
  }
}
