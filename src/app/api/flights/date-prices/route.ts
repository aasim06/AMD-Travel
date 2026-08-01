import { NextRequest, NextResponse } from "next/server";

// ─── Cache ────────────────────────────────────────────────────────────────────

interface CacheEntry { data: object; expiresAt: number }
const cache  = new Map<string, CacheEntry>();
const TTL_MS = 30 * 60 * 1000;

function cacheGet(key: string): object | null {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() > e.expiresAt) { cache.delete(key); return null; }
  return e.data;
}
function cacheSet(key: string, data: object) {
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function fetchCheapestPrice(
  origin:      string,
  destination: string,
  date:        string,
  returnDate:  string | null, // null = one-way
  passengers:  string,
  travelClass: string,
  currency:    string,
  apiKey:      string
): Promise<number | null> {
  const isRound = !!returnDate;

  const params = new URLSearchParams({
    engine:        "google_flights",
    api_key:       apiKey,
    departure_id:  origin.toUpperCase(),
    arrival_id:    destination.toUpperCase(),
    outbound_date: date,
    type:          isRound ? "1" : "2",
    adults:        passengers,
    travel_class:  travelClass,
    currency,
    hl:            "en",
  });

  if (isRound && returnDate) params.set("return_date", returnDate);

  try {
    const res = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    if (!res.ok) return null;
    const json = await res.json() as {
      best_flights?: { price: number }[];
      other_flights?: { price: number }[];
      error?: string;
    };
    if (json.error) return null;
    const all = [...(json.best_flights ?? []), ...(json.other_flights ?? [])];
    if (!all.length) return null;
    return Math.min(...all.map(o => o.price));
  } catch {
    return null;
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    origin:      string;
    destination: string;
    centerDate:  string;
    returnDate?: string;   // pass for round-trip
    passengers?: number;
    travelClass?: string;
    currency?:   string;
    range?:      number;
  };

  const {
    origin, destination, centerDate,
    returnDate = null,
    passengers = 1, travelClass = "1",
    currency = "USD", range = 3,
  } = body;

  if (!origin || !destination || !centerDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return NextResponse.json({ error: "SERPAPI_KEY not configured" }, { status: 500 });

  const dates: string[] = [];
  for (let i = -range; i <= range; i++) dates.push(addDays(centerDate, i));

  const cacheKey = `date-prices:${origin}:${destination}:${centerDate}:${returnDate ?? ""}:${range}:${passengers}:${travelClass}:${currency}`;
  const cached = cacheGet(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  const results = await Promise.all(
    dates.map(async (date) => {
      const price = await fetchCheapestPrice(
        origin, destination, date, returnDate,
        String(passengers), travelClass, currency, apiKey
      );
      return { date, price };
    })
  );

  const response = { dates: results };
  cacheSet(cacheKey, response);
  return NextResponse.json(response);
}
