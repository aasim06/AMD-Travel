"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plane,
  ArrowRight,
  X,
  Clock,
  Users,
  CalendarDays,
  Trash2,
  Plus,
  Hotel,
  Package,
  TrendingUp,
} from "lucide-react";
import type { RecentSearch, TravelClass } from "@/types/flight";
import { RECENT_SEARCHES_KEY } from "@/types/flight";
import { useCurrency } from "@/context/currency-context";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AIRPORTS: Record<string, { city: string; country: string }> = {
  LHE: { city: "Lahore",       country: "Pakistan"     },
  KHI: { city: "Karachi",      country: "Pakistan"     },
  ISB: { city: "Islamabad",    country: "Pakistan"     },
  DXB: { city: "Dubai",        country: "UAE"          },
  LHR: { city: "London",       country: "UK"           },
  JED: { city: "Jeddah",       country: "Saudi Arabia" },
  RUH: { city: "Riyadh",       country: "Saudi Arabia" },
  DOH: { city: "Doha",         country: "Qatar"        },
  IST: { city: "Istanbul",     country: "Turkey"       },
  CDG: { city: "Paris",        country: "France"       },
  JFK: { city: "New York",     country: "USA"          },
  BOM: { city: "Mumbai",       country: "India"        },
  MAN: { city: "Manchester",   country: "UK"           },
  AUH: { city: "Abu Dhabi",    country: "UAE"          },
  KWI: { city: "Kuwait City",  country: "Kuwait"       },
};

