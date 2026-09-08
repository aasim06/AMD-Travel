import { NextRequest, NextResponse } from "next/server";
import { createPayonePayment } from "@/lib/payone";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const {
      amount,
      currency = "EUR",
      firstName = "Traveler",
      lastName = "Guest",
      email,
      pnr,
      bookingType = "flight",
      paymentType = "sb", // "sb" (Sofort/Giropay), "cc" (Card), "elv" (SEPA)
      onlineBankTransferType = "PNT", // PNT = Sofort, GPY = Giropay, EPS = eps
    } = await req.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Customer email is required for PAYONE payment" },
        { status: 400 }
      );
    }

    // Determine host origin for return redirects
    const origin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.replace(/\/$/, "") ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const reference = pnr || `AMD-${Date.now()}`;
    const successUrl = `${origin}/checkout/payone/return?status=success&ref=${reference}`;
    const errorUrl = `${origin}/checkout/payone/return?status=error&ref=${reference}`;
    const backUrl = `${origin}/checkout`;

    const payoneResult = await createPayonePayment({
      reference,
      amount: Number(amount),
      currency: String(currency).toUpperCase(),
      firstName,
      lastName,
      email,
      country: "DE",
      paymentType,
      onlineBankTransferType,
      successUrl,
      errorUrl,
      backUrl,
      customData: {
        bookingType,
        pnr: reference,
        customerEmail: email,
      },
    });

    if (payoneResult.status === "ERROR") {
      return NextResponse.json(
        {
          success: false,
          error:
            payoneResult.customermessage ||
            payoneResult.errormessage ||
            "PAYONE payment initiation failed",
          code: payoneResult.errorcode,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: payoneResult.status,
      txid: payoneResult.txid,
      redirectUrl: payoneResult.redirecturl,
      reference,
    });
  } catch (error: any) {
    console.error("[PAYONE API Route Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Server error while processing PAYONE payment",
      },
      { status: 500 }
    );
  }
}
