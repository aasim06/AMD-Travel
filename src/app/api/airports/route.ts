import dns from "node:dns";
try { dns.setDefaultResultOrder("ipv4first"); } catch { /* ignore */ }

import { NextRequest, NextResponse } from "next/server";
import { getAmadeusToken } from "@/lib/amadeus";
import COUNTRY_ALIASES from "@/lib/countryAliases";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AirportSuggestion {
  code:           string;
  name:           string;
  city:           string;
  country:        string;
  type:           "AIRPORT" | "CITY";
  isCountryMatch?: boolean;
  groupLabel?:    string;
}

// ─── Local fallback dataset ───────────────────────────────────────────────────

const FALLBACK_AIRPORTS: AirportSuggestion[] = [
  { code: "JFK", name: "John F. Kennedy International", city: "New York",     country: "United States",      type: "AIRPORT" },
  { code: "EWR", name: "Newark Liberty International",  city: "New York",     country: "United States",      type: "AIRPORT" },
  { code: "LAX", name: "Los Angeles International",     city: "Los Angeles",  country: "United States",      type: "AIRPORT" },
  { code: "ORD", name: "O'Hare International",          city: "Chicago",      country: "United States",      type: "AIRPORT" },
  { code: "MIA", name: "Miami International",           city: "Miami",        country: "United States",      type: "AIRPORT" },
  { code: "LHR", name: "Heathrow Airport",              city: "London",       country: "United Kingdom",     type: "AIRPORT" },
  { code: "LGW", name: "Gatwick Airport",               city: "London",       country: "United Kingdom",     type: "AIRPORT" },
  { code: "MAN", name: "Manchester Airport",            city: "Manchester",   country: "United Kingdom",     type: "AIRPORT" },
  { code: "DXB", name: "Dubai International Airport",   city: "Dubai",        country: "UAE",                type: "AIRPORT" },
  { code: "AUH", name: "Abu Dhabi International",       city: "Abu Dhabi",    country: "UAE",                type: "AIRPORT" },
  { code: "IST", name: "Istanbul Airport",              city: "Istanbul",     country: "Turkey",             type: "AIRPORT" },
  { code: "CDG", name: "Charles de Gaulle Airport",     city: "Paris",        country: "France",             type: "AIRPORT" },
  { code: "FRA", name: "Frankfurt Airport",             city: "Frankfurt",    country: "Germany",            type: "AIRPORT" },
  { code: "MUC", name: "Munich Airport",                city: "Munich",       country: "Germany",            type: "AIRPORT" },
  { code: "AMS", name: "Amsterdam Schiphol",            city: "Amsterdam",    country: "Netherlands",        type: "AIRPORT" },
  { code: "DOH", name: "Hamad International Airport",   city: "Doha",         country: "Qatar",              type: "AIRPORT" },
  { code: "JED", name: "King Abdulaziz International",  city: "Jeddah",       country: "Saudi Arabia",       type: "AIRPORT" },
  { code: "RUH", name: "King Khalid International",     city: "Riyadh",       country: "Saudi Arabia",       type: "AIRPORT" },
  { code: "MED", name: "Prince Mohammad Bin Abdulaziz", city: "Madinah",      country: "Saudi Arabia",       type: "AIRPORT" },
  { code: "LHE", name: "Allama Iqbal International",    city: "Lahore",       country: "Pakistan",           type: "AIRPORT" },
  { code: "KHI", name: "Jinnah International",          city: "Karachi",      country: "Pakistan",           type: "AIRPORT" },
  { code: "ISB", name: "Islamabad International",       city: "Islamabad",    country: "Pakistan",           type: "AIRPORT" },
  { code: "DEL", name: "Indira Gandhi International",   city: "New Delhi",    country: "India",              type: "AIRPORT" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj",   city: "Mumbai",       country: "India",              type: "AIRPORT" },
  { code: "SIN", name: "Changi Airport",                city: "Singapore",    country: "Singapore",          type: "AIRPORT" },
  { code: "KUL", name: "Kuala Lumpur International",    city: "Kuala Lumpur", country: "Malaysia",           type: "AIRPORT" },
  { code: "BKK", name: "Suvarnabhumi Airport",          city: "Bangkok",      country: "Thailand",           type: "AIRPORT" },
  { code: "NRT", name: "Narita International",          city: "Tokyo",        country: "Japan",              type: "AIRPORT" },
  { code: "SYD", name: "Sydney Kingsford Smith",        city: "Sydney",       country: "Australia",          type: "AIRPORT" },
  { code: "YYZ", name: "Toronto Pearson International", city: "Toronto",      country: "Canada",             type: "AIRPORT" },
  { code: "FCO", name: "Leonardo da Vinci–Fiumicino",   city: "Rome",         country: "Italy",              type: "AIRPORT" },
  { code: "MAD", name: "Adolfo Suárez Madrid–Barajas",  city: "Madrid",       country: "Spain",              type: "AIRPORT" },
  { code: "BCN", name: "Barcelona–El Prat Airport",     city: "Barcelona",    country: "Spain",              type: "AIRPORT" },
  { code: "PEK", name: "Beijing Capital International", city: "Beijing",      country: "China",              type: "AIRPORT" },
  { code: "PVG", name: "Shanghai Pudong International", city: "Shanghai",     country: "China",              type: "AIRPORT" },
];

function localFallback(keyword: string): AirportSuggestion[] {
  const q = keyword.toLowerCase();
  return FALLBACK_AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
  ).slice(0, 8);
}

