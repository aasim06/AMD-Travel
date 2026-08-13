import dns from "node:dns";
try { dns.setDefaultResultOrder("ipv4first"); } catch { /* ignore */ }

import { NextRequest, NextResponse } from "next/server";
import { AMADEUS_BASE_URL, getAmadeusToken } from "@/lib/amadeus";
import type { FlightOffer } from "@/types/flight";
import type { CheckoutData } from "@/components/checkout/types";
import { sendPNRNotification } from "@/lib/emailService";

interface BookRequestBody {
  flightOffer?: unknown;
  offer?: FlightOffer;
  passengers?: CheckoutData["passengers"];
  travelers?: any[];
  contact?: CheckoutData["contact"];
  selectedPrice?: number | null;
  fareClass?: string;
}

const DIAL_TO_ISO: Record<string, string> = {
  "92": "PK", "+92": "PK", "PAKISTAN": "PK",
  "49": "DE", "+49": "DE", "GERMANY": "DE",
  "1": "US",  "+1": "US",  "UNITED STATES": "US", "USA": "US", "CANADA": "CA",
  "44": "GB", "+44": "GB", "UNITED KINGDOM": "GB", "UK": "GB",
  "966": "SA", "+966": "SA", "SAUDI ARABIA": "SA",
  "971": "AE", "+971": "AE", "UNITED ARAB EMIRATES": "AE", "UAE": "AE",
  "33": "FR", "+33": "FR", "FRANCE": "FR",
  "39": "IT", "+39": "IT", "ITALY": "IT",
  "34": "ES", "+34": "ES", "SPAIN": "ES",
  "91": "IN", "+91": "IN", "INDIA": "IN",
  "90": "TR", "+90": "TR", "TURKEY": "TR", "TÜRKIYE": "TR",
  "61": "AU", "+61": "AU", "AUSTRALIA": "AU",
  "86": "CN", "+86": "CN", "CHINA": "CN",
  "880": "BD", "+880": "BD", "BANGLADESH": "BD",
  "60": "MY", "+60": "MY", "MALAYSIA": "MY",
  "65": "SG", "+65": "SG", "SINGAPORE": "SG",
  "974": "QA", "+974": "QA", "QATAR": "QA",
  "965": "KW", "+965": "KW", "KUWAIT": "KW",
  "968": "OM", "+968": "OM", "OMAN": "OM",
  "973": "BH", "+973": "BH", "BAHRAIN": "BH",
};

function toIso2CountryCode(val?: string, fallback = "PK"): string {
  if (!val) return fallback;
  const clean = val.trim().toUpperCase();
  if (DIAL_TO_ISO[clean]) return DIAL_TO_ISO[clean];
  const noPlus = clean.replace("+", "");
  if (DIAL_TO_ISO[noPlus]) return DIAL_TO_ISO[noPlus];
  if (/^[A-Z]{2}$/.test(clean)) return clean;
  return fallback;
}

