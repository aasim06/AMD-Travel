import { NextRequest, NextResponse } from "next/server";
import { getAmadeusToken, amadeusHeaders, amadeusBaseUrl } from "@/lib/amadeus";
import type {
  FlightOffer,
  FlightSearchResponse,
  FlightSegment,
  Itinerary,
  TravelClass,
  Currency,
  BaggageAllowance,
} from "@/types/flight";

// ─── In-memory cache (15-minute TTL) ─────────────────────────────────────────

interface CacheEntry {
  data:      object;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 15 * 60 * 1000;

function cacheGet(key: string): object | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}

function cacheSet(key: string, data: object) {
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

// ─── Amadeus cabin class map ──────────────────────────────────────────────────

const AMADEUS_CLASS: Record<TravelClass, string> = {
  ECONOMY:         "ECONOMY",
  PREMIUM_ECONOMY: "PREMIUM_ECONOMY",
  BUSINESS:        "BUSINESS",
  FIRST:           "FIRST",
};

// ─── Request body type ────────────────────────────────────────────────────────

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

// ─── Build Amadeus v2 POST payload ────────────────────────────────────────────

function buildPayload(body: SearchBody) {
  const travelers = Array.from({ length: body.passengers }, (_, i) => ({
    id:           String(i + 1),
    travelerType: "ADULT",
  }));

  let originDestinations: object[];

  if (body.tripType === "multi-city" && body.legs?.length) {
    originDestinations = body.legs.map((leg, i) => ({
      id:                        String(i + 1),
      originLocationCode:        leg.origin.toUpperCase(),
      destinationLocationCode:   leg.destination.toUpperCase(),
      departureDateTimeRange:    { date: leg.departureDate },
    }));
  } else {
    originDestinations = [
      {
        id:                      "1",
        originLocationCode:      body.origin.toUpperCase(),
        destinationLocationCode: body.destination.toUpperCase(),
        departureDateTimeRange:  { date: body.departureDate },
      },
    ];
    if (body.tripType === "round-trip" && body.returnDate) {
      originDestinations.push({
        id:                      "2",
        originLocationCode:      body.destination.toUpperCase(),
        destinationLocationCode: body.origin.toUpperCase(),
        departureDateTimeRange:  { date: body.returnDate },
      });
    }
  }

  return {
    currencyCode: body.currency,
    originDestinations,
    travelers,
    sources: ["GDS"],
    searchCriteria: {
      maxFlightOffers: 25,
      flightFilters: {
        cabinRestrictions: [
          {
            cabin:                  AMADEUS_CLASS[body.travelClass],
            coverage:               "MOST_SEGMENTS",
            originDestinationIds:   originDestinations.map((_, i) => String(i + 1)),
          },
        ],
      },
    },
  };
}

// ─── Response normalizers ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSegment(seg: any, idx: number): FlightSegment {
  return {
    id:           seg.id ?? String(idx),
    carrierCode:  seg.carrierCode,
    flightNumber: seg.number,
    aircraft:     seg.aircraft?.code ?? "---",
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
    numberOfStops: seg.numberOfStops ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeItinerary(itin: any): Itinerary {
  return {
    duration: itin.duration,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    segments: itin.segments.map((s: any, i: number) => normalizeSegment(s, i)),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBaggage(offer: any): BaggageAllowance | undefined {
  try {
    const detail =
      offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags;
    if (!detail) return undefined;
    return {
      quantity:   detail.quantity ?? 0,
      weight:     detail.weight,
      weightUnit: detail.weightUnit,
    };
  } catch {
    return undefined;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeOffer(offer: any, currency: Currency): FlightOffer {
  return {
    id:     offer.id,
    source: offer.source ?? "GDS",
    price: {
      total:        offer.price.grandTotal ?? offer.price.total,
      base:         offer.price.base,
      currency,
      perPassenger: offer.travelerPricings?.[0]?.price?.total ?? offer.price.grandTotal,
    },
    itineraries:           offer.itineraries.map(normalizeItinerary),
    validatingAirlineCodes: offer.validatingAirlineCodes ?? [],
    numberOfBookableSeats:  offer.numberOfBookableSeats ?? 9,
    lastTicketingDate:
      offer.lastTicketingDate ??
      offer.lastTicketingDateTime?.slice(0, 10) ??
      "",
    baggageAllowance: normalizeBaggage(offer),
  };
}

// ─── Mock fallback ────────────────────────────────────────────────────────────

function mockFlightResponse(body: SearchBody): FlightSearchResponse {
  const { origin, destination, departureDate, travelClass, currency, passengers } = body;

  const classMultiplier =
    travelClass === "ECONOMY"         ? 1 :
    travelClass === "PREMIUM_ECONOMY" ? 1.8 :
    travelClass === "BUSINESS"        ? 3.5 : 6;

  function addMins(hhmm: string, mins: number): string {
    const [h, m] = hhmm.split(":").map(Number);
    const total  = h * 60 + m + mins;
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  function price(base: number): string {
    return String(Math.round(base * classMultiplier * passengers));
  }
  function baseOf(total: string): string {
    return String(Math.round(parseFloat(total) * 0.88));
  }

  function buildItinerary(
    org: string, dst: string, date: string,
    carrier: string, flightNum: string, aircraft: string,
    depTime: string, durMins: number,
    stopIata?: string, stopMins?: number,
  ): Itinerary {
    const dt = (hhmm: string) => `${date}T${hhmm}:00`;

    if (stopIata && stopMins != null) {
      const leg1Mins  = Math.round(durMins * 0.55);
      const leg2Mins  = durMins - leg1Mins;
      const midArr    = addMins(depTime, leg1Mins);
      const midDep    = addMins(midArr, stopMins);
      const totalMins = durMins + stopMins;
      return {
        duration: `PT${Math.floor(totalMins / 60)}H${totalMins % 60}M`,
        segments: [
          {
            id: "1", carrierCode: carrier, flightNumber: flightNum, aircraft,
            departure: { iataCode: org, at: dt(depTime) },
            arrival:   { iataCode: stopIata, at: dt(midArr) },
            duration: `PT${Math.floor(leg1Mins / 60)}H${leg1Mins % 60}M`,
            numberOfStops: 0,
          },
          {
            id: "2", carrierCode: carrier, flightNumber: String(parseInt(flightNum) + 1), aircraft,
            departure: { iataCode: stopIata, at: dt(midDep) },
            arrival:   { iataCode: dst, at: dt(addMins(midDep, leg2Mins)) },
            duration: `PT${Math.floor(leg2Mins / 60)}H${leg2Mins % 60}M`,
            numberOfStops: 0,
          },
        ],
      };
    }

    const dur = `PT${Math.floor(durMins / 60)}H${durMins % 60}M`;
    return {
      duration: dur,
      segments: [{
        id: "1", carrierCode: carrier, flightNumber: flightNum, aircraft,
        departure: { iataCode: org, at: dt(depTime) },
        arrival:   { iataCode: dst, at: dt(addMins(depTime, durMins)) },
        duration: dur,
        numberOfStops: 0,
      }],
    };
  }

  type RawOffer = {
    id: string; carrier: string; flight: string; aircraft: string;
    depTime: string; durMins: number;
    stopIata?: string; stopMins?: number;
    totalUSD: number; bags: number; seats: number;
  };

  const RAW: RawOffer[] = [
    { id:  "1", carrier: "EK", flight: "501",  aircraft: "388", depTime: "08:00", durMins: 390, totalUSD: 420, bags: 1, seats: 7  },
    { id:  "2", carrier: "QR", flight: "301",  aircraft: "359", depTime: "10:30", durMins: 405, totalUSD: 395, bags: 1, seats: 4  },
    { id:  "3", carrier: "EY", flight: "101",  aircraft: "789", depTime: "14:15", durMins: 380, totalUSD: 370, bags: 1, seats: 9  },
    { id:  "4", carrier: "TK", flight: "760",  aircraft: "333", depTime: "06:45", durMins: 430, totalUSD: 310, bags: 1, seats: 6  },
    { id:  "5", carrier: "SV", flight: "220",  aircraft: "321", depTime: "22:00", durMins: 360, totalUSD: 285, bags: 1, seats: 12 },
    { id:  "6", carrier: "GF", flight: "142",  aircraft: "321", depTime: "16:50", durMins: 415, totalUSD: 340, bags: 1, seats: 5  },
    { id:  "7", carrier: "FZ", flight: "311",  aircraft: "73H", depTime: "05:20", durMins: 345, totalUSD: 195, bags: 0, seats: 15 },
    { id:  "8", carrier: "G9", flight: "412",  aircraft: "320", depTime: "19:40", durMins: 355, totalUSD: 180, bags: 0, seats: 18 },
    { id:  "9", carrier: "PK", flight: "201",  aircraft: "77W", depTime: "02:30", durMins: 390, stopIata: "DXB", stopMins: 90,  totalUSD: 265, bags: 1, seats: 8  },
    { id: "10", carrier: "EK", flight: "803",  aircraft: "77W", depTime: "23:55", durMins: 420, stopIata: "DXB", stopMins: 75,  totalUSD: 380, bags: 1, seats: 3  },
    { id: "11", carrier: "TK", flight: "192",  aircraft: "333", depTime: "07:10", durMins: 480, stopIata: "IST", stopMins: 120, totalUSD: 290, bags: 1, seats: 11 },
    { id: "12", carrier: "QR", flight: "617",  aircraft: "359", depTime: "13:00", durMins: 450, stopIata: "DOH", stopMins: 100, totalUSD: 355, bags: 1, seats: 6  },
    { id: "13", carrier: "SV", flight: "535",  aircraft: "321", depTime: "09:25", durMins: 510, stopIata: "RUH", stopMins: 150, totalUSD: 275, bags: 1, seats: 9  },
    { id: "14", carrier: "FZ", flight: "522",  aircraft: "73H", depTime: "17:30", durMins: 400, stopIata: "DXB", stopMins: 60,  totalUSD: 210, bags: 0, seats: 20 },
    { id: "15", carrier: "G9", flight: "703",  aircraft: "320", depTime: "11:45", durMins: 440, stopIata: "SHJ", stopMins: 80,  totalUSD: 225, bags: 0, seats: 14 },
  ];

  const isMultiCity = body.tripType === "multi-city" && body.legs && body.legs.length > 0;
  const legs = isMultiCity
    ? body.legs!
    : [
        { origin: origin.toUpperCase(), destination: destination.toUpperCase(), departureDate },
        ...(body.tripType === "round-trip" && body.returnDate
          ? [{ origin: destination.toUpperCase(), destination: origin.toUpperCase(), departureDate: body.returnDate }]
          : []),
      ];

  const org = origin.toUpperCase();
  const dst = destination.toUpperCase();

  const offers: FlightOffer[] = RAW.map((r) => {
    const total = price(r.totalUSD);
    const base  = baseOf(total);

    const itineraries: Itinerary[] = legs.map((leg, li) => {
      const legDepTime = li === 0 ? r.depTime : addMins(r.depTime, li * 180);
      return buildItinerary(
        leg.origin.toUpperCase(),
        leg.destination.toUpperCase(),
        leg.departureDate,
        r.carrier,
        String(parseInt(r.flight) + li * 100),
        r.aircraft,
        legDepTime,
        r.durMins,
        li === 0 ? r.stopIata : undefined,
        li === 0 ? r.stopMins : undefined,
      );
    });

    const baggageAllowance: BaggageAllowance = r.bags > 0
      ? { quantity: r.bags, weight: 23, weightUnit: "KG" }
      : { quantity: 0 };

    return {
      id:     r.id,
      source: "GDS",
      price:  { total, base, currency, perPassenger: String(Math.round(parseFloat(total) / passengers)) },
      itineraries,
      validatingAirlineCodes: [r.carrier],
      numberOfBookableSeats:  r.seats,
      lastTicketingDate:      departureDate,
      baggageAllowance,
    };
  });

  const usedLocs = new Set(legs.flatMap((l) => [l.origin.toUpperCase(), l.destination.toUpperCase()]));
  const staticLocs: Record<string, { cityCode: string; countryCode: string }> = {
    DXB: { cityCode: "DXB", countryCode: "AE" },
    IST: { cityCode: "IST", countryCode: "TR" },
    DOH: { cityCode: "DOH", countryCode: "QA" },
    RUH: { cityCode: "RUH", countryCode: "SA" },
    SHJ: { cityCode: "SHJ", countryCode: "AE" },
  };
  const locations: Record<string, { cityCode: string; countryCode: string }> = {};
  usedLocs.forEach((code) => {
    locations[code] = staticLocs[code] ?? { cityCode: code, countryCode: "XX" };
  });

  return {
    data: offers,
    meta: { count: offers.length, currency, origin: org, destination: dst, departureDate },
    dictionaries: {
      carriers: {
        EK: "Emirates",  QR: "Qatar Airways",  EY: "Etihad Airways",
        TK: "Turkish Airlines", SV: "Saudia", GF: "Gulf Air",
        FZ: "flydubai",  G9: "Air Arabia",    PK: "PIA - Pakistan International Airlines",
      },
      aircraft: {
        "388": "Airbus A380-800", "359": "Airbus A350-900",
        "789": "Boeing 787-9",    "333": "Airbus A330-300",
        "321": "Airbus A321",     "73H": "Boeing 737-800",
        "320": "Airbus A320",     "77W": "Boeing 777-300ER",
      },
      locations,
    },
  };
}

const MOCK_HEADERS = { "X-Data-Source": "MOCK" };

// ─── GET handler ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const body: SearchBody = {
    tripType:      "one-way",
    origin:        sp.get("origin")        ?? "LHE",
    destination:   sp.get("destination")   ?? "DXB",
    departureDate: sp.get("departureDate") ?? new Date().toISOString().slice(0, 10),
    passengers:    parseInt(sp.get("passengers") ?? "1", 10),
    travelClass:   (sp.get("class") ?? "ECONOMY") as TravelClass,
    currency:      (sp.get("currency") ?? "USD") as Currency,
  };

  // Mock short-circuit
  if (process.env.USE_MOCK_DATA === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return NextResponse.json({ ...mockFlightResponse(body), mock: true }, { headers: MOCK_HEADERS });
  }

  // Mock disabled — USE_MOCK_DATA must be false for live API

  const cacheKey = [
    body.tripType, body.origin, body.destination,
    body.departureDate, "", body.passengers, body.travelClass, body.currency,
  ].join(":");

  const cached = cacheGet(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  let token: string;
  try {
    token = await getAmadeusToken();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to authenticate with Amadeus";
    console.error("[GET] AMADEUS_TOKEN_ERROR — falling back to mock:", msg);
    return NextResponse.json({ ...mockFlightResponse(body), mock: true }, { headers: MOCK_HEADERS });
  }

  const baseUrl = amadeusBaseUrl;
  let amadeusRes: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    try {
      amadeusRes = await fetch(
        `${baseUrl}/v2/shopping/flight-offers`,
        {
          method:  "POST",
          headers: amadeusHeaders(token),
          body:    JSON.stringify(buildPayload(body)),
          signal:  controller.signal,
        }
      );
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    const msg = err instanceof Error && err.name === "AbortError" ? "Amadeus request timed out" : (err instanceof Error ? err.message : "Network error");
    console.error("[GET] AMADEUS_FETCH_ERROR — falling back to mock:", msg);
    return NextResponse.json({ ...mockFlightResponse(body), mock: true }, { headers: MOCK_HEADERS });
  }

  if (!amadeusRes.ok) {
    const errBody = await amadeusRes.json().catch(() => ({}));
    console.error("[GET] AMADEUS_HTTP_ERROR — falling back to mock:", amadeusRes.status, JSON.stringify(errBody));
    return NextResponse.json({ ...mockFlightResponse(body), mock: true }, { headers: MOCK_HEADERS });
  }

  let amadeusData: { data?: unknown[]; dictionaries?: Record<string, unknown> };
  try {
    amadeusData = await amadeusRes.json();
  } catch (err) {
    console.error("[GET] AMADEUS_PARSE_ERROR — falling back to mock:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ...mockFlightResponse(body), mock: true }, { headers: MOCK_HEADERS });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalized: FlightOffer[] = ((amadeusData.data ?? []) as any[]).map((o) =>
    normalizeOffer(o, body.currency)
  );

  const response: FlightSearchResponse = {
    data: normalized,
    meta: { count: normalized.length, currency: body.currency, origin: body.origin, destination: body.destination, departureDate: body.departureDate },
    dictionaries: {
      carriers:  (amadeusData.dictionaries?.carriers  ?? {}) as Record<string, string>,
      aircraft:  (amadeusData.dictionaries?.aircraft  ?? {}) as Record<string, string>,
      locations: (amadeusData.dictionaries?.locations ?? {}) as Record<string, { cityCode: string; countryCode: string }>,
    },
  };

  cacheSet(cacheKey, response);
  return NextResponse.json(response, { headers: { "X-Data-Source": "AMADEUS" } });
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Parse body
  let body: SearchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { origin, destination, departureDate, travelClass, currency } = body;

  if (!origin || !destination || !departureDate || !travelClass || !currency) {
    return NextResponse.json(
      { error: "Missing required fields: origin, destination, departureDate, travelClass, currency" },
      { status: 400 }
    );
  }

  // 2. Mock short-circuit
  if (process.env.USE_MOCK_DATA === "true" || process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("[POST] USE_MOCK_DATA=true — returning mock response");
    return NextResponse.json({ ...mockFlightResponse(body), mock: true }, { headers: MOCK_HEADERS });
  }

  // 3. Cache lookup
  const legs = body.legs ?? [];
  const cacheKey = [
    body.tripType,
    origin.toUpperCase(),
    destination.toUpperCase(),
    departureDate,
    body.returnDate ?? "",
    body.passengers,
    travelClass,
    currency,
    legs.map((l) => `${l.origin}-${l.destination}-${l.departureDate}`).join("|"),
  ].join(":");

  const cached = cacheGet(cacheKey);
  if (cached) {
    console.log(`[/api/flights/search] Cache HIT — ${cacheKey}`);
    return NextResponse.json({ ...cached, cached: true });
  }

  // 4. Get bearer token
  let token: string;
  try {
    token = await getAmadeusToken();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to authenticate with Amadeus";
    console.error("[POST] AMADEUS_TOKEN_ERROR — falling back to mock:", msg);
    return NextResponse.json({ ...mockFlightResponse(body), mock: true }, { headers: MOCK_HEADERS });
  }

  // 5. Call Amadeus flight-offers
  const baseUrl = amadeusBaseUrl;
  const payload = buildPayload(body);
  let amadeusRes: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    try {
      amadeusRes = await fetch(
        `${baseUrl}/v2/shopping/flight-offers`,
        {
          method:  "POST",
          headers: amadeusHeaders(token),
          body:    JSON.stringify(payload),
          signal:  controller.signal,
        }
      );
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    const msg = err instanceof Error && err.name === "AbortError" ? "Amadeus request timed out" : (err instanceof Error ? err.message : "Network error");
    console.error("[POST] AMADEUS_FETCH_ERROR — falling back to mock:", msg);
    return NextResponse.json({ ...mockFlightResponse(body), mock: true }, { headers: MOCK_HEADERS });
  }

  // 6. Handle Amadeus error responses
  if (!amadeusRes.ok) {
    const errBody = await amadeusRes.json().catch(() => ({}));
    console.error("[POST] AMADEUS_HTTP_ERROR — falling back to mock:", amadeusRes.status, JSON.stringify(errBody));
    return NextResponse.json({ ...mockFlightResponse(body), mock: true }, { headers: MOCK_HEADERS });
  }

  // 7. Parse + normalize
  let amadeusData: { data?: unknown[]; dictionaries?: Record<string, unknown> };
  try {
    amadeusData = await amadeusRes.json();
  } catch (err) {
    console.error("[POST] AMADEUS_PARSE_ERROR — falling back to mock:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ...mockFlightResponse(body), mock: true }, { headers: MOCK_HEADERS });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalized: FlightOffer[] = ((amadeusData.data ?? []) as any[]).map((o) =>
    normalizeOffer(o, currency)
  );

  const dicts = (amadeusData.dictionaries ?? {}) as Record<string, Record<string, unknown>>;
  const usedCarriers  = new Set(normalized.flatMap((o) => o.validatingAirlineCodes));
  const usedAircraft  = new Set(normalized.flatMap((o) => o.itineraries.flatMap((it) => it.segments.map((s) => s.aircraft))));
  const usedLocations = new Set(normalized.flatMap((o) => o.itineraries.flatMap((it) => it.segments.flatMap((s) => [s.departure.iataCode, s.arrival.iataCode]))));

  const response: FlightSearchResponse = {
    data: normalized,
    meta: { count: normalized.length, currency, origin: origin.toUpperCase(), destination: destination.toUpperCase(), departureDate },
    dictionaries: {
      carriers:  Object.fromEntries(Object.entries((dicts.carriers  ?? {}) as Record<string, string>).filter(([k]) => usedCarriers.has(k))),
      aircraft:  Object.fromEntries(Object.entries((dicts.aircraft  ?? {}) as Record<string, string>).filter(([k]) => usedAircraft.has(k))),
      locations: Object.fromEntries(Object.entries((dicts.locations ?? {}) as Record<string, { cityCode: string; countryCode: string }>).filter(([k]) => usedLocations.has(k))),
    },
  };

  cacheSet(cacheKey, response);
  console.log("[POST] AMADEUS_SUCCESS: returning", normalized.length, "offers (cached for 15 min)");
  return NextResponse.json(response, { headers: { "X-Data-Source": "AMADEUS" } });
}
