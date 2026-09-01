export interface HubAirport {
  code:    string;
  name:    string;
  city:    string;
  country: string;
  type:    "AIRPORT" | "CITY";
}

export interface CountryEntry {
  groupLabel: string;
  airports:   HubAirport[];
}

// Keys are uppercased for fast O(1) lookup
const COUNTRY_ALIASES: Record<string, CountryEntry> = {
  // ── Germany ──────────────────────────────────────────────────────────────
  GER:     germany(),
  DE:      germany(),
  DEU:     germany(),
  GERMANY: germany(),

  // ── United Kingdom ────────────────────────────────────────────────────────
  UK:             uk(),
  GB:             uk(),
  GBR:            uk(),
  ENGLAND:        uk(),
  "UNITED KINGDOM": uk(),

  // ── United States ─────────────────────────────────────────────────────────
  US:              usa(),
  USA:             usa(),
  AMERICA:         usa(),
  "UNITED STATES": usa(),

  // ── UAE ───────────────────────────────────────────────────────────────────
  UAE:      uae(),
  AE:       uae(),
  EMIRATES: uae(),

  // ── Saudi Arabia ──────────────────────────────────────────────────────────
  SA:             saudi(),
  SAU:            saudi(),
  SAUDI:          saudi(),
  "SAUDI ARABIA": saudi(),

  // ── Pakistan ──────────────────────────────────────────────────────────────
  PK:       pakistan(),
  PAK:      pakistan(),
  PAKISTAN: pakistan(),

  // ── Turkey ────────────────────────────────────────────────────────────────
  TR:     turkey(),
  TUR:    turkey(),
  TURKEY: turkey(),

  // ── Qatar ─────────────────────────────────────────────────────────────────
  QA:    qatar(),
  QAT:   qatar(),
  QATAR: qatar(),

  // ── France ────────────────────────────────────────────────────────────────
  FR:     france(),
  FRANCE: france(),

  // ── Italy ─────────────────────────────────────────────────────────────────
  IT:    italy(),
  ITA:   italy(),
  ITALY: italy(),

  // ── Spain ─────────────────────────────────────────────────────────────────
  ES:    spain(),
  ESP:   spain(),
  SPAIN: spain(),

  // ── Canada ────────────────────────────────────────────────────────────────
  CA:     canada(),
  CANADA: canada(),

  // ── Australia ─────────────────────────────────────────────────────────────
  AU:        australia(),
  AUSTRALIA: australia(),

  // ── China ─────────────────────────────────────────────────────────────────
  CN:    china(),
  CHN:   china(),
  CHINA: china(),
};

export default COUNTRY_ALIASES;

// ── Factory functions ─────────────────────────────────────────────────────────

function germany(): CountryEntry {
  return {
    groupLabel: "Popular Airports in Germany",
    airports: [
      { code: "FRA", name: "Frankfurt Airport",          city: "Frankfurt", country: "Germany", type: "AIRPORT" },
      { code: "MUC", name: "Munich Airport",             city: "Munich",    country: "Germany", type: "AIRPORT" },
      { code: "BER", name: "Berlin Brandenburg Airport", city: "Berlin",    country: "Germany", type: "AIRPORT" },
      { code: "DUS", name: "Düsseldorf Airport",         city: "Düsseldorf",country: "Germany", type: "AIRPORT" },
      { code: "HAM", name: "Hamburg Airport",            city: "Hamburg",   country: "Germany", type: "AIRPORT" },
    ],
  };
}

function uk(): CountryEntry {
  return {
    groupLabel: "Popular Airports in United Kingdom",
    airports: [
      { code: "LHR", name: "Heathrow Airport",           city: "London",     country: "United Kingdom", type: "AIRPORT" },
      { code: "LGW", name: "Gatwick Airport",            city: "London",     country: "United Kingdom", type: "AIRPORT" },
      { code: "STN", name: "Stansted Airport",           city: "London",     country: "United Kingdom", type: "AIRPORT" },
      { code: "LON", name: "London (All Airports)",      city: "London",     country: "United Kingdom", type: "CITY"    },
      { code: "MAN", name: "Manchester Airport",         city: "Manchester", country: "United Kingdom", type: "AIRPORT" },
      { code: "BHX", name: "Birmingham Airport",         city: "Birmingham", country: "United Kingdom", type: "AIRPORT" },
    ],
  };
}

function usa(): CountryEntry {
  return {
    groupLabel: "Popular Airports in USA",
    airports: [
      { code: "JFK", name: "John F. Kennedy International", city: "New York",    country: "United States", type: "AIRPORT" },
      { code: "EWR", name: "Newark Liberty International",  city: "New York",    country: "United States", type: "AIRPORT" },
      { code: "NYC", name: "New York (All Airports)",       city: "New York",    country: "United States", type: "CITY"    },
      { code: "LAX", name: "Los Angeles International",     city: "Los Angeles", country: "United States", type: "AIRPORT" },
      { code: "ORD", name: "O'Hare International",          city: "Chicago",     country: "United States", type: "AIRPORT" },
      { code: "MIA", name: "Miami International",           city: "Miami",       country: "United States", type: "AIRPORT" },
    ],
  };
}

