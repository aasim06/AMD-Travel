import { NextRequest, NextResponse } from "next/server";
import type {
  FlightOffer,
  FlightSearchResponse,
  FlightSegment,
  Itinerary,
  TravelClass,
  Currency,
} from "@/types/flight";

// ─── Travel class map → SerpApi travel_class param ───────────────────────────

const SERP_CLASS: Record<TravelClass, string> = {
  ECONOMY:         "1",
  PREMIUM_ECONOMY: "2",
  BUSINESS:        "3",
  FIRST:           "4",
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
  duration:          number; // minutes
  airplane:          string;
  airline:           string;
  airline_logo:      string;
  flight_number:     string;
  often_delayed_by_over_30_min?: boolean;
}

interface SerpLayover {
  duration:  number;
  name:      string;
  id:        string;
  overnight?: boolean;
}

interface SerpOffer {
  flights:           SerpFlight[];
  layovers?:         SerpLayover[];
  total_duration:    number; // minutes
  price:             number;
  type:              string;
  airline_logo:      string;
  departure_token?:  string;
  booking_token?:    string;
  carbon_emissions?: { this_flight: number };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "2025-07-31T19:40" → "2025-07-31T19:40:00" (ISO-safe) */
function toISO(serpTime: string): string {
  return serpTime.includes("T") ? `${serpTime}:00` : serpTime;
}

/** minutes → "PT7H30M" */
function minsToDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `PT${h}H${m}M` : `PT${h}H`;
}

/** Extract IATA carrier code from flight_number e.g. "EK 501" → "EK" */
function carrierCode(flightNumber: string): string {
  return flightNumber.split(" ")[0] ?? flightNumber.slice(0, 2).toUpperCase();
}

/** Map one SerpApi offer (outbound or return) into our Itinerary shape */
function mapItinerary(offer: SerpOffer): Itinerary {
  const segments: FlightSegment[] = offer.flights.map((f, i) => ({
    id:           String(i + 1),
    carrierCode:  carrierCode(f.flight_number),
    flightNumber: f.flight_number.replace(/\s+/g, ""),
    aircraft:     f.airplane ?? "---",
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
    duration: minsToDuration(offer.total_duration),
    segments,
  };
}

/** Build a FlightOffer from outbound + optional return SerpApi offer */
function mapOffer(
  outbound: SerpOffer,
  returnOffer: SerpOffer | null,
  currency: Currency,
  passengers: number,
  idx: number,
): FlightOffer {
  const itineraries: Itinerary[] = [mapItinerary(outbound)];
  if (returnOffer) itineraries.push(mapItinerary(returnOffer));

  const totalPrice  = outbound.price + (returnOffer?.price ?? 0);
  const perPax      = Math.round(totalPrice / passengers);
  const basePrice   = Math.round(totalPrice * 0.88);

  const firstFlight = outbound.flights[0];
  const lastFlight  = outbound.flights[outbound.flights.length - 1];
  const carrier     = carrierCode(firstFlight.flight_number);

  return {
    id:     `serp-${idx}-${outbound.departure_token ?? idx}`,
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
    lastTicketingDate:      firstFlight.departure_airport.time.slice(0, 10),
    baggageAllowance:       { quantity: 1, weight: 23, weightUnit: "KG" },
  };
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

async function fetchSerpFlights(params: URLSearchParams): Promise<SerpOffer[]> {
  const url = `https://serpapi.com/search.json?${params.toString()}`;
  console.log("[SerpApi] GET", url.replace(/api_key=[^&]+/, "api_key=***"));

  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    const body = await res.text();
    console.error("[SerpApi] HTTP error", res.status, body);
    throw new Error(`SerpApi responded with HTTP ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = await res.json() as {
    best_flights?:  SerpOffer[];
    other_flights?: SerpOffer[];
    error?:         string;
  };

  if (json.error) {
    console.error("[SerpApi] API error:", json.error);
    throw new Error(`SerpApi error: ${json.error}`);
  }

  const offers = [...(json.best_flights ?? []), ...(json.other_flights ?? [])];
  console.log("[SerpApi] Received", offers.length, "offers");
  return offers;
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Parse + validate body
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

  // 2. Check API key
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error("[SerpApi] SERPAPI_KEY is not set");
    return NextResponse.json({ success: false, error: "SERPAPI_KEY environment variable is not configured" }, { status: 500 });
  }

  // 3. Cache lookup
  const cacheKey = [tripType, origin, destination, departureDate, returnDate ?? "", passengers, travelClass, currency].join(":");
  const cached = cacheGet(cacheKey);
  if (cached) {
    console.log("[SerpApi] Cache HIT:", cacheKey);
    return NextResponse.json({ ...cached, cached: true });
  }

  // 4. Build SerpApi params
  const baseParams: Record<string, string> = {
    engine:        "google_flights",
    api_key:       apiKey,
    departure_id:  origin.toUpperCase(),
    arrival_id:    destination.toUpperCase(),
    outbound_date: departureDate,
    travel_class:  SERP_CLASS[travelClass] ?? "1",
    adults:        String(passengers),
    currency:      currency,
    hl:            "en",
    type:          tripType === "round-trip" ? "1" : "2", // 1=round-trip, 2=one-way
  };

  if (tripType === "round-trip" && returnDate) {
    baseParams.return_date = returnDate;
  }

  try {
    // 5. Fetch outbound flights
    const outboundOffers = await fetchSerpFlights(new URLSearchParams(baseParams));

    if (outboundOffers.length === 0) {
      const response: FlightSearchResponse = {
        data: [],
        meta: { count: 0, currency, origin: origin.toUpperCase(), destination: destination.toUpperCase(), departureDate },
        dictionaries: { carriers: {}, aircraft: {}, locations: {} },
      };
      return NextResponse.json(response, { headers: { "X-Data-Source": "SERPAPI" } });
    }

    // 6. Map to FlightOffer[]
    const offers: FlightOffer[] = outboundOffers
      .slice(0, 25)
      .map((o, i) => mapOffer(o, null, currency, passengers, i));

    // 7. Build dictionaries from mapped offers
    const carriers: Record<string, string>  = {};
    const aircraft: Record<string, string>  = {};

    outboundOffers.slice(0, 25).forEach((o) => {
      o.flights.forEach((f) => {
        const code = carrierCode(f.flight_number);
        if (!carriers[code]) carriers[code] = f.airline;
        if (f.airplane && !aircraft[f.airplane]) aircraft[f.airplane] = f.airplane;
      });
    });

    const response: FlightSearchResponse = {
      data: offers,
      meta: {
        count:         offers.length,
        currency,
        origin:        origin.toUpperCase(),
        destination:   destination.toUpperCase(),
        departureDate,
      },
      dictionaries: { carriers, aircraft, locations: {} },
    };

    cacheSet(cacheKey, response);
    console.log("[SerpApi] Returning", offers.length, "offers");
    return NextResponse.json(response, { headers: { "X-Data-Source": "SERPAPI" } });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[SerpApi] Search failed:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ─── GET handler (optional convenience) ──────────────────────────────────────

export async function GET() {
  return NextResponse.json({ success: false, error: "Use POST /api/flights/search" }, { status: 405 });
}
