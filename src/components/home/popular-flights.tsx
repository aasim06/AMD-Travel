"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, TrendingUp, ChevronDown, ChevronUp, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";

const ROUTES = [
  {
    from: "KHI", fromCity: "Karachi",
    to:   "DXB", toCity:   "Dubai",
    price: 189, tag: "Most Popular", duration: "3h 10m",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
  },
  {
    from: "LHE", fromCity: "Lahore",
    to:   "LHR", toCity:   "London",
    price: 520, tag: "Trending", duration: "9h 45m",
    img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80",
  },
  {
    from: "ISB", fromCity: "Islamabad",
    to:   "IST", toCity:   "Istanbul",
    price: 370, tag: "Hot Deal", duration: "6h 20m",
    img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80",
  },
  {
    from: "KHI", fromCity: "Karachi",
    to:   "JED", toCity:   "Jeddah",
    price: 260, tag: "Umrah", duration: "4h 05m",
    img: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&q=80",
  },
  {
    from: "LHE", fromCity: "Lahore",
    to:   "DOH", toCity:   "Doha",
    price: 210, tag: "Popular", duration: "4h 30m",
    img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80",
  },
  {
    from: "ISB", fromCity: "Islamabad",
    to:   "RUH", toCity:   "Riyadh",
    price: 240, tag: "Popular", duration: "4h 50m",
    img: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=600&q=80",
  },
  {
    from: "KHI", fromCity: "Karachi",
    to:   "CDG", toCity:   "Paris",
    price: 610, tag: "Trending", duration: "11h 15m",
    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
  },
  {
    from: "LHE", fromCity: "Lahore",
    to:   "AUH", toCity:   "Abu Dhabi",
    price: 195, tag: "Deal", duration: "3h 40m",
    img: "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=600&q=80",
  },
  {
    from: "ISB", fromCity: "Islamabad",
    to:   "KWI", toCity:   "Kuwait City",
    price: 230, tag: "Popular", duration: "4h 15m",
    img: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80",
  },
];

const TAG_STYLES: Record<string, { bg: string; dot: string }> = {
  "Most Popular": { bg: "bg-primary/90 text-white",          dot: "bg-white" },
  "Trending":     { bg: "bg-violet-600/90 text-white",       dot: "bg-white" },
  "Hot Deal":     { bg: "bg-rose-500/90 text-white",         dot: "bg-white" },
  "Umrah":        { bg: "bg-emerald-600/90 text-white",      dot: "bg-white" },
  "Popular":      { bg: "bg-slate-800/80 text-white",        dot: "bg-slate-300" },
  "Deal":         { bg: "bg-amber-500/90 text-white",        dot: "bg-white" },
};

const INITIAL_COUNT = 6;

function RouteCard({ route, onClick, index }: { route: typeof ROUTES[0]; onClick: () => void; index: number }) {
  const { formatPrice } = useCurrency();
  const [imgError, setImgError] = useState(false);
  const tag = TAG_STYLES[route.tag] ?? TAG_STYLES["Popular"];

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${index * 60}ms` }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 animate-fade-in border border-slate-100"
    >
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 shrink-0">
        {!imgError ? (
          <img
            src={route.img}
            alt={`${route.fromCity} to ${route.toCity}`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 to-violet-100 flex items-center justify-center">
            <Plane className="h-10 w-10 text-primary/30" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Tag */}
        <span className={cn("absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide backdrop-blur-sm", tag.bg)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", tag.dot)} />
          {route.tag}
        </span>

        {/* Duration pill */}
        <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-[11px] font-medium">
          <Plane className="h-3 w-3" />
          {route.duration}
        </span>

        {/* Route overlay at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-left">
              <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider">{route.from}</p>
              <p className="text-white font-bold text-sm leading-tight">{route.fromCity}</p>
            </div>
            <div className="flex flex-col items-center gap-0.5 px-2">
              <ArrowRight className="h-3.5 w-3.5 text-white/60" />
            </div>
            <div className="text-left">
              <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider">{route.to}</p>
              <p className="text-white font-bold text-sm leading-tight">{route.toCity}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="flex items-center justify-between px-4 py-3 gap-3 bg-white">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Direct flight available</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 leading-none mb-0.5">from</p>
          <p className="text-lg font-extrabold text-slate-900 leading-none tracking-tight">
            {formatPrice(route.price)}
          </p>
        </div>
      </div>

      {/* Bottom hover bar */}
      <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-500 rounded-b-2xl" />
    </button>
  );
}

export function PopularFlights() {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? ROUTES : ROUTES.slice(0, INITIAL_COUNT);

  function handleRouteClick(route: typeof ROUTES[0]) {
    const dept = new Date();
    dept.setDate(dept.getDate() + 14);
    const deptISO = dept.toISOString().split("T")[0];
    router.push(
      `/search?from=${route.from}&to=${route.to}&fromLabel=${encodeURIComponent(route.fromCity)}&toLabel=${encodeURIComponent(route.toCity)}&dept=${deptISO}&passengers=1&class=ECONOMY&tripType=one-way`
    );
  }

  return (
    <section className="container py-14">

      {/* Header */}
      <div className="flex items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-3">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Flights</span>
          </div>
          <h2 className="font-heading font-extrabold text-slate-900 text-2xl sm:text-3xl leading-tight">
            Popular Flights
          </h2>
          <p className="text-slate-500 text-sm mt-1.5 max-w-md">
            Check these popular routes — great prices, updated daily.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAll(v => !v)}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all shadow-sm shrink-0"
        >
          {showAll ? (
            <><ChevronUp className="h-4 w-4" /> Show less</>
          ) : (
            <><ChevronDown className="h-4 w-4" /> View all {ROUTES.length} routes</>
          )}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((route, i) => (
          <RouteCard
            key={`${route.from}-${route.to}`}
            route={route}
            index={i}
            onClick={() => handleRouteClick(route)}
          />
        ))}
      </div>

      {/* Mobile button */}
      <div className="mt-8 flex justify-center sm:hidden">
        <button
          type="button"
          onClick={() => setShowAll(v => !v)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all shadow-sm"
        >
          {showAll ? (
            <><ChevronUp className="h-4 w-4" /> Show less</>
          ) : (
            <><ChevronDown className="h-4 w-4" /> Show {ROUTES.length - INITIAL_COUNT} more routes</>
          )}
        </button>
      </div>

    </section>
  );
}
