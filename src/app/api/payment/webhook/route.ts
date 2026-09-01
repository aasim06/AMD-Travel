import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Fallback parse if webhook secret is not set in development
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error("[Stripe Webhook Signature Verification Failed]:", err.message);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const pnr = paymentIntent.metadata?.pnr;

        console.log(`[Stripe Webhook] Payment succeeded for PaymentIntent: ${paymentIntent.id}, PNR: ${pnr}`);

        if (pnr && pnr !== "PENDING_CHECKOUT") {
          await prisma.booking.updateMany({
            where: { pnr },
            data: { status: "CONFIRMED" },
          });

          await prisma.payment.updateMany({
            where: { transactionId: paymentIntent.id },
            data: { status: "PAID" },
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const pnr = paymentIntent.metadata?.pnr;

        console.warn(`[Stripe Webhook] Payment failed for PaymentIntent: ${paymentIntent.id}, PNR: ${pnr}`);

        if (pnr && pnr !== "PENDING_CHECKOUT") {
          await prisma.payment.updateMany({
            where: { transactionId: paymentIntent.id },
            data: { status: "FAILED" },
          });
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (dbErr: any) {
    console.error("[Stripe Webhook Processing Error]:", dbErr);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
