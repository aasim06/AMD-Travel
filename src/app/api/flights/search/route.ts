import { NextRequest, NextResponse } from "next/server";
import type {
  FlightOffer,
  FlightSearchResponse,
  FlightSegment,
  Itinerary,
  TravelClass,
  Currency,
} from "@/types/flight";

// ─── Maps ─────────────────────────────────────────────────────────────────────

const SERP_CLASS: Record<TravelClass, string> = {
  ECONOMY:         "1",
  PREMIUM_ECONOMY: "2",
  BUSINESS:        "3",
  FIRST:           "4",
};

// SerpApi: type=1 → Round trip, type=2 → One-way, type=3 → Multi-city
const SERP_TRIP_TYPE: Record<string, string> = {
  "round-trip": "1",
  "one-way":    "2",
  "multi-city": "3",
};

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
}

interface SerpApiResponse {
  best_flights?:  SerpOffer[];
  other_flights?: SerpOffer[];
  error?:         string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toISO(t: string): string {
  if (!t) return t;
  if (/T\d{2}:\d{2}:\d{2}/.test(t)) return t;
  if (t.includes("T")) return `${t}:00`;
  return t;
}

function minsToDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `PT${h}H${m}M` : `PT${h}H`;
}

function carrierCode(flightNumber: string): string {
  return flightNumber.trim().split(/\s+/)[0] ?? flightNumber.slice(0, 2).toUpperCase();
}

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

