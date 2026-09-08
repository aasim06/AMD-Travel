import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Handles PAYONE TransactionStatus Webhook / Callback.
 * PAYONE expects a plain text response "TSOK" upon successful reception.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const txid = data.txid;
    const reference = data.reference;
    const txaction = (data.txaction || "").toLowerCase();
    const price = data.price ? parseFloat(data.price) : 0;
    const currency = data.currency || "EUR";

    console.log(`[PAYONE Callback Received]: txid=${txid}, reference=${reference}, action=${txaction}`);

    // Update payment & booking status if booking reference exists
    if (reference && (txaction === "paid" || txaction === "appointed")) {
      try {
        const booking = await prisma.booking.findUnique({
          where: { pnr: reference },
          include: { payment: true },
        });

        if (booking) {
          if (booking.payment) {
            await prisma.payment.update({
              where: { id: booking.payment.id },
              data: {
                status: txaction === "paid" ? "PAID" : "PENDING",
                transactionId: txid || booking.payment.transactionId,
                gateway: "PAYONE",
              },
            });
          } else {
            await prisma.payment.create({
              data: {
                bookingId: booking.id,
                amount: price || booking.totalAmount,
                currency: currency || booking.currency,
                gateway: "PAYONE",
                transactionId: txid,
                status: txaction === "paid" ? "PAID" : "PENDING",
              },
            });
          }

          if (txaction === "paid") {
            await prisma.booking.update({
              where: { id: booking.id },
              data: { status: "CONFIRMED" },
            });
          }
        }
      } catch (dbErr) {
        console.error("[PAYONE Callback DB Update Error]:", dbErr);
      }
    }

    // PAYONE standard acknowledgement response
    return new Response("TSOK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error: any) {
    console.error("[PAYONE Callback Handler Failed]:", error);
    // Return TSOK or 200 so PAYONE doesn't needlessly retry if body was malformed
    return new Response("TSOK", { status: 200 });
  }
}
