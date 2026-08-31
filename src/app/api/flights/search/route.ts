import dns from "node:dns";
try { dns.setDefaultResultOrder("ipv4first"); } catch { /* ignore */ }

import { NextRequest, NextResponse } from "next/server";
import { getAmadeusToken, amadeusFetch, amadeusPost } from "@/lib/amadeus";
import type { FlightOffer, FlightSegment, Itinerary, TravelClass, Currency } from "@/types/flight";
import { prisma } from "@/lib/prisma";

// Force IPv4 resolution
async function safeLookup(hostname: string): Promise<string> {
  try {
    const res = await dns.promises.lookup(hostname, { family: 4 });
    return res.address;
  } catch {
    return hostname;
  }
}

// ─── Mock data fallback (used when Amadeus is unreachable or for multi-city preview) ───

function generateMockFlights(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string | undefined,
  passengers: number,
  travelClass: TravelClass,
  currency: Currency,
  tripType: string,
  legs?: { origin: string; destination: string; departureDate: string }[]
): object {
  const isRound = tripType === "round-trip";
  const isMultiCity = tripType === "multi-city" && legs && legs.length >= 2;

  const isDomesticPk = ["LHE","ISB","KHI","PEW","MUX","SKT","UET"].includes(origin.toUpperCase()) &&
                       ["LHE","ISB","KHI","PEW","MUX","SKT","UET"].includes(destination.toUpperCase());

  const MOCK_CARRIERS = isDomesticPk
    ? [
        { code: "PK", name: "PIA (Pakistan International Airlines)", basePrice: 85 },
        { code: "PA", name: "Airblue",                              basePrice: 78 },
        { code: "PF", name: "AirSial",                              basePrice: 82 },
        { code: "9P", name: "Fly Jinnah",                           basePrice: 72 },
        { code: "ER", name: "SereneAir",                            basePrice: 80 },
      ]
    : [
        { code: "EK", name: "Emirates",       basePrice: 420 },
        { code: "QR", name: "Qatar Airways",   basePrice: 390 },
        { code: "TK", name: "Turkish Airlines",basePrice: 340 },
        { code: "EY", name: "Etihad Airways",  basePrice: 410 },
        { code: "SV", name: "Saudia",          basePrice: 310 },
        { code: "FZ", name: "flydubai",        basePrice: 240 },
      ];

  const AIRCRAFT: Record<string, string> = {
    PK: "320", PA: "321", PF: "320", "9P": "320", ER: "738",
    EK: "77W", QR: "359", TK: "321", EY: "789", SV: "333", FZ: "73H",
  };

  const carriers: Record<string, string> = {};
  const aircraft: Record<string, string> = { "77W": "Boeing 777-300ER", "359": "Airbus A350-900", "321": "Airbus A321", "789": "Boeing 787-9", "333": "Airbus A330-300", "73H": "Boeing 737-800" };

  let routeSeed = 0;
  for (let i = 0; i < (origin + destination).length; i++) {
    routeSeed += (origin + destination).charCodeAt(i);
  }
  const routeMult = 0.75 + (routeSeed % 15) * 0.08;

  const offers: FlightOffer[] = MOCK_CARRIERS.map((c, i) => {
    carriers[c.code] = c.name;
    const variation = (1 + (i * 0.07)) * routeMult;

    if (isMultiCity) {
      // ── MULTI-CITY ITINERARY GENERATION ────────────────────────────────────
      const itineraries: Itinerary[] = [];
      let multiCityTotal = 0;

      legs.forEach((leg, legIdx) => {
        const legDate = leg.departureDate || departureDate;
        const depTime = ["06:15", "09:30", "13:45", "16:20", "20:10", "22:45"][(i + legIdx) % 6];
        const depAt = `${legDate}T${depTime}:00`;
        const durMins = 120 + ((legIdx * 45 + i * 30) % 360);
        const arrAt = new Date(new Date(depAt).getTime() + durMins * 60000).toISOString().replace(".000Z", "");
        const durStr = `PT${Math.floor(durMins / 60)}H${durMins % 60 > 0 ? (durMins % 60) + "M" : ""}`;

        const legPrice = Math.round((c.basePrice * 0.85 + legIdx * 60) * variation);
        multiCityTotal += legPrice;

        const seg: FlightSegment = {
          id: `${i + 1}-${legIdx + 1}`,
          carrierCode: c.code,
          flightNumber: `${c.code}${100 + (legIdx * 50) + (i * 12)}`,
          aircraft: AIRCRAFT[c.code] ?? "320",
          airlineLogo: `https://content.airhex.com/content/logos/airlines_${c.code}_32_32_s.png`,
          departure: { iataCode: leg.origin.toUpperCase(), at: depAt },
          arrival: { iataCode: leg.destination.toUpperCase(), at: arrAt },
          duration: durStr,
          numberOfStops: legIdx % 2 === 1 ? 1 : 0,
        };

        itineraries.push({
          duration: durStr,
          segments: [seg],
        });
      });

      const totalAmount = Math.round(multiCityTotal * passengers);
      const perPax = Math.round(totalAmount / passengers);

      return {
        id: `mock-multi-${i}-${c.code}`,
        source: "GDS" as const,
        price: {
          total: String(totalAmount),
          base: String(Math.round(totalAmount * 0.88)),
          currency,
          perPassenger: String(perPax),
        },
        itineraries,
        validatingAirlineCodes: [c.code],
        numberOfBookableSeats: 9 - i,
        lastTicketingDate: departureDate,
        baggageAllowance: { quantity: travelClass === "ECONOMY" ? 1 : 2, weight: 23, weightUnit: "KG" },
      };
    }

    // ── ONE-WAY / ROUND-TRIP ITINERARY GENERATION ────────────────────────────
    const depAt = `${departureDate}T${["06:00","09:30","12:15","15:45","18:00","21:30"][Math.floor(Math.random()*6)]}:00`;
    const durationMins = isDomesticPk ? (55 + Math.floor(Math.random() * 30)) : (120 + Math.floor(Math.random() * 300));
    const arrAt = new Date(new Date(depAt).getTime() + durationMins * 60000).toISOString().replace(".000Z","");
    const durStr = `PT${Math.floor(durationMins/60)}H${durationMins%60 > 0 ? durationMins%60+"M" : ""}`;

    const baseTotal  = Math.round(c.basePrice * variation * passengers);
    const roundMult  = isRound ? 1.85 : 1;
    const total      = Math.round(baseTotal * roundMult);
    const perPax     = Math.round(total / passengers);

    const seg: FlightSegment = {
      id: String(i + 1),
      carrierCode:  c.code,
      flightNumber: `${c.code}${100 + i * 37}`,
      aircraft:     AIRCRAFT[c.code] ?? "320",
      airlineLogo:  `https://content.airhex.com/content/logos/airlines_${c.code}_32_32_s.png`,
      departure: { iataCode: origin.toUpperCase(),      at: depAt  },
      arrival:   { iataCode: destination.toUpperCase(), at: arrAt  },
      duration:  durStr,
      numberOfStops: i > 3 ? 1 : 0,
    };

    const outboundItin: Itinerary = { duration: durStr, segments: [seg] };
    const itineraries: Itinerary[] = [outboundItin];

    if (isRound && returnDate) {
      const retDepAt = `${returnDate}T${["07:00","10:00","14:00","17:30","20:00"][i % 5]}:00`;
      const retArrAt = new Date(new Date(retDepAt).getTime() + durationMins * 60000).toISOString().replace(".000Z","");
      const retSeg: FlightSegment = {
        id:           String(i + 10),
        carrierCode:  c.code,
        flightNumber: `${c.code}${200 + i * 37}`,
        aircraft:     AIRCRAFT[c.code] ?? "320",
        airlineLogo:  `https://content.airhex.com/content/logos/airlines_${c.code}_32_32_s.png`,
        departure: { iataCode: destination.toUpperCase(), at: retDepAt },
        arrival:   { iataCode: origin.toUpperCase(),      at: retArrAt },
        duration:  durStr,
        numberOfStops: 0,
      };
      itineraries.push({ duration: durStr, segments: [retSeg] });
    }

    return {
      id:                    `mock-${i}-${c.code}`,
      source:                "GDS" as const,
      price: {
        total:        String(total),
        base:         String(Math.round(total * 0.88)),
        currency,
        perPassenger: String(perPax),
      },
      itineraries,
      validatingAirlineCodes: [c.code],
      numberOfBookableSeats:  9 - i,
      lastTicketingDate:      departureDate,
      baggageAllowance: { quantity: travelClass === "ECONOMY" ? 1 : 2, weight: 23, weightUnit: "KG" },
    };
  });

  return {
    data: offers,
    meta: { count: offers.length, currency, origin: origin.toUpperCase(), destination: destination.toUpperCase(), departureDate },
    dictionaries: { carriers, aircraft, locations: {} },
    _mock: true,
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchBody {
  tripType:      "one-way" | "round-trip" | "multi-city";
  origin:        string;
  destination:   string;
  departureDate: string;
  returnDate?:   string;
  passengers?:   number;
  travelClass?:  TravelClass;
  currency?:     Currency;
  fast?:         boolean;
  legs?: { origin: string; destination: string; departureDate: string }[];
}

// ─── Amadeus raw types ────────────────────────────────────────────────────────

interface AmadeusSegment {
  id: string;
  departure:   { iataCode: string; terminal?: string; at: string };
  arrival:     { iataCode: string; terminal?: string; at: string };
  carrierCode: string;
  number:      string;
  aircraft:    { code: string };
  duration:    string;
  numberOfStops: number;
}

interface AmadeusItinerary {
  duration: string;
  segments: AmadeusSegment[];
}

interface AmadeusOffer {
  id: string;
  source: "GDS" | "NDC";
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: AmadeusItinerary[];
  price: {
    currency: string;
    total: string;
    base: string;
    grandTotal?: string;
  };
  validatingAirlineCodes: string[];
  travelerPricings?: {
    price: { total: string; base: string };
    fareDetailsBySegment: {
      segmentId: string;
      includedCheckedBags?: { quantity?: number; weight?: number; weightType?: string };
    }[];
  }[];
}

interface AmadeusResponse {
  data?: AmadeusOffer[];
  errors?: { title: string; detail: string; code: number }[];
  dictionaries?: {
    carriers?: Record<string, string>;
    aircraft?: Record<string, string>;
    locations?: Record<string, { cityCode: string; countryCode: string }>;
  };
}

// ─── Cache ────────────────────────────────────────────────────────────────────

interface CacheEntry { data: object; expiresAt: number }
const cache  = new Map<string, CacheEntry>();
const TTL_MS = 10 * 60 * 1000;

function cacheGet(key: string): object | null {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() > e.expiresAt) { cache.delete(key); return null; }
  return e.data;
}
function cacheSet(key: string, data: object) {
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

// ─── Airline logo helper ──────────────────────────────────────────────────────

function airlineLogo(code: string): string {
  return `https://content.airhex.com/content/logos/airlines_${code}_32_32_s.png`;
}

function extractBaggageAllowance(offer: AmadeusOffer): { quantity: number; weight?: number; weightUnit?: string } {
  let quantity = 0;
  let weight: number | undefined = undefined;
  let weightUnit = "KG";
  let foundInfo = false;

  if (offer.travelerPricings) {
    for (const traveler of offer.travelerPricings) {
      if (traveler.fareDetailsBySegment) {
        for (const fareDetail of traveler.fareDetailsBySegment) {
          const bags = fareDetail.includedCheckedBags;
          if (bags) {
            foundInfo = true;
            if (typeof bags.quantity === "number" && bags.quantity > 0) {
              quantity = Math.max(quantity, bags.quantity);
            }
            if (typeof bags.weight === "number" && bags.weight > 0) {
              weight = bags.weight;
              const u = bags.weightType ?? (bags as Record<string, unknown>).weightUnit ?? "KG";
              weightUnit = String(u).toUpperCase();
              if (quantity === 0) {
                quantity = 1;
              }
            }
          }
        }
      }
    }
  }

  if (foundInfo) {
    return { quantity, weight, weightUnit };
  }

  return { quantity: 1, weight: 23, weightUnit: "KG" };
}

// ─── Map Amadeus offer to our FlightOffer format ──────────────────────────────

function mapOffer(offer: AmadeusOffer, requestedCurrency: Currency, markupType: string = "PERCENTAGE", markupValue: number = 5): FlightOffer {
  const rawTotal = parseFloat(offer.price.grandTotal ?? offer.price.total);
  const rawBase  = parseFloat(offer.price.base);

  // Apply Admin Profit Markup dynamically
  let finalTotal = rawTotal;
  let finalBase  = rawBase;

  if (markupType === "FIXED") {
    finalTotal += markupValue;
    finalBase  += markupValue;
  } else {
    // Percentage markup (e.g. +5%)
    const pct = 1 + markupValue / 100;
    finalTotal *= pct;
    finalBase  *= pct;
  }

  const numTravelers = offer.travelerPricings?.length || 1;
  const perPax = (finalTotal / numTravelers).toFixed(2);

  const itineraries: Itinerary[] = offer.itineraries.map((itin) => ({
    duration: itin.duration,
    segments: itin.segments.map((seg): FlightSegment => ({
      id:            seg.id,
      carrierCode:   seg.carrierCode,
      flightNumber:  `${seg.carrierCode}${seg.number}`,
      aircraft:      seg.aircraft?.code ?? "---",
      airlineLogo:   airlineLogo(seg.carrierCode),
      departure: {
        iataCode: seg.departure.iataCode,
        terminal: seg.departure.terminal,
        at:       seg.departure.at,
      },
      arrival: {
        iataCode: seg.arrival.iataCode,
        terminal: seg.arrival.terminal,
        at:       seg.arrival.at,
      },
      duration:      seg.duration,
      numberOfStops: seg.numberOfStops,
    })),
  }));

  const baggageAllowance = extractBaggageAllowance(offer);

  return {
    id:                     offer.id,
    source:                 offer.source ?? "GDS",
    price: {
      total:        finalTotal.toFixed(2),
      base:         finalBase.toFixed(2),
      currency:     requestedCurrency,
      perPassenger: perPax,
    },
    itineraries,
    validatingAirlineCodes: offer.validatingAirlineCodes,
    numberOfBookableSeats:  offer.numberOfBookableSeats ?? 9,
    lastTicketingDate:      offer.lastTicketingDate,
    baggageAllowance,
    rawAmadeusOffer:        offer,
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: SearchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const {
    tripType      = "one-way",
    origin,
    destination,
    departureDate,
    returnDate,
    passengers  = 1,
    travelClass = "ECONOMY",
    currency    = "USD",
  } = body;

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { success: false, error: "origin, destination, and departureDate are required" },
      { status: 400 }
    );
  }

  const isRoundTrip = tripType === "round-trip";
  const isMultiCity = tripType === "multi-city";

  if (isRoundTrip && !returnDate) {
    return NextResponse.json({ success: false, error: "returnDate required for round-trip" }, { status: 400 });
  }
  if (isMultiCity && (!body.legs || body.legs.length < 2)) {
    return NextResponse.json({ success: false, error: "At least 2 legs required for multi-city" }, { status: 400 });
  }

  // ── Cache check ────────────────────────────────────────────────────────────
  const cacheKey = [tripType, origin, destination, departureDate, returnDate ?? "", passengers, travelClass, currency,
    isMultiCity ? JSON.stringify(body.legs) : ""].join(":");
  const cached = cacheGet(cacheKey);
  if (cached) {
    console.log("[Amadeus] Cache HIT:", cacheKey);
    return NextResponse.json({ ...cached, cached: true });
  }

  // ── Fast preview request (returns instant results in <300ms) ────────────────
  if (body.fast) {
    const instantData = generateMockFlights(
      origin, destination, departureDate, returnDate,
      passengers, travelClass, currency, tripType,
      body.legs
    );
    return NextResponse.json({ ...instantData, isPartial: true }, { headers: { "X-Data-Source": "FAST_PREVIEW" } });
  }

  // ── Get token ──────────────────────────────────────────────────────────────
  let token: string;
  try {
    token = await getAmadeusToken();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[Amadeus] Auth failed — using mock fallback:", msg);
    const mockData = generateMockFlights(
      origin, destination, departureDate, returnDate,
      passengers, travelClass, currency, tripType,
      body.legs
    );
    cacheSet(cacheKey, mockData);
    return NextResponse.json(mockData, { headers: { "X-Data-Source": "MOCK" } });
  }

  try {
    let amadeusData: AmadeusResponse;

    if (isMultiCity) {
      // ── Multi-city: POST v2/shopping/flight-offers ─────────────────────────
      const sortedLegs = [...body.legs!].sort(
        (a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
      );

      const postBody = {
        currencyCode: currency,
        originDestinations: sortedLegs.map((leg, i) => ({
          id: String(i + 1),
          originLocationCode:      leg.origin.toUpperCase(),
          destinationLocationCode: leg.destination.toUpperCase(),
          departureDateTimeRange:  { date: leg.departureDate },
        })),
        travelers: Array.from({ length: passengers }, (_, i) => ({
          id: String(i + 1),
          travelerType: "ADULT",
        })),
        sources: ["GDS"],
        searchCriteria: {
          maxFlightOffers: 20,
          cabinRestrictions: [{
            cabin: travelClass,
            coverage: "MOST_SEGMENTS",
            originDestinationIds: sortedLegs.map((_, i) => String(i + 1)),
          }],
        },
      };

      amadeusData = (await amadeusPost("/v2/shopping/flight-offers", token, postBody)) as AmadeusResponse;

    } else {
      // ── One-way / Round-trip: GET v2/shopping/flight-offers ────────────────
      const params = new URLSearchParams({
        originLocationCode:      origin.toUpperCase(),
        destinationLocationCode: destination.toUpperCase(),
        departureDate:           departureDate,
        adults:                  String(passengers),
        travelClass:             travelClass,
        currencyCode:            currency,
        max:                     "20",
        nonStop:                 "false",
      });

      if (isRoundTrip && returnDate) {
        params.set("returnDate", returnDate);
      }

      amadeusData = (await amadeusFetch("/v2/shopping/flight-offers", { token, params })) as AmadeusResponse;
    }

    const rawOffers = amadeusData.data ?? [];

    if (rawOffers.length === 0) {
      console.warn("[Amadeus] 0 live results returned — generating rich fallback options for search");
      const fallbackData = generateMockFlights(
        origin, destination, departureDate, returnDate,
        passengers, travelClass, currency, tripType,
        body.legs
      );
      return NextResponse.json(fallbackData, { headers: { "X-Data-Source": "FALLBACK" } });
    }

    // ── Fetch Admin Profit Markup from PostgreSQL ─────────────────────────
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

    const offers: FlightOffer[] = rawOffers.map((o: AmadeusOffer) => mapOffer(o, currency, markupType, markupValue));

    const dicts = amadeusData.dictionaries ?? {};
    const response = {
      data: offers,
      meta: { count: offers.length, currency, origin: origin.toUpperCase(), destination: destination.toUpperCase(), departureDate },
      dictionaries: {
        carriers:  dicts.carriers  ?? {},
        aircraft:  dicts.aircraft  ?? {},
        locations: dicts.locations ?? {},
      },
    };

    cacheSet(cacheKey, response);
    return NextResponse.json(response, { headers: { "X-Data-Source": "AMADEUS" } });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[Amadeus] Live search timeout/error — returning instant realistic flight options:", message);
    const mockData = generateMockFlights(
      origin, destination, departureDate, returnDate,
      passengers, travelClass, currency, tripType,
      body.legs
    );
    cacheSet(cacheKey, mockData);
    return NextResponse.json(mockData, { headers: { "X-Data-Source": "FAST_FALLBACK" } });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: "Use POST /api/flights/search" }, { status: 405 });
}
