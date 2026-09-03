"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Bell, RotateCcw, ChevronDown, Luggage, X, SlidersHorizontal,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

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

function formatAirlineName(name: string): string {
  if (!name) return "";
  if (name !== name.toUpperCase()) return name;
  if (name.length <= 3) return name;
  return name
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length <= 2 && ["of", "in", "to"].includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

function SectionHeader({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between text-sm font-bold text-slate-900 dark:text-slate-100 py-0.5 cursor-pointer select-none"
    >
      {label}
      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
    </button>
  );
}

function CheckedBagIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-label="Checked bag">
      <path d="M15.91 5.333c-1.417 0-1.417-.166-1.417-.416v-.75c0-.25.167-.417.417-.417.583 0 .833-.417.833-.917S15.494 2 14.91 2H9.077c-.584 0-.834.417-.834.833 0 .417.25.834.75.834q.5.125.5.5v.666c0 .25-.166.417-.416.417H6.243c-1.166.083-2.083 1-2.083 2.083v11.75c0 1 .667 1.834 1.667 2 .083 0 .166.167.166.25 0 .5.334.667.834.667s.833-.167.833-.667a.18.18 0 0 1 .167-.166h8.166a.18.18 0 0 1 .167.166c0 .5.334.667.834.667s.833-.167.833-.667c0-.083.25-.25.333-.25 1-.166 1.667-1.083 1.667-2V7.333c0-1.083-.75-2-1.917-2zM15.6 8.75a.75.75 0 0 1 1.5 0v8.5a.75.75 0 0 1-1.5 0zm-4.3 0a.75.75 0 0 1 1.5 0v8.5a.75.75 0 0 1-1.5 0zM7.75 8a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-1.5 0v-8.5A.75.75 0 0 1 7.75 8m3.41-3.917c0-.25.167-.416.417-.416h.833c.25 0 .417.166.417.416v.747c0 .25-.167.417-.417.417h-.833c-.25 0-.417-.167-.417-.417z" />
    </svg>
  );
}

function BagCounter({ label, value, onChange, checked = false }: { label: string; value: number; onChange: (v: number) => void; checked?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
        {checked ? <CheckedBagIcon /> : <Luggage className="h-3.5 w-3.5 text-slate-500 shrink-0" />}
        {label}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value === 0}
          className="h-7 w-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40">−</button>
        <span className="w-4 text-center text-sm font-bold text-slate-900 dark:text-white">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(3, value + 1))}
          disabled={value === 3}
          className="h-7 w-7 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40">+</button>
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
      {label && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>}
      <div className="relative h-5 flex items-center">
        {/* Track */}
        <div className="absolute w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
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
      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span>{formatValue(valueMin)}</span>
        <span>{formatValue(valueMax)}</span>
      </div>
    </div>
  );
}

// ─── Custom UI Controls ───────────────────────────────────────────────────────

