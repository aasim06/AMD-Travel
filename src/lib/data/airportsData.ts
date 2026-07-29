import rawData from "./airportsData.json";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AirportOption {
  code:            string;
  name:            string;
  city:            string;
  country:         string;
  type:            "AIRPORT";
  isCountryMatch?: boolean;
  groupLabel?:     string;
}

interface RawAirport {
  iata:    string;
  name:    string;
  city:    string;
  country: string;
  aliases: string[];
}

// ─── Popular airports shown before the user types ─────────────────────────────

export const POPULAR_AIRPORTS: AirportOption[] = [
  { code: "LHE", name: "Allama Iqbal International Airport", city: "Lahore",    country: "Pakistan",        type: "AIRPORT" },
  { code: "KHI", name: "Jinnah International Airport",       city: "Karachi",   country: "Pakistan",        type: "AIRPORT" },
  { code: "ISB", name: "Islamabad International Airport",    city: "Islamabad", country: "Pakistan",        type: "AIRPORT" },
  { code: "DXB", name: "Dubai International Airport",        city: "Dubai",     country: "United Arab Emirates", type: "AIRPORT" },
  { code: "LHR", name: "Heathrow Airport",                   city: "London",    country: "United Kingdom",  type: "AIRPORT" },
  { code: "JED", name: "King Abdulaziz International",       city: "Jeddah",    country: "Saudi Arabia",    type: "AIRPORT" },
];

// ─── Build inverted prefix index ──────────────────────────────────────────────
// At module load time we iterate the dataset once and map every 2-char prefix
// of (iata, city, name, country, aliases) → Set<RawAirport>.
// A query lookup is then a single Map.get() + one tiny Set iteration.

const airports = rawData as RawAirport[];

// Pre-compute a lowercase search string for each airport once
interface IndexedAirport extends RawAirport {
  _search: string; // "iata|city|name|country|alias1|alias2…"
}

const indexed: IndexedAirport[] = airports.map((a) => ({
  ...a,
  _search: [a.iata, a.city, a.name, a.country, ...a.aliases]
    .join("|")
    .toLowerCase(),
}));

// Prefix index: first 2 chars of every token → candidate set
const prefixIndex = new Map<string, Set<IndexedAirport>>();

function addToIndex(prefix: string, airport: IndexedAirport) {
  let bucket = prefixIndex.get(prefix);
  if (!bucket) { bucket = new Set(); prefixIndex.set(prefix, bucket); }
  bucket.add(airport);
}

for (const airport of indexed) {
  const tokens = airport._search.split("|");
  const seen2 = new Set<string>();
  for (const token of tokens) {
    if (token.length < 2) continue;
    const p2 = token.slice(0, 2);
    if (!seen2.has(p2)) { seen2.add(p2); addToIndex(p2, airport); }
  }
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function searchAirports(keyword: string): AirportOption[] {
  const q = keyword.trim().toLowerCase();
  if (q.length < 2) return POPULAR_AIRPORTS;

  // Country-group match: if the entire query matches an alias for a country,
  // return all airports for that country (up to 10), flagged as isCountryMatch.
  const countryHits = indexed.filter(
    (a) => a.aliases.includes(q) || a.country.toLowerCase() === q
  );
  if (countryHits.length > 0) {
    const groupLabel = `Airports in ${countryHits[0].country}`;
    return countryHits.slice(0, 10).map((a) => toOption(a, true, groupLabel));
  }

  // Prefix-index lookup: get the candidate bucket for the first 2 chars,
  // then filter candidates whose full _search string contains the query.
  const p2 = q.slice(0, 2);
  const candidates = prefixIndex.get(p2);
  if (!candidates) return [];

  const results: AirportOption[] = [];
  for (const a of candidates) {
    if (a._search.includes(q)) {
      results.push(toOption(a));
      if (results.length === 10) break;
    }
  }
  return results;
}

function toOption(
  a: IndexedAirport,
  isCountryMatch = false,
  groupLabel?: string,
): AirportOption {
  return {
    code:    a.iata,
    name:    a.name,
    city:    a.city,
    country: a.country,
    type:    "AIRPORT",
    ...(isCountryMatch && { isCountryMatch: true, groupLabel }),
  };
}
