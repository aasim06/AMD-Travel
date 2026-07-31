"use client";

import { useState, useRef, useEffect, useMemo, useDeferredValue } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export interface CountryDialCode {
  code: string;
  flag: string;
  name: string;
}

export const WORLD_PHONE_CODES: CountryDialCode[] = [
  { code: "+93",   flag: "🇦🇫", name: "Afghanistan" },
  { code: "+355",  flag: "🇦🇱", name: "Albania" },
  { code: "+213",  flag: "🇩🇿", name: "Algeria" },
  { code: "+376",  flag: "🇦🇩", name: "Andorra" },
  { code: "+244",  flag: "🇦🇴", name: "Angola" },
  { code: "+1268", flag: "🇦🇬", name: "Antigua & Barbuda" },
  { code: "+54",   flag: "🇦🇷", name: "Argentina" },
  { code: "+374",  flag: "🇦🇲", name: "Armenia" },
  { code: "+61",   flag: "🇦🇺", name: "Australia" },
  { code: "+43",   flag: "🇦🇹", name: "Austria" },
  { code: "+994",  flag: "🇦🇿", name: "Azerbaijan" },
  { code: "+1242", flag: "🇧🇸", name: "Bahamas" },
  { code: "+973",  flag: "🇧🇭", name: "Bahrain" },
  { code: "+880",  flag: "🇧🇩", name: "Bangladesh" },
  { code: "+1246", flag: "🇧🇧", name: "Barbados" },
  { code: "+375",  flag: "🇧🇾", name: "Belarus" },
  { code: "+32",   flag: "🇧🇪", name: "Belgium" },
  { code: "+501",  flag: "🇧🇿", name: "Belize" },
  { code: "+229",  flag: "🇧🇯", name: "Benin" },
  { code: "+975",  flag: "🇧🇹", name: "Bhutan" },
  { code: "+591",  flag: "🇧🇴", name: "Bolivia" },
  { code: "+387",  flag: "🇧🇦", name: "Bosnia & Herzegovina" },
  { code: "+267",  flag: "🇧🇼", name: "Botswana" },
  { code: "+55",   flag: "🇧🇷", name: "Brazil" },
  { code: "+673",  flag: "🇧🇳", name: "Brunei" },
  { code: "+359",  flag: "🇧🇬", name: "Bulgaria" },
  { code: "+226",  flag: "🇧🇫", name: "Burkina Faso" },
  { code: "+257",  flag: "🇧🇮", name: "Burundi" },
  { code: "+238",  flag: "🇨🇻", name: "Cabo Verde" },
  { code: "+855",  flag: "🇰🇭", name: "Cambodia" },
  { code: "+237",  flag: "🇨🇲", name: "Cameroon" },
  { code: "+1",    flag: "🇨🇦", name: "Canada" },
  { code: "+236",  flag: "🇨🇫", name: "Central African Republic" },
  { code: "+235",  flag: "🇹🇩", name: "Chad" },
  { code: "+56",   flag: "🇨🇱", name: "Chile" },
  { code: "+86",   flag: "🇨🇳", name: "China" },
  { code: "+57",   flag: "🇨🇴", name: "Colombia" },
  { code: "+269",  flag: "🇰🇲", name: "Comoros" },
  { code: "+242",  flag: "🇨🇬", name: "Congo" },
  { code: "+243",  flag: "🇨🇩", name: "Congo (DRC)" },
  { code: "+506",  flag: "🇨🇷", name: "Costa Rica" },
  { code: "+385",  flag: "🇭🇷", name: "Croatia" },
  { code: "+53",   flag: "🇨🇺", name: "Cuba" },
  { code: "+357",  flag: "🇨🇾", name: "Cyprus" },
  { code: "+420",  flag: "🇨🇿", name: "Czech Republic" },
  { code: "+45",   flag: "🇩🇰", name: "Denmark" },
  { code: "+253",  flag: "🇩🇯", name: "Djibouti" },
  { code: "+1767", flag: "🇩🇲", name: "Dominica" },
  { code: "+1809", flag: "🇩🇴", name: "Dominican Republic" },
  { code: "+593",  flag: "🇪🇨", name: "Ecuador" },
  { code: "+20",   flag: "🇪🇬", name: "Egypt" },
  { code: "+503",  flag: "🇸🇻", name: "El Salvador" },
  { code: "+240",  flag: "🇬🇶", name: "Equatorial Guinea" },
  { code: "+291",  flag: "🇪🇷", name: "Eritrea" },
  { code: "+372",  flag: "🇪🇪", name: "Estonia" },
  { code: "+268",  flag: "🇸🇿", name: "Eswatini" },
  { code: "+251",  flag: "🇪🇹", name: "Ethiopia" },
  { code: "+679",  flag: "🇫🇯", name: "Fiji" },
  { code: "+358",  flag: "🇫🇮", name: "Finland" },
  { code: "+33",   flag: "🇫🇷", name: "France" },
  { code: "+241",  flag: "🇬🇦", name: "Gabon" },
  { code: "+220",  flag: "🇬🇲", name: "Gambia" },
  { code: "+995",  flag: "🇬🇪", name: "Georgia" },
  { code: "+49",   flag: "🇩🇪", name: "Germany" },
  { code: "+233",  flag: "🇬🇭", name: "Ghana" },
  { code: "+30",   flag: "🇬🇷", name: "Greece" },
  { code: "+1473", flag: "🇬🇩", name: "Grenada" },
  { code: "+502",  flag: "🇬🇹", name: "Guatemala" },
  { code: "+224",  flag: "🇬🇳", name: "Guinea" },
  { code: "+245",  flag: "🇬🇼", name: "Guinea-Bissau" },
  { code: "+592",  flag: "🇬🇾", name: "Guyana" },
  { code: "+509",  flag: "🇭🇹", name: "Haiti" },
  { code: "+504",  flag: "🇭🇳", name: "Honduras" },
  { code: "+36",   flag: "🇭🇺", name: "Hungary" },
  { code: "+354",  flag: "🇮🇸", name: "Iceland" },
  { code: "+91",   flag: "🇮🇳", name: "India" },
  { code: "+62",   flag: "🇮🇩", name: "Indonesia" },
  { code: "+98",   flag: "🇮🇷", name: "Iran" },
  { code: "+964",  flag: "🇮🇶", name: "Iraq" },
  { code: "+353",  flag: "🇮🇪", name: "Ireland" },
  { code: "+972",  flag: "🇮🇱", name: "Israel" },
  { code: "+39",   flag: "🇮🇹", name: "Italy" },
  { code: "+1876", flag: "🇯🇲", name: "Jamaica" },
  { code: "+81",   flag: "🇯🇵", name: "Japan" },
  { code: "+962",  flag: "🇯🇴", name: "Jordan" },
  { code: "+7",    flag: "🇰🇿", name: "Kazakhstan" },
  { code: "+254",  flag: "🇰🇪", name: "Kenya" },
  { code: "+686",  flag: "🇰🇮", name: "Kiribati" },
  { code: "+383",  flag: "🇽🇰", name: "Kosovo" },
  { code: "+965",  flag: "🇰🇼", name: "Kuwait" },
  { code: "+996",  flag: "🇰🇬", name: "Kyrgyzstan" },
  { code: "+856",  flag: "🇱🇦", name: "Laos" },
  { code: "+371",  flag: "🇱🇻", name: "Latvia" },
  { code: "+961",  flag: "🇱🇧", name: "Lebanon" },
  { code: "+266",  flag: "🇱🇸", name: "Lesotho" },
  { code: "+231",  flag: "🇱🇷", name: "Liberia" },
  { code: "+218",  flag: "🇱🇾", name: "Libya" },
  { code: "+423",  flag: "🇱🇮", name: "Liechtenstein" },
  { code: "+370",  flag: "🇱🇹", name: "Lithuania" },
  { code: "+352",  flag: "🇱🇺", name: "Luxembourg" },
  { code: "+261",  flag: "🇲🇬", name: "Madagascar" },
  { code: "+265",  flag: "🇲🇼", name: "Malawi" },
  { code: "+60",   flag: "🇲🇾", name: "Malaysia" },
  { code: "+960",  flag: "🇲🇻", name: "Maldives" },
  { code: "+223",  flag: "🇲🇱", name: "Mali" },
  { code: "+356",  flag: "🇲🇹", name: "Malta" },
  { code: "+692",  flag: "🇲🇭", name: "Marshall Islands" },
  { code: "+222",  flag: "🇲🇷", name: "Mauritania" },
  { code: "+230",  flag: "🇲🇺", name: "Mauritius" },
  { code: "+52",   flag: "🇲🇽", name: "Mexico" },
  { code: "+691",  flag: "🇫🇲", name: "Micronesia" },
  { code: "+373",  flag: "🇲🇩", name: "Moldova" },
  { code: "+377",  flag: "🇲🇨", name: "Monaco" },
  { code: "+976",  flag: "🇲🇳", name: "Mongolia" },
  { code: "+382",  flag: "🇲🇪", name: "Montenegro" },
  { code: "+212",  flag: "🇲🇦", name: "Morocco" },
  { code: "+258",  flag: "🇲🇿", name: "Mozambique" },
  { code: "+95",   flag: "🇲🇲", name: "Myanmar" },
  { code: "+264",  flag: "🇳🇦", name: "Namibia" },
  { code: "+674",  flag: "🇳🇷", name: "Nauru" },
  { code: "+977",  flag: "🇳🇵", name: "Nepal" },
  { code: "+31",   flag: "🇳🇱", name: "Netherlands" },
  { code: "+64",   flag: "🇳🇿", name: "New Zealand" },
  { code: "+505",  flag: "🇳🇮", name: "Nicaragua" },
  { code: "+227",  flag: "🇳🇪", name: "Niger" },
  { code: "+234",  flag: "🇳🇬", name: "Nigeria" },
  { code: "+389",  flag: "🇲🇰", name: "North Macedonia" },
  { code: "+47",   flag: "🇳🇴", name: "Norway" },
  { code: "+968",  flag: "🇴🇲", name: "Oman" },
  { code: "+92",   flag: "🇵🇰", name: "Pakistan" },
  { code: "+680",  flag: "🇵🇼", name: "Palau" },
  { code: "+970",  flag: "🇵🇸", name: "Palestine" },
  { code: "+507",  flag: "🇵🇦", name: "Panama" },
  { code: "+675",  flag: "🇵🇬", name: "Papua New Guinea" },
  { code: "+595",  flag: "🇵🇾", name: "Paraguay" },
  { code: "+51",   flag: "🇵🇪", name: "Peru" },
  { code: "+63",   flag: "🇵🇭", name: "Philippines" },
  { code: "+48",   flag: "🇵🇱", name: "Poland" },
  { code: "+351",  flag: "🇵🇹", name: "Portugal" },
  { code: "+974",  flag: "🇶🇦", name: "Qatar" },
  { code: "+40",   flag: "🇷🇴", name: "Romania" },
  { code: "+7",    flag: "🇷🇺", name: "Russia" },
  { code: "+250",  flag: "🇷🇼", name: "Rwanda" },
  { code: "+1869", flag: "🇰🇳", name: "Saint Kitts & Nevis" },
  { code: "+1758", flag: "🇱🇨", name: "Saint Lucia" },
  { code: "+1784", flag: "🇻🇨", name: "Saint Vincent & Grenadines" },
  { code: "+685",  flag: "🇼🇸", name: "Samoa" },
  { code: "+378",  flag: "🇸🇲", name: "San Marino" },
  { code: "+239",  flag: "🇸🇹", name: "São Tomé & Príncipe" },
  { code: "+966",  flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+221",  flag: "🇸🇳", name: "Senegal" },
  { code: "+381",  flag: "🇷🇸", name: "Serbia" },
  { code: "+248",  flag: "🇸🇨", name: "Seychelles" },
  { code: "+232",  flag: "🇸🇱", name: "Sierra Leone" },
  { code: "+65",   flag: "🇸🇬", name: "Singapore" },
  { code: "+421",  flag: "🇸🇰", name: "Slovakia" },
  { code: "+386",  flag: "🇸🇮", name: "Slovenia" },
  { code: "+677",  flag: "🇸🇧", name: "Solomon Islands" },
  { code: "+252",  flag: "🇸🇴", name: "Somalia" },
  { code: "+27",   flag: "🇿🇦", name: "South Africa" },
  { code: "+211",  flag: "🇸🇸", name: "South Sudan" },
  { code: "+34",   flag: "🇪🇸", name: "Spain" },
  { code: "+94",   flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+249",  flag: "🇸🇩", name: "Sudan" },
  { code: "+597",  flag: "🇸🇷", name: "Suriname" },
  { code: "+46",   flag: "🇸🇪", name: "Sweden" },
  { code: "+41",   flag: "🇨🇭", name: "Switzerland" },
  { code: "+963",  flag: "🇸🇾", name: "Syria" },
  { code: "+886",  flag: "🇹🇼", name: "Taiwan" },
  { code: "+992",  flag: "🇹🇯", name: "Tajikistan" },
  { code: "+255",  flag: "🇹🇿", name: "Tanzania" },
  { code: "+66",   flag: "🇹🇭", name: "Thailand" },
  { code: "+670",  flag: "🇹🇱", name: "Timor-Leste" },
  { code: "+228",  flag: "🇹🇬", name: "Togo" },
  { code: "+676",  flag: "🇹🇴", name: "Tonga" },
  { code: "+1868", flag: "🇹🇹", name: "Trinidad & Tobago" },
  { code: "+216",  flag: "🇹🇳", name: "Tunisia" },
  { code: "+90",   flag: "🇹🇷", name: "Turkey" },
  { code: "+993",  flag: "🇹🇲", name: "Turkmenistan" },
  { code: "+688",  flag: "🇹🇻", name: "Tuvalu" },
  { code: "+256",  flag: "🇺🇬", name: "Uganda" },
  { code: "+380",  flag: "🇺🇦", name: "Ukraine" },
  { code: "+971",  flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "+44",   flag: "🇬🇧", name: "United Kingdom" },
  { code: "+1",    flag: "🇺🇸", name: "United States" },
  { code: "+598",  flag: "🇺🇾", name: "Uruguay" },
  { code: "+998",  flag: "🇺🇿", name: "Uzbekistan" },
  { code: "+678",  flag: "🇻🇺", name: "Vanuatu" },
  { code: "+379",  flag: "🇻🇦", name: "Vatican City" },
  { code: "+58",   flag: "🇻🇪", name: "Venezuela" },
  { code: "+84",   flag: "🇻🇳", name: "Vietnam" },
  { code: "+967",  flag: "🇾🇪", name: "Yemen" },
  { code: "+260",  flag: "🇿🇲", name: "Zambia" },
  { code: "+263",  flag: "🇿🇼", name: "Zimbabwe" },
];

interface PhoneCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

export function PhoneCodeSelect({ value, onChange, hasError }: PhoneCodeSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const deferredSearch = useDeferredValue(search);

  const selected = useMemo(
    () => WORLD_PHONE_CODES.find((c) => c.code === value) ?? WORLD_PHONE_CODES[0],
    [value]
  );

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return WORLD_PHONE_CODES;
    return WORLD_PHONE_CODES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.includes(q)
    );
  }, [deferredSearch]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full h-10 flex items-center justify-between gap-1.5 px-3 rounded-lg border bg-white text-sm transition-all",
            "hover:border-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            hasError ? "border-red-400" : "border-slate-300"
          )}
        >
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="text-base leading-none">{selected.flag}</span>
            <span className="font-medium text-slate-700 truncate">{selected.code}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-64 p-0 overflow-hidden"
      >
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2">
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country or code…"
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400 text-slate-800"
          />
        </div>

        {/* List */}
        <ul className="max-h-56 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400">No results</li>
          ) : (
            filtered.map((c) => (
              <li
                key={`${c.name}-${c.code}`}
                onClick={() => { onChange(c.code); setOpen(false); }}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm transition-colors",
                  "hover:bg-slate-50 active:bg-slate-100",
                  c.code === value && c.name === selected.name
                    ? "bg-primary/5 text-primary font-medium"
                    : "text-slate-700"
                )}
              >
                <span className="text-base leading-none w-5 text-center">{c.flag}</span>
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-slate-400 text-xs shrink-0">{c.code}</span>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
