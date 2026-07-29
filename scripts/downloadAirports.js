#!/usr/bin/env node
/**
 * scripts/downloadAirports.js
 *
 * Fetches the OpenFlights airports.dat (~14 k airports, public domain),
 * filters to entries that have a valid 3-letter IATA code, attaches
 * country-level aliases for fast client-side lookup, and writes the
 * result to src/lib/data/airportsData.json.
 *
 * Run:  npm run airports:download
 */

const https  = require("https");
const fs     = require("fs");
const path   = require("path");

const SOURCE_URL =
  "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat";

const OUT_PATH = path.resolve(
  __dirname,
  "../src/lib/data/airportsData.json"
);

// ─── Country alias map ────────────────────────────────────────────────────────
// Maps every country name (as it appears in OpenFlights) to an array of
// lowercase aliases that users might type.  Add more entries as needed.

const COUNTRY_ALIASES = {
  "Afghanistan":                    ["af","afg","afghanistan"],
  "Albania":                        ["al","alb","albania"],
  "Algeria":                        ["dz","dza","algeria"],
  "Angola":                         ["ao","ago","angola"],
  "Argentina":                      ["ar","arg","argentina"],
  "Armenia":                        ["am","arm","armenia"],
  "Australia":                      ["au","aus","australia"],
  "Austria":                        ["at","aut","austria"],
  "Azerbaijan":                     ["az","aze","azerbaijan"],
  "Bahrain":                        ["bh","bhr","bahrain"],
  "Bangladesh":                     ["bd","bgd","bangladesh"],
  "Belarus":                        ["by","blr","belarus"],
  "Belgium":                        ["be","bel","belgium"],
  "Bolivia":                        ["bo","bol","bolivia"],
  "Bosnia and Herzegovina":         ["ba","bih","bosnia"],
  "Brazil":                         ["br","bra","brazil","brasil"],
  "Bulgaria":                       ["bg","bgr","bulgaria"],
  "Cambodia":                       ["kh","khm","cambodia"],
  "Cameroon":                       ["cm","cmr","cameroon"],
  "Canada":                         ["ca","can","canada"],
  "Chile":                          ["cl","chl","chile"],
  "China":                          ["cn","chn","china"],
  "Colombia":                       ["co","col","colombia"],
  "Congo (Kinshasa)":               ["cd","cod","congo","drc"],
  "Costa Rica":                     ["cr","cri","costa rica"],
  "Croatia":                        ["hr","hrv","croatia"],
  "Cuba":                           ["cu","cub","cuba"],
  "Cyprus":                         ["cy","cyp","cyprus"],
  "Czech Republic":                 ["cz","cze","czech","czechia"],
  "Denmark":                        ["dk","dnk","denmark"],
  "Dominican Republic":             ["do","dom","dominican"],
  "Ecuador":                        ["ec","ecu","ecuador"],
  "Egypt":                          ["eg","egy","egypt"],
  "El Salvador":                    ["sv","slv","el salvador"],
  "Estonia":                        ["ee","est","estonia"],
  "Ethiopia":                       ["et","eth","ethiopia"],
  "Finland":                        ["fi","fin","finland"],
  "France":                         ["fr","fra","france"],
  "Georgia":                        ["ge","geo","georgia"],
  "Germany":                        ["de","deu","ger","germany"],
  "Ghana":                          ["gh","gha","ghana"],
  "Greece":                         ["gr","grc","greece"],
  "Guatemala":                      ["gt","gtm","guatemala"],
  "Honduras":                       ["hn","hnd","honduras"],
  "Hungary":                        ["hu","hun","hungary"],
  "Iceland":                        ["is","isl","iceland"],
  "India":                          ["in","ind","india"],
  "Indonesia":                      ["id","idn","indonesia"],
  "Iran":                           ["ir","irn","iran"],
  "Iraq":                           ["iq","irq","iraq"],
  "Ireland":                        ["ie","irl","ireland"],
  "Israel":                         ["il","isr","israel"],
  "Italy":                          ["it","ita","italy"],
  "Ivory Coast":                    ["ci","civ","ivory coast","cote d'ivoire"],
  "Jamaica":                        ["jm","jam","jamaica"],
  "Japan":                          ["jp","jpn","japan"],
  "Jordan":                         ["jo","jor","jordan"],
  "Kazakhstan":                     ["kz","kaz","kazakhstan"],
  "Kenya":                          ["ke","ken","kenya"],
  "Kosovo":                         ["xk","xkx","kosovo"],
  "Kuwait":                         ["kw","kwt","kuwait"],
  "Kyrgyzstan":                     ["kg","kgz","kyrgyzstan"],
  "Laos":                           ["la","lao","laos"],
  "Latvia":                         ["lv","lva","latvia"],
  "Lebanon":                        ["lb","lbn","lebanon"],
  "Libya":                          ["ly","lby","libya"],
  "Lithuania":                      ["lt","ltu","lithuania"],
  "Luxembourg":                     ["lu","lux","luxembourg"],
  "Malaysia":                       ["my","mys","malaysia"],
  "Maldives":                       ["mv","mdv","maldives"],
  "Malta":                          ["mt","mlt","malta"],
  "Mexico":                         ["mx","mex","mexico"],
  "Moldova":                        ["md","mda","moldova"],
  "Mongolia":                       ["mn","mng","mongolia"],
  "Montenegro":                     ["me","mne","montenegro"],
  "Morocco":                        ["ma","mar","morocco"],
  "Mozambique":                     ["mz","moz","mozambique"],
  "Myanmar":                        ["mm","mmr","myanmar","burma"],
  "Nepal":                          ["np","npl","nepal"],
  "Netherlands":                    ["nl","nld","netherlands","holland"],
  "New Zealand":                    ["nz","nzl","new zealand"],
  "Nicaragua":                      ["ni","nic","nicaragua"],
  "Nigeria":                        ["ng","nga","nigeria"],
  "North Korea":                    ["kp","prk","north korea"],
  "North Macedonia":                ["mk","mkd","north macedonia","macedonia"],
  "Norway":                         ["no","nor","norway"],
  "Oman":                           ["om","omn","oman"],
  "Pakistan":                       ["pk","pak","pakistan"],
  "Panama":                         ["pa","pan","panama"],
  "Paraguay":                       ["py","pry","paraguay"],
  "Peru":                           ["pe","per","peru"],
  "Philippines":                    ["ph","phl","philippines"],
  "Poland":                         ["pl","pol","poland"],
  "Portugal":                       ["pt","prt","portugal"],
  "Qatar":                          ["qa","qat","qatar"],
  "Romania":                        ["ro","rou","romania"],
  "Russia":                         ["ru","rus","russia"],
  "Saudi Arabia":                   ["sa","sau","saudi","saudi arabia","ksa"],
  "Senegal":                        ["sn","sen","senegal"],
  "Serbia":                         ["rs","srb","serbia"],
  "Singapore":                      ["sg","sgp","singapore"],
  "Slovakia":                       ["sk","svk","slovakia"],
  "Slovenia":                       ["si","svn","slovenia"],
  "Somalia":                        ["so","som","somalia"],
  "South Africa":                   ["za","zaf","south africa"],
  "South Korea":                    ["kr","kor","south korea","korea"],
  "Spain":                          ["es","esp","spain"],
  "Sri Lanka":                      ["lk","lka","sri lanka","ceylon"],
  "Sudan":                          ["sd","sdn","sudan"],
  "Sweden":                         ["se","swe","sweden"],
  "Switzerland":                    ["ch","che","switzerland","swiss"],
  "Syria":                          ["sy","syr","syria"],
  "Taiwan":                         ["tw","twn","taiwan"],
  "Tajikistan":                     ["tj","tjk","tajikistan"],
  "Tanzania":                       ["tz","tza","tanzania"],
  "Thailand":                       ["th","tha","thailand"],
  "Tunisia":                        ["tn","tun","tunisia"],
  "Turkey":                         ["tr","tur","turkey","türkiye"],
  "Turkmenistan":                   ["tm","tkm","turkmenistan"],
  "Uganda":                         ["ug","uga","uganda"],
  "Ukraine":                        ["ua","ukr","ukraine"],
  "United Arab Emirates":           ["ae","are","uae","emirates","dubai country"],
  "United Kingdom":                 ["gb","gbr","uk","england","britain","great britain","united kingdom"],
  "United States":                  ["us","usa","america","united states","us of a"],
  "Uruguay":                        ["uy","ury","uruguay"],
  "Uzbekistan":                     ["uz","uzb","uzbekistan"],
  "Venezuela":                      ["ve","ven","venezuela"],
  "Vietnam":                        ["vn","vnm","vietnam","viet nam"],
  "Yemen":                          ["ye","yem","yemen"],
  "Zambia":                         ["zm","zmb","zambia"],
  "Zimbabwe":                       ["zw","zwe","zimbabwe"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end",  () => resolve(Buffer.concat(chunks).toString("utf8")));
      res.on("error", reject);
    }).on("error", reject);
  });
}

