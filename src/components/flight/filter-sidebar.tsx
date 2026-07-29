"use client";

import { useState, useCallback } from "react";
import {
  Bell, RotateCcw, ChevronDown, Luggage, X, SlidersHorizontal,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StopOption = "any" | "direct" | "1stop" | "2stop";

export interface FilterState {
  priceAlert:         boolean;
  cabinBags:          number;
  checkedBags:        number;
  stops:              StopOption;
  allowOvernightStop: boolean;
  selectedAirlines:   Set<string>;
  minPrice:           number;
  maxPrice:           number;
  // Times (minutes from midnight, 0–1439)
  outDepFrom:  number;
  outDepTo:    number;
  outArrFrom:  number;
  outArrTo:    number;
  retDepFrom:  number;
  retDepTo:    number;
  retArrFrom:  number;
  retArrTo:    number;
  // Duration (minutes)
  maxFlightDuration:  number;
  maxLayoverDuration: number;
  // Days (0=Sun … 6=Sat)
  activeDays: Set<number>;
  // Excluded layover countries (ISO-2 codes)
  excludedCountries: Set<string>;
}

export interface FilterSidebarProps {
  availableAirlines: { code: string; name: string }[];
  absoluteMaxPrice:  number;
  absoluteMinPrice:  number;
  filters:           FilterState;
  onChange:          (f: FilterState) => void;
}

const LAYOVER_COUNTRIES = [
  { code: "IN", name: "India"        },
  { code: "AE", name: "UAE"          },
  { code: "QA", name: "Qatar"        },
  { code: "TR", name: "Turkey"       },
  { code: "SA", name: "Saudi Arabia" },
  { code: "PK", name: "Pakistan"     },
  { code: "EG", name: "Egypt"        },
  { code: "OM", name: "Oman"         },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MAX_FLIGHT_MINS   = 30 * 60; // 30 h
const MAX_LAYOVER_MINS  = 24 * 60; // 24 h

export function getDefaultFilters(
  maxPrice: number,
  minPrice = 0,
): FilterState {
  return {
    priceAlert:          false,
    cabinBags:           0,
    checkedBags:         0,
    stops:               "any",
    allowOvernightStop:  false,
    selectedAirlines:    new Set(),
    minPrice,
    maxPrice,
    outDepFrom:  0,    outDepTo:  1439,
    outArrFrom:  0,    outArrTo:  1439,
    retDepFrom:  0,    retDepTo:  1439,
    retArrFrom:  0,    retArrTo:  1439,
    maxFlightDuration:   MAX_FLIGHT_MINS,
    maxLayoverDuration:  MAX_LAYOVER_MINS,
    activeDays:          new Set(),
    excludedCountries:   new Set(),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function minsToHHMM(m: number): string {
  const h = Math.floor(m / 60) % 24;
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function minsToLabel(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm > 0 ? `${h}h ${mm}m` : `${h}h`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between text-sm font-semibold text-slate-800 py-0.5"
    >
      {label}
      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
    </button>
  );
}

function BagCounter({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Luggage className="h-4 w-4 text-slate-400" />
        {label}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value === 0}
          className="h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40">−</button>
        <span className="w-4 text-center text-sm font-semibold text-slate-800">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(3, value + 1))}
          disabled={value === 3}
          className="h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40">+</button>
      </div>
    </div>
  );
}

function RangeSlider({
  label, min, max, valueMin, valueMax, step = 1,
  formatValue, onChangeMin, onChangeMax,
}: {
  label?: string; min: number; max: number;
  valueMin: number; valueMax: number; step?: number;
  formatValue: (v: number) => string;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      {label && <p className="text-xs text-slate-500">{label}</p>}
      <div className="relative h-5 flex items-center">
        {/* Track */}
        <div className="absolute w-full h-1.5 rounded-full bg-slate-200" />
        {/* Active range */}
        <div
          className="absolute h-1.5 rounded-full bg-primary"
          style={{ left: `${pct(valueMin)}%`, right: `${100 - pct(valueMax)}%` }}
        />
        {/* Min thumb */}
        <input type="range" min={min} max={max} step={step} value={valueMin}
          onChange={e => onChangeMin(Math.min(Number(e.target.value), valueMax - step))}
          className="absolute w-full appearance-none bg-transparent cursor-pointer range-thumb"
          style={{ zIndex: valueMin > max - (max - min) * 0.1 ? 5 : 3 }}
        />
        {/* Max thumb */}
        <input type="range" min={min} max={max} step={step} value={valueMax}
          onChange={e => onChangeMax(Math.max(Number(e.target.value), valueMin + step))}
          className="absolute w-full appearance-none bg-transparent cursor-pointer range-thumb"
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-slate-500">
        <span className="font-semibold text-slate-700">{formatValue(valueMin)}</span>
        <span className="font-semibold text-slate-700">{formatValue(valueMax)}</span>
      </div>
    </div>
  );
}

// ─── Main Sidebar Panel ───────────────────────────────────────────────────────

function SidebarPanel({ availableAirlines, absoluteMaxPrice, absoluteMinPrice, filters, onChange }: FilterSidebarProps) {
  const [baggageOpen,   setBaggageOpen]   = useState(true);
  const [stopsOpen,     setStopsOpen]     = useState(true);
  const [airlinesOpen,  setAirlinesOpen]  = useState(true);
  const [priceOpen,     setPriceOpen]     = useState(true);
  const [timesOpen,     setTimesOpen]     = useState(false);
  const [durationOpen,  setDurationOpen]  = useState(false);
  const [daysOpen,      setDaysOpen]      = useState(false);
  const [countriesOpen, setCountriesOpen] = useState(false);

  const set = useCallback(
    (patch: Partial<FilterState>) => onChange({ ...filters, ...patch }),
    [filters, onChange]
  );

  const toggleAirline = (code: string) => {
    const next = new Set(filters.selectedAirlines);
    next.has(code) ? next.delete(code) : next.add(code);
    set({ selectedAirlines: next });
  };

  const toggleDay = (d: number) => {
    const next = new Set(filters.activeDays);
    next.has(d) ? next.delete(d) : next.add(d);
    set({ activeDays: next });
  };

  const toggleCountry = (code: string) => {
    const next = new Set(filters.excludedCountries);
    next.has(code) ? next.delete(code) : next.add(code);
    set({ excludedCountries: next });
  };

  const allAirlinesSelected = filters.selectedAirlines.size === 0;

  const STOP_OPTIONS: { value: StopOption; label: string }[] = [
    { value: "any",    label: "Any stops"     },
    { value: "direct", label: "Direct only"   },
    { value: "1stop",  label: "Up to 1 stop"  },
    { value: "2stop",  label: "Up to 2 stops" },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-5" style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 50px' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-900">Filters</span>
        <button type="button"
          onClick={() => onChange(getDefaultFilters(absoluteMaxPrice, absoluteMinPrice))}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/70 font-medium transition-colors">
          <RotateCcw className="h-3 w-3" />Reset
        </button>
      </div>

      {/* ── Price Alert ── */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-500" />
          <div>
            <p className="text-sm font-medium text-slate-800">Price alerts</p>
            <p className="text-[11px] text-slate-400">Get notified on drops</p>
          </div>
        </div>
        <button type="button" role="switch" aria-checked={filters.priceAlert}
          onClick={() => set({ priceAlert: !filters.priceAlert })}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${filters.priceAlert ? "bg-primary" : "bg-slate-200"}`}>
          <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${filters.priceAlert ? "translate-x-4" : "translate-x-0"}`} />
        </button>
      </div>

      {/* ── Price Range ── */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <SectionHeader label="Price" open={priceOpen} onToggle={() => setPriceOpen(v => !v)} />
        <div className={`accordion-body ${priceOpen ? "open" : ""}`}><div className="pt-1">
          <RangeSlider
            min={absoluteMinPrice} max={absoluteMaxPrice} step={5}
            valueMin={filters.minPrice} valueMax={filters.maxPrice}
            formatValue={v => `$${v}`}
            onChangeMin={v => set({ minPrice: v })}
            onChangeMax={v => set({ maxPrice: v })}
          />
        </div></div>
      </div>

      {/* ── Stops ── */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <SectionHeader label="Stops" open={stopsOpen} onToggle={() => setStopsOpen(v => !v)} />
        <div className={`accordion-body ${stopsOpen ? "open" : ""}`}><div className="pt-1 space-y-2">
            {STOP_OPTIONS.map(opt => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input type="radio" name="stops" value={opt.value}
                  checked={filters.stops === opt.value}
                  onChange={() => set({ stops: opt.value })}
                  className="accent-primary h-3.5 w-3.5 cursor-pointer" />
                <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{opt.label}</span>
              </label>
            ))}
            <label className="flex items-center gap-2.5 cursor-pointer group mt-1 pt-1 border-t border-slate-100">
              <input type="checkbox" checked={filters.allowOvernightStop}
                onChange={e => set({ allowOvernightStop: e.target.checked })}
                className="accent-primary h-3.5 w-3.5 cursor-pointer rounded" />
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Allow overnight stopovers</span>
            </label>
        </div></div>
      </div>

      {/* ── Times ── */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <SectionHeader label="Times" open={timesOpen} onToggle={() => setTimesOpen(v => !v)} />
        <div className={`accordion-body ${timesOpen ? "open" : ""}`}><div className="pt-1 space-y-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Outbound</p>
            <RangeSlider label="Departure" min={0} max={1439} step={15}
              valueMin={filters.outDepFrom} valueMax={filters.outDepTo}
              formatValue={minsToHHMM}
              onChangeMin={v => set({ outDepFrom: v })}
              onChangeMax={v => set({ outDepTo: v })} />
            <RangeSlider label="Arrival" min={0} max={1439} step={15}
              valueMin={filters.outArrFrom} valueMax={filters.outArrTo}
              formatValue={minsToHHMM}
              onChangeMin={v => set({ outArrFrom: v })}
              onChangeMax={v => set({ outArrTo: v })} />
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide pt-1">Return</p>
            <RangeSlider label="Departure" min={0} max={1439} step={15}
              valueMin={filters.retDepFrom} valueMax={filters.retDepTo}
              formatValue={minsToHHMM}
              onChangeMin={v => set({ retDepFrom: v })}
              onChangeMax={v => set({ retDepTo: v })} />
            <RangeSlider label="Arrival" min={0} max={1439} step={15}
              valueMin={filters.retArrFrom} valueMax={filters.retArrTo}
              formatValue={minsToHHMM}
              onChangeMin={v => set({ retArrFrom: v })}
              onChangeMax={v => set({ retArrTo: v })} />
        </div></div>
      </div>

      {/* ── Duration ── */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <SectionHeader label="Duration" open={durationOpen} onToggle={() => setDurationOpen(v => !v)} />
        <div className={`accordion-body ${durationOpen ? "open" : ""}`}><div className="pt-1 space-y-4">
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Max flight duration</p>
              <input type="range" min={60} max={MAX_FLIGHT_MINS} step={30}
                value={filters.maxFlightDuration}
                onChange={e => set({ maxFlightDuration: Number(e.target.value) })}
                className="w-full h-1.5 rounded-full accent-primary cursor-pointer" />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>1h</span>
                <span className="font-semibold text-slate-700">{minsToLabel(filters.maxFlightDuration)}</span>
                <span>30h</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Max layover duration</p>
              <input type="range" min={30} max={MAX_LAYOVER_MINS} step={30}
                value={filters.maxLayoverDuration}
                onChange={e => set({ maxLayoverDuration: Number(e.target.value) })}
                className="w-full h-1.5 rounded-full accent-primary cursor-pointer" />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>30m</span>
                <span className="font-semibold text-slate-700">{minsToLabel(filters.maxLayoverDuration)}</span>
                <span>24h</span>
              </div>
            </div>
        </div></div>
      </div>

      {/* ── Days ── */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <SectionHeader label="Days" open={daysOpen} onToggle={() => setDaysOpen(v => !v)} />
        <div className={`accordion-body ${daysOpen ? "open" : ""}`}><div className="pt-1">
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((day, i) => (
                <button key={day} type="button" onClick={() => toggleDay(i)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    filters.activeDays.has(i)
                      ? "bg-primary border-primary text-primary-foreground"
                      : filters.activeDays.size === 0
                        ? "bg-slate-50 border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                        : "bg-slate-50 border-slate-200 text-slate-400 hover:border-primary hover:text-primary"
                  }`}>
                  {day}
                </button>
            ))}
            {filters.activeDays.size > 0 && (
              <button type="button" onClick={() => set({ activeDays: new Set() })}
                className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-red-500 transition-colors">
                Clear
              </button>
            )}
          </div>
        </div></div>
      </div>

      {/* ── Baggage ── */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <SectionHeader label="Baggage" open={baggageOpen} onToggle={() => setBaggageOpen(v => !v)} />
        <div className={`accordion-body ${baggageOpen ? "open" : ""}`}><div className="pt-1 space-y-3">
            <BagCounter label="Cabin baggage"   value={filters.cabinBags}   onChange={v => set({ cabinBags: v })} />
            <BagCounter label="Checked baggage" value={filters.checkedBags} onChange={v => set({ checkedBags: v })} />
        </div></div>
      </div>

      {/* ── Airlines ── */}
      {availableAirlines.length > 0 && (
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <SectionHeader label="Airlines" open={airlinesOpen} onToggle={() => setAirlinesOpen(v => !v)} />
          <div className={`accordion-body ${airlinesOpen ? "open" : ""}`}><div className="pt-1 space-y-2">
              <div className="flex gap-3 text-[11px] font-medium">
                <button type="button" onClick={() => set({ selectedAirlines: new Set() })}
                  className={`transition-colors ${allAirlinesSelected ? "text-primary" : "text-slate-400 hover:text-primary"}`}>
                  Select all
                </button>
                <span className="text-slate-200">|</span>
                <button type="button"
                  onClick={() => set({ selectedAirlines: new Set(availableAirlines.map(a => a.code)) })}
                  className="text-slate-400 hover:text-red-500 transition-colors">
                  Clear
                </button>
              </div>
              <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                {availableAirlines.map(airline => (
                  <label key={airline.code} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox"
                      checked={allAirlinesSelected || filters.selectedAirlines.has(airline.code)}
                      onChange={() => toggleAirline(airline.code)}
                      className="accent-primary h-3.5 w-3.5 cursor-pointer rounded" />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors truncate">{airline.name}</span>
                  </label>
                ))}
              </div>
          </div></div>
        </div>
      )}

      {/* ── Exclude Countries ── */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <SectionHeader label="Exclude countries" open={countriesOpen} onToggle={() => setCountriesOpen(v => !v)} />
        <div className={`accordion-body ${countriesOpen ? "open" : ""}`}><div className="pt-1 space-y-2">
            <p className="text-[11px] text-slate-400">Exclude layover/transit countries</p>
            <div className="space-y-2">
              {LAYOVER_COUNTRIES.map(c => (
                <label key={c.code} className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox"
                    checked={filters.excludedCountries.has(c.code)}
                    onChange={() => toggleCountry(c.code)}
                    className="accent-red-500 h-3.5 w-3.5 cursor-pointer rounded" />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">{c.name}</span>
                  {filters.excludedCountries.has(c.code) && (
                    <span className="ml-auto text-[10px] text-red-500 font-medium">Excluded</span>
                  )}
                </label>
              ))}
            </div>
        </div></div>
      </div>

    </div>
  );
}

// ─── Exported wrapper (desktop sticky + mobile drawer) ────────────────────────

export function FilterSidebar(props: FilterSidebarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden mb-3">
        <button type="button" onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filters
          {/* Active filter badge */}
          {(props.filters.stops !== "any" ||
            props.filters.selectedAirlines.size > 0 ||
            props.filters.activeDays.size > 0 ||
            props.filters.excludedCountries.size > 0 ||
            props.filters.maxFlightDuration < MAX_FLIGHT_MINS ||
            props.filters.maxLayoverDuration < MAX_LAYOVER_MINS) && (
            <span className="ml-1 h-2 w-2 rounded-full bg-primary" />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-background overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <span className="font-semibold text-slate-900">Filters</span>
              <button type="button" onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="p-4">
              <SidebarPanel {...props} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sticky sidebar */}
      <div className="hidden lg:block w-full lg:w-72 xl:w-80 shrink-0">
        <div className="lg:sticky lg:top-24 h-fit max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar">
          <SidebarPanel {...props} />
        </div>
      </div>
    </>
  );
}
