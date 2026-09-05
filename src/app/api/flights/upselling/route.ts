import dns from "node:dns";
try { dns.setDefaultResultOrder("ipv4first"); } catch { /* ignore */ }

import { NextRequest, NextResponse } from "next/server";
import { getAmadeusToken, amadeusPost } from "@/lib/amadeus";
import type { FlightOffer, Currency, FlightSegment, Itinerary } from "@/types/flight";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface UpsellRequestBody {
  flightOffer: FlightOffer;
  currency?: Currency;
}

interface AmenityItem {
  code?: string;
  description?: string;
  isChargeable?: boolean;
  amenityType?: string;
}

function airlineLogo(code: string): string {
  return `https://content.airhex.com/content/logos/airlines_${code}_32_32_s.png`;
}

function mapOfferToFlightOffer(
  rawOffer: any,
  requestedCurrency: Currency,
  markupType: string = "PERCENTAGE",
  markupValue: number = 5
): FlightOffer {
  const rawTotal = parseFloat(rawOffer.price?.grandTotal ?? rawOffer.price?.total ?? "0");
  const rawBase = parseFloat(rawOffer.price?.base ?? "0");

  let finalTotal = rawTotal;
  let finalBase = rawBase;

  if (markupType === "FIXED") {
    finalTotal += markupValue;
    finalBase += markupValue;
  } else {
    const pct = 1 + markupValue / 100;
    finalTotal *= pct;
    finalBase *= pct;
  }

  const numTravelers = rawOffer.travelerPricings?.length || 1;
  const perPax = (finalTotal / numTravelers).toFixed(2);

  const itineraries: Itinerary[] = (rawOffer.itineraries || []).map((itin: any) => ({
    duration: itin.duration,
    segments: (itin.segments || []).map((seg: any): FlightSegment => ({
      id: seg.id,
      carrierCode: seg.carrierCode,
      flightNumber: `${seg.carrierCode}${seg.number}`,
      aircraft: seg.aircraft?.code ?? "---",
      airlineLogo: airlineLogo(seg.carrierCode),
      departure: {
        iataCode: seg.departure?.iataCode,
        terminal: seg.departure?.terminal,
        at: seg.departure?.at,
      },
      arrival: {
        iataCode: seg.arrival?.iataCode,
        terminal: seg.arrival?.terminal,
        at: seg.arrival?.at,
      },
      duration: seg.duration,
      numberOfStops: seg.numberOfStops ?? 0,
    })),
  }));

  // Extract baggage allowance
  let baggageQty = 0;
  let baggageWeight: number | undefined = undefined;
  const fareDetails = rawOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
  if (fareDetails?.includedCheckedBags) {
    if (typeof fareDetails.includedCheckedBags.quantity === "number") {
      baggageQty = fareDetails.includedCheckedBags.quantity;
    }
    if (typeof fareDetails.includedCheckedBags.weight === "number") {
      baggageWeight = fareDetails.includedCheckedBags.weight;
      if (baggageQty === 0) baggageQty = 1;
    }
  }

  return {
    id: rawOffer.id,
    source: rawOffer.source ?? "GDS",
    price: {
      total: finalTotal.toFixed(2),
      base: finalBase.toFixed(2),
      currency: requestedCurrency,
      perPassenger: perPax,
    },
    itineraries,
    validatingAirlineCodes: rawOffer.validatingAirlineCodes ?? [],
    numberOfBookableSeats: rawOffer.numberOfBookableSeats ?? 9,
    lastTicketingDate: rawOffer.lastTicketingDate ?? "",
    baggageAllowance: {
      quantity: baggageQty,
      weight: baggageWeight ?? (baggageQty > 0 ? 23 : undefined),
      weightUnit: "KG",
    },
    rawAmadeusOffer: rawOffer,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: UpsellRequestBody = await req.json();
    const { flightOffer, currency = "USD" } = body;

    if (!flightOffer) {
      return NextResponse.json({ success: false, error: "Missing flightOffer" }, { status: 400 });
    }

    const rawOffer = (flightOffer.rawAmadeusOffer || flightOffer) as any;

    // If it's a mock offer or doesn't have Amadeus structure, return fallback flag
    if (!rawOffer || !rawOffer.itineraries || String(flightOffer.id).startsWith("mock-")) {
      return NextResponse.json({
        success: false,
        reason: "mock_or_unsupported",
      });
    }

    // Fetch Admin Profit Markup
    let markupType = "PERCENTAGE";
    let markupValue = 5;
    try {
      const typeSetting = await prisma.systemSetting.findUnique({ where: { key: "markup_type" } });
      const valSetting = await prisma.systemSetting.findUnique({ where: { key: "markup_value" } });
      if (typeSetting?.value) markupType = typeSetting.value;
      if (valSetting?.value) markupValue = parseFloat(valSetting.value);
    } catch {
      /* use default */
    }

    // Call Amadeus Upselling API
    let token: string;
    try {
      token = await getAmadeusToken();
    } catch (err: any) {
      console.warn("[Amadeus Upsell] Token auth failed:", err.message);
      return NextResponse.json({ success: false, reason: "auth_failed" });
    }

    const payload = {
      data: {
        type: "flight-offers-upselling",
        flightOffers: [rawOffer],
      },
    };

    let amadeusResponse: any;
    try {
      amadeusResponse = await amadeusPost(
        "/v1/shopping/flight-offers/upselling",
        token,
        payload
      );
    } catch (err: any) {
      console.warn("[Amadeus Upselling API Error]:", err.message);
      return NextResponse.json({ success: false, reason: "api_call_failed", message: err.message });
    }

    const returnedOffers = amadeusResponse?.data;
    if (!returnedOffers || !Array.isArray(returnedOffers) || returnedOffers.length === 0) {
      console.log("[Amadeus Upselling] No upsell tiers returned by airline for this flight.");
      return NextResponse.json({ success: false, reason: "no_tiers_available" });
    }

    // Map each returned upsell offer
    const mappedOffers: FlightOffer[] = returnedOffers.map((offer: any) =>
      mapOfferToFlightOffer(offer, currency, markupType, markupValue)
    );

    // Sort offers by price ascending
    mappedOffers.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));

    const basePrice = parseFloat(flightOffer.price.total);

    // Select up to 3 distinct tiers: Light / Standard / Flex
    // If Amadeus returns multiple tiers:
    // Option 1 = Light / Basic (lowest price)
    // Option 2 = Standard (recommended)
    // Option 3 = Flex / Premium (highest flexibility)
    let selectedTierOffers: { id: "light" | "standard" | "flex"; offer: FlightOffer; raw: any }[] = [];

    if (mappedOffers.length === 1) {
      selectedTierOffers = [
        { id: "light", offer: mappedOffers[0], raw: returnedOffers[0] },
      ];
    } else if (mappedOffers.length === 2) {
      selectedTierOffers = [
        { id: "light", offer: mappedOffers[0], raw: returnedOffers[0] },
        { id: "standard", offer: mappedOffers[1], raw: returnedOffers[1] },
      ];
    } else {
      // 3 or more offers
      // 1st is lowest (Light)
      // middle is Standard
      // highest of reasonable economy/flex is Flex
      const first = mappedOffers[0];
      const middleIdx = Math.floor(mappedOffers.length / 2);
      const middle = mappedOffers[middleIdx];
      const last = mappedOffers[mappedOffers.length - 1];

      selectedTierOffers = [
        { id: "light", offer: first, raw: returnedOffers[0] },
        { id: "standard", offer: middle, raw: returnedOffers[middleIdx] },
        { id: "flex", offer: last, raw: returnedOffers[returnedOffers.length - 1] },
      ];
    }

    // Build structured FareTier objects with live data
    const tiers = selectedTierOffers.map(({ id, offer, raw }) => {
      const fareDetail = raw?.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
      const amenities: AmenityItem[] = fareDetail?.amenities ?? [];
      const brandedFareCode = fareDetail?.brandedFare ?? "";
      const cabin = fareDetail?.cabin ?? "ECONOMY";

      const tierPrice = parseFloat(offer.price.total);
      const priceAdd = Math.max(0, Math.round(tierPrice - basePrice));

      // Baggage analysis
      const bagQty = offer.baggageAllowance?.quantity ?? 0;
      const bagDesc = bagQty > 0
        ? `${bagQty} × 23 KG included`
        : "Not included (Add-on available)";

      // Amenities parsing
      const carryonAmenity = amenities.find((a) =>
        a.description?.toLowerCase().includes("carryon") || a.description?.toLowerCase().includes("carry-on")
      );
      const carryonDesc = carryonAmenity?.description
        ? carryonAmenity.description.replace(/carryon\s*/i, "").trim()
        : "1 × 7-8 KG Overhead bag";

      const seatAmenity = amenities.find((a) =>
        a.description?.toLowerCase().includes("seat")
      );
      const seatIncluded = seatAmenity ? !seatAmenity.isChargeable : id !== "light";
      const seatValue = seatIncluded
        ? "Choose standard seat in advance"
        : "Standard seat allocated at check-in";

      const changeAmenity = amenities.find((a) =>
        a.description?.toLowerCase().includes("change")
      );
      const changesIncluded = changeAmenity ? !changeAmenity.isChargeable : id !== "light";
      const changesValue = changesIncluded
        ? "Free date changes up to departure"
        : "Fee applies + fare difference";

      const refundAmenity = amenities.find((a) =>
        a.description?.toLowerCase().includes("refund")
      );
      const refundIncluded = refundAmenity ? !refundAmenity.isChargeable : id === "flex";
      const refundValue = refundIncluded
        ? "100% Refundable ticket"
        : "Non-refundable ticket";

      const priorityAmenity = amenities.find((a) =>
        a.description?.toLowerCase().includes("priority")
      );
      const priorityIncluded = priorityAmenity ? !priorityAmenity.isChargeable : id === "flex";
      const priorityValue = priorityIncluded
        ? "Priority Check-in & Boarding"
        : "Standard Boarding (Group 3/4)";

      // Labels and Badges
      let label = id === "light" ? "Economy Light" : id === "standard" ? "Economy Standard" : "Economy Flex";
      if (brandedFareCode) {
        if (brandedFareCode === "BSC" || brandedFareCode === "BAS") label = "Economy Basic";
        else if (brandedFareCode === "FLX") label = "Economy Flex";
        else if (brandedFareCode === "TOP" || brandedFareCode === "PLU") label = "Economy Premium/Plus";
        else if (brandedFareCode === "LIT") label = "Business Lite";
      }

      let badge = "Basic Fare";
      let tagline = bagQty > 0 ? "Essential fare · Bag included" : "Hand baggage only · Best price";

      if (id === "standard") {
        badge = "Most Popular";
        tagline = "Seat selection + checked baggage included";
      } else if (id === "flex") {
        badge = "Maximum Freedom";
        tagline = "Flexible changes + baggage + priority";
      }

      return {
        id,
        label,
        badge,
        tagline,
        priceAdd,
        totalPrice: tierPrice,
        recommended: id === "standard",
        brandedFareCode,
        cabin,
        isLiveAmadeus: true,
        upgradedOffer: offer,
        accentBg:
          id === "standard"
            ? "bg-primary/5 dark:bg-primary/10"
            : id === "flex"
            ? "bg-slate-50 dark:bg-slate-900/50"
            : "bg-slate-50/80 dark:bg-slate-900/60",
        accentBorder:
          id === "standard"
            ? "border-primary"
            : id === "flex"
            ? "border-slate-300 dark:border-slate-700"
            : "border-slate-200 dark:border-slate-800",
        accentText:
          id === "standard"
            ? "text-primary"
            : id === "flex"
            ? "text-slate-800 dark:text-slate-200"
            : "text-slate-700 dark:text-slate-300",
        accentPillBg:
          id === "standard"
            ? "bg-primary/15 text-primary border border-primary/30"
            : id === "flex"
            ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        features: [
          {
            icon: "personal",
            label: "Personal Item",
            value: "1 Small under-seat bag (Laptop/Handbag)",
            included: true,
          },
          {
            icon: "cabin",
            label: "Cabin Carry-on",
            value: carryonDesc.startsWith("1") ? carryonDesc : `1 × ${carryonDesc}`,
            included: true,
          },
          {
            icon: "luggage",
            label: "Checked Baggage",
            value: bagDesc,
            included: bagQty > 0,
            highlight: bagQty > 0,
          },
          {
            icon: "seat",
            label: "Seat Selection",
            value: seatValue,
            included: seatIncluded,
          },
          {
            icon: "changes",
            label: "Flight Changes",
            value: changesValue,
            included: changesIncluded,
            highlight: changesIncluded,
          },
          {
            icon: "refund",
            label: "Cancellation & Refund",
            value: refundValue,
            included: refundIncluded,
            highlight: refundIncluded,
          },
          {
            icon: "priority",
            label: "Boarding Priority",
            value: priorityValue,
            included: priorityIncluded,
          },
        ],
      };
    });

    return NextResponse.json({
      success: true,
      isLive: true,
      tiers,
      count: tiers.length,
    });
  } catch (error: any) {
    console.error("[Flight Upselling Fatal Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch live branded fare tiers" },
      { status: 500 }
    );
  }
}
