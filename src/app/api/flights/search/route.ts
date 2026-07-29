import { NextRequest, NextResponse } from "next/server";
import type {
  FlightOffer,
  FlightSearchResponse,
  FlightSegment,
  Itinerary,
  TravelClass,
  Currency,
} from "@/types/flight";

// ─── Travel class map ─────────────────────────────────────────────────────────
// SerpApi: 1=Economy, 2=Premium Economy, 3=Business, 4=First

const SERP_CLASS: Record<TravelClass, string> = {
  ECONOMY:         "1",
  PREMIUM_ECONOMY: "2",
  BUSINESS:        "3",
  FIRST:           "4",
};

// ─── SerpApi type param ───────────────────────────────────────────────────────
// SerpApi: type=1 → Round trip, type=2 → One-way, type=3 → Multi-city

const SERP_TRIP_TYPE: Record<string, string> = {
  "round-trip": "1",
  "one-way":    "2",
  "multi-city": "3",
};

// ─── Request body ─────────────────────────────────────────────────────────────

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

// ─── SerpApi raw types ────────────────────────────────────────────────────────

interface SerpFlight {
  departure_airport: { id: string; name: string; time: string };
  arrival_airport:   { id: string; name: string; time: string };
  duration:          number;
  airplane:          string;
  airline:           string;
  airline_logo:      string;
  flight_number:     string;
}

interface SerpOffer {
  flights:          SerpFlight[];
  layovers?:        { duration: number; name: string; id: string }[];
  total_duration:   number;
  price:            number;
  type:             string;
  airline_logo:     string;
  departure_token?: string;
  booking_token?:   string;
  // Round-trip only: SerpApi nests return leg inside each outbound offer
  return_flights?:  SerpOffer[];
}

interface SerpApiResponse {
  best_flights?:  SerpOffer[];
  other_flights?: SerpOffer[];
  error?:         string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "2025-07-31T19:40" → "2025-07-31T19:40:00" */
function toISO(t: string): string {
  if (!t) return t;
  // Already has seconds
  if (/T\d{2}:\d{2}:\d{2}/.test(t)) return t;
  // Has T but no seconds
  if (t.includes("T")) return `${t}:00`;
  // Date only — shouldn't happen but guard anyway
  return t;
}

/** minutes → "PT7H30M" */
function minsToDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `PT${h}H${m}M` : `PT${h}H`;
}

/** "EK 501" → "EK" */
function carrierCode(flightNumber: string): string {
  const parts = flightNumber.trim().split(/\s+/);
  return parts[0] ?? flightNumber.slice(0, 2).toUpperCase();
}

/** Map a SerpApi flights array into our Itinerary */
function mapItinerary(serpOffer: SerpOffer): Itinerary {
  const segments: FlightSegment[] = serpOffer.flights.map((f, i) => ({
    id:           String(i + 1),
    carrierCode:  carrierCode(f.flight_number),
    flightNumber: f.flight_number.replace(/\s+/g, ""),
    aircraft:     f.airplane || "---",
    departure: {
      iataCode: f.departure_airport.id,
      at:       toISO(f.departure_airport.time),
    },
    arrival: {
      iataCode: f.arrival_airport.id,
      at:       toISO(f.arrival_airport.time),
    },
    duration:      minsToDuration(f.duration),
    numberOfStops: 0,
  }));

  return {
    duration: minsToDuration(serpOffer.total_duration),
    segments,
  };
}

/**
 * Build a FlightOffer from one SerpApi outbound offer.
 *
 * For round-trips SerpApi returns `return_flights` nested inside each
 * outbound offer. We pick the first (cheapest/best) return option and
 * attach it as the second itinerary. The `price` on the outbound offer
 * already represents the combined round-trip price.
 */
function mapOffer(
  outbound: SerpOffer,
  isRoundTrip: boolean,
  currency: Currency,
  passengers: number,
  idx: number,
): FlightOffer {
  const itineraries: Itinerary[] = [mapItinerary(outbound)];

  // Attach return leg if present
  if (isRoundTrip && outbound.return_flights && outbound.return_flights.length > 0) {
    // Pick the first return option (SerpApi sorts by best)
    itineraries.push(mapItinerary(outbound.return_flights[0]));
  }

  const totalPrice = outbound.price;
  const perPax     = Math.round(totalPrice / Math.max(passengers, 1));
  const basePrice  = Math.round(totalPrice * 0.88);
  const carrier    = carrierCode(outbound.flights[0].flight_number);

  return {
    id:     `serp-${idx}-${outbound.departure_token ?? String(idx)}`,
    source: "GDS",
    price: {
      total:        String(totalPrice),
      base:         String(basePrice),
      currency,
      perPassenger: String(perPax),
    },
    itineraries,
    validatingAirlineCodes: [carrier],
    numberOfBookableSeats:  9,
    lastTicketingDate:      outbound.flights[0].departure_airport.time.slice(0, 10),
    baggageAllowance:       { quantity: 1, weight: 23, weightUnit: "KG" },
  };
}