function buildDictionaries(offers: SerpOffer[]) {
  const carriers: Record<string, string> = {};
  const aircraft: Record<string, string> = {};
  offers.forEach((o) => {
    o.flights.forEach((f) => {
      const code = carrierCode(f.flight_number);
      if (!carriers[code]) carriers[code] = f.airline;
      if (f.airplane && !aircraft[f.airplane]) aircraft[f.airplane] = f.airplane;
    });
  });
  return { carriers, aircraft };
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

// ─── SerpApi fetch ────────────────────────────────────────────────────────────

async function serpFetch(params: URLSearchParams): Promise<SerpApiResponse> {
  const url = `https://serpapi.com/search.json?${params.toString()}`;
  console.log("[SerpApi] GET", url.replace(/api_key=[^&]+/, "api_key=***"));

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SerpApi HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = await res.json() as SerpApiResponse;
  if (json.error) throw new Error(`SerpApi error: ${json.error}`);

  console.log("[SerpApi] best:", json.best_flights?.length ?? 0, "other:", json.other_flights?.length ?? 0);
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

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "SERPAPI_KEY not configured" }, { status: 500 });
  }

  const isRoundTrip = tripType === "round-trip";

  if (isRoundTrip && !returnDate) {
    return NextResponse.json({ success: false, error: "returnDate required for round-trip" }, { status: 400 });
  }

  // Cache check
  const cacheKey = [tripType, origin, destination, departureDate, returnDate ?? "", passengers, travelClass, currency].join(":");
  const cached = cacheGet(cacheKey);
  if (cached) {
    console.log("[SerpApi] Cache HIT:", cacheKey);
    return NextResponse.json({ ...cached, cached: true });
  }

  // Base params shared by all calls
  const baseParams = {
    engine:       "google_flights",
    api_key:      apiKey,
    travel_class: SERP_CLASS[travelClass] ?? "1",
    adults:       String(passengers),
    currency:     currency,
    hl:           "en",
  };

  try {
    // ── Step 1: Fetch outbound flights ────────────────────────────────────────
    const outboundParams = new URLSearchParams({
      ...baseParams,
      departure_id:  origin.toUpperCase(),
      arrival_id:    destination.toUpperCase(),
      outbound_date: departureDate,
      type:          SERP_TRIP_TYPE[tripType] ?? "2",
      ...(isRoundTrip && returnDate ? { return_date: returnDate } : {}),
    });

    const outboundData   = await serpFetch(outboundParams);
    const outboundOffers = [...(outboundData.best_flights ?? []), ...(outboundData.other_flights ?? [])].slice(0, 15);

    if (outboundOffers.length === 0) {
      const empty: FlightSearchResponse = {
        data: [],
        meta: { count: 0, currency, origin: origin.toUpperCase(), destination: destination.toUpperCase(), departureDate },
        dictionaries: { carriers: {}, aircraft: {}, locations: {} },
      };
      return NextResponse.json(empty, { headers: { "X-Data-Source": "SERPAPI" } });
    }

    // ── Step 2 (Round-trip only): fetch return flights per departure_token ────
    // SerpApi round-trip flow:
    //   - First call with type=1 + return_date returns outbound options
    //   - Each outbound offer has a departure_token
    //   - Second call with departure_token returns the matching return options
    //   - We pick the best (first) return offer for each outbound

    let returnOfferMap = new Map<string, SerpOffer>(); // departure_token → best return offer

    if (isRoundTrip) {
      // Fetch return flights for the first outbound offer's token
      // (SerpApi returns the same return pool regardless of which token you use,
      //  so one call is enough — we reuse it for all outbound offers)
      const firstToken = outboundOffers.find((o) => o.departure_token)?.departure_token;

      if (firstToken) {
        const returnParams = new URLSearchParams({
          ...baseParams,
          departure_id:    origin.toUpperCase(),
          arrival_id:      destination.toUpperCase(),
          outbound_date:   departureDate,
          return_date:     returnDate!,
          type:            "1",
          departure_token: firstToken,
        });

        try {
          const returnData    = await serpFetch(returnParams);
          const returnOffers  = [...(returnData.best_flights ?? []), ...(returnData.other_flights ?? [])];

          console.log("[SerpApi] Return offers fetched:", returnOffers.length);

          // Map every outbound token to the same pool of return offers
          // (UI will show the best return per outbound)
          outboundOffers.forEach((o) => {
            if (o.departure_token) {
              // Assign the best return offer (index 0) to each outbound
              const bestReturn = returnOffers[0];
              if (bestReturn) returnOfferMap.set(o.departure_token, bestReturn);
            }
          });
        } catch (returnErr) {
          // Non-fatal: if return fetch fails, show outbound-only
          console.warn("[SerpApi] Return fetch failed:", returnErr instanceof Error ? returnErr.message : returnErr);
        }
      }
    }

    // ── Step 3: Build FlightOffer[] ───────────────────────────────────────────
    const allOffers: SerpOffer[] = [];

    const offers: FlightOffer[] = outboundOffers.map((outbound, i) => {
      allOffers.push(outbound);

      const itineraries: Itinerary[] = [mapItinerary(outbound)];

      // Attach return itinerary if we have one
      const returnOffer = outbound.departure_token
        ? returnOfferMap.get(outbound.departure_token)
        : undefined;

      if (isRoundTrip && returnOffer) {
        allOffers.push(returnOffer);
        itineraries.push(mapItinerary(returnOffer));
      }

      const totalPrice = outbound.price + (isRoundTrip && returnOffer ? returnOffer.price : 0);
      const perPax     = Math.round(totalPrice / Math.max(passengers, 1));
      const carrier    = carrierCode(outbound.flights[0].flight_number);

      return {
        id:     `serp-${i}-${outbound.departure_token ?? i}`,
        source: "GDS",
        price: {
          total:        String(totalPrice),
          base:         String(Math.round(totalPrice * 0.88)),
          currency,
          perPassenger: String(perPax),
        },
        itineraries,
        validatingAirlineCodes: [carrier],
        numberOfBookableSeats:  9,
        lastTicketingDate:      outbound.flights[0].departure_airport.time.slice(0, 10),
        baggageAllowance:       { quantity: 1, weight: 23, weightUnit: "KG" },
      };
    });

    // ── Step 4: Dictionaries ──────────────────────────────────────────────────
    const { carriers, aircraft } = buildDictionaries(allOffers);

    const response: FlightSearchResponse = {
      data: offers,
      meta: { count: offers.length, currency, origin: origin.toUpperCase(), destination: destination.toUpperCase(), departureDate },
      dictionaries: { carriers, aircraft, locations: {} },
    };

    cacheSet(cacheKey, response);
    console.log("[SerpApi] Done — offers:", offers.length, "round-trip:", isRoundTrip, "return leg attached:", returnOfferMap.size > 0);
    return NextResponse.json(response, { headers: { "X-Data-Source": "SERPAPI" } });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[SerpApi] Failed:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: "Use POST /api/flights/search" }, { status: 405 });
}
