import { NextRequest, NextResponse } from "next/server";
import { amadeusPost, getAmadeusToken, AMADEUS_BASE_URL } from "@/lib/amadeus";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { flightOffer } = body;

    if (!flightOffer) {
      return NextResponse.json(
        { success: false, error: "Missing flightOffer parameter" },
        { status: 400 }
      );
    }

    // ── Fetch Admin Profit Markup from PostgreSQL ─────────────────────────────
    let markupType = "PERCENTAGE";
    let markupValue = 5;
    try {
      const typeSetting = await prisma.systemSetting.findUnique({ where: { key: "markup_type" } });
      const valSetting  = await prisma.systemSetting.findUnique({ where: { key: "markup_value" } });
      if (typeSetting?.value) markupType = typeSetting.value;
      if (valSetting?.value)  markupValue = parseFloat(valSetting.value);
    } catch {
      /* default 5% */
    }

    const isFlat = markupType === "FLAT" || markupType === "FIXED";

    // Check if mock offer
    if (flightOffer.id && String(flightOffer.id).startsWith("mock-")) {
      return NextResponse.json({
        success: true,
        data: {
          flightOffers: [flightOffer],
          warnings: ["Mock offer priced locally"],
        },
      });
    }

    const gdsOffer = flightOffer.rawAmadeusOffer || flightOffer;

    try {
      const token = await getAmadeusToken();
      const payload = {
        data: {
          type: "flight-offers-pricing",
          flightOffers: [gdsOffer],
        },
      };

      const response: any = await amadeusPost(
        "/v1/shopping/flight-offers/pricing",
        token,
        payload
      );

      if (response?.data?.flightOffers) {
        const markedFlightOffers = response.data.flightOffers.map((off: any) => {
          const rawTotal = parseFloat(off.price?.grandTotal ?? off.price?.total ?? "0");
          const rawBase  = parseFloat(off.price?.base ?? "0");
          const finalTotal = isFlat ? rawTotal + markupValue : rawTotal * (1 + markupValue / 100);
          const finalBase  = isFlat ? rawBase + markupValue : rawBase * (1 + markupValue / 100);
          return {
            ...off,
            price: {
              ...off.price,
              total: finalTotal.toFixed(2),
              grandTotal: finalTotal.toFixed(2),
              base: finalBase.toFixed(2),
            },
          };
        });

        return NextResponse.json({
          success: true,
          data: {
            ...response.data,
            flightOffers: markedFlightOffers,
          },
          dictionaries: response.dictionaries,
        });
      }

      // If pricing response does not contain flightOffers, return the original offer with fallback flag
      return NextResponse.json({
        success: true,
        data: {
          flightOffers: [flightOffer],
        },
        fallback: true,
      });
    } catch (amadeusErr: any) {
      console.warn("[Amadeus Flight Pricing API Warning]:", amadeusErr.message);
      // Fallback gracefully so user can continue booking flow
      return NextResponse.json({
        success: true,
        data: {
          flightOffers: [flightOffer],
        },
        fallback: true,
        warning: amadeusErr.message,
      });
    }
  } catch (error: any) {
    console.error("[Flight Pricing Fatal Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify flight pricing" },
      { status: 500 }
    );
  }
}