function uae(): CountryEntry {
  return {
    groupLabel: "Popular Airports in UAE",
    airports: [
      { code: "DXB", name: "Dubai International Airport",    city: "Dubai",     country: "UAE", type: "AIRPORT" },
      { code: "AUH", name: "Abu Dhabi International Airport",city: "Abu Dhabi", country: "UAE", type: "AIRPORT" },
      { code: "SHJ", name: "Sharjah International Airport",  city: "Sharjah",   country: "UAE", type: "AIRPORT" },
    ],
  };
}

function saudi(): CountryEntry {
  return {
    groupLabel: "Popular Airports in Saudi Arabia",
    airports: [
      { code: "JED", name: "King Abdulaziz International", city: "Jeddah",  country: "Saudi Arabia", type: "AIRPORT" },
      { code: "RUH", name: "King Khalid International",    city: "Riyadh",  country: "Saudi Arabia", type: "AIRPORT" },
      { code: "MED", name: "Prince Mohammad Bin Abdulaziz",city: "Madinah", country: "Saudi Arabia", type: "AIRPORT" },
    ],
  };
}

function pakistan(): CountryEntry {
  return {
    groupLabel: "Popular Airports in Pakistan",
    airports: [
      { code: "LHE", name: "Allama Iqbal International",  city: "Lahore",    country: "Pakistan", type: "AIRPORT" },
      { code: "KHI", name: "Jinnah International",        city: "Karachi",   country: "Pakistan", type: "AIRPORT" },
      { code: "ISB", name: "Islamabad International",     city: "Islamabad", country: "Pakistan", type: "AIRPORT" },
    ],
  };
}

function turkey(): CountryEntry {
  return {
    groupLabel: "Popular Airports in Turkey",
    airports: [
      { code: "IST", name: "Istanbul Airport",          city: "Istanbul", country: "Turkey", type: "AIRPORT" },
      { code: "SAW", name: "Sabiha Gökçen International",city: "Istanbul", country: "Turkey", type: "AIRPORT" },
      { code: "AYT", name: "Antalya Airport",           city: "Antalya",  country: "Turkey", type: "AIRPORT" },
    ],
  };
}

function qatar(): CountryEntry {
  return {
    groupLabel: "Popular Airports in Qatar",
    airports: [
      { code: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar", type: "AIRPORT" },
    ],
  };
}

function france(): CountryEntry {
  return {
    groupLabel: "Popular Airports in France",
    airports: [
      { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", type: "AIRPORT" },
      { code: "ORY", name: "Orly Airport",              city: "Paris", country: "France", type: "AIRPORT" },
      { code: "NCE", name: "Nice Côte d'Azur Airport",  city: "Nice",  country: "France", type: "AIRPORT" },
    ],
  };
}

function italy(): CountryEntry {
  return {
    groupLabel: "Popular Airports in Italy",
    airports: [
      { code: "FCO", name: "Leonardo da Vinci–Fiumicino", city: "Rome",  country: "Italy", type: "AIRPORT" },
      { code: "MXP", name: "Milan Malpensa Airport",      city: "Milan", country: "Italy", type: "AIRPORT" },
      { code: "VCE", name: "Venice Marco Polo Airport",   city: "Venice",country: "Italy", type: "AIRPORT" },
    ],
  };
}

function spain(): CountryEntry {
  return {
    groupLabel: "Popular Airports in Spain",
    airports: [
      { code: "MAD", name: "Adolfo Suárez Madrid–Barajas", city: "Madrid",    country: "Spain", type: "AIRPORT" },
      { code: "BCN", name: "Barcelona–El Prat Airport",    city: "Barcelona", country: "Spain", type: "AIRPORT" },
      { code: "AGP", name: "Málaga–Costa del Sol Airport", city: "Málaga",    country: "Spain", type: "AIRPORT" },
    ],
  };
}

function canada(): CountryEntry {
  return {
    groupLabel: "Popular Airports in Canada",
    airports: [
      { code: "YYZ", name: "Toronto Pearson International", city: "Toronto",   country: "Canada", type: "AIRPORT" },
      { code: "YVR", name: "Vancouver International",       city: "Vancouver", country: "Canada", type: "AIRPORT" },
      { code: "YUL", name: "Montréal–Trudeau International",city: "Montreal",  country: "Canada", type: "AIRPORT" },
    ],
  };
}

function australia(): CountryEntry {
  return {
    groupLabel: "Popular Airports in Australia",
    airports: [
      { code: "SYD", name: "Sydney Kingsford Smith Airport",  city: "Sydney",    country: "Australia", type: "AIRPORT" },
      { code: "MEL", name: "Melbourne Airport",               city: "Melbourne", country: "Australia", type: "AIRPORT" },
      { code: "BNE", name: "Brisbane Airport",                city: "Brisbane",  country: "Australia", type: "AIRPORT" },
    ],
  };
}

function china(): CountryEntry {
  return {
    groupLabel: "Popular Airports in China",
    airports: [
      { code: "PEK", name: "Beijing Capital International",  city: "Beijing",  country: "China", type: "AIRPORT" },
      { code: "PKX", name: "Beijing Daxing International",   city: "Beijing",  country: "China", type: "AIRPORT" },
      { code: "PVG", name: "Shanghai Pudong International",  city: "Shanghai", country: "China", type: "AIRPORT" },
      { code: "CAN", name: "Guangzhou Baiyun International", city: "Guangzhou",country: "China", type: "AIRPORT" },
    ],
  };
}
