export type TravelClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export type Currency = "USD" | "PKR" | "SAR" | "AED" | "GBP" | "EUR";

export interface FlightLeg {
  origin: string;
  destination: string;
  departureDate: string;
}

export interface FlightSearchParams {
  tripType: "one-way" | "round-trip" | "multi-city";
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  travelClass: TravelClass;
  currency: Currency;
  legs?: FlightLeg[]; // multi-city
}

export interface FlightPrice {
  total: string;
  base: string;
  currency: Currency;
  perPassenger: string;
}

export interface FlightSegment {
  id: string;
  carrierCode: string;
  flightNumber: string;
  aircraft: string;
  airlineLogo?: string;
  departure: {
    iataCode: string;
    terminal?: string;
    at: string; // ISO datetime
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string; // ISO datetime
  };
  duration: string; // ISO 8601 duration e.g. PT7H30M
  numberOfStops: number;
}

export interface Itinerary {
  duration: string;
  segments: FlightSegment[];
}

export interface BaggageAllowance {
  quantity: number;
  weight?: number;
  weightUnit?: string;
}

export interface FlightOffer {
  id: string;
  source: "GDS" | "NDC";
  price: FlightPrice;
  itineraries: Itinerary[];
  validatingAirlineCodes: string[];
  numberOfBookableSeats: number;
  lastTicketingDate: string;
  baggageAllowance?: BaggageAllowance;
  rawAmadeusOffer?: unknown;
}

export interface FlightSearchResponse {
  data: FlightOffer[];
  meta: {
    count: number;
    currency: Currency;
    origin: string;
    destination: string;
    departureDate: string;
  };
  dictionaries: {
    carriers: Record<string, string>;
    aircraft: Record<string, string>;
    locations: Record<string, { cityCode: string; countryCode: string }>;
  };
}

export interface RecentSearch {
  id: string;
  tripType: "round-trip" | "one-way" | "multi-city";
  origin: string;
  destination: string;
  departureDate: string;   // ISO YYYY-MM-DD
  returnDate?: string;
  passengers: number;
  travelClass: TravelClass;
  estimatedPrice: number;  // USD
  searchedAt: string;      // ISO datetime
}

export const RECENT_SEARCHES_KEY = "amd_recent_searches";
export const MAX_RECENT_SEARCHES = 5;

export const AIRLINE_NAMES: Record<string, string> = {
  EK: "Emirates",
  QR: "Qatar Airways",
  SV: "Saudia",
  PK: "PIA",
  TK: "Turkish Airlines",
  FZ: "flydubai",
  G9: "Air Arabia",
  WY: "Oman Air",
  EY: "Etihad Airways",
  AI: "Air India",
  "9P": "Fly Jinnah",
  PF: "Air Sial",
  PA: "Airblue",
  ER: "SERENE Air",
};

// Fallback logo URLs for airlines not on Duffel CDN
export const AIRLINE_LOGO_FALLBACKS: Record<string, string> = {
  "9P": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Fly_Jinnah_logo.svg/320px-Fly_Jinnah_logo.svg.png",
  PF:  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Air_Sial_logo.svg/320px-Air_Sial_logo.svg.png",
  PA:  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Airblue_logo.svg/320px-Airblue_logo.svg.png",
  ER:  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Serene_Air_logo.svg/320px-Serene_Air_logo.svg.png",
};

export const AIRCRAFT_NAMES: Record<string, string> = {
  "773": "Boeing 777-300",
  "77W": "Boeing 777-300ER",
  "789": "Boeing 787-9 Dreamliner",
  "359": "Airbus A350-900",
  "321": "Airbus A321",
  "333": "Airbus A330-300",
  "388": "Airbus A380-800",
};

// ─── Currency conversion ───────────────────────────────────────────────────────
// Rates are relative to USD. Update periodically or swap for a live feed.
export const FX_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  SAR: 3.75,
  PKR: 278,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED",
  SAR: "SAR",
  PKR: "Rs",
};

/** Convert a USD price string to the target currency, returned as a formatted string. */
export function displayPrice(usdTotal: string, toCurrency: Currency): string {
  const converted = parseFloat(usdTotal) * FX_RATES[toCurrency];
  return converted.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
