import { NextRequest, NextResponse } from "next/server";
import { getAmadeusToken, AMADEUS_API_BASE } from "@/lib/amadeus";

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

// ─── Amadeus cheapest price per date ─────────────────────────────────────────

async function fetchCheapestPrice(
  origin:      string,
  destination: string,
  date:        string,
  returnDate:  string | null,
  passengers:  number,
  travelClass: string,
  currency:    string,
  token:       string
): Promise<number | null> {
  const params = new URLSearchParams({
    originLocationCode:      origin.toUpperCase(),
    destinationLocationCode: destination.toUpperCase(),
    departureDate:           date,
    adults:                  String(passengers),
    travelClass:             travelClass,
    currencyCode:            currency,
    max:                     "5",
    nonStop:                 "false",
  });

  if (returnDate) params.set("returnDate", returnDate);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(
      `${AMADEUS_API_BASE}/v2/shopping/flight-offers?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      }
    );
    clearTimeout(timer);

    if (!res.ok) return null;

    const json = await res.json() as {
      data?: { price: { total: string } }[];
      errors?: unknown[];
    };

    if (json.errors || !json.data?.length) return null;

    const prices = json.data.map(o => parseFloat(o.price.total)).filter(p => !isNaN(p));
    return prices.length ? Math.min(...prices) : null;

  } catch {
    clearTimeout(timer);
    return null;
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    origin:       string;
    destination:  string;
    centerDate:   string;
    returnDate?:  string;
    passengers?:  number;
    travelClass?: string;
    currency?:    string;
    range?:       number;
  };

  const {
    origin, destination, centerDate,
    returnDate = null,
    passengers = 1, travelClass = "ECONOMY",
    currency = "EUR", range = 3,
  } = body;

  if (!origin || !destination || !centerDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const cacheKey = `date-prices:${origin}:${destination}:${centerDate}:${returnDate ?? ""}:${range}:${passengers}:${travelClass}:${currency}`;
  const cached = cacheGet(cacheKey);
  if (cached) return NextResponse.json({ ...cached, cached: true });

  // Get Amadeus token
  let token: string | null = null;
  try {
    token = await getAmadeusToken();
  } catch (err) {
    console.warn("[date-prices] Token error — using mock prices:", err);
    // Return mock price data when Amadeus is unreachable
    const dates: string[] = [];
    for (let i = -range; i <= range; i++) dates.push(addDays(centerDate, i));
    const BASE = 280 + Math.floor(Math.random() * 120);
    const mockResults = dates.map((date, i) => ({
      date,
      price: i === range ? null : Math.round(BASE * (0.85 + Math.random() * 0.3)),
    }));
    const mockResponse = { dates: mockResults, _mock: true };
    cacheSet(cacheKey, mockResponse);
    return NextResponse.json(mockResponse);
  }

  // Generate date range
  const dates: string[] = [];
  for (let i = -range; i <= range; i++) dates.push(addDays(centerDate, i));

  // Fetch in parallel (sequential would be too slow)
  const results = await Promise.all(
    dates.map(async (date) => {
      const price = await fetchCheapestPrice(
        origin, destination, date, returnDate,
        passengers, travelClass, currency, token!
      );
      return { date, price };
    })
  );

  const response = { dates: results };
  cacheSet(cacheKey, response);
  return NextResponse.json(response);
}