// ─── Formatting Helper ───────────────────────────────────────────────────────

function toTitleCase(str: string): string {
  if (!str) return "";
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

// ─── GET handler ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const keyword = new URL(request.url).searchParams.get("keyword")?.trim() ?? "";

  if (keyword.length < 2) return NextResponse.json([], { status: 200 });

  // ── Step A: static country alias lookup ──────────────────────────────────
  const entry = COUNTRY_ALIASES[keyword.toUpperCase()];
  if (entry) {
    const results: AirportSuggestion[] = entry.airports.map((a) => ({
      ...a,
      isCountryMatch: true,
      groupLabel: entry.groupLabel,
    }));
    return NextResponse.json(results);
  }

  // ── Step B: Amadeus live search ───────────────────────────────────────────
  let token: string;
  try {
    token = await getAmadeusToken();
  } catch (err) {
    console.warn("[/api/airports] Token error — using local fallback:", err);
    return NextResponse.json(localFallback(keyword));
  }

  const params = new URLSearchParams({
    subType:      "AIRPORT,CITY",
    keyword:      keyword,
    "page[limit]":"6",
    view:         "LIGHT",
  });

  let json: { data?: unknown[] };
  try {
    json = await import("@/lib/amadeus").then(m =>
      m.amadeusGet(`/v1/reference-data/locations?${params.toString()}`, token)
    ) as { data?: unknown[] };
  } catch (err) {
    console.warn("[/api/airports] API error — using local fallback:", err);
    return NextResponse.json(localFallback(keyword).slice(0, 6));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const suggestions: AirportSuggestion[] = ((json.data ?? []) as any[])
    .filter((loc) => loc.iataCode)
    .map((loc) => ({
      code:    loc.iataCode,
      name:    toTitleCase(loc.name || loc.detailedName || ""),
      city:    toTitleCase(loc.address?.cityName || loc.name || ""),
      country: toTitleCase(loc.address?.countryName || loc.address?.countryCode || ""),
      type:    (loc.subType as "AIRPORT" | "CITY") || "AIRPORT",
    }));

  const merged = [...suggestions];
  // Add local fallback hits if not already present
  for (const fb of localFallback(keyword)) {
    if (!merged.some((m) => m.code === fb.code)) {
      merged.push(fb);
    }
  }

  const cleanQ = keyword.trim().toUpperCase();

  // Smart Sorting: Exact IATA Code Match -> City StartsWith -> Name StartsWith
  const sorted = merged.sort((a, b) => {
    const aExactIata = a.code.toUpperCase() === cleanQ ? 1 : 0;
    const bExactIata = b.code.toUpperCase() === cleanQ ? 1 : 0;
    if (aExactIata !== bExactIata) return bExactIata - aExactIata;

    const aCityMatch = a.city.toUpperCase().startsWith(cleanQ) ? 1 : 0;
    const bCityMatch = b.city.toUpperCase().startsWith(cleanQ) ? 1 : 0;
    if (aCityMatch !== bCityMatch) return bCityMatch - aCityMatch;

    return 0;
  });

  return NextResponse.json(sorted.slice(0, 6));
}