/** Collect carrier + aircraft dictionaries from all offers */
function buildDictionaries(offers: SerpOffer[], isRoundTrip: boolean) {
  const carriers: Record<string, string> = {};
  const aircraft: Record<string, string> = {};

  const collectFlights = (flights: SerpFlight[]) => {
    flights.forEach((f) => {
      const code = carrierCode(f.flight_number);
      if (!carriers[code]) carriers[code] = f.airline;
      if (f.airplane && !aircraft[f.airplane]) aircraft[f.airplane] = f.airplane;
    });
  };

  offers.forEach((o) => {
    collectFlights(o.flights);
    if (isRoundTrip && o.return_flights) {
      o.return_flights.forEach((r) => collectFlights(r.flights));
    }
  });

  return { carriers, aircraft };
}

// ─── In-memory cache (10-minute TTL) ─────────────────────────────────────────

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

// ─── SerpApi fetcher ──────────────────────────────────────────────────────────

async function fetchSerpFlights(params: URLSearchParams): Promise<SerpApiResponse> {
  const url = `https://serpapi.com/search.json?${params.toString()}`;
  console.log("[SerpApi] GET", url.replace(/api_key=[^&]+/, "api_key=***"));

  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    console.error("[SerpApi] HTTP error", res.status, text.slice(0, 300));
    throw new Error(`SerpApi HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = await res.json() as SerpApiResponse;

  if (json.error) {
    console.error("[SerpApi] API error:", json.error);
    throw new Error(`SerpApi error: ${json.error}`);
  }

  const count = (json.best_flights?.length ?? 0) + (json.other_flights?.length ?? 0);
  console.log("[SerpApi] Received best:", json.best_flights?.length ?? 0, "other:", json.other_flights?.length ?? 0);

  return json;
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Parse body
  let body: SearchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { origin, destination, departureDate, returnDate, travelClass, currency, passengers, tripType } = body;

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { success: false, error: "Missing required fields: origin, destination, departureDate" },
      { status: 400 }
    );
  }

  // 2. Validate round-trip has return date
  if (tripType === "round-trip" && !returnDate) {
    return NextResponse.json(
      { success: false, error: "returnDate is required for round-trip searches" },
      { status: 400 }
    );
  }

  // 3. API key check
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error("[SerpApi] SERPAPI_KEY not set");
    return NextResponse.json({ success: false, error: "SERPAPI_KEY is not configured" }, { status: 500 });
  }

  // 4. Cache
  const cacheKey = [tripType, origin, destination, departureDate, returnDate ?? "", passengers, travelClass, currency].join(":");
  const cached = cacheGet(cacheKey);
  if (cached) {
    console.log("[SerpApi] Cache HIT:", cacheKey);
    return NextResponse.json({ ...cached, cached: true });
  }

  const isRoundTrip = tripType === "round-trip";

  // 5. Build params
  // SerpApi type: "1" = Round trip, "2" = One-way, "3" = Multi-city
  const params = new URLSearchParams({
    engine:        "google_flights",
    api_key:       apiKey,
    departure_id:  origin.toUpperCase(),
    arrival_id:    destination.toUpperCase(),
    outbound_date: departureDate,
    type:          SERP_TRIP_TYPE[tripType] ?? "2",
    travel_class:  SERP_CLASS[travelClass] ?? "1",
    adults:        String(passengers),
    currency:      currency,
    hl:            "en",
  });

  // return_date only for round-trip
  if (isRoundTrip && returnDate) {
    params.set("return_date", returnDate);
  }

  try {
    // 6. Fetch
    const serpData = await fetchSerpFlights(params);
    const rawOffers = [...(serpData.best_flights ?? []), ...(serpData.other_flights ?? [])];

    if (rawOffers.length === 0) {
      console.log("[SerpApi] No flights found for:", cacheKey);
      const empty: FlightSearchResponse = {
        data: [],
        meta: { count: 0, currency, origin: origin.toUpperCase(), destination: destination.toUpperCase(), departureDate },
        dictionaries: { carriers: {}, aircraft: {}, locations: {} },
      };
      return NextResponse.json(empty, { headers: { "X-Data-Source": "SERPAPI" } });
    }

    // 7. Map offers — round-trip return leg comes from offer.return_flights[0]
    const offers: FlightOffer[] = rawOffers
      .slice(0, 25)
      .map((o, i) => mapOffer(o, isRoundTrip, currency, passengers, i));

    // 8. Dictionaries
    const { carriers, aircraft } = buildDictionaries(rawOffers.slice(0, 25), isRoundTrip);

    const response: FlightSearchResponse = {
      data: offers,
      meta: {
        count:       offers.length,
        currency,
        origin:      origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departureDate,
      },
      dictionaries: { carriers, aircraft, locations: {} },
    };

    cacheSet(cacheKey, response);
    console.log("[SerpApi] Returning", offers.length, "offers, round-trip:", isRoundTrip);
    return NextResponse.json(response, { headers: { "X-Data-Source": "SERPAPI" } });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[SerpApi] Search failed:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({ success: false, error: "Use POST /api/flights/search" }, { status: 405 });
}