export async function POST(request: NextRequest) {
  try {
    const body: BookRequestBody = await request.json();
    const { flightOffer, offer, passengers, travelers, contact, selectedPrice, fareClass } = body;

    // Use full unmodified offer object from rawAmadeusOffer or flightOffer
    const rawOffer = flightOffer || offer?.rawAmadeusOffer || offer;
    const travelerList = passengers || travelers;

    if (!rawOffer || !travelerList || travelerList.length === 0 || !contact) {
      return NextResponse.json(
        { success: false, error: "Missing required booking details (flightOffer, travelers, or contact)" },
        { status: 400 }
      );
    }

    console.log(`[Amadeus Book] Building GDS booking payload for ${travelerList.length} passenger(s)...`);

    const contactAny = contact as any;
    const currentOfferObj = (offer || rawOffer) as any;

    const amadeusTravelers = travelerList.map((t: any, index: number) => {
      const travelerId = String(index + 1);
      const isFemale = t.title === "Mrs" || t.title === "Ms" || t.gender === "FEMALE";
      const gender = isFemale ? "FEMALE" : "MALE";

      const rawDob = t.dateOfBirth ? t.dateOfBirth.split("T")[0] : "1990-01-01";
      const rawExp = t.passportExpiry ? t.passportExpiry.split("T")[0] : "2030-01-01";
      const rawIss = t.passportIssuanceDate || t.issuanceDate ? (t.passportIssuanceDate || t.issuanceDate).split("T")[0] : "2020-01-01";

      const phoneNum = (t.phone || contactAny.phone || "").replace(/[^\d]/g, "");
      const callingCode = (t.callingCode || contactAny.countryCode || "+92").replace("+", "");

      const pNum = t.passportNumber || t.documents?.[0]?.number;

      return {
        id: travelerId,
        dateOfBirth: rawDob,
        name: {
          firstName: (t.firstName || t.name?.firstName || "").toUpperCase().trim(),
          lastName: (t.lastName || t.name?.lastName || "").toUpperCase().trim(),
        },
        gender,
        contact: {
          emailAddress: (t.email || contactAny.email || "").trim(),
          phones: [
            {
              deviceType: "MOBILE",
              countryCallingCode: callingCode || "92",
              number: phoneNum || "3001234567",
            },
          ],
        },
        documents: pNum
          ? [
              {
                documentType: "PASSPORT",
                birthPlace: t.birthPlace || "Lahore",
                issuanceLocation: t.issuanceLocation || "Lahore",
                issuanceDate: rawIss,
                number: String(pNum).toUpperCase().trim(),
                expiryDate: rawExp,
                issuanceCountry: toIso2CountryCode(t.passportCountry || t.issuanceCountry, "PK"),
                validityCountry: toIso2CountryCode(t.validityCountry || t.passportCountry, "PK"),
                nationality: toIso2CountryCode(t.nationality || t.passportCountry, "PK"),
                holder: true,
              },
            ]
          : undefined,
      };
    });

    // Match Reference Implementation Payload Structure Exactly (PDF Page 3 & 4)
    const bookingPayload = {
      data: {
        type: "flight-order",
        flightOffers: [rawOffer],
        travelers: amadeusTravelers,
        remarks: {
          general: [
            {
              subType: "GENERAL_MISCELLANEOUS",
              text: "ONLINE BOOKING",
            },
          ],
        },
        ticketingAgreement: {
          option: "CONFIRM",
          delay: "6D",
        },
        contacts: [
          {
            addresseeName: {
              firstName: contactAny.firstName || "Traveler",
              lastName: contactAny.lastName || "Contact",
            },
            companyName: contactAny.companyName || "AMD GLOBAL TRAVEL",
            purpose: "STANDARD",
            phones: [
              {
                deviceType: "LANDLINE",
                countryCallingCode: (contactAny.countryCode || "+92").replace("+", "") || "92",
                number: (contactAny.phone || "").replace(/[^\d]/g, "") || "3001234567",
              },
              {
                deviceType: "MOBILE",
                countryCallingCode: (contactAny.countryCode || "+92").replace("+", "") || "92",
                number: (contactAny.phone || "").replace(/[^\d]/g, "") || "3001234567",
              },
            ],
            emailAddress: contactAny.email,
            address: {
              lines: [contactAny.address || "Travel Agency Desk"],
              postalCode: contactAny.postalCode || "54000",
              cityName: contactAny.city || "Lahore",
              countryCode: toIso2CountryCode(contactAny.countryCode || contactAny.addressCountry, "DE"),
            },
          },
        ],
        formOfPayments: [
          {
            other: {
              method: "CASH",
              flightOfferIds: [1],
            },
          },
        ],
      },
    };

    console.log("[Amadeus] Booking payload:", JSON.stringify(bookingPayload));

    const token = await getAmadeusToken();
    const url = `${AMADEUS_BASE_URL}/v1/booking/flight-orders`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookingPayload),
    });

    const data = await res.json();
    console.log("[Amadeus] Booking raw response:", JSON.stringify(data));

    // STRICT CHECK: If Amadeus returns errors or HTTP error status, return REAL FAILURE response
    if (!res.ok || data.errors) {
      const firstError = data.errors?.[0];
      const errorMsg = firstError?.detail || firstError?.title || `Amadeus API HTTP ${res.status}`;
      console.error("[Amadeus Booking API Failed]:", errorMsg, data.errors);
      return NextResponse.json(
        {
          success: false,
          error: `Amadeus Live Booking Failed: ${errorMsg}`,
          errors: data.errors || null,
          response: data,
        },
        { status: res.ok ? 400 : res.status }
      );
    }

    // Extract PNR reference code from Amadeus response
    const pnr = data.data?.associatedRecords?.[0]?.reference || data.data?.id?.substring(0, 6).toUpperCase();
    const amadeusOrderId = data.data?.id ?? "";

    if (!pnr) {
      return NextResponse.json(
        {
          success: false,
          error: "Amadeus response succeeded but no PNR record locator reference was assigned by GDS.",
          response: data,
        },
        { status: 500 }
      );
    }

    console.log(`[Amadeus Book SUCCESS] Live PNR Generated in GDS: ${pnr} (OrderId: ${amadeusOrderId})`);

    // Build standardized booking object for frontend persistence
    const depSeg = currentOfferObj.itineraries?.[0]?.segments?.[0];
    const arrSeg = currentOfferObj.itineraries?.[currentOfferObj.itineraries.length - 1]?.segments?.at(-1);

    const bookingData = {
      id: `bk_${Date.now()}_${pnr}`,
      pnr: pnr,
      source: "AMADEUS_LIVE" as const,
      amadeusOrderId: amadeusOrderId || undefined,
      type: "flight" as const,
      status: "confirmed" as const,
      title: `${depSeg?.departure?.iataCode || "DEP"} → ${arrSeg?.arrival?.iataCode || "ARR"}`,
      subtitle: `${depSeg?.carrierCode || "Flight"} · ${fareClass || "Economy"} Class`,
      bookingDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      travelDate: depSeg?.departure?.at
        ? new Date(depSeg.departure.at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      travelDateRaw: depSeg?.departure?.at || new Date().toISOString(),
      passengers: travelerList.map((p: any) => ({
        name: `${p.firstName || p.name?.firstName} ${p.lastName || p.name?.lastName}`,
        type: "Adult",
        seat: "Auto-Assigned",
        passportNo: p.passportNumber || p.documents?.[0]?.number || "N/A",
      })),
      details: {
        airline: depSeg?.carrierCode || "Airline",
        flightNo: depSeg?.flightNumber || depSeg?.number || "FL100",
        departureCity: depSeg?.departure?.iataCode || "DEP",
        departureAirport: `${depSeg?.departure?.iataCode || "Airport"} Intl.`,
        departureTime: depSeg?.departure?.at ? new Date(depSeg.departure.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "10:00 AM",
        arrivalCity: arrSeg?.arrival?.iataCode || "ARR",
        arrivalAirport: `${arrSeg?.arrival?.iataCode || "Airport"} Intl.`,
        arrivalTime: arrSeg?.arrival?.at ? new Date(arrSeg.arrival.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "02:00 PM",
        cabinClass: fareClass || "Economy",
        baggage: currentOfferObj.baggageAllowance ? `${currentOfferObj.baggageAllowance.quantity || 1}x ${currentOfferObj.baggageAllowance.weight || 23}kg` : "23kg Checked",
        duration: depSeg?.duration || "2h 30m",
        totalAmount: selectedPrice ? `$${selectedPrice}` : `$${currentOfferObj.price?.total || "0"}`,
      },
    };

    // Trigger PNR email notification asynchronously (guaranteed not to break API response)
    sendPNRNotification({
      pnrNumber: pnr,
      passengerName: travelerList[0]
        ? `${travelerList[0].firstName || travelerList[0].name?.firstName || ""} ${travelerList[0].lastName || travelerList[0].name?.lastName || ""}`.trim()
        : (contactAny.firstName ? `${contactAny.firstName} ${contactAny.lastName}` : "Passenger"),
      passengerEmail: contactAny.email || travelerList[0]?.email,
      flightDetails: {
        airline: depSeg?.carrierCode || "Airline",
        flightNumber: `${depSeg?.carrierCode || ""}${depSeg?.flightNumber || depSeg?.number || ""}`.trim(),
        origin: depSeg?.departure?.iataCode || "DEP",
        destination: arrSeg?.arrival?.iataCode || "ARR",
        departureDate: depSeg?.departure?.at
          ? new Date(depSeg.departure.at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        cabinClass: fareClass || "Economy",
        totalAmount: selectedPrice ? `$${selectedPrice}` : `$${currentOfferObj.price?.total || "0"}`,
      },
      status: "CONFIRMED",
    }).catch((emailErr) => console.error("[PNR Email Async Error]:", emailErr));

    return NextResponse.json({
      success: true,
      pnr: pnr,
      orderId: amadeusOrderId || null,
      source: "AMADEUS_LIVE",
      warnings: data.warnings || null,
      booking: bookingData,
      response: data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Amadeus Book Fatal Error]:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
