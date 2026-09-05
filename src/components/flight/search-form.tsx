"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  FileText,
  ArrowLeftRight,
  Search,
  ChevronDown,
  Users,
  User,
  Luggage,
  Plus,
  Minus,
  Armchair,
  Sparkles,
  Briefcase,
  Crown,
  Loader2,
} from "lucide-react";
import { Trash2 } from "lucide-react";
import type { TravelClass } from "@/types/flight";
import { RECENT_SEARCHES_KEY, MAX_RECENT_SEARCHES } from "@/types/flight";
import { DatePickerPopover, formatISO, type DateRange } from "@/components/flight/date-picker-popover";
import { AirportInput } from "@/components/flight/airport-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// ─── Prefetch cache ──────────────────────────────────────────────────────────
const prefetchCache = new Map<string, Promise<void>>();

function prefetchFlights(query: Record<string, unknown>) {
  const key = JSON.stringify(query);
  if (prefetchCache.has(key)) return;
  const p = fetch("/api/flights/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: key,
  })
    .then(() => {})
    .catch(() => {});
  prefetchCache.set(key, p);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export type TripType = "round-trip" | "one-way" | "multi-city";
export type CategoryKey = "flights" | "visa" | "umrah" | "cars";

export interface FlightLeg {
  id: string;
  origin: string;
  destination: string;
  departureDate: Date | null;
}

interface RecentSearchItem {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  travelClass: TravelClass;
  tripType: TripType;
  estimatedPrice?: number;
}

function estimatePrice(origin: string, destination: string, isRound: boolean, pax: number): number {
  const isDomesticPk = ["LHE","ISB","KHI","PEW","MUX","SKT","UET"].includes(origin.toUpperCase()) &&
                       ["LHE","ISB","KHI","PEW","MUX","SKT","UET"].includes(destination.toUpperCase());
  let base = isDomesticPk ? 85 : 380;
  if (isRound) base = Math.round(base * 1.85);
  return base * Math.max(1, pax);
}

function saveRecentSearch(item: RecentSearchItem) {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    const prev: any[] = raw ? JSON.parse(raw) : [];
    const isRound = item.tripType === "round-trip";
    const fullItem = {
      id: `search-${item.origin}-${item.destination}-${Date.now()}`,
      origin: item.origin,
      destination: item.destination,
      departureDate: item.departureDate,
      returnDate: item.returnDate,
      passengers: item.passengers || 1,
      travelClass: item.travelClass || "ECONOMY",
      tripType: item.tripType || "one-way",
      estimatedPrice: item.estimatedPrice || estimatePrice(item.origin, item.destination, isRound, item.passengers || 1),
      searchedAt: new Date().toISOString(),
    };

    const filtered = prev.filter(
      (s) =>
        !(
          s.origin === fullItem.origin &&
          s.destination === fullItem.destination &&
          s.departureDate === fullItem.departureDate
        )
    );
    const updated = [fullItem, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("amd_search_saved"));
    }
  } catch {}
}

const DEFAULT_LEGS = [
  { id: "leg-1", origin: "", destination: "", departureDate: null as Date | null },
  { id: "leg-2", origin: "", destination: "", departureDate: null as Date | null },
];

const CATEGORY_TABS: { key: CategoryKey; label: string; icon: React.ReactNode }[] = [
  { key: "flights",  label: "Flights",         icon: <Plane      className="h-4 w-4" /> },
  { key: "visa",     label: "Visa",            icon: <FileText   className="h-4 w-4" /> },
];

const TRIP_TYPES: { label: string; value: TripType }[] = [
  { label: "Round-trip",  value: "round-trip"  },
  { label: "One-way",     value: "one-way"     },
  { label: "Multi-city",  value: "multi-city"  },
];

