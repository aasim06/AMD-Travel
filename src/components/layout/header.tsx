"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth/auth-modal";
import {
  Menu,
  X,
  MessageCircle,
  UserRound,
  ChevronDown,
  Plane,
  Hotel,
  Car,
  Package,
  Moon,
  FileText,
  MapPin,
  BookOpen,
  Globe,
  Search,
  CalendarDays,
  Users,
  PlaneTakeoff,
  PlaneLanding,
  Plus,
  Minus,
  Armchair,
  Sparkles,
  Briefcase,
  Crown,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogIn,
  UserPlus,
  Settings,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { searchAirports } from "@/lib/data/airportsData";
import { useCurrency } from "@/context/currency-context";
import type { CurrencyCode } from "@/lib/currency";

// ─── Drawer nav items ─────────────────────────────────────────────────────────

const PRIMARY_NAV = [
  { label: "Flights",         href: "/flights",          icon: Plane,    soon: true  },
  { label: "Stays / Hotels",  href: "/stays",            icon: Hotel,    soon: true  },
  { label: "Cars",            href: "/cars",             icon: Car,      soon: true  },
  { label: "Tour Packages",   href: "/tour-deals",       icon: Package,  soon: false },
  { label: "Umrah",           href: "/umrah-packages",   icon: Moon,     soon: false },
  { label: "Visa",            href: "/visa",             icon: FileText, soon: false },
];

const SECONDARY_NAV = [
  { label: "Explore Destinations", href: "/destinations", icon: MapPin,       soon: true  },
  { label: "My Bookings / Trips",  href: "/bookings",     icon: BookOpen,     soon: true  },
  { label: "Contact Us",           href: "/contact",      icon: MessageCircle, soon: false },
  { label: "Language & Currency",  href: "/settings",     icon: Globe,        soon: true  },
];

// ─── Logo mark (shared) ───────────────────────────────────────────────────────

function LogoMark() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary shadow-card group-hover:shadow-card-hover transition-shadow shrink-0">
        <svg viewBox="0 0 36 36" fill="none" className="h-5 w-5" aria-hidden>
          <circle cx="18" cy="18" r="10" stroke="white" strokeWidth="1.8" strokeDasharray="4 2.5" opacity="0.5" />
          <path d="M8 20.5l5-2.5 2.5-6 1.5 5.5 4-1.5-1 4.5 5.5-2-3 4.5-14.5 1 0.5-3.5z" fill="white" opacity="0.95" />
          <path d="M10 18.5 Q18 10 26 18.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-heading font-extrabold text-base text-foreground tracking-tight">
          AMD<span className="text-primary"> Global</span>
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase">
          Travel
        </span>
      </div>
    </Link>
  );
}

// ─── Currency dropdown ───────────────────────────────────────────────────────

const CURRENCY_META: Record<string, { flagSvg: React.ReactNode; symbol: string; label: string }> = {
  USD: {
    flagSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="h-4 w-6 overflow-hidden shrink-0">
        <rect width="60" height="30" fill="#B22234"/>
        {[0,1,2,3,4,5,6].map(i => <rect key={i} y={i*4+2} width="60" height="2" fill="white"/>)}
        <rect width="24" height="16" fill="#3C3B6E"/>
        {Array.from({length:9}).map((_,i) => (
          <text key={i} x={3 + (i%3)*8} y={5 + Math.floor(i/3)*5} fontSize="4" fill="white">★</text>
        ))}
      </svg>
    ),
    symbol: "$", label: "US Dollar",
  },
  EUR: {
    flagSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" className="h-4 w-6 overflow-hidden shrink-0">
        <rect width="60" height="40" fill="#003399"/>
        {Array.from({length:12}).map((_,i) => {
          const angle = (i * 30 - 90) * Math.PI / 180;
          const cx = 30 + Math.cos(angle) * 12;
          const cy = 20 + Math.sin(angle) * 12;
          return <text key={i} x={cx} y={cy} fontSize="5" fill="#FFCC00" textAnchor="middle" dominantBaseline="middle">★</text>;
        })}
      </svg>
    ),
    symbol: "€", label: "Euro",
  },
};

