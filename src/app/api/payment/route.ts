import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { success: false, error: "Stripe payment gateway is not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey);
    const {
      amount,
      currency = "eur",
      passengerName = "Traveler",
      email,
      pnr,
      bookingType = "flight",
    } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    const cleanCurrency = String(currency).toLowerCase();
    // Stripe amount in smallest currency unit (e.g. cents)
    const unitAmount = Math.round(Number(amount) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: unitAmount,
      currency: cleanCurrency,
      receipt_email: email || undefined,
      description: `AMD Global Travel — ${bookingType.toUpperCase()} Booking (${passengerName})`,
      metadata: {
        pnr: pnr || "PENDING_CHECKOUT",
        passengerName,
        customerEmail: email || "",
        bookingType,
      },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : "Payment initialization failed";
    console.error("[Stripe Payment Error]:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
