import { NextRequest, NextResponse } from "next/server";
import { getAmadeusToken, AMADEUS_API_BASE } from "@/lib/amadeus";
import type {
  FlightOffer,
  FlightSegment,
  Itinerary,
  TravelClass,
  Currency,
} from "@/types/flight";

// ─── Mock data fallback (used when Amadeus is unreachable) ───────────────────

function generateMockFlights(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string | undefined,
  passengers: number,
  travelClass: TravelClass,
  currency: Currency,
  tripType: string
): object {
  const isRound = tripType === "round-trip";

  const MOCK_CARRIERS = [
    { code: "EK", name: "Emirates",       basePrice: 420 },
    { code: "QR", name: "Qatar Airways",   basePrice: 390 },
    { code: "TK", name: "Turkish Airlines",basePrice: 340 },
    { code: "EY", name: "Etihad Airways",  basePrice: 410 },
    { code: "SV", name: "Saudia",          basePrice: 310 },
    { code: "FZ", name: "flydubai",        basePrice: 240 },
  ];

  const AIRCRAFT: Record<string, string> = {
    EK: "77W", QR: "359", TK: "321", EY: "789", SV: "333", FZ: "73H",
  };

  const depAt = `${departureDate}T${["06:00","09:30","12:15","15:45","18:00","21:30"][Math.floor(Math.random()*6)]}:00`;
  const durationMins = 120 + Math.floor(Math.random() * 300);
  const arrAt = new Date(new Date(depAt).getTime() + durationMins * 60000).toISOString().replace(".000Z","");
  const durStr = `PT${Math.floor(durationMins/60)}H${durationMins%60 > 0 ? durationMins%60+"M" : ""}`;

  const carriers: Record<string, string> = {};
  const aircraft: Record<string, string> = { "77W": "Boeing 777-300ER", "359": "Airbus A350-900", "321": "Airbus A321", "789": "Boeing 787-9", "333": "Airbus A330-300", "73H": "Boeing 737-800" };

  const offers: FlightOffer[] = MOCK_CARRIERS.map((c, i) => {
    carriers[c.code] = c.name;
    const variation = 1 + (i * 0.07);
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
  passengers:    number;
  travelClass:   TravelClass;
  currency:      Currency;
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

// ─── Map Amadeus offer → FlightOffer ─────────────────────────────────────────

function mapOffer(offer: AmadeusOffer, currency: Currency): FlightOffer {
  const itineraries: Itinerary[] = offer.itineraries.map((itin) => ({
    duration: itin.duration,
    segments: itin.segments.map((seg): FlightSegment => ({
      id:           seg.id,
      carrierCode:  seg.carrierCode,
      flightNumber: `${seg.carrierCode}${seg.number}`,
      aircraft:     seg.aircraft?.code ?? "---",
      airlineLogo:  airlineLogo(seg.carrierCode),
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

  // Per-passenger price from travelerPricings if available
  const travelerTotal = offer.travelerPricings?.[0]?.price?.total;
  const perPassenger  = travelerTotal ?? String(Math.round(parseFloat(offer.price.total)));

  // Baggage from first fare detail
  const fareDetail = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0];
  const bags       = fareDetail?.includedCheckedBags;

  return {
    id:                    offer.id,
    source:                offer.source ?? "GDS",
    price: {
      total:        offer.price.total,
      base:         offer.price.base,
      currency:     currency,
      perPassenger: perPassenger,
    },
    itineraries,
    validatingAirlineCodes: offer.validatingAirlineCodes ?? [],
    numberOfBookableSeats:  offer.numberOfBookableSeats ?? 9,
    lastTicketingDate:      offer.lastTicketingDate ?? "",
    baggageAllowance: bags
      ? { quantity: bags.quantity ?? 0, weight: bags.weight ?? 23, weightUnit: bags.weightType ?? "KG" }
      : { quantity: 0, weight: 23, weightUnit: "KG" },
  };
}

// ─── Amadeus fetch wrapper ────────────────────────────────────────────────────

async function amadeusFetch(
  path: string,
  token: string,
  params?: URLSearchParams
): Promise<AmadeusResponse> {
  const url = `${AMADEUS_API_BASE}${path}${params ? `?${params.toString()}` : ""}`;
  console.log("[Amadeus] GET", url);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  const json = await res.json() as AmadeusResponse;

  if (!res.ok) {
    const detail = json.errors?.map(e => e.detail).join("; ") ?? `HTTP ${res.status}`;
    throw new Error(`Amadeus API error: ${detail}`);
  }

  return json;
}

async function amadeusPostFetch(
  path: string,
  token: string,
  body: object
): Promise<AmadeusResponse> {
  const url = `${AMADEUS_API_BASE}${path}`;
  console.log("[Amadeus] POST", url);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.amadeus+json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  const json = await res.json() as AmadeusResponse;

  if (!res.ok) {
    const detail = json.errors?.map(e => e.detail).join("; ") ?? `HTTP ${res.status}`;
    throw new Error(`Amadeus API error: ${detail}`);
  }

  return json;
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: SearchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { origin, destination, departureDate, returnDate, travelClass, currency, passengers, tripType } = body;

  if (!origin || !destination || !departureDate) {
    return NextResponse.json({ success: false, error: "Missing: origin, destination, departureDate" }, { status: 400 });
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

  // ── Get token ──────────────────────────────────────────────────────────────
  let token: string;
  try {
    token = await getAmadeusToken();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[Amadeus] Auth failed — using mock fallback:", msg);
    // Return realistic mock data so the UI still works when Amadeus is unreachable
    const mockData = generateMockFlights(
      origin, destination, departureDate, returnDate,
      passengers, travelClass, currency, tripType
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

      amadeusData = await amadeusPostFetch("/v2/shopping/flight-offers", token, postBody);

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

      amadeusData = await amadeusFetch("/v2/shopping/flight-offers", token, params);
    }

    const rawOffers = amadeusData.data ?? [];
    console.log("[Amadeus] Offers received:", rawOffers.length, "tripType:", tripType);

    if (rawOffers.length === 0) {
      const empty = {
        data: [],
        meta: { count: 0, currency, origin: origin.toUpperCase(), destination: destination.toUpperCase(), departureDate },
        dictionaries: { carriers: {}, aircraft: {}, locations: {} },
      };
      return NextResponse.json(empty, { headers: { "X-Data-Source": "AMADEUS" } });
    }

    const offers: FlightOffer[] = rawOffers.map(o => mapOffer(o, currency));

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
    console.error("[Amadeus] Search failed:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: "Use POST /api/flights/search" }, { status: 405 });
}