function CurrencyDropdown() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const active = CURRENCY_META[currency];

  return (
    <div ref={ref} className="relative flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-foreground/80 rounded-lg hover:bg-accent hover:text-primary transition-colors border border-slate-200/60 dark:border-slate-800/60"
      >
        {active?.flagSvg}
        <span className="hidden xs:inline">{active?.symbol}</span>
        <span>{currency}</span>
        <ChevronDown className={`h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-[80] animate-in fade-in slide-in-from-top-2 duration-150">
          {siteConfig.locale.supportedCurrencies.map((cur) => {
            const meta = CURRENCY_META[cur];
            const isActive = cur === currency;
            return (
              <li key={cur}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setCurrency(cur as CurrencyCode);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-accent ${
                    isActive ? "text-primary font-semibold bg-primary/5" : "text-foreground/80"
                  }`}
                >
                  {meta?.flagSvg}
                  <span className="flex flex-col text-left min-w-0">
                    <span className="font-semibold text-xs">{cur} <span className="font-normal text-muted-foreground">{meta?.symbol}</span></span>
                    <span className="text-[10px] text-muted-foreground">{meta?.label}</span>
                  </span>
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Shared pill button ───────────────────────────────────────────────────────

function Pill({
  active, onClick, children, className = "",
}: {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border text-xs font-medium transition-all ${
        active
          ? "bg-white border-primary/60 ring-2 ring-primary/20 text-slate-800"
          : "bg-white border-slate-200 hover:border-primary/40 hover:bg-primary/5 text-slate-700"
      } ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Mini airport autocomplete (self-contained, no fetch) ─────────────────────

function MiniAirportInput({
  value, onChange, placeholder, icon, inputRef,
}: {
  value: string; onChange: (code: string, label: string) => void;
  placeholder: string; icon: React.ReactNode;
  inputRef?: React.RefObject<HTMLInputElement>;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen]   = useState(false);
  const [idx, setIdx]     = useState(-1);
  const containerRef      = useRef<HTMLDivElement>(null);
  const internalRef       = useRef<HTMLInputElement>(null);
  const resolvedRef       = inputRef ?? internalRef;
  const [dropCoords, setDropCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  // Sync display when value changes externally
  useEffect(() => {
    if (!value) { setQuery(""); return; }
    const m = searchAirports(value)[0];
    if (m) setQuery(`${m.city} (${m.code})`);
    else    setQuery(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const results = useMemo(() => {
    const q = query.trim();
    return q.length >= 2 ? searchAirports(q).slice(0, 8) : [];
  }, [query]);

  // Reposition portal dropdown to anchor input
  const reposition = useCallback(() => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    setDropCoords({ top: r.bottom + 4, left: r.left, width: r.width });
  }, []);

  useEffect(() => {
    if (!open) { setDropCoords(null); return; }
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, reposition]);

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setIdx(-1);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function select(code: string, city: string) {
    onChange(code, `${city} (${code})`);
    setQuery(`${city} (${code})`);
    setOpen(false);
    setIdx(-1);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && idx >= 0 && results[idx]) { e.preventDefault(); select(results[idx].code, results[idx].city); }
    else if (e.key === "Escape") { setOpen(false); }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2 h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
        <span className="text-primary shrink-0">{icon}</span>
        <input
          ref={resolvedRef}
          type="text" autoComplete="off" spellCheck={false}
          value={query}
          placeholder={placeholder}
          onChange={e => { setQuery(e.target.value); setIdx(-1); setOpen(true); }}
          onFocus={() => { reposition(); setOpen(true); }}
          onKeyDown={onKey}
          className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none min-w-0"
        />
      </div>

      {open && results.length > 0 && dropCoords && createPortal(
        <ul
          className="fixed z-[9999] rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden"
          style={{ top: dropCoords.top, left: dropCoords.left, width: Math.max(dropCoords.width, 240) }}
        >
          {results.map((a, i) => (
            <li key={a.code}>
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); select(a.code, a.city); }}
                onMouseEnter={() => setIdx(i)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                  i === idx ? "bg-primary/5" : "hover:bg-slate-50"
                }`}
              >
                <span className="text-xs font-bold text-primary w-8 shrink-0">{a.code}</span>
                <span className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-slate-800 truncate">{a.city}</span>
                  <span className="text-[10px] text-slate-400 truncate">{a.country}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
}

// ─── Mini calendar (single-month, no prices) ──────────────────────────────────

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_HDRS   = ["M","T","W","T","F","S","S"];

function MiniCalendar({
  selected, onSelect, label,
}: {
  selected: string; onSelect: (iso: string) => void; label: string;
}) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [ym, setYm] = useState(() => ({ y: today.getFullYear(), m: today.getMonth() }));

  const firstDay  = (new Date(ym.y, ym.m, 1).getDay() + 6) % 7;
  const daysInMon = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells     = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMon }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  function isoOf(day: number) {
    return `${ym.y}-${String(ym.m + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  }

  function prevM() { setYm(p => p.m === 0 ? { y: p.y-1, m: 11 } : { y: p.y, m: p.m-1 }); }
  function nextM() { setYm(p => p.m === 11 ? { y: p.y+1, m: 0 } : { y: p.y, m: p.m+1 }); }

  return (
    <div className="w-full">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{label}</p>
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={prevM} className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-xs font-semibold text-slate-700">{MONTH_NAMES[ym.m]} {ym.y}</span>
        <button type="button" onClick={nextM} className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-colors">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-0.5">
        {DAY_HDRS.map((d,i) => <div key={i} className="text-center text-[10px] font-semibold text-slate-400 py-0.5">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const iso  = isoOf(day);
          const past = new Date(iso + "T00:00:00") < today;
          const sel  = iso === selected;
          return (
            <button
              key={iso} type="button" disabled={past}
              onClick={() => onSelect(iso)}
              className={`w-full aspect-square rounded-md text-[11px] font-medium transition-colors ${
                past ? "opacity-30 cursor-not-allowed text-slate-400"
                : sel  ? "bg-primary text-primary-foreground"
                : "hover:bg-primary/10 text-slate-700"
              }`}
            >{day}</button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Compact date picker for multi-city legs (popover, not inline) ───────────

function McDatePicker({ selected, onSelect }: { selected: string; onSelect: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function fmt(iso: string) {
    if (!iso) return "";
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 w-full h-9 px-2.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all duration-200 ${
          open ? "border-primary ring-2 ring-primary/20 bg-white" : "border-slate-200 bg-slate-50 hover:border-primary/40"
        } ${selected ? "text-slate-800" : "text-slate-400"}`}
      >
        <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="whitespace-nowrap overflow-hidden">{selected ? fmt(selected) : "Date"}</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-[300] bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-3 w-[220px]">
          <MiniCalendar label="" selected={selected} onSelect={iso => { onSelect(iso); setOpen(false); }} />
        </div>
      )}
    </div>
  );
}

// ─── Travel class options ─────────────────────────────────────────────────────

const CLASSES = [
  { value: "ECONOMY",         label: "Economy",         icon: <Armchair  className="h-3.5 w-3.5" /> },
  { value: "PREMIUM_ECONOMY", label: "Premium Economy", icon: <Sparkles  className="h-3.5 w-3.5" /> },
  { value: "BUSINESS",        label: "Business",        icon: <Briefcase className="h-3.5 w-3.5" /> },
  { value: "FIRST",           label: "First Class",     icon: <Crown     className="h-3.5 w-3.5" /> },
];

// ─── Compact search bar ───────────────────────────────────────────────────────

type TripType = "round-trip" | "one-way" | "multi-city";

const TRIP_TYPES: { label: string; value: TripType }[] = [
  { label: "Round-trip", value: "round-trip"  },
  { label: "One-way",    value: "one-way"     },
  { label: "Multi-city", value: "multi-city"  },
];

function CompactSearchBar() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // ── Editable state seeded from URL ────────────────────────────────────────
  const [tripType,    setTripType]    = useState<TripType>((searchParams.get("tripType") as TripType) || "one-way");
  const [fromCode,    setFromCode]    = useState(searchParams.get("from")      || "");
  const [fromLabel,   setFromLabel]   = useState(searchParams.get("fromLabel") || searchParams.get("from") || "");
  const [toCode,      setToCode]      = useState(searchParams.get("to")        || "");
  const [toLabel,     setToLabel]     = useState(searchParams.get("toLabel")   || searchParams.get("to")   || "");
  const [dept,        setDept]        = useState(searchParams.get("dept")      || "");
  const [ret,         setRet]         = useState(searchParams.get("ret")       || "");
  const [passengers,  setPassengers]  = useState(parseInt(searchParams.get("passengers") || "1", 10));
  const [travelClass, setTravelClass] = useState(searchParams.get("class")    || "ECONOMY");

  // Multi-city legs
  const [mcLegs, setMcLegs] = useState([
    { id: "l1", from: "", fromLabel: "", to: "", toLabel: "", date: "" },
    { id: "l2", from: "", fromLabel: "", to: "", toLabel: "", date: "" },
  ]);
  function updateMcLeg(id: string, patch: Partial<typeof mcLegs[0]>) {
    setMcLegs(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  }
  function addMcLeg() {
    if (mcLegs.length >= 5) return;
    setMcLegs(prev => [...prev, { id: `l${Date.now()}`, from: "", fromLabel: "", to: "", toLabel: "", date: "" }]);
  }
  function removeMcLeg(id: string) {
    setMcLegs(prev => prev.filter(l => l.id !== id));
  }

  const isRound = tripType === "round-trip";

  // ── Modal open state ──────────────────────────────────────────────────────
  const [open,   setOpen]   = useState(false);
  const [active, setActive] = useState<"route" | "dates" | "pax">("route");
  const modalRef            = useRef<HTMLDivElement>(null);
  const destInputRef        = useRef<HTMLInputElement>(null);
  const scrollContainerRef  = useRef<HTMLDivElement>(null);

  // Outside-click closes desktop modal only (mobile uses full-screen, no outside-click needed)
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (window.innerWidth < 768) return; // skip on mobile — full-screen modal has its own close button
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll when mobile modal is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function fmtDate(iso: string) {
    if (!iso) return "";
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short", month: "numeric", day: "numeric",
    });
  }

  function openPanel(tab: "route" | "dates" | "pax") {
    setActive(tab);
    setOpen(true);
  }

  function handleSearch() {
    if (tripType === "multi-city") {
      const valid = mcLegs.every(l => l.from && l.to && l.date);
      if (!valid) return;
      const p = new URLSearchParams({
        tripType, passengers: String(passengers), class: travelClass,
        legs: JSON.stringify(mcLegs.map(l => ({ from: l.from, to: l.to, date: l.date }))),
      });
      setOpen(false);
      router.push(`/search?${p.toString()}`);
      return;
    }
    if (!fromCode || !toCode || !dept) return;
    const p = new URLSearchParams({
      from: fromCode, to: toCode,
      fromLabel, toLabel, dept,
      passengers: String(passengers),
      class: travelClass, tripType,
      ...(isRound && ret ? { ret } : {}),
    });
    setOpen(false);
    router.push(`/search?${p.toString()}`);
  }

  // ── Pill / mobile summary labels ─────────────────────────────────────────
  const routeLabel   = fromLabel && toLabel ? `${fromLabel} → ${toLabel}` : "Where to?";
  const dateLabel    = dept
    ? (isRound && ret ? `${fmtDate(dept)} – ${fmtDate(ret)}` : fmtDate(dept))
    : "Select dates";
  const paxLabel     = `${passengers} Adult${passengers > 1 ? "s" : ""}, ${
    CLASSES.find(c => c.value === travelClass)?.label ?? "Economy"
  }`;
  // Short date for mobile pill (e.g. "Aug 14")
  function shortDate(iso: string) {
    if (!iso) return "";
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  const mobilePillText = fromLabel && toLabel
    ? `${fromLabel} → ${toLabel}${dept ? " • " + shortDate(dept) : ""}`
    : "Search flights";

  // ── Shared search form content (used in both desktop modal & mobile sheet) ─
  function SearchFormContent({ onClose }: { onClose: () => void }) {
    return (
      <>
        {/* Tab bar */}
        <div className="flex border-b border-slate-100 shrink-0">
          {(["route", "dates", "pax"] as const).map(tab => (
            <button
              key={tab} type="button"
              onClick={() => {
                const currentScroll = scrollContainerRef.current?.scrollTop;
                setActive(tab);
                requestAnimationFrame(() => {
                  if (scrollContainerRef.current && currentScroll !== undefined) {
                    scrollContainerRef.current.scrollTop = currentScroll;
                  }
                });
              }}
              className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors border-b-2 -mb-px ${
                active === tab ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab === "route" ? "Route" : tab === "dates" ? "Dates" : "Passengers"}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4 max-h-[650px]">

          {/* ── ROUTE TAB ── */}
          {active === "route" && (
            <div className="space-y-4">
              <div className="relative flex bg-slate-100 p-1 rounded-xl">
                <div
                  className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm transition-all duration-300 ease-in-out"
                  style={{
                    width: `calc(${100 / TRIP_TYPES.length}% - 2px)`,
                    left: `calc(${TRIP_TYPES.findIndex(t => t.value === tripType) * (100 / TRIP_TYPES.length)}% + 1px)`,
                  }}
                />
                {TRIP_TYPES.map(t => (
                  <button key={t.value} type="button"
                    onClick={() => { setTripType(t.value); if (t.value !== "round-trip") setRet(""); }}
                    className={`relative flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 ${
                      tripType === t.value ? "text-primary" : "text-slate-500 hover:text-slate-700"
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {tripType !== "multi-city" && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">From</label>
                    <MiniAirportInput value={fromCode}
                      onChange={(code, lbl) => {
                        const currentScroll = scrollContainerRef.current?.scrollTop;
                        setFromCode(code);
                        setFromLabel(lbl);
                        requestAnimationFrame(() => {
                          destInputRef.current?.focus({ preventScroll: true });
                          if (scrollContainerRef.current && currentScroll !== undefined) {
                            scrollContainerRef.current.scrollTop = currentScroll;
                          }
                        });
                      }}
                      placeholder="City or airport" icon={<PlaneTakeoff className="h-3.5 w-3.5" />} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">To</label>
                    <MiniAirportInput value={toCode}
                      onChange={(code, lbl) => {
                        const currentScroll = scrollContainerRef.current?.scrollTop;
                        setToCode(code);
                        setToLabel(lbl);
                        requestAnimationFrame(() => {
                          if (scrollContainerRef.current && currentScroll !== undefined) {
                            scrollContainerRef.current.scrollTop = currentScroll;
                          }
                        });
                      }}
                      placeholder="City or airport" icon={<PlaneLanding className="h-3.5 w-3.5" />}
                      inputRef={destInputRef} />
                  </div>
                </>
              )}

              {tripType === "multi-city" && (
                <div className="space-y-2">
                  {mcLegs.map((leg, i) => (
                    <div key={leg.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Flight {i + 1}</span>
                        {i >= 2 && (
                          <button type="button" onClick={() => removeMcLeg(leg.id)}
                            className="text-[10px] text-red-400 hover:text-red-600 transition-colors">Remove</button>
                        )}
                      </div>
                      <div className="grid grid-cols-12 gap-1.5 items-start">
                        <div className="col-span-4">
                          <MiniAirportInput value={leg.from}
                            onChange={(code, lbl) => {
                              const s = scrollContainerRef.current?.scrollTop;
                              updateMcLeg(leg.id, { from: code, fromLabel: lbl });
                              requestAnimationFrame(() => {
                                if (scrollContainerRef.current && s !== undefined) scrollContainerRef.current.scrollTop = s;
                              });
                            }}
                            placeholder="From" icon={<PlaneTakeoff className="h-3.5 w-3.5" />} />
                        </div>
                        <div className="col-span-4">
                          <MiniAirportInput value={leg.to}
                            onChange={(code, lbl) => {
                              const s = scrollContainerRef.current?.scrollTop;
                              updateMcLeg(leg.id, { to: code, toLabel: lbl });
                              requestAnimationFrame(() => {
                                if (scrollContainerRef.current && s !== undefined) scrollContainerRef.current.scrollTop = s;
                              });
                            }}
                            placeholder="To" icon={<PlaneLanding className="h-3.5 w-3.5" />} />
                        </div>
                        <div className="col-span-4">
                          <McDatePicker selected={leg.date} onSelect={iso => updateMcLeg(leg.id, { date: iso })} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {mcLegs.length < 5 && (
                    <button type="button" onClick={addMcLeg}
                      className="w-full py-2 rounded-xl border border-dashed border-primary/40 text-primary text-xs font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Add flight
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── DATES TAB ── */}
          {active === "dates" && (
            <div className="space-y-4">
              <div className={`grid gap-4 ${isRound ? "grid-cols-2" : "grid-cols-1"}`}>
                <MiniCalendar label="Departure" selected={dept} onSelect={iso => setDept(iso)} />
                {isRound && <MiniCalendar label="Return" selected={ret} onSelect={iso => setRet(iso)} />}
              </div>
              {!isRound && (
                <p className="text-[11px] text-slate-400 text-center">
                  Switch to Round-trip in the Route tab to add a return date.
                </p>
              )}
            </div>
          )}

          {/* ── PAX TAB ── */}
          {active === "pax" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Adults</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setPassengers(p => Math.max(1, p - 1))}
                    className="h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center hover:border-primary/60 hover:text-primary transition-colors">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-slate-800">{passengers}</span>
                  <button type="button" onClick={() => setPassengers(p => Math.min(9, p + 1))}
                    className="h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center hover:border-primary/60 hover:text-primary transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Cabin Class</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {CLASSES.map(c => (
                    <button key={c.value} type="button" onClick={() => setTravelClass(c.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        travelClass === c.value ? "bg-primary/10 border-primary/40 text-primary" : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}>
                      {c.icon}{c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA — sticky pinned */}
        <div className="sticky bottom-0 shrink-0 px-5 py-4 bg-white border-t border-slate-100/50 flex items-center justify-between gap-3 rounded-b-3xl">
          <button type="button" onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
          <button type="button" onClick={handleSearch}
            disabled={tripType === "multi-city" ? !mcLegs.every(l => l.from && l.to && l.date) : !fromCode || !toCode || !dept}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground text-sm font-semibold transition-all active:scale-95">
            <Search className="h-3.5 w-3.5" /> Search Flights
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ════ MOBILE: single compact pill ════ */}
      <button
        type="button"
        onClick={() => { setActive("route"); setOpen(true); }}
        className="md:hidden flex items-center gap-2 w-full max-w-[260px] px-3 py-2 rounded-full border border-slate-200 bg-slate-100 text-xs font-medium text-slate-700 truncate animate-in fade-in slide-in-from-top-2 duration-200"
      >
        <Search className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="truncate">{mobilePillText}</span>
      </button>

      {/* ════ DESKTOP: multi-pill bar ════ */}
      <div
        className="hidden md:flex items-center gap-1 bg-slate-100 p-[5px] rounded-[5px] border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <Pill active={open && active === "route"} onClick={() => openPanel("route")}>
          <Plane className="h-3 w-3 text-primary shrink-0" />
          <span className="max-w-[160px] truncate font-semibold">{routeLabel}</span>
        </Pill>
        <Pill active={open && active === "dates"} onClick={() => openPanel("dates")}>
          <CalendarDays className="h-3 w-3 text-slate-400 shrink-0" />
          {dateLabel}
        </Pill>
        <Pill active={open && active === "pax"} onClick={() => openPanel("pax")}>
          <Users className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="max-w-[130px] truncate">{paxLabel}</span>
        </Pill>
        <button type="button" onClick={handleSearch}
          className="flex items-center gap-1 px-4 py-1.5 rounded-[5px] bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors active:scale-95">
          <Search className="h-3 w-3" /> Search
        </button>
      </div>

      {/* ════ MOBILE full-screen modal ════ */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col md:hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0 bg-white">
            <span className="text-sm font-bold text-slate-800">Edit Flight Search</span>
            <button type="button" onClick={() => setOpen(false)}
              className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-slate-100 text-slate-500 transition-colors shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col min-h-0">
            <SearchFormContent onClose={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* ════ DESKTOP floating modal ════ */}
      {open && (
        <>
          <div className="fixed inset-0 z-[55] bg-black/20 hidden md:block" onMouseDown={() => setOpen(false)} />
          <div
            ref={modalRef}
            className="fixed left-1/2 -translate-x-1/2 top-[68px] z-[60] w-[480px] max-w-[calc(100vw-32px)] max-h-[90vh] bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] hidden md:flex flex-col animate-in fade-in slide-in-from-top-2 duration-150"
            onMouseDown={e => e.stopPropagation()}
          >
            <SearchFormContent onClose={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}

// ─── User Popover ────────────────────────────────────────────────────────────

function UserPopover() {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup" | "lookup">("signin");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const handleAuthEvent = () => handleOpenAuth("signin");
    window.addEventListener("open-auth-modal", handleAuthEvent);
    return () => window.removeEventListener("open-auth-modal", handleAuthEvent);
  }, []);

  const handleOpenAuth = (tab: "signin" | "signup" | "lookup") => {
    setAuthTab(tab);
    setOpen(false);
    setAuthOpen(true);
  };

  return (
    <>
      <div ref={ref} className="relative flex items-center">
        <button
          type="button"
          aria-label="User account"
          onClick={() => setOpen(v => !v)}
          className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <UserRound className="h-5 w-5" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.1)] overflow-hidden z-[80] animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="px-4 py-4 bg-gradient-to-br from-primary/8 to-primary/3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <UserRound className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Welcome back!</p>
                  <p className="text-[11px] text-slate-400">Sign in to manage your trips</p>
                </div>
              </div>
            </div>

            {/* Auth buttons */}
            <div className="p-3 space-y-2">
              <button
                type="button"
                onClick={() => handleOpenAuth("signin")}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors text-left"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleOpenAuth("signup")}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-primary/30 transition-colors text-left"
              >
                <UserPlus className="h-4 w-4 text-primary" />
                Create Account
              </button>
            </div>

            {/* Divider */}
            <div className="mx-3 border-t border-slate-100" />

            {/* Quick links */}
            <div className="p-3 space-y-0.5">
              <button
                type="button"
                onClick={() => handleOpenAuth("signin")}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors text-left"
              >
                <BookOpen className="h-4 w-4 text-slate-400" />
                My Bookings
              </button>
              <Link href="/settings" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors">
                <Settings className="h-4 w-4 text-slate-400" />
                Settings
              </Link>
            </div>
          </div>
        )}
      </div>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab={authTab}
      />
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { currency, setCurrency }   = useCurrency();
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener — always show on /search (no hero to scroll past)
  useEffect(() => {
    if (pathname === "/search") { setIsScrolled(true); return; }
    setIsScrolled(window.scrollY > 200);
    const handleScroll = () => setIsScrolled(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Listen for toggle drawer from mobile bottom dock
  useEffect(() => {
    const handleToggle = () => setDrawerOpen(prev => !prev);
    window.addEventListener("toggle-mobile-drawer", handleToggle);
    return () => window.removeEventListener("toggle-mobile-drawer", handleToggle);
  }, []);

  const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp.replace(/\+/g, "")}`;

  return (
    <>
      {/* ── Top navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm transition-all duration-300">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">

          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="hidden md:flex items-center justify-center h-9 w-9 rounded-md text-foreground hover:bg-accent hover:text-primary transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <LogoMark />
          </div>

          {/* Center: search slot — hidden on mobile to prevent overflow and clutter */}
          <div id="header-search-slot" className="flex-1 hidden md:flex justify-center px-4">
            {isScrolled && pathname !== "/search" && <CompactSearchBar />}
          </div>

          {/* Right: currency + user account */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Currency selector */}
            <CurrencyDropdown />

            {/* Bell */}
            <button
              type="button"
              aria-label="Notifications"
              className="hidden sm:flex items-center justify-center h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-primary transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border-2 border-white" />
            </button>

            {/* User popover */}
            <UserPopover />
          </div>
        </div>
      </header>

      {/* ── Backdrop overlay ── */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
      />

      {/* ── Left sidebar drawer ── */}
      <aside
        className={`fixed top-0 left-0 z-[70] h-full w-72 bg-card border-r border-border shadow-glass flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navigation drawer"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <LogoMark />
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer body — scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* Primary nav */}
          {PRIMARY_NAV.map(({ label, href, icon: Icon, soon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/75 hover:bg-accent hover:text-primary"
                }`}
              >
                <span className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                }`}>
                  <Icon className="h-4 w-4" />
                </span>
                {label}
                {soon && (
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-amber-400/15 text-amber-600 border border-amber-400/30 px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
                {active && !soon && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-3 border-t border-border" />

          {/* Secondary nav */}
          {SECONDARY_NAV.map(({ label, href, icon: Icon, soon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/75 hover:bg-accent hover:text-primary"
                }`}
              >
                <span className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                }`}>
                  <Icon className="h-4 w-4" />
                </span>
                {label}
                {soon && (
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-amber-400/15 text-amber-600 border border-amber-400/30 px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div className="shrink-0 px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground/70 hover:text-success hover:border-success hover:bg-success/5 transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <Link
              href="/bookings"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-card hover:shadow-card-hover transition-shadow"
            >
              <UserRound className="h-4 w-4" />
              Bookings
            </Link>
          </div>
          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </aside>
    </>
  );
}