const CLASS_LABELS: Record<TravelClass, string> = {
  ECONOMY:         "Economy",
  PREMIUM_ECONOMY: "Prem. Economy",
  BUSINESS:        "Business",
  FIRST:           "First Class",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function cityOf(code: string) {
  return AIRPORTS[code]?.city ?? code;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Popular routes (empty state) ────────────────────────────────────────────

const POPULAR_ROUTES = [
  { origin: "LHE", destination: "DXB", price: 320, label: "Lahore → Dubai"       },
  { origin: "ISB", destination: "JED", price: 290, label: "Islamabad → Jeddah"   },
  { origin: "KHI", destination: "LHR", price: 580, label: "Karachi → London"     },
  { origin: "LHE", destination: "IST", price: 410, label: "Lahore → Istanbul"    },
];

// ─── Card themes (gradient bg + border + glow + icon gradient) ───────────────

const CARD_THEMES = [
  {
    bg:     "bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white",
    border: "border-blue-100/80 hover:border-blue-300",
    glow:   "hover:shadow-blue-500/10",
    strip:  "from-blue-500 to-indigo-500",
    icon:   "from-blue-600 to-indigo-600",
    badge:  "bg-blue-50 text-blue-700",
    price:  "text-blue-700",
  },
  {
    bg:     "bg-gradient-to-br from-violet-50/80 via-purple-50/40 to-white",
    border: "border-violet-100/80 hover:border-violet-300",
    glow:   "hover:shadow-violet-500/10",
    strip:  "from-violet-500 to-purple-500",
    icon:   "from-violet-600 to-purple-600",
    badge:  "bg-violet-50 text-violet-700",
    price:  "text-violet-700",
  },
  {
    bg:     "bg-gradient-to-br from-sky-50/80 via-cyan-50/40 to-white",
    border: "border-sky-100/80 hover:border-sky-300",
    glow:   "hover:shadow-sky-500/10",
    strip:  "from-sky-500 to-cyan-500",
    icon:   "from-sky-500 to-cyan-600",
    badge:  "bg-sky-50 text-sky-700",
    price:  "text-sky-700",
  },
  {
    bg:     "bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white",
    border: "border-emerald-100/80 hover:border-emerald-300",
    glow:   "hover:shadow-emerald-500/10",
    strip:  "from-emerald-500 to-teal-500",
    icon:   "from-emerald-600 to-teal-600",
    badge:  "bg-emerald-50 text-emerald-700",
    price:  "text-emerald-700",
  },
  {
    bg:     "bg-gradient-to-br from-rose-50/80 via-pink-50/40 to-white",
    border: "border-rose-100/80 hover:border-rose-300",
    glow:   "hover:shadow-rose-500/10",
    strip:  "from-rose-500 to-pink-500",
    icon:   "from-rose-600 to-pink-600",
    badge:  "bg-rose-50 text-rose-700",
    price:  "text-rose-700",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function RecentSearches() {
  const router = useRouter();
  const [searches, setSearches] = useState<RecentSearch[]>([]);
  const [mounted, setMounted] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (raw) setSearches(JSON.parse(raw));
    } catch {
      setSearches([]);
    }
  }, []);

  // Listen for storage updates from search-form
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === RECENT_SEARCHES_KEY && e.newValue) {
        try { setSearches(JSON.parse(e.newValue)); } catch { /* noop */ }
      }
    }
    // Also listen for custom event (same-tab updates)
    function onCustom() {
      try {
        const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (raw) setSearches(JSON.parse(raw));
      } catch { /* noop */ }
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("amd_search_saved", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("amd_search_saved", onCustom);
    };
  }, []);

  function removeOne(id: string) {
    const updated = searches.filter((s) => s.id !== id);
    setSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  }

  function clearAll() {
    setSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  }

  function reSearch(s: RecentSearch) {
    const params = new URLSearchParams({
      from: s.origin,
      to: s.destination,
      dept: s.departureDate,
      passengers: String(s.passengers),
      class: s.travelClass,
      tripType: s.tripType,
      ...(s.returnDate ? { ret: s.returnDate } : {}),
    });
    router.push(`/search?${params.toString()}`);
  }

  function quickPopularSearch(route: typeof POPULAR_ROUTES[0]) {
    const dept = new Date();
    dept.setDate(dept.getDate() + 14);
    const deptISO = dept.toISOString().split("T")[0];
    router.push(`/search?from=${route.origin}&to=${route.destination}&dept=${deptISO}&passengers=1&class=ECONOMY&tripType=one-way`);
  }

  if (!mounted) return null;

  // ── Empty state ──
  if (searches.length === 0) {
    return (
      <section className="container py-8">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-heading font-bold text-foreground text-base">Popular Routes</h2>
          <span className="text-xs text-muted-foreground ml-1">— start exploring</span>
        </div>

        <div className="flex gap-3 flex-wrap">
          {POPULAR_ROUTES.map((route) => (
            <button
              key={route.label}
              type="button"
              onClick={() => quickPopularSearch(route)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary shrink-0">
                <Plane className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {route.label}
                </p>
                <p className="text-xs text-muted-foreground">from {formatPrice(route.price)}</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all ml-1" />
            </button>
          ))}
        </div>
      </section>
    );
  }

  // ── Searches exist ──
  return (
    <section className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 text-primary" />
          <h2 className="font-heading font-bold text-foreground text-base">Recent Searches</h2>
          <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
            {searches.length}
          </span>
        </div>
        <button
          type="button"
          onClick={clearAll}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear History
        </button>
      </div>

      {/* Cards row */}
      <div className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {searches.map((s, idx) => {
          const theme      = CARD_THEMES[idx % CARD_THEMES.length];
          const originCity = cityOf(s.origin);
          const destCity   = cityOf(s.destination);
          const classLabel = CLASS_LABELS[s.travelClass] ?? s.travelClass;

          return (
            <div
              key={s.id}
              className={`relative flex-none w-64 snap-start rounded-2xl border ${theme.bg} ${theme.border} hover:-translate-y-1 hover:shadow-lg ${theme.glow} transition-all duration-300 overflow-hidden group`}
            >
              {/* Gradient top strip */}
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.strip}`} />

              {/* Delete button */}
              <button
                type="button"
                onClick={() => removeOne(s.id)}
                aria-label="Remove search"
                className="absolute top-2.5 right-2.5 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <div className="p-4 pt-5">
                {/* Route */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`flex items-center justify-center h-7 w-7 rounded-lg bg-gradient-to-r ${theme.icon} shrink-0`}>
                    <Plane className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-heading font-bold text-sm text-foreground truncate">{originCity}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="font-heading font-bold text-sm text-foreground truncate">{destCity}</span>
                  </div>
                </div>

                {/* IATA codes badge */}
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${theme.badge} text-[10px] font-bold mb-3`}>
                  {s.origin} → {s.destination}
                  {s.tripType === "round-trip" && " (RT)"}
                  {s.tripType === "one-way" && " (OW)"}
                </div>

                {/* Date range */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {formatDate(s.departureDate)}
                    {s.returnDate && ` – ${formatDate(s.returnDate)}`}
                  </span>
                </div>

                {/* Passengers + class */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span>{s.passengers} Adult{s.passengers > 1 ? "s" : ""} · {classLabel}</span>
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Estimated</p>
                    <p className={`font-heading font-bold text-base leading-tight ${theme.price}`}>
                      from {formatPrice(s.estimatedPrice)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => reSearch(s)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r ${theme.icon} text-white text-xs font-bold hover:brightness-110 hover:shadow-md transition-all active:scale-95`}
                  >
                    Search
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Time ago */}
                <p className="mt-2 text-[10px] text-muted-foreground/60">{timeAgo(s.searchedAt)}</p>
              </div>
            </div>
          );
        })}

        {/* ── New Search card ── */}
        <div
          className="flex-none w-56 snap-start rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-white flex flex-col items-center justify-center gap-4 p-5 hover:bg-blue-50/70 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">New Search</p>
            <p className="text-xs text-muted-foreground mt-0.5">Start fresh</p>
          </div>
          {/* Quick category icons */}
          <div className="flex items-center gap-2">
            {[Plane, Hotel, Package].map((Icon, i) => (
              <div key={i} className="flex items-center justify-center h-7 w-7 rounded-lg bg-white border border-blue-100 text-blue-500 group-hover:border-blue-300 group-hover:bg-blue-50 transition-colors shadow-sm">
                <Icon className="h-3.5 w-3.5" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
