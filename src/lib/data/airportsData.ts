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

// ─── Popular airport IATA set — used to boost relevance score ────────────────
const POPULAR_CODES = new Set(POPULAR_AIRPORTS.map((a) => a.code));

// ─── Search ───────────────────────────────────────────────────────────────────

export function searchAirports(keyword: string): AirportOption[] {
  const q = keyword.trim().toLowerCase();
  if (q.length < 2) return POPULAR_AIRPORTS;

  // Country-group match
  const countryHits = indexed.filter(
    (a) => a.aliases.includes(q) || a.country.toLowerCase() === q
  );
  if (countryHits.length > 0) {
    const groupLabel = `Airports in ${countryHits[0].country}`;
    return countryHits.slice(0, 10).map((a) => toOption(a, true, groupLabel));
  }

  // Prefix-index lookup — collect all candidates that contain the query
  const p2 = q.slice(0, 2);
  const candidates = prefixIndex.get(p2);
  if (!candidates) return [];

  const scored: { airport: IndexedAirport; score: number }[] = [];

  for (const a of candidates) {
    if (!a._search.includes(q)) continue;

    const iataLower = a.iata.toLowerCase();
    const cityLower = a.city.toLowerCase();
    const nameLower = a.name.toLowerCase();

    let score = 0;

    // Exact IATA match — highest priority
    if (iataLower === q)                  score += 100;
    // IATA starts with query
    else if (iataLower.startsWith(q))     score += 80;
    // City exact match
    if (cityLower === q)                  score += 70;
    // City starts with query
    else if (cityLower.startsWith(q))     score += 50;
    // Airport name starts with query
    else if (nameLower.startsWith(q))     score += 30;
    // Alias exact match
    else if (a.aliases.includes(q))       score += 40;
    // Fallback: substring match (already guaranteed by _search.includes)
    else                                  score += 10;

    // Boost popular/well-known airports
    if (POPULAR_CODES.has(a.iata))        score += 20;

    scored.push({ airport: a, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(({ airport }) => toOption(airport));
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