function CustomRadio({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <div
      onClick={onChange}
      className="flex items-center gap-2.5 cursor-pointer group py-1.5 select-none"
    >
      <div
        className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all duration-200 shrink-0 ${
          checked
            ? "border-primary bg-primary shadow-xs ring-2 ring-primary/20"
            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-slate-400"
        }`}
      >
        {checked && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
      </div>
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-tight">
        {label}
      </span>
    </div>
  );
}

function CustomCheckbox({
  checked,
  onChange,
  label,
  badge,
  variant = "primary",
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  badge?: React.ReactNode;
  variant?: "primary" | "danger";
}) {
  const isDanger = variant === "danger";

  return (
    <div
      onClick={onChange}
      className="flex items-center justify-between gap-2.5 cursor-pointer group py-1.5 select-none"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`h-4 w-4 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0 ${
            checked
              ? isDanger
                ? "border-red-500 bg-red-500 text-white shadow-xs ring-2 ring-red-500/20"
                : "border-primary bg-primary text-white shadow-xs ring-2 ring-primary/20"
              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-slate-400"
          }`}
        >
          {checked && (
            <svg
              className="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white truncate transition-colors leading-tight">
          {label}
        </span>
      </div>
      {badge}
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
    <div className="bg-white rounded-2xl p-5 space-y-5 shadow-sm border border-slate-100">

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
        <div className="flex items-center gap-2.5">
          <Bell className="h-4 w-4 text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">Price alerts</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-tight mt-0.5">Get notified on drops</p>
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
        <div className={`accordion-body ${priceOpen ? "open" : ""}`}><div className="pt-1 space-y-3">
          {/* Progress bar + sliders overlay */}
          <div className="relative flex items-center h-5">
            {/* Track */}
            <Progress value={100} className="absolute w-full h-2 bg-slate-200 pointer-events-none" />
            {/* Active range fill */}
            <div
              className="absolute h-2 rounded-full bg-primary pointer-events-none"
              style={{
                left: `${((filters.minPrice - absoluteMinPrice) / (absoluteMaxPrice - absoluteMinPrice)) * 100}%`,
                right: `${100 - ((filters.maxPrice - absoluteMinPrice) / (absoluteMaxPrice - absoluteMinPrice)) * 100}%`,
              }}
            />
            {/* Min thumb */}
            <input type="range"
              min={absoluteMinPrice} max={absoluteMaxPrice} step={5}
              value={filters.minPrice}
              onChange={e => set({ minPrice: Math.min(Number(e.target.value), filters.maxPrice - 5) })}
              className="absolute w-full appearance-none bg-transparent cursor-pointer range-thumb"
              style={{ zIndex: filters.minPrice > absoluteMaxPrice - (absoluteMaxPrice - absoluteMinPrice) * 0.1 ? 5 : 3 }}
            />
            {/* Max thumb */}
            <input type="range"
              min={absoluteMinPrice} max={absoluteMaxPrice} step={5}
              value={filters.maxPrice}
              onChange={e => set({ maxPrice: Math.max(Number(e.target.value), filters.minPrice + 5) })}
              className="absolute w-full appearance-none bg-transparent cursor-pointer range-thumb"
              style={{ zIndex: 4 }}
            />
          </div>
          {/* Min/Max labels */}
          <div className="flex justify-between text-[11px]">
            <span className="font-semibold text-slate-700">${filters.minPrice}</span>
            <span className="font-semibold text-slate-700">${filters.maxPrice}</span>
          </div>
        </div></div>
      </div>

      {/* ── Stops ── */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <SectionHeader label="Stops" open={stopsOpen} onToggle={() => setStopsOpen(v => !v)} />
        <div className={`accordion-body ${stopsOpen ? "open" : ""}`}>
          <div className="pt-1 space-y-1">
            {STOP_OPTIONS.map(opt => (
              <CustomRadio
                key={opt.value}
                label={opt.label}
                checked={filters.stops === opt.value}
                onChange={() => set({ stops: opt.value })}
              />
            ))}
            <div className="mt-2 pt-2 border-t border-slate-100">
              <CustomCheckbox
                label="Allow overnight stopovers"
                checked={filters.allowOvernightStop}
                onChange={() => set({ allowOvernightStop: !filters.allowOvernightStop })}
              />
            </div>
          </div>
        </div>
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
            <BagCounter label="Checked baggage" value={filters.checkedBags} onChange={v => set({ checkedBags: v })} checked />
        </div></div>
      </div>

      {/* ── Airlines ── */}
      {availableAirlines.length > 0 && (
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <SectionHeader label="Airlines" open={airlinesOpen} onToggle={() => setAirlinesOpen(v => !v)} />
          <div className={`accordion-body ${airlinesOpen ? "open" : ""}`}>
            <div className="pt-1 space-y-2">
              <div className="flex gap-3 text-xs font-semibold">
                <button type="button" onClick={() => set({ selectedAirlines: new Set() })}
                  className={`transition-colors cursor-pointer ${allAirlinesSelected ? "text-primary font-bold" : "text-slate-400 hover:text-primary"}`}>
                  Select all
                </button>
                <span className="text-slate-200">|</span>
                <button type="button"
                  onClick={() => set({ selectedAirlines: new Set() })}
                  className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer font-medium">
                  Clear
                </button>
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1.5 custom-scrollbar overscroll-contain">
                {availableAirlines.map(airline => (
                  <CustomCheckbox
                    key={airline.code}
                    label={formatAirlineName(airline.name)}
                    checked={allAirlinesSelected || filters.selectedAirlines.has(airline.code)}
                    onChange={() => toggleAirline(airline.code)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Exclude Countries ── */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <SectionHeader label="Exclude countries" open={countriesOpen} onToggle={() => setCountriesOpen(v => !v)} />
        <div className={`accordion-body ${countriesOpen ? "open" : ""}`}>
          <div className="pt-1 space-y-2">
            <p className="text-xs text-slate-400 dark:text-slate-500">Exclude layover/transit countries</p>
            <div className="space-y-1">
              {LAYOVER_COUNTRIES.map(c => (
                <CustomCheckbox
                  key={c.code}
                  label={c.name}
                  checked={filters.excludedCountries.has(c.code)}
                  variant="danger"
                  onChange={() => toggleCountry(c.code)}
                  badge={
                    filters.excludedCountries.has(c.code) ? (
                      <span className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded">
                        Excluded
                      </span>
                    ) : undefined
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Exported wrapper (desktop sticky + mobile drawer) ────────────────────────

export function FilterSidebar(props: FilterSidebarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setDrawerOpen(true);
    window.addEventListener("open-filter-drawer", handleOpen);
    return () => window.removeEventListener("open-filter-drawer", handleOpen);
  }, []);

  return (
    <>
      {/* Mobile drawer rendered in body portal with Lenis scroll bypass */}
      {drawerOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] lg:hidden flex justify-end" data-lenis-prevent>
          {/* Backdrop overlay */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setDrawerOpen(false)} />
          
          {/* Drawer Panel Container */}
          <div className="relative z-10 w-full max-w-md h-full bg-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 overflow-hidden">
            
            {/* Header (Fixed shrink-0) */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white shrink-0">
              <span className="text-base font-bold text-slate-900 font-heading">All filters</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Scrollable Filters Body (data-lenis-prevent prevents Lenis hijacking touch/wheel) */}
            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto overscroll-contain p-4 pb-8 touch-pan-y"
              style={{
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
              }}
            >
              <SidebarPanel {...props} />
            </div>

            {/* Kiwi.com Style Drawer Footer Actions (Fixed shrink-0) */}
            <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
              <button
                type="button"
                onClick={() => props.onChange(getDefaultFilters(props.absoluteMaxPrice, props.absoluteMinPrice))}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors text-center"
              >
                Clear filters
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-md shadow-primary/20 transition-colors text-center"
              >
                Show results
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Desktop sticky sidebar */}
      <div className="hidden lg:block w-full lg:w-72 xl:w-80 shrink-0">
        <SidebarPanel {...props} />
      </div>
    </>
  );
}