const TRAVEL_CLASSES: { label: string; value: TravelClass; icon: React.ReactNode }[] = [
  { label: "Economy",         value: "ECONOMY",         icon: <Armchair  className="h-4 w-4" /> },
  { label: "Premium Economy", value: "PREMIUM_ECONOMY", icon: <Sparkles  className="h-4 w-4" /> },
  { label: "Business",        value: "BUSINESS",        icon: <Briefcase className="h-4 w-4" /> },
  { label: "First Class",     value: "FIRST",           icon: <Crown     className="h-4 w-4" /> },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function DropdownButton({
  label,
  children,
}: {
  label: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary transition-colors cursor-pointer"
        >
          {label}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="min-w-[160px] p-0 overflow-hidden z-[9999]">
        {children(() => setOpen(false))}
      </PopoverContent>
    </Popover>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FlightSearchForm() {
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState<CategoryKey>("flights");
  const [tripType, setTripType]             = useState<TripType>("round-trip");
  const [travelClass, setTravelClass]       = useState<TravelClass>("ECONOMY");
  const [passengers, setPassengers]         = useState(1);
  const [carryOn, setCarryOn]               = useState(0);
  const [checked, setChecked]               = useState(0);
  const [paxOpen, setPaxOpen]               = useState(false);
  const [bagsOpen, setBagsOpen]             = useState(false);

  const [origin, setOrigin]                 = useState("");
  const [destination, setDestination]       = useState("");
  const [originDisplay, setOriginDisplay]   = useState("");
  const [destDisplay, setDestDisplay]       = useState("");
  const [dateRange, setDateRange]           = useState<DateRange>({ departure: null, returnDate: null });
  const [swapping, setSwapping]             = useState(false);
  const [returnDateError, setReturnDateError] = useState(false);
  const [isSearching, setIsSearching]       = useState(false);
  const [legs, setLegs]                     = useState<FlightLeg[]>(DEFAULT_LEGS);
  const newLegRef                            = useRef<HTMLDivElement>(null);

  function updateLeg(id: string, patch: Partial<FlightLeg>) {
    setLegs((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx === -1) return prev;
      const updated = prev.map((l, i) => (i === idx ? { ...l, ...patch } : l));

      // Auto-chain next leg origin if current leg destination is updated and next leg has no origin
      if (patch.destination && idx < updated.length - 1) {
        const nextLeg = updated[idx + 1];
        if (!nextLeg.origin || nextLeg.origin === prev[idx].destination) {
          updated[idx + 1] = { ...nextLeg, origin: patch.destination };
        }
      }

      return updated;
    });
  }

  const addLeg = useCallback(() => {
    if (legs.length >= 5) return;
    setLegs((prev) => {
      const lastDest = prev[prev.length - 1]?.destination || "";
      return [
        ...prev,
        { id: `leg-${Date.now()}`, origin: lastDest, destination: "", departureDate: null },
      ];
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        newLegRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    });
  }, [legs.length]);

  function removeLeg(id: string) {
    if (legs.length <= 2) return;
    setLegs((prev) => prev.filter((l) => l.id !== id));
  }

  function handleSwap() {
    setSwapping(true);
    setTimeout(() => setSwapping(false), 350);
    setOrigin(destination);
    setDestination(origin);
    setOriginDisplay(destDisplay);
    setDestDisplay(originDisplay);
  }

  // Prefetch when all fields are filled
  useEffect(() => {
    if (tripType === "multi-city") {
      const allFilled = legs.every((l) => l.origin && l.destination && l.departureDate);
      if (!allFilled) return;
      prefetchFlights({
        tripType,
        origin: legs[0].origin,
        destination: legs[legs.length - 1].destination,
        departureDate: formatISO(legs[0].departureDate!),
        passengers,
        travelClass,
        currency: "USD",
      });
    } else {
      if (!origin || !destination || !dateRange.departure) return;
      if (tripType === "round-trip" && !dateRange.returnDate) return;
      prefetchFlights({
        tripType,
        origin,
        destination,
        departureDate: formatISO(dateRange.departure),
        ...(tripType === "round-trip" && dateRange.returnDate ? { returnDate: formatISO(dateRange.returnDate) } : {}),
        passengers,
        travelClass,
        currency: "USD",
      });
    }
  }, [origin, destination, dateRange, legs, tripType, passengers, travelClass]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (tripType === "multi-city") {
      const valid = legs.every((l) => l.origin && l.destination && l.departureDate);
      if (!valid) return;
      setIsSearching(true);
      const params = new URLSearchParams({
        tripType,
        passengers: String(passengers),
        class: travelClass,
        bags: String(carryOn + checked),
        legs: JSON.stringify(
          legs.map((l) => ({
            from: l.origin,
            to: l.destination,
            date: formatISO(l.departureDate!),
          }))
        ),
      });
      router.push(`/search?${params.toString()}`);
      return;
    }

    if (!origin || !destination || !dateRange.departure) return;
    if (tripType === "round-trip" && !dateRange.returnDate) {
      setReturnDateError(true);
      return;
    }
    setReturnDateError(false);
    setIsSearching(true);
    saveRecentSearch({
      origin,
      destination,
      departureDate: formatISO(dateRange.departure),
      ...(tripType === "round-trip" && dateRange.returnDate
        ? { returnDate: formatISO(dateRange.returnDate) }
        : {}),
      passengers,
      travelClass,
      tripType,
    });
    const params = new URLSearchParams({
      from: origin,
      to: destination,
      fromLabel: originDisplay || origin,
      toLabel:   destDisplay   || destination,
      dept: formatISO(dateRange.departure),
      passengers: String(passengers),
      class: travelClass,
      tripType,
      bags: String(carryOn + checked),
      ...(tripType === "round-trip" && dateRange.returnDate
        ? { ret: formatISO(dateRange.returnDate) }
        : {}),
    });
    router.push(`/search?${params.toString()}`);
  }

  const classLabel = TRAVEL_CLASSES.find((c) => c.value === travelClass)?.label ?? "Economy";
  const totalBags  = carryOn + checked;
  const bagsLabel  = totalBags === 0 ? "No bags" : totalBags === 1 ? "1 bag" : `${totalBags} bags`;
  const paxLabel   = `${passengers} Adult${passengers > 1 ? "s" : ""}, ${classLabel}`;

  // ── Mobile bottom-sheet state ──────────────────────────────────────────────
  const [mobileSheet, setMobileSheet] = useState<"pax" | "bags" | "dates" | null>(null);

  return (
    <div className="w-full max-w-full overflow-visible">

      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE LAYOUT  (block md:hidden)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 w-full p-1">

          {/* Segmented Trip Type Switcher */}
          <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            {TRIP_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTripType(t.value)}
                className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all text-center ${
                  tripType === t.value
                    ? "bg-white dark:bg-slate-900 text-primary shadow-sm font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Pax & Bags Trigger Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMobileSheet("pax")}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{paxLabel}</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => setMobileSheet("bags")}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Luggage className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{bagsLabel}</span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </button>
          </div>

          {/* Inputs section */}
          {tripType === "multi-city" ? (
            <div className="space-y-4">
              {legs.map((leg, idx) => (
                <div
                  key={leg.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Flight {idx + 1}
                      </span>
                    </div>

                    {/* Delete button for 3rd, 4th, 5th leg */}
                    {idx >= 2 && (
                      <button
                        type="button"
                        onClick={() => removeLeg(leg.id)}
                        className="h-7 w-7 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors active:scale-95"
                        aria-label="Remove flight"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* From */}
                  <div className="w-full rounded-xl border border-slate-200 bg-slate-50/60 flex items-center px-3.5 py-2.5 gap-3 shadow-2xs focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <div className="h-8 w-8 rounded-lg bg-white shadow-xs border border-slate-100 flex items-center justify-center text-primary shrink-0">
                      <PlaneTakeoff className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Departure
                      </label>
                      <AirportInput
                        id={`m-leg-orig-${leg.id}`}
                        value={leg.origin}
                        onChange={(v) => updateLeg(leg.id, { origin: v })}
                        placeholder="Where from?"
                        icon={<></>}
                        label="From"
                        mobileSheet
                      />
                    </div>
                  </div>

                  {/* To */}
                  <div className="w-full rounded-xl border border-slate-200 bg-slate-50/60 flex items-center px-3.5 py-2.5 gap-3 shadow-2xs focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <div className="h-8 w-8 rounded-lg bg-white shadow-xs border border-slate-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <PlaneLanding className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Arrival
                      </label>
                      <AirportInput
                        id={`m-leg-dest-${leg.id}`}
                        value={leg.destination}
                        onChange={(v) => updateLeg(leg.id, { destination: v })}
                        placeholder="Where to?"
                        icon={<></>}
                        label="To"
                        mobileSheet
                      />
                    </div>
                  </div>

                  {/* Departure Date */}
                  <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                    <DatePickerPopover
                      value={{ departure: leg.departureDate, returnDate: null }}
                      onChange={(r) => updateLeg(leg.id, { departureDate: r.departure })}
                      isRoundTrip={false}
                      mobileSheet
                    />
                  </div>
                </div>
              ))}

              {/* Add flight button */}
              {legs.length < 5 && (
                <button
                  type="button"
                  onClick={addLeg}
                  className="w-full py-3.5 border-2 border-dashed border-primary/40 bg-primary/5 rounded-2xl text-primary text-xs font-bold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 active:scale-98"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add another flight ({legs.length}/5)</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* From & To inputs with Swap Button */}
              <div className="relative flex flex-col gap-2">
                {/* From */}
                <div className="w-full rounded-xl border border-slate-200 bg-white flex items-center px-3.5 py-3 gap-3 shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-primary shrink-0">
                    <PlaneTakeoff className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <AirportInput
                      id="m-origin"
                      value={origin}
                      onChange={(v, display) => { setOrigin(v); setOriginDisplay(display); }}
                      placeholder="Where from?"
                      icon={<></>}
                      label="Departure City or Airport"
                      mobileSheet
                    />
                  </div>
                </div>

                {/* Floating Swap button */}
                <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20">
                  <button
                    type="button"
                    onClick={handleSwap}
                    aria-label="Swap airports"
                    className="h-8 w-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
                    style={{
                      transform: swapping ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.32s cubic-bezier(.4,0,.2,1)",
                    }}
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* To */}
                <div className="w-full rounded-xl border border-slate-200 bg-white flex items-center px-3.5 py-3 gap-3 shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <PlaneLanding className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <AirportInput
                      id="m-destination"
                      value={destination}
                      onChange={(v, display) => { setDestination(v); setDestDisplay(display); }}
                      placeholder="Where to?"
                      icon={<></>}
                      label="Destination City or Airport"
                      mobileSheet
                    />
                  </div>
                </div>
              </div>

              {/* Departure & Return Dates */}
              <div className="w-full">
                <div className={`rounded-xl border bg-white shadow-xs ${ returnDateError ? "border-rose-400" : "border-slate-200" }`}>
                  <DatePickerPopover
                    value={dateRange}
                    onChange={(r) => { setDateRange(r); if (r.returnDate) setReturnDateError(false); }}
                    isRoundTrip={tripType === "round-trip"}
                    mobileSheet
                  />
                </div>
                {returnDateError && (
                  <p className="text-[11px] text-rose-500 mt-1 pl-1">Please select a return date</p>
                )}
              </div>
            </>
          )}

          {/* CTA Submit Button */}
          <button
            type="submit"
            disabled={isSearching}
            className="w-full py-4 bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-bold rounded-xl text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 mt-1 disabled:opacity-85"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Searching Flights...</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Search Flights</span>
              </>
            )}
          </button>
        </form>

        {/* ── Mobile bottom sheets (portalled to body with high z-index) ── */}
        {mobileSheet && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[999999] flex flex-col justify-end">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setMobileSheet(null)}
            />

            {/* Pax sheet */}
            {mobileSheet === "pax" && (
              <div className="relative z-10 bg-white dark:bg-slate-900 rounded-t-3xl p-5 shadow-2xl border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom duration-250">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-800 dark:text-white mb-3">Passengers &amp; Class</p>
                {/* Adults */}
                <div className="flex items-center justify-between py-2 px-3 mb-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <User className="h-4 w-4 text-slate-400" /> Adults
                  </span>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                      className="h-8 w-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{passengers}</span>
                    <button type="button" onClick={() => setPassengers((p) => Math.min(9, p + 1))}
                      className="h-8 w-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                {/* Class */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {TRAVEL_CLASSES.map((c) => (
                    <button key={c.value} type="button" onClick={() => setTravelClass(c.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        travelClass === c.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setMobileSheet("bags")}
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm active:scale-[0.98]">
                  Next: Baggage
                </button>
              </div>
            )}

            {/* Bags sheet */}
            {mobileSheet === "bags" && (
              <div className="relative z-10 bg-white dark:bg-slate-900 rounded-t-3xl p-5 shadow-2xl border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom duration-250">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-800 dark:text-white mb-3">Baggage</p>
                {[
                  { label: "Carry-on bag", icon: <Briefcase className="h-4 w-4 text-slate-400" />, val: carryOn, set: setCarryOn, max: 2 },
                  { label: "Checked bag",  icon: <Luggage    className="h-4 w-4 text-slate-400" />, val: checked, set: setChecked, max: 4 },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3 px-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      {row.icon} {row.label}
                    </span>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => row.set((b: number) => Math.max(0, b - 1))}
                        className="h-8 w-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">{row.val}</span>
                      <button type="button" onClick={() => row.set((b: number) => Math.min(row.max, b + 1))}
                        className="h-8 w-8 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setMobileSheet(null)}
                  className="w-full mt-4 py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm active:scale-[0.98]">
                  Done
                </button>
              </div>
            )}
          </div>,
          document.body
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DESKTOP LAYOUT  (hidden md:flex)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex flex-col gap-4 w-full">
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-4 w-full"
      >
        {/* Trip options bar */}
        <div className="relative z-50 flex items-center gap-1 flex-wrap">
          {/* Trip type */}
          <DropdownButton label={TRIP_TYPES.find((t) => t.value === tripType)?.label ?? "Round-trip"}>
            {(close) => TRIP_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => { setTripType(t.value); close(); }}
                className={`w-full text-left py-2 px-3 text-sm font-medium transition-colors flex items-center gap-2.5 ${
                  tripType === t.value ? "text-primary bg-primary/5" : "text-slate-700 hover:bg-accent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </DropdownButton>

          {/* Passengers & class */}
          <Popover open={paxOpen} onOpenChange={setPaxOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary transition-colors cursor-pointer"
              >
                <Users className="h-3.5 w-3.5" />
                {paxLabel}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${paxOpen ? "rotate-180" : ""}`} />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-4 space-y-4 z-[9999]">
              {/* Adults row */}
              <div className="flex items-center justify-between py-2 px-3">
                <span className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                  <User className="h-4 w-4 text-slate-400" />
                  Adults
                </span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                    className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-4 text-center text-sm font-medium text-slate-900">{passengers}</span>
                  <button type="button" onClick={() => setPassengers((p) => Math.min(9, p + 1))}
                    className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              {/* Class */}
              <div className="space-y-0.5">
                <span className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Cabin Class</span>
                {TRAVEL_CLASSES.map((c) => (
                  <button key={c.value} type="button" onClick={() => { setTravelClass(c.value); setPaxOpen(false); }}
                    className={`w-full text-left py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 ${
                      travelClass === c.value
                        ? "bg-primary/10 text-primary"
                        : "text-slate-700 hover:bg-accent"
                    }`}>
                    {c.icon}
                    {c.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Bags */}
          <Popover open={bagsOpen} onOpenChange={setBagsOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary transition-colors cursor-pointer"
              >
                <Luggage className="h-3.5 w-3.5" />
                {bagsLabel}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${bagsOpen ? "rotate-180" : ""}`} />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[300px] p-4 space-y-0.5 z-[9999]">
              <span className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Baggage</span>
              {/* Carry-on row */}
              <div className="flex items-center justify-between gap-4 py-2 px-3">
                <span className="flex items-center gap-2.5 text-sm font-medium text-slate-700 whitespace-nowrap">
                  <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
                  Carry-on bag
                </span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setCarryOn((b) => Math.max(0, b - 1))}
                    className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-4 text-center text-sm font-medium text-slate-900">{carryOn}</span>
                  <button type="button" onClick={() => setCarryOn((b) => Math.min(2, b + 1))}
                    className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              {/* Checked row */}
              <div className="flex items-center justify-between gap-4 py-2 px-3">
                <span className="flex items-center gap-2.5 text-sm font-medium text-slate-700 whitespace-nowrap">
                  <Luggage className="h-4 w-4 text-slate-400 shrink-0" />
                  Checked bag
                </span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setChecked((b) => Math.max(0, b - 1))}
                    className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-4 text-center text-sm font-medium text-slate-900">{checked}</span>
                  <button type="button" onClick={() => setChecked((b) => Math.min(4, b + 1))}
                    className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* ── Multi-city legs ── */}
        {tripType === "multi-city" && (
          <div className="flex flex-col gap-3">
            {legs.map((leg, idx) => (
              <div
                key={leg.id}
                ref={idx === legs.length - 1 ? newLegRef : undefined}
                className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 p-3 rounded-2xl border border-border bg-card shadow-xs animate-fade-in"
              >
                <div className="shrink-0 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Flight</span>
                </div>

                {/* From */}
                <div className="flex-1 min-w-0">
                  <AirportInput
                    id={`leg-orig-${leg.id}`}
                    value={leg.origin}
                    onChange={(v) => updateLeg(leg.id, { origin: v })}
                    placeholder="Where from?"
                    icon={<PlaneTakeoff className="h-4 w-4 text-primary" />}
                    label="From"
                  />
                </div>

                {/* To */}
                <div className="flex-1 min-w-0">
                  <AirportInput
                    id={`leg-dest-${leg.id}`}
                    value={leg.destination}
                    onChange={(v) => updateLeg(leg.id, { destination: v })}
                    placeholder="Where to?"
                    icon={<PlaneLanding className="h-4 w-4 text-emerald-600" />}
                    label="To"
                  />
                </div>

                {/* Departure Date */}
                <div className="flex-1 min-w-0">
                  <DatePickerPopover
                    value={{ departure: leg.departureDate, returnDate: null }}
                    onChange={(r) => updateLeg(leg.id, { departureDate: r.departure })}
                    isRoundTrip={false}
                  />
                </div>

                {/* Remove button — only from 3rd leg onwards */}
                {idx >= 2 ? (
                  <div className="flex items-end shrink-0">
                    <button
                      type="button"
                      onClick={() => removeLeg(leg.id)}
                      aria-label="Remove flight"
                      className="flex items-center justify-center h-14 w-10 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/5 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="hidden lg:block w-10 shrink-0" />
                )}
              </div>
            ))}

            {/* Add flight button */}
            {legs.length < 5 && (
              <button
                type="button"
                onClick={addLeg}
                className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-primary/40 text-primary text-sm font-medium hover:bg-primary/5 hover:border-primary transition-all"
              >
                <Plus className="h-4 w-4" />
                Add another flight
              </button>
            )}

            {/* Search CTA for multi-city */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-card hover:shadow-card-hover hover:brightness-110 active:scale-[0.97] transition-all duration-200 disabled:opacity-85 cursor-pointer"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Search Flights</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Main search bar (one-way / round-trip) ── */}
        {tripType !== "multi-city" && (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-end w-full">

          {/* FROM & TO + SWAP */}
          <div className="lg:col-span-5 flex items-center gap-2 min-w-0">
            {/* FROM */}
            <div className="flex-1 min-w-0">
              <AirportInput
                id="origin"
                value={origin}
                onChange={(v, display) => { setOrigin(v); setOriginDisplay(display); }}
                placeholder="Where from?"
                icon={<PlaneTakeoff className="h-4 w-4" />}
                label="From"
              />
            </div>

            {/* SWAP BUTTON */}
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap departure and arrival airports"
              className="mt-5 shrink-0 h-10 w-10 rounded-full border border-border bg-card text-foreground/70 hover:text-primary hover:border-primary hover:bg-accent flex items-center justify-center shadow-xs transition-all"
              style={{
                transform: swapping ? "rotate(180deg) scale(0.88)" : "rotate(0deg) scale(1)",
                transition: "transform 0.32s cubic-bezier(.4,0,.2,1)",
              }}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </button>

            {/* TO */}
            <div className="flex-1 min-w-0">
              <AirportInput
                id="destination"
                value={destination}
                onChange={(v, display) => { setDestination(v); setDestDisplay(display); }}
                placeholder="Where to?"
                icon={<PlaneLanding className="h-4 w-4" />}
                label="To"
              />
            </div>
          </div>

          {/* DATES */}
          <div className="lg:col-span-4 min-w-0">
            <DatePickerPopover
              value={dateRange}
              onChange={(r) => { setDateRange(r); if (r.returnDate) setReturnDateError(false); }}
              isRoundTrip={tripType === "round-trip"}
              error={returnDateError}
            />
            {returnDateError && (
              <p className="text-[11px] text-rose-500 mt-1 pl-1">Please select a return date</p>
            )}
          </div>

          {/* SEARCH CTA */}
          <div className="lg:col-span-3 min-w-0">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full inline-flex items-center justify-center gap-2 h-14 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm xl:text-base shadow-md shadow-primary/20 active:scale-[0.97] transition-all duration-200 disabled:opacity-85 cursor-pointer"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Searching Flights...</span>
                </>
              ) : (
                <>
                  <Search className="h-4.5 w-4.5" />
                  <span>Search Flights</span>
                </>
              )}
            </button>
          </div>

        </div>
        )}
      </form>
      </div>
    </div>
  );
}
