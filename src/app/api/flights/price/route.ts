import { NextRequest, NextResponse } from "next/server";
import { amadeusPost, getAmadeusToken, AMADEUS_BASE_URL } from "@/lib/amadeus";

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

    try {
      const token = await getAmadeusToken();
      const payload = {
        data: {
          type: "flight-offers-pricing",
          flightOffers: [flightOffer],
        },
      };

      const response: any = await amadeusPost(
        "/v1/shopping/flight-offers/pricing",
        token,
        payload
      );

      if (response?.data?.flightOffers) {
        return NextResponse.json({
          success: true,
          data: response.data,
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