// OpenFlights CSV field indices
const F_NAME    = 1;
const F_CITY    = 2;
const F_COUNTRY = 3;
const F_IATA    = 4;
const F_TYPE    = 12; // "airport", "station", "port", "unknown"

function parseCSVLine(line) {
  const fields = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === "," && !inQ) { fields.push(cur); cur = ""; continue; }
    cur += ch;
  }
  fields.push(cur);
  return fields;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log("⬇  Fetching OpenFlights airports.dat …");
  const raw = await get(SOURCE_URL);
  const lines = raw.split("\n").filter(Boolean);
  console.log(`   ${lines.length} raw lines`);

  const airports = [];

  for (const line of lines) {
    const f = parseCSVLine(line);
    const iata = f[F_IATA]?.trim();

    // Skip entries without a real 3-letter IATA code
    if (!iata || iata.length !== 3 || iata === "\\N" || iata === "-") continue;

    const country = f[F_COUNTRY]?.trim() ?? "";
    const aliases = COUNTRY_ALIASES[country] ?? [];

    airports.push({
      iata,
      name:    f[F_NAME]?.trim()    ?? "",
      city:    f[F_CITY]?.trim()    ?? "",
      country,
      aliases,
    });
  }

  // Deduplicate by IATA (keep first occurrence)
  const seen = new Set();
  const unique = airports.filter((a) => {
    if (seen.has(a.iata)) return false;
    seen.add(a.iata);
    return true;
  });

  console.log(`✅  ${unique.length} airports with valid IATA codes`);

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(unique, null, 2), "utf8");
  console.log(`💾  Written to ${OUT_PATH}`);
})().catch((err) => {
  console.error("❌ ", err.message);
  process.exit(1);
});
