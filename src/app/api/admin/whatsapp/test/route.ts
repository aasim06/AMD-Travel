import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/whatsappService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: "Recipient phone number ('to') and 'message' body are required" },
        { status: 400 }
      );
    }

    const result = await sendWhatsAppMessage({ to, body: message });

    return NextResponse.json({
      success: result.success,
      instanceId: process.env.ULTRAMSG_INSTANCE_ID || "instance189493",
      result: result.data || result.error,
    });
  } catch (error: any) {
    console.error("UltraMsg WhatsApp Test Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
