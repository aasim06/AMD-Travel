"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useCallback, useMemo, Suspense, useRef, Fragment } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plane,
  Users,
  ArrowRight,
  ArrowLeft,
  SlidersHorizontal,
  AlertCircle,
  ChevronDown,
  Share2,
  Heart,
  CalendarDays,
  ArrowLeftRight,
  Search,
  PlaneTakeoff,
  PlaneLanding,
  Minus,
  Plus,
  Trash2,
  Loader2,
  Luggage,
  UserRound,
  Menu,
  Moon,
  Car,
  FileText,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import type { FlightOffer, FlightSearchResponse, TravelClass, Currency } from "@/types/flight";
import { AIRLINE_NAMES, AIRLINE_LOGO_FALLBACKS } from "@/types/flight";
import { useCurrency } from "@/context/currency-context";
import { FilterSidebar, getDefaultFilters } from "@/components/flight/filter-sidebar";
import type { FilterState } from "@/components/flight/filter-sidebar";
import { FlightDetailsModal } from "@/components/flight/flight-details-modal";
import { ShareItineraryModal } from "@/components/flight/share-itinerary-modal";
import { FlightSkeleton } from "@/components/flight/flight-skeleton";
import { DatePriceStrip } from "@/components/flight/date-price-strip";
import { FareTierModal } from "@/components/flight/fare-tier-modal";
import type { FareTier } from "@/components/flight/fare-tier-modal";
import { searchAirports, getAirportCountry } from "@/lib/data/airportsData";
import { useAirportSearch } from "@/hooks/useAirportSearch";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDuration(iso: string): string {
  // PT7H30M → "7h 30m"
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const h = match[1] ? `${match[1]}h` : "";
  const m = match[2] ? `${match[2]}m` : "";
  return [h, m].filter(Boolean).join(" ");
}

function isoToMins(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] ?? "0") * 60) + parseInt(match[2] ?? "0");
}

function totalMins(offer: FlightOffer): number {
  return offer.itineraries.reduce((sum, it) => sum + isoToMins(it.duration), 0);
}

function minsToLabel(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// ─── Modify Search Bar ───────────────────────────────────────────────────────

/** Shadcn-styled airport combobox with Input + floating dropdown */
function AirportCombobox({
  value, onChange, placeholder, label, icon, minWidth = "0",
}: {
  value: string;
  onChange: (code: string, label: string) => void;
  placeholder: string;
  label: string;
  icon: React.ReactNode;
  minWidth?: string;
}) {
  const [query, setQuery]     = useState("");
  const [open, setOpen]       = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef          = useRef<HTMLDivElement>(null);
  const [dropCoords, setDropCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!value) { setQuery(""); return; }
    const m = searchAirports(value)[0];
    if (m) setQuery(`${m.city} (${m.code})`);
    else setQuery(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const { results, isLoading, error } = useAirportSearch(query);

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

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0" style={minWidth && minWidth !== "0" ? { minWidth } : undefined}>
      {/* Label */}
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">{label}</p>
      {/* Input wrapper */}
      <div className={`flex items-center gap-2.5 h-11 px-3.5 rounded-xl border bg-white transition-all ${
        focused ? "border-primary ring-2 ring-primary/15 shadow-sm" : "border-slate-200 hover:border-slate-300"
      }`}>
        <span className={`shrink-0 transition-colors ${focused ? "text-primary" : "text-slate-400"}`}>{icon}</span>
        <input
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder={placeholder}
          onChange={e => { setQuery(e.target.value); setOpen(true); reposition(); }}
          onFocus={() => { setFocused(true); setOpen(true); reposition(); }}
          onBlur={() => setFocused(false)}
          className="flex-1 text-sm font-medium text-slate-800 placeholder:text-slate-400 bg-transparent outline-none min-w-0"
        />
        {query && (
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); setQuery(""); onChange("", ""); }}
            className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown — rendered via portal so z-index is always on top */}
      {open && dropCoords && createPortal(
        <div
          id="airport-combobox-portal"
          onMouseDown={(e) => e.stopPropagation()}
          className="fixed z-[99999] w-64 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xl"
          style={{
            top: dropCoords.top,
            left: dropCoords.left,
            minWidth: dropCoords.width,
            boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
          }}
        >
          <div className="py-1.5 overflow-hidden no-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-3 text-xs text-slate-500 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                <span>Searching locations...</span>
              </div>
            ) : error ? (
              <div className="px-4 py-2 text-xs text-rose-500 text-center font-medium">
                {error}
              </div>
            ) : results.length === 0 && query.trim().length >= 2 ? (
              <div className="px-4 py-3 text-xs text-slate-400 text-center">
                No locations found
              </div>
            ) : (
              results.slice(0, 6).map((a, i) => (
                <button
                  key={`${a.code}-${i}`}
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault();
                    onChange(a.code, `${a.city} (${a.code})`);
                    setQuery(`${a.city} (${a.code})`);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-slate-50 transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{a.code}</span>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-primary transition-colors">{a.city}</span>
                    <span className="text-[11px] text-slate-400 truncate">{a.name ?? a.country}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">{a.country}</span>
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/** Unified date range / single picker — one button, one popover, one calendar */
function DateRangePicker({
  dept,
  ret,
  isRound,
  onDeptChange,
  onRetChange,
  hideLabel = false,
}: {
  dept: string;
  ret: string;
  isRound: boolean;
  onDeptChange: (iso: string) => void;
  onRetChange: (iso: string) => void;
  hideLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState<"dept" | "ret">("dept");
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropCoords, setDropCoords] = useState<{ top: number; left: number } | null>(null);

  // Temp state for Kiwi-style: only apply on "Set dates" confirm
  const [tempDept, setTempDept] = useState(dept);
  const [tempRet, setTempRet] = useState(ret);

  // Sync temp state when modal opens
  useEffect(() => {
    if (open) { setTempDept(dept); setTempRet(ret); setPicking("dept"); }
  }, [open, dept, ret]);

  const deptDate    = dept     ? parseISO(dept)    : undefined;
  const retDate     = ret      ? parseISO(ret)      : undefined;
  const tempDeptDate = tempDept ? parseISO(tempDept) : undefined;
  const tempRetDate  = tempRet  ? parseISO(tempRet)  : undefined;
  const today       = new Date(new Date().setHours(0, 0, 0, 0));

  // Position the portal dropdown anchored to the button
  const reposition = useCallback(() => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    setDropCoords({ top: r.bottom + 6, left: r.left });
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

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // also check portal content
        const portal = document.getElementById("date-picker-portal");
        if (portal && portal.contains(e.target as Node)) return;
        setOpen(false);
        setPicking("dept");
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function handleOpen() {
    setPicking("dept");
    setOpen(v => !v);
  }

  function handleDayClick(day: Date | undefined) {
    if (!day) return;
    const iso = format(day, "yyyy-MM-dd");

    if (!isRound) {
      onDeptChange(iso);
      setOpen(false);
      return;
    }

    if (picking === "dept") {
      setTempDept(iso);
      if (tempRetDate && day >= tempRetDate) setTempRet("");
      setPicking("ret");
    } else {
      if (tempDeptDate && day < tempDeptDate) {
        setTempDept(iso);
        setTempRet("");
        setPicking("ret");
      } else {
        setTempRet(iso);
        setPicking("dept");
      }
    }
  }

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const deptLabel = deptDate ? format(deptDate, "EEE, MMM d") : "Departure";
  const retLabel  = retDate  ? format(retDate,  "EEE, MMM d") : "Return";

  // Custom modifiers for range highlighting
  const modifiers: Record<string, Date | Date[] | { after: Date; before: Date }> = {};
  const modifiersClassNames: Record<string, string> = {};
  const dFrom = isRound ? tempDeptDate : deptDate;
  const dTo   = isRound ? tempRetDate  : retDate;
  if (dFrom && dTo) {
    modifiers.range_start  = dFrom;
    modifiers.range_end    = dTo;
    modifiers.range_middle = { after: dFrom, before: dTo };
    modifiersClassNames.range_start  = "!bg-primary !text-primary-foreground rounded-lg";
    modifiersClassNames.range_end    = "!bg-primary !text-primary-foreground rounded-lg";
    modifiersClassNames.range_middle = "!bg-primary/10 !text-primary rounded-none";
  } else if (dFrom) {
    modifiers.range_start = dFrom;
    modifiersClassNames.range_start = "!bg-primary !text-primary-foreground rounded-lg";
  }

  const dropdown = open ? createPortal(
    <>
      {/* Mobile bottom sheet backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-xs sm:hidden"
        onClick={() => setOpen(false)}
      />

      {/* Desktop backdrop */}
      <div
        className="fixed inset-0 z-[9998] hidden sm:block"
        onClick={() => setOpen(false)}
      />

      {/* Calendar Modal / Sheet */}
      <div
        id="date-picker-portal"
        data-lenis-prevent
        className={
          isMobile
            ? "fixed left-0 right-0 bottom-0 z-[99999] bg-white rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 max-h-[95dvh]"
            : "fixed z-[99999] bg-white rounded-3xl border border-slate-200 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        }
        style={
          isMobile
            ? {}
            : {
                top: dropCoords ? Math.min(dropCoords.top, window.innerHeight - 440) : "50%",
                left: dropCoords ? Math.max(16, Math.min(dropCoords.left, window.innerWidth - (isRound ? 620 : 340))) : "50%",
                transform: dropCoords ? undefined : "translate(-50%, -50%)",
                width: isRound ? "min(620px, calc(100vw - 32px))" : "min(340px, calc(100vw - 32px))",
              }
        }
      >
        {/* Mobile: Kiwi-style header with date range display */}
        {isMobile && (
          <div className="px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
            {/* Drag handle */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
            {/* Date range input row */}
            <div className="flex items-center gap-2 p-3 rounded-2xl border border-primary/30 bg-primary/5">
              <CalendarDays className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 flex items-center gap-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setPicking("dept")}
                  className={`text-sm font-semibold transition-colors ${picking === "dept" ? "text-primary" : "text-slate-700"}`}
                >
                  {tempDeptDate ? format(tempDeptDate, "EEE d MMM") : "Departure"}
                </button>
                {isRound && (
                  <>
                    <span className="text-slate-300 font-light">–</span>
                    <button
                      type="button"
                      onClick={() => setPicking("ret")}
                      className={`text-sm font-semibold transition-colors ${picking === "ret" ? "text-primary" : tempRetDate ? "text-slate-700" : "text-slate-400"}`}
                    >
                      {tempRetDate ? format(tempRetDate, "EEE d MMM") : "No return"}
                    </button>
                  </>
                )}
              </div>
              {(tempDept || tempRet) && (
                <button
                  type="button"
                  onClick={() => { setTempDept(""); setTempRet(""); setPicking("dept"); }}
                  className="h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
            {/* Picking hint */}
            <p className="text-xs text-slate-400 font-medium mt-2 text-center">
              {picking === "dept" ? "Select departure date" : "Select return date"}
            </p>
          </div>
        )}

        {/* Desktop: Hint bar for round-trip */}
        {!isMobile && isRound && (
          <div className="flex items-center gap-2 px-3 pt-2 pb-2 border-b border-slate-100 mb-2">
            <button
              type="button"
              onClick={() => setPicking("dept")}
              className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold transition-colors ${
                picking === "dept" ? "bg-primary text-primary-foreground shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {deptDate ? format(deptDate, "EEE, MMM d") : "Departure"}
            </button>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <button
              type="button"
              onClick={() => setPicking("ret")}
              className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold transition-colors ${
                picking === "ret" ? "bg-primary text-primary-foreground shadow-xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {retDate ? format(retDate, "EEE, MMM d") : "Return"}
            </button>
          </div>
        )}

        {/* Calendar */}
        <div className={isMobile ? "flex-1 min-h-0 overflow-y-auto overscroll-contain p-3" : "p-3"} style={isMobile ? { WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" } : {}}>
          <Calendar
            mode="single"
            selected={isRound ? (picking === "dept" ? tempDeptDate : tempRetDate) : deptDate}
            onSelect={handleDayClick}
            disabled={(d) => d < today}
            numberOfMonths={isMobile ? 2 : (isRound ? 2 : 1)}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            initialFocus
          />
        </div>

        {/* Mobile footer: Cancel + Set dates */}
        {isMobile && (
          <div className="px-4 py-4 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
            <button
              type="button"
              onClick={() => { setTempDept(dept); setTempRet(ret); setOpen(false); }}
              className="flex-1 h-12 rounded-2xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (tempDept) onDeptChange(tempDept);
                if (tempRet) onRetChange(tempRet);
                setOpen(false);
              }}
              disabled={!tempDept}
              className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-md shadow-primary/20 transition-all disabled:opacity-50"
            >
              Set dates
            </button>
          </div>
        )}
      </div>
    </>,
    document.body
  ) : null;

  return (
    <>
      <div ref={containerRef} className="flex-1 w-full sm:w-auto">
        {!hideLabel && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
            {isRound ? "Departure — Return" : "Departure"}
          </p>
        )}
        <button
          type="button"
          onClick={handleOpen}
          className={`w-full flex items-center gap-2 h-11 px-3.5 rounded-xl border bg-white transition-all text-left overflow-hidden
            ${open ? "border-primary ring-2 ring-primary/15 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}
        >
          <CalendarDays className={`h-4 w-4 shrink-0 transition-colors ${open ? "text-primary" : "text-slate-400"}`} />
          <span className={`text-sm font-medium whitespace-nowrap shrink-0 ${deptDate ? "text-slate-800" : "text-slate-400"}`}>
            {deptLabel}
          </span>
          {isRound && (
            <>
              <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />
              <span className={`text-sm font-medium whitespace-nowrap shrink-0 ${retDate ? "text-slate-800" : "text-slate-400"}`}>
                {retLabel}
              </span>
            </>
          )}
        </button>
      </div>
      {dropdown}
    </>
  );
}

function SingleDatePicker({
  value,
  onChange,
  label = "Date",
  minDate,
}: {
  value: string;
  onChange: (iso: string) => void;
  label?: string;
  minDate?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropCoords, setDropCoords] = useState<{ top: number; left: number } | null>(null);

  const selectedDate = value ? parseISO(value) : undefined;
  const minParsed = minDate ? parseISO(minDate) : new Date(new Date().setHours(0, 0, 0, 0));

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const reposition = useCallback(() => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const neededWidth = window.innerWidth < 640 ? 300 : 590;
    const left = Math.max(12, Math.min(r.left, window.innerWidth - neededWidth - 16));
    setDropCoords({ top: r.bottom + 6, left });
  }, []);

  useEffect(() => {
    if (!open) {
      setDropCoords(null);
      return;
    }
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, reposition]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (target.closest("#single-date-picker-portal") || target.closest(".rdp")) return;
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const displayLabel = selectedDate ? format(selectedDate, "EEE, MMM d") : "Select date";

  return (
    <div ref={containerRef} className="relative w-full">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 h-11 px-3.5 rounded-xl border bg-white text-xs font-semibold transition-all cursor-pointer ${
          open ? "border-primary ring-2 ring-primary/15 shadow-sm text-slate-900" : "border-slate-200 text-slate-700 hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          <CalendarDays className={`h-4 w-4 shrink-0 transition-colors ${open ? "text-primary" : "text-slate-400"}`} />
          <span className="truncate font-semibold">{displayLabel}</span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && dropCoords && createPortal(
        <>
          {isMobile && (
            <div
              className="fixed inset-0 z-[99998] bg-black/40 backdrop-blur-xs sm:hidden"
              onClick={() => setOpen(false)}
            />
          )}
          <div
            id="single-date-picker-portal"
            onMouseDown={(e) => e.stopPropagation()}
            className={
              isMobile
                ? "fixed left-3 right-3 top-20 z-[99999] max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 animate-in fade-in-0 zoom-in-95 duration-150"
                : "fixed z-[99999] bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 animate-in fade-in-0 zoom-in-95 duration-150"
            }
            style={
              isMobile
                ? {}
                : {
                    top: dropCoords.top,
                    left: dropCoords.left,
                    minWidth: 580,
                  }
            }
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(day) => {
                if (day) {
                  onChange(format(day, "yyyy-MM-dd"));
                  setOpen(false);
                }
              }}
              numberOfMonths={isMobile ? 1 : 2}
              disabled={(d) => d < minParsed}
              initialFocus
            />
            {isMobile && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-3 w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

function ModifySearchBar({ compact = false }: { compact?: boolean }) {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [fromCode,   setFromCode]   = useState(searchParams.get("from") ?? "");
  const [fromLabel,  setFromLabel]  = useState(searchParams.get("fromLabel") ?? searchParams.get("from") ?? "");
  const [toCode,     setToCode]     = useState(searchParams.get("to") ?? "");
  const [toLabel,    setToLabel]    = useState(searchParams.get("toLabel") ?? searchParams.get("to") ?? "");
  const [dept,       setDept]       = useState(searchParams.get("dept") ?? "");
  const [ret,        setRet]        = useState(searchParams.get("ret") ?? "");
  // Fix #1: bags as proper local state (was just a const from URL)
  const [bags,       setBags]       = useState(parseInt(searchParams.get("bags") ?? searchParams.get("checkedBags") ?? "0", 10));
  const [passengers, setPassengers] = useState(parseInt(searchParams.get("passengers") ?? "1", 10));
  const [tripType,   setTripType]   = useState<"one-way" | "round-trip" | "multi-city">(
    (searchParams.get("tripType") ?? "one-way") as "one-way" | "round-trip" | "multi-city"
  );

  // Fix #2: Sync local state when URL changes (e.g. date-price-strip click)
  useEffect(() => {
    setFromCode(searchParams.get("from") ?? "");
    setFromLabel(searchParams.get("fromLabel") ?? searchParams.get("from") ?? "");
    setToCode(searchParams.get("to") ?? "");
    setToLabel(searchParams.get("toLabel") ?? searchParams.get("to") ?? "");
    setDept(searchParams.get("dept") ?? "");
    setRet(searchParams.get("ret") ?? "");
    setPassengers(parseInt(searchParams.get("passengers") ?? "1", 10));
    setBags(parseInt(searchParams.get("bags") ?? searchParams.get("checkedBags") ?? "0", 10));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);
  const [paxOpen,    setPaxOpen]    = useState(false);
  const [paxCoords, setPaxCoords] = useState<{ top: number; left: number } | null>(null);

  const [multiLegs, setMultiLegs] = useState<Array<{ id: string; from: string; to: string; date: string }>>(() => {
    const legsParam = searchParams.get("legs");
    if (legsParam) {
      try {
        const raw = JSON.parse(legsParam);
        if (Array.isArray(raw) && raw.length >= 2) {
          return raw.map((l: any, i: number) => ({
            id: `leg-${i + 1}`,
            from: l.from || l.origin || "",
            to: l.to || l.destination || "",
            date: l.date || l.dept || l.departureDate || "",
          }));
        }
      } catch {}
    }
    return [
      { id: "leg-1", from: searchParams.get("from") || "LHE", to: searchParams.get("to") || "DXB", date: searchParams.get("dept") || "" },
      { id: "leg-2", from: searchParams.get("to") || "DXB", to: "LHR", date: searchParams.get("ret") || "" },
    ];
  });

  function updateMultiLeg(id: string, patch: Partial<{ from: string; to: string; date: string }>) {
    setMultiLegs((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addMultiLeg() {
    if (multiLegs.length >= 5) return;
    const last = multiLegs[multiLegs.length - 1];
    setMultiLegs((prev) => [
      ...prev,
      { id: `leg-${Date.now()}`, from: last?.to || "", to: "", date: "" },
    ]);
  }

  function removeMultiLeg(id: string) {
    if (multiLegs.length <= 2) return;
    setMultiLegs((prev) => prev.filter((l) => l.id !== id));
  }

  // Mobile: bottom-sheet mode; Desktop: positioned popover
  const [isMobilePax, setIsMobilePax] = useState(false);
  useEffect(() => {
    const check = () => setIsMobilePax(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  function openPax(e: React.MouseEvent<HTMLButtonElement>) {
    if (window.innerWidth >= 640) {
      // Desktop: position below the button, clamped to viewport
      const r = e.currentTarget.getBoundingClientRect();
      const popupWidth = 280;
      const left = Math.min(r.left, window.innerWidth - popupWidth - 12);
      setPaxCoords({ top: r.bottom + 6, left });
    } else {
      // Mobile: bottom sheet — coords not needed
      setPaxCoords({ top: 0, left: 0 });
    }
    setPaxOpen(v => !v);
  }

  const isRound = tripType === "round-trip";

  // Fix #6: When switching trip type, clear ret both in state and compact display
  function handleTripTypeChange(t: "one-way" | "round-trip" | "multi-city") {
    setTripType(t);
    if (t !== "round-trip") setRet("");
  }

  const [travelTypeMenuOpen, setTravelTypeMenuOpen] = useState(false);
  const travelTypeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!travelTypeMenuOpen) return;
    function onOutside(e: MouseEvent) {
      if (travelTypeRef.current && !travelTypeRef.current.contains(e.target as Node)) {
        setTravelTypeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [travelTypeMenuOpen]);

  useEffect(() => {
    if (!paxOpen) return;
    function onDown(e: MouseEvent) {
      const portal = document.getElementById("pax-portal");
      if (portal && portal.contains(e.target as Node)) return;
      if ((e.target as HTMLElement).closest("[data-pax-trigger]")) return;
      setPaxOpen(false);
    }
    const tid = setTimeout(() => {
      document.addEventListener("mousedown", onDown);
    }, 0);
    return () => {
      clearTimeout(tid);
      document.removeEventListener("mousedown", onDown);
    };
  }, [paxOpen]);

  function handleSearch() {
    if (tripType === "multi-city") {
      const valid = multiLegs.every((l) => l.from && l.to && l.date);
      if (!valid) return;
      const p = new URLSearchParams({
        tripType: "multi-city",
        passengers: String(passengers),
        bags: String(bags), // Fix #3: include bags in URL
        class: searchParams.get("class") ?? "ECONOMY",
        legs: JSON.stringify(multiLegs.map((l) => ({ from: l.from, to: l.to, date: l.date }))),
      });
      router.push(`/search?${p.toString()}`);
      return;
    }

    if (!fromCode || !toCode || !dept) return;
    const p = new URLSearchParams({
      from: fromCode,
      to: toCode,
      fromLabel,
      toLabel,
      dept,
      passengers: String(passengers),
      bags: String(bags), // Fix #3: include bags in URL
      class: searchParams.get("class") ?? "ECONOMY",
      tripType,
      ...(isRound && ret ? { ret } : {}),
    });
    router.push(`/search?${p.toString()}`);
  }

  const canSearch = !!fromCode && !!toCode && !!dept;

  // ── Compact pill labels ────────────────────────────────────────────────────
  const fromShort  = fromLabel ? fromLabel.replace(/\s*\(.*\)/, "") : "From";
  const toShort    = toLabel   ? toLabel.replace(/\s*\(.*\)/, "")   : "To";
  const deptShort  = dept ? format(parseISO(dept), "MMM d") : "";
  const retShort   = ret  ? format(parseISO(ret),  "MMM d") : "";
  const dateShort  = deptShort
    ? isRound && retShort ? `${deptShort} – ${retShort}` : deptShort
    : "Date";
  const paxShort   = `${passengers} Adult${passengers > 1 ? "s" : ""}`;

  // ── Compact expand state ──────────────────────────────────────────────────
  const [expanded, setExpanded] = useState(false);
  const expandRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!compact || !expanded) return;
    function onDown(e: MouseEvent) {
      const target = e.target as HTMLElement;
      // Don't close if click is inside the expand panel or the compact pill trigger
      if (
        (expandRef.current && expandRef.current.contains(e.target as Node)) ||
        (pillRef.current && pillRef.current.contains(e.target as Node)) ||
        target.closest("#modify-search-modal") ||
        target.closest("#airport-combobox-portal") ||
        target.closest("#single-date-picker-portal") ||
        target.closest("#date-picker-portal") ||
        target.closest("#pax-portal") ||
        target.closest(".rdp") ||
        target.closest("[data-radix-popper-content-wrapper]")
      ) {
        return;
      }
      setExpanded(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [compact, expanded]);

  // ── COMPACT MODE ──────────────────────────────────────────────────────────
  if (compact) {
    return (
      <>
      {/* ── Top navbar — mobile only ── */}
      <div
        className="flex items-center justify-between px-4 bg-white border-b border-slate-100/80 sm:hidden shrink-0"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 14px)",
          paddingBottom: "10px",
        }}
      >
        {/* LEFT: Exact drawer logo (orange icon square with plane/globe SVG + brand text) */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="AMD Global Travel">
            {/* Orange icon square — exact same as drawer LogoMark */}
            <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary shadow-xs group-hover:shadow-sm transition-shadow shrink-0">
              <svg viewBox="0 0 36 36" fill="none" className="h-[18px] w-[18px]" aria-hidden>
                <circle cx="18" cy="18" r="10" stroke="white" strokeWidth="1.8" strokeDasharray="4 2.5" opacity="0.5" />
                <path d="M8 20.5l5-2.5 2.5-6 1.5 5.5 4-1.5-1 4.5 5.5-2-3 4.5-14.5 1 0.5-3.5z" fill="white" opacity="0.95" />
                <path d="M10 18.5 Q18 10 26 18.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
              </svg>
            </div>
            {/* Brand text — exact same as drawer LogoMark */}
            <div className="flex flex-col leading-none">
              <span className="font-heading font-extrabold text-[13px] text-slate-900 tracking-tight">
                AMD<span className="text-primary"> Global</span>
              </span>
              <span className="text-[9px] font-semibold text-slate-400 tracking-widest uppercase">
                Travel
              </span>
            </div>
          </Link>

          {/* Service Selector — Plane icon with interactive dropdown menu */}
          <div ref={travelTypeRef} className="relative">
            <button
              type="button"
              onClick={() => setTravelTypeMenuOpen(v => !v)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                travelTypeMenuOpen ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-slate-100"
              }`}
              title="Select Service"
            >
              <PlaneTakeoff className="h-4 w-4 shrink-0 transition-transform" />
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${travelTypeMenuOpen ? "rotate-180 text-primary" : "text-slate-400"}`} />
            </button>

            {/* Service dropdown bottom sheet (Kiwi style) */}
            {travelTypeMenuOpen && typeof document !== "undefined" && createPortal(
              <div className="fixed inset-0 z-[99999] flex flex-col justify-end" data-lenis-prevent>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
                  onClick={() => setTravelTypeMenuOpen(false)}
                />

                {/* Bottom Sheet Card */}
                <div className="relative bg-white rounded-t-3xl shadow-2xl p-5 pb-8 animate-in slide-in-from-bottom duration-300 z-10 max-w-lg mx-auto w-full">
                  {/* Drag Handle */}
                  <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Travel Services</p>
                    <button
                      type="button"
                      onClick={() => setTravelTypeMenuOpen(false)}
                      className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href="/"
                      onClick={() => setTravelTypeMenuOpen(false)}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold text-primary bg-primary/10 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <PlaneTakeoff className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span>Flights</span>
                        <span className="text-[11px] font-normal text-slate-400">Search & book cheap flights</span>
                      </div>
                      <span className="ml-auto text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">Active</span>
                    </Link>

                    <Link
                      href="/umrah-packages"
                      onClick={() => setTravelTypeMenuOpen(false)}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <Moon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span>Umrah Packages</span>
                        <span className="text-[11px] font-normal text-slate-400">All-inclusive pilgrimage packages</span>
                      </div>
                    </Link>

                    <Link
                      href="/visa"
                      onClick={() => setTravelTypeMenuOpen(false)}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span>Visa Services</span>
                        <span className="text-[11px] font-normal text-slate-400">Tourist & visit visa assistance</span>
                      </div>
                    </Link>

                    <Link
                      href="/cars"
                      onClick={() => setTravelTypeMenuOpen(false)}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <Car className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span>Rental Cars</span>
                        <span className="text-[11px] font-normal text-slate-400">Best rates on car rentals</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
        </div>

        {/* RIGHT: Avatar + hamburger */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-auth-modal"))}
            aria-label="My account"
            className="h-9 w-9 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          >
            <span className="h-8 w-8 rounded-full border-2 border-slate-200 bg-slate-100 flex items-center justify-center hover:border-primary/50 transition-colors">
              <UserRound className="h-4 w-4 text-slate-500" />
            </span>
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("toggle-mobile-drawer"))}
            aria-label="Open menu"
            className="h-9 w-9 flex items-center justify-center text-slate-600 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div ref={pillRef} className="relative px-3 py-2 bg-white sm:bg-transparent sm:px-0 sm:py-0">
        {/* ─── Premium compact search bar ─── */}
        <div className="flex items-center gap-2 w-full max-w-lg mx-auto">

          {/* Back button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="md:hidden h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all shrink-0"
            title="Go back"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>

          {/* Main pill */}
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className={`flex-1 flex items-center justify-between gap-2 pl-3.5 pr-3 py-2 rounded-2xl border transition-all duration-200 ${
              expanded
                ? "bg-white border-primary/60 ring-2 ring-primary/15 shadow-lg shadow-primary/10"
                : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-sm"
            }`}
          >
            {/* Left: route + meta */}
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Route icon */}
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Plane className="h-4 w-4 text-primary" />
              </div>

              {/* Text */}
              <div className="flex flex-col text-left min-w-0">
                {/* Route */}
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-black text-slate-900 tracking-tight font-heading truncate">
                    {fromShort}
                  </span>
                  <ArrowLeftRight className="h-3 w-3 text-primary shrink-0" />
                  <span className="text-[13px] font-black text-slate-900 tracking-tight font-heading truncate">
                    {toShort}
                  </span>
                </div>

                {/* Meta chips */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-500">
                    <CalendarDays className="h-3 w-3 text-slate-400" />
                    {dateShort}
                  </span>
                  <span className="text-slate-300 text-[9px]">•</span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-500">
                    <Users className="h-3 w-3 text-slate-400" />
                    {passengers}
                  </span>
                  <span className="text-slate-300 text-[9px]">•</span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-500">
                    <Luggage className="h-3 w-3 text-slate-400" />
                    {bags}
                  </span>
                </div>
              </div>
            </div>

            {/* Chevron */}
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                expanded ? "rotate-180 text-primary" : "text-slate-400"
              }`}
            />
          </button>

          {/* Filter button */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-filter-drawer"))}
            className="lg:hidden h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 border border-slate-200 hover:border-slate-300 transition-all shrink-0 shadow-sm"
            title="Open filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* ── Kiwi.com "Modify journey" bottom sheet portal ── */}
        {expanded && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:items-center sm:justify-center sm:p-4" data-lenis-prevent>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setExpanded(false)}
            />

            {/* Bottom Sheet / Modal */}
            <div
              ref={expandRef}
              id="modify-search-modal"
              data-lenis-prevent
              className="relative z-10 w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 sm:animate-in sm:zoom-in-95 sm:slide-in-from-bottom-0 max-h-[92dvh]"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                <h2 className="text-base font-bold text-slate-900 font-heading">Modify journey</h2>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4" style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>

                {/* Row 1: Trip type pills + Pax/Bags pill */}
                <div className="flex items-center gap-3">
                  {/* Custom trip type pill toggle — replaces ugly native <select> */}
                  <div className="flex-1 flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
                    {([
                      { val: "one-way",    label: "One-way" },
                      { val: "round-trip", label: "Return"  },
                      { val: "multi-city", label: "Multi"   },
                    ] as const).map(({ val, label }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleTripTypeChange(val)}
                        className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all duration-150 ${
                          tripType === val
                            ? "bg-white text-primary shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Pax + Bags button */}
                  <button
                    type="button"
                    data-pax-trigger
                    onClick={openPax}
                    className={`h-11 px-3.5 rounded-xl border bg-white flex items-center gap-1.5 text-sm font-semibold transition-all shrink-0 ${
                      paxOpen ? "border-primary ring-2 ring-primary/15 text-primary" : "border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <Users className={`h-4 w-4 shrink-0 ${paxOpen ? "text-primary" : "text-slate-400"}`} />
                    <span className="tabular-nums">{passengers}</span>
                    <span className="text-slate-300">·</span>
                    <Luggage className={`h-4 w-4 shrink-0 ${paxOpen ? "text-primary" : "text-slate-400"}`} />
                    <span className="tabular-nums">{bags}</span>
                    <ChevronDown className={`h-3.5 w-3.5 ml-0.5 transition-transform ${paxOpen ? "rotate-180 text-primary" : "text-slate-400"}`} />
                  </button>
                </div>

                {/* Row 2: Origin + Swap + Destination (single/round), or multi-city legs */}
                {tripType === "multi-city" ? (
                  <div className="space-y-3">
                    {multiLegs.map((leg, idx) => (
                      <div key={leg.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-primary/10 text-primary text-xs font-bold">{idx + 1}</span>
                          Flight
                          {idx >= 2 && (
                            <button type="button" onClick={() => removeMultiLeg(leg.id)} className="ml-auto text-slate-400 hover:text-rose-500 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <AirportCombobox value={leg.from} label="From" onChange={(code) => updateMultiLeg(leg.id, { from: code })} placeholder="Origin" icon={<PlaneTakeoff className="h-4 w-4" />} />
                        <AirportCombobox value={leg.to} label="To" onChange={(code) => updateMultiLeg(leg.id, { to: code })} placeholder="Destination" icon={<PlaneLanding className="h-4 w-4" />} />
                        <SingleDatePicker value={leg.date} label="Date" onChange={(d) => updateMultiLeg(leg.id, { date: d })} />
                      </div>
                    ))}
                    {multiLegs.length < 5 && (
                      <button type="button" onClick={addMultiLeg} className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-primary/40 text-primary text-sm font-bold hover:bg-primary/5 transition-colors">
                        <Plus className="h-4 w-4" /> Add another flight
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Origin chip */}
                    <div className="relative">
                      <AirportCombobox
                        value={fromCode}
                        label="From"
                        onChange={(code, lbl) => { setFromCode(code); setFromLabel(lbl); }}
                        placeholder="City or airport"
                        icon={<PlaneTakeoff className="h-4 w-4" />}
                        minWidth="0"
                      />
                    </div>

                    {/* Swap button centered between origin and destination */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-slate-200" />
                      <button
                        type="button"
                        onClick={() => { setFromCode(toCode); setFromLabel(toLabel); setToCode(fromCode); setToLabel(fromLabel); }}
                        className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-95 shrink-0"
                        title="Swap airports"
                      >
                        <ArrowLeftRight className="h-3.5 w-3.5" />
                      </button>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Destination chip */}
                    <div className="relative">
                      <AirportCombobox
                        value={toCode}
                        label="To"
                        onChange={(code, lbl) => { setToCode(code); setToLabel(lbl); }}
                        placeholder="City or airport"
                        icon={<PlaneLanding className="h-4 w-4" />}
                        minWidth="0"
                      />
                    </div>

                    {/* Date row — label hidden as modal provides context */}
                    <DateRangePicker
                      dept={dept}
                      ret={ret}
                      isRound={isRound}
                      onDeptChange={setDept}
                      onRetChange={setRet}
                      hideLabel
                    />
                  </div>
                )}

              </div>

              {/* Footer actions */}
              <div className="px-5 py-4 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="flex-1 h-12 rounded-2xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => { handleSearch(); setExpanded(false); }}
                  disabled={tripType === "multi-city" ? !multiLegs.every(l => l.from && l.to && l.date) : !canSearch}
                  className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* Pax + Bags portal — bottom sheet on mobile, popover on desktop */}
      {paxOpen && paxCoords && createPortal(
        <>
          {/* Mobile backdrop */}
          {isMobilePax && (
            <div
              className="fixed inset-0 z-[99998] bg-black/40"
              onClick={() => setPaxOpen(false)}
            />
          )}
          <div
            id="pax-portal"
            className={
              isMobilePax
                ? "fixed left-0 right-0 bottom-0 z-[99999] bg-white rounded-t-3xl shadow-2xl p-5 animate-in slide-in-from-bottom duration-300"
                : "fixed z-[99999] bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 w-[280px]"
            }
            style={isMobilePax ? {} : { top: paxCoords.top, left: paxCoords.left }}
          >
            {/* Mobile drag handle */}
            {isMobilePax && <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />}

            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Travellers</p>

            {/* Adults row */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Adults</p>
                <p className="text-[11px] text-slate-400">Age 12+</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPassengers(p => Math.max(1, p - 1))}
                  disabled={passengers <= 1}
                  className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-base font-bold text-slate-800 w-6 text-center tabular-nums">{passengers}</span>
                <button
                  type="button"
                  onClick={() => setPassengers(p => Math.min(9, p + 1))}
                  disabled={passengers >= 9}
                  className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-30 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Bags row */}
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Checked bags</p>
                <p className="text-[11px] text-slate-400">Per person</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setBags(b => Math.max(0, b - 1))}
                  disabled={bags <= 0}
                  className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-base font-bold text-slate-800 w-6 text-center tabular-nums">{bags}</span>
                <button
                  type="button"
                  onClick={() => setBags(b => Math.min(3, b + 1))}
                  disabled={bags >= 3}
                  className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-30 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPaxOpen(false)}
              className="mt-4 w-full h-11 rounded-2xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </>,
        document.body
      )}
      </>
    );
  }
  // ── END COMPACT MODE ──────────────────────────────────────────────────────

  return (
    <>
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

      {/* ── Header strip: trip type toggle ── */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-3.5 pb-3 border-b border-slate-100">
        {/* Toggle buttons */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
          {(["round-trip", "one-way", "multi-city"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTripTypeChange(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                tripType === t
                  ? "bg-white text-primary shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Plane className={`h-3 w-3 ${tripType === t ? "text-primary" : "text-slate-400"} ${t === "round-trip" ? "rotate-180" : ""}`} />
              {t === "one-way" ? "One Way" : t === "round-trip" ? "Round Trip" : "Multi-city"}
            </button>
          ))}
        </div>
        <span className="hidden sm:inline text-[11px] text-slate-400 font-medium">Modify your search</span>
      </div>

      {/* ── Form fields ── */}
      <div className="p-4 sm:p-5">
        {tripType === "multi-city" ? (
          <div className="space-y-3">
            <div className="flex flex-col gap-2.5">
              {multiLegs.map((leg, idx) => (
                <div key={leg.id} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
                  <div className="shrink-0 flex sm:flex-col items-center justify-center sm:pb-2.5 gap-1">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Flight</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <AirportCombobox
                      value={leg.from}
                      label="From"
                      onChange={(code) => updateMultiLeg(leg.id, { from: code })}
                      placeholder="Origin"
                      icon={<PlaneTakeoff className="h-4 w-4" />}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <AirportCombobox
                      value={leg.to}
                      label="To"
                      onChange={(code) => updateMultiLeg(leg.id, { to: code })}
                      placeholder="Destination"
                      icon={<PlaneLanding className="h-4 w-4" />}
                    />
                  </div>

                  <div className="w-full sm:w-48 shrink-0">
                    <SingleDatePicker
                      value={leg.date}
                      label="Date"
                      onChange={(d) => updateMultiLeg(leg.id, { date: d })}
                    />
                  </div>

                  {idx >= 2 && (
                    <div className="shrink-0 pb-0.5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeMultiLeg(leg.id)}
                        className="h-11 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove flight"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              {multiLegs.length < 5 && (
                <button
                  type="button"
                  onClick={addMultiLeg}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-primary/40 text-primary text-xs font-bold hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add another flight
                </button>
              )}

              <div className="flex items-center gap-3 ml-auto">
                <Button
                  type="button"
                  onClick={handleSearch}
                  disabled={!multiLegs.every((l) => l.from && l.to && l.date)}
                  className="h-11 px-6 rounded-xl text-sm font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 cursor-pointer"
                >
                  <Search className="h-4 w-4 shrink-0" />
                  <span>Search Flights</span>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:items-end gap-3">
            {/* ── From & To + Swap ── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 sm:gap-3 flex-1 min-w-0">
              <AirportCombobox
                value={fromCode}
                label="From"
                onChange={(code, lbl) => { setFromCode(code); setFromLabel(lbl); }}
                placeholder="City or airport"
                icon={<PlaneTakeoff className="h-4 w-4" />}
                minWidth="0"
              />

              {/* Swap button */}
              <div className="shrink-0 flex justify-center pb-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setFromCode(toCode); setFromLabel(toLabel);
                    setToCode(fromCode); setToLabel(fromLabel);
                  }}
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-95"
                  title="Swap airports"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </button>
              </div>

              <AirportCombobox
                value={toCode}
                label="To"
                onChange={(code, lbl) => { setToCode(code); setToLabel(lbl); }}
                placeholder="City or airport"
                icon={<PlaneLanding className="h-4 w-4" />}
                minWidth="0"
              />
            </div>

            {/* ── Date & Passengers ── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 flex-1 min-w-0">
              <DateRangePicker
                dept={dept}
                ret={ret}
                isRound={isRound}
                onDeptChange={setDept}
                onRetChange={setRet}
              />

              <div className="relative shrink-0 w-full sm:w-auto">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Passengers</p>
                <button
                  data-pax-trigger
                  type="button"
                  onClick={openPax}
                  className={`w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2.5 h-11 px-3.5 rounded-xl border bg-white transition-all text-sm font-medium text-slate-700
                    ${paxOpen ? "border-primary ring-2 ring-primary/15 shadow-sm" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div className="flex items-center gap-2">
                    <Users className={`h-4 w-4 transition-colors ${paxOpen ? "text-primary" : "text-slate-400"}`} />
                    <span className="font-semibold text-slate-800">{passengers}</span>
                    <span className="text-slate-500">{passengers === 1 ? "Adult" : "Adults"}</span>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ml-1 ${paxOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {/* ── Search button ── */}
            <div className="shrink-0 pt-2 lg:pt-0 w-full lg:w-auto">
              <Button
                type="button"
                onClick={handleSearch}
                disabled={!canSearch}
                className="w-full lg:w-auto h-12 sm:h-11 px-6 rounded-xl text-sm font-bold gap-2 shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Search className="h-4 w-4" />
                <span>Search flights</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* ── Passengers portal dropdown (shared by full + compact forms) ── */}
    {paxOpen && paxCoords && createPortal(
      <div
        id="pax-portal"
        className="fixed z-[9999] bg-white rounded-xl border border-slate-200 shadow-2xl p-4 min-w-[200px]"
        style={{ top: paxCoords.top, left: paxCoords.left }}
      >
        <p className="text-xs font-semibold text-slate-700 mb-3">Passengers</p>
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-slate-800">Adults</p>
            <p className="text-[11px] text-slate-400">Age 12+</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={() => setPassengers(p => Math.max(1, p - 1))}
              disabled={passengers <= 1}
              className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-40">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="text-sm font-bold text-slate-800 w-5 text-center tabular-nums">{passengers}</span>
            <button type="button" onClick={() => setPassengers(p => Math.min(9, p + 1))}
              disabled={passengers >= 9}
              className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-40">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <button type="button" onClick={() => setPaxOpen(false)}
          className="mt-3 w-full h-8 rounded-lg bg-primary/8 text-primary text-xs font-semibold hover:bg-primary/15 transition-colors">
          Done
        </button>
      </div>,
      document.body
    )}
    </>
  );
}

// ─── Sort tab bar ─────────────────────────────────────────────────────────────

type SortKey = "best" | "cheapest" | "quickest";
type OtherSort = "dep_asc" | "dep_desc" | "arr_asc" | "arr_desc" | "price_desc";

const OTHER_SORT_OPTIONS: { label: string; value: OtherSort }[] = [
  { label: "Earliest take-off", value: "dep_asc"   },
  { label: "Latest take-off",   value: "dep_desc"  },
  { label: "Earliest landing",  value: "arr_asc"   },
  { label: "Latest landing",    value: "arr_desc"  },
  { label: "Highest price",     value: "price_desc" },
];

const COUNTRY_CODE_TO_NAMES: Record<string, string[]> = {
  IN: ["India"],
  AE: ["United Arab Emirates", "UAE"],
  QA: ["Qatar"],
  TR: ["Turkey", "Türkiye"],
  SA: ["Saudi Arabia"],
  PK: ["Pakistan"],
  EG: ["Egypt"],
  OM: ["Oman"],
};

function SortTabBar({
  offers, carriers, sortKey, onSort,
}: {
  offers: FlightOffer[];
  carriers: Record<string, string>;
  sortKey: SortKey | OtherSort;
  onSort: (key: SortKey | OtherSort) => void;
}) {
  const { formatPrice } = useCurrency();
  const [dropOpen, setDropOpen] = useState(false);

  const cheapest = useMemo(() => {
    if (!offers.length) return null;
    const o = offers.reduce((a, b) => parseFloat(a.price.total) < parseFloat(b.price.total) ? a : b);
    return { price: formatPrice(parseFloat(o.price.total)), dur: minsToLabel(totalMins(o)) };
  }, [offers, formatPrice]);

  const quickest = useMemo(() => {
    if (!offers.length) return null;
    const o = offers.reduce((a, b) => totalMins(a) < totalMins(b) ? a : b);
    return { price: formatPrice(parseFloat(o.price.total)), dur: minsToLabel(totalMins(o)) };
  }, [offers, formatPrice]);

  const best = useMemo(() => {
    if (!offers.length) return null;
    const score = (o: FlightOffer) => parseFloat(o.price.total) * 0.6 + totalMins(o) * 0.4;
    const o = offers.reduce((a, b) => score(a) < score(b) ? a : b);
    return { price: formatPrice(parseFloat(o.price.total)), dur: minsToLabel(totalMins(o)) };
  }, [offers, formatPrice]);

  const TABS: { key: SortKey; label: string; stats: { price: string; dur: string } | null }[] = [
    { key: "cheapest", label: "Cheapest", stats: cheapest },
    { key: "best",     label: "Best",     stats: best     },
    { key: "quickest", label: "Quickest", stats: quickest },
  ];

  const isOther = !(["cheapest", "best", "quickest"] as string[]).includes(sortKey);
  const otherLabel = OTHER_SORT_OPTIONS.find(o => o.value === sortKey)?.label;

  return (
    <div className="relative flex items-stretch bg-card rounded-2xl border border-border shadow-card mb-4 z-20 overflow-visible">
      {TABS.map((tab, i) => {
        const active = sortKey === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSort(tab.key)}
            className={`relative flex-1 flex flex-col items-center justify-center py-2 sm:py-3 px-1 sm:px-2 text-center transition-colors border-b-2 ${
              i === 0 ? "rounded-l-2xl" : ""
            } ${
              active
                ? "border-primary bg-primary/5"
                : "border-transparent hover:bg-muted/50"
            } ${i > 0 ? "border-l border-l-border" : ""}`}
          >
            <span className={`text-[11px] sm:text-[13px] font-semibold whitespace-nowrap leading-tight ${active ? "text-primary" : "text-foreground"}`}>
              {tab.label}
            </span>
            {tab.stats ? (
              <span className={`text-[10px] sm:text-xs font-medium mt-0.5 whitespace-nowrap leading-tight ${active ? "text-primary" : "text-muted-foreground"}`}>
                <span className="font-semibold">{tab.stats.price}</span> · {tab.stats.dur}
              </span>
            ) : (
              <span className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 font-medium leading-tight">—</span>
            )}
          </button>
        );
      })}

      {/* Other sort dropdown */}
      <div className="relative border-l border-border rounded-r-2xl">
        <button
          type="button"
          onClick={() => setDropOpen((v) => !v)}
          className={`h-full flex flex-col items-center justify-center py-2 sm:py-3 px-2 sm:px-4 min-w-[70px] sm:min-w-[100px] transition-colors border-b-2 rounded-r-2xl ${
            isOther
              ? "border-primary bg-primary/5 text-primary"
              : "border-transparent text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <span className={`flex items-center gap-1 text-[11px] sm:text-[13px] font-semibold whitespace-nowrap leading-tight ${isOther ? "text-primary" : "text-foreground"}`}>
            {isOther ? "Sorted" : "Other sort"}
            <ChevronDown className={`h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform ${dropOpen ? "rotate-180 text-primary" : "text-muted-foreground"}`} />
          </span>
          <span className={`text-[10px] sm:text-xs font-medium mt-0.5 whitespace-nowrap max-w-[70px] sm:max-w-[100px] truncate leading-tight ${isOther ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            {isOther && otherLabel ? otherLabel : "Times & Price"}
          </span>
        </button>

        {dropOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setDropOpen(false)} />

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-56 sm:w-60 bg-popover text-popover-foreground rounded-2xl shadow-2xl border border-border z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Departure Time
              </div>
              {(["dep_asc", "dep_desc"] as OtherSort[]).map((val) => {
                const opt = OTHER_SORT_OPTIONS.find((o) => o.value === val)!;
                const isSelected = sortKey === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      onSort(val);
                      setDropOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary font-bold"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <span className="text-primary font-bold">✓</span>}
                  </button>
                );
              })}

              <div className="h-px bg-border my-1" />

              <div className="px-3 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Arrival Time
              </div>
              {(["arr_asc", "arr_desc"] as OtherSort[]).map((val) => {
                const opt = OTHER_SORT_OPTIONS.find((o) => o.value === val)!;
                const isSelected = sortKey === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      onSort(val);
                      setDropOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary font-bold"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <span className="text-primary font-bold">✓</span>}
                  </button>
                );
              })}

              <div className="h-px bg-border my-1" />

              <div className="px-3 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Price Sorting
              </div>
              <button
                type="button"
                onClick={() => {
                  onSort("price_desc");
                  setDropOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                  sortKey === "price_desc"
                    ? "bg-primary/10 text-primary font-bold"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <span>Highest price</span>
                {sortKey === "price_desc" && <span className="text-primary font-bold">✓</span>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Airline logo with fallback ─────────────────────────────────────────────

const LOCAL_LOGOS: Record<string, string> = {
  "9P": "/airlines/9P.jpg",
  PF:   "/airlines/PF.png",
};

function AirlineLogo({ code }: { code: string }) {
  const urls = [
    LOCAL_LOGOS[code],
    `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${code}.svg`,
    AIRLINE_LOGO_FALLBACKS[code],
  ].filter(Boolean) as string[];

  const [idx, setIdx]       = useState(0);
  const [failed, setFailed] = useState(false);

  const name     = AIRLINE_NAMES[code] ?? code;
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  function handleError() {
    if (idx + 1 < urls.length) setIdx(idx + 1);
    else setFailed(true);
  }

  if (failed) {
    return (
      <div className="h-7 w-12 sm:h-9 sm:w-20 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
        <span className="text-xs sm:text-sm font-bold text-primary tracking-wide">{initials}</span>
      </div>
    );
  }

  return (
    <div className="h-7 w-14 sm:h-9 sm:w-20 bg-white flex items-center justify-center shrink-0 overflow-hidden px-1">
      <img src={urls[idx]} alt={name} className="h-6 sm:h-8 w-full object-contain" onError={handleError} />
    </div>
  );
}

// ─── Flight Card ──────────────────────────────────────────────────────────────

function LegRow({
  leg, legIndex, totalLegs, carriers,
}: {
  leg: FlightOffer["itineraries"][0];
  legIndex: number;
  totalLegs: number;
  carriers: Record<string, string>;
}) {
  const dep     = leg.segments[0];
  const arr     = leg.segments[leg.segments.length - 1];
  const stops   = leg.segments.length - 1;
  const airline = carriers[dep.carrierCode] ?? AIRLINE_NAMES[dep.carrierCode] ?? dep.carrierCode;
  const isMulti = totalLegs > 2;
  const label   = isMulti
    ? `Flight ${legIndex + 1} · ${dep.departure.iataCode} → ${arr.arrival.iataCode}`
    : totalLegs === 1
    ? "Outbound"
    : legIndex === 0
    ? "Outbound"
    : "Inbound";

  // Overnight: arrival on different calendar day than departure
  const depDay = new Date(dep.departure.at).toDateString();
  const arrDay = new Date(arr.arrival.at).toDateString();
  const nightOffset = Math.round(
    (new Date(arr.arrival.at).getTime() - new Date(dep.departure.at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOvernight = arrDay !== depDay;

  // Layover durations between segments
  const layovers = leg.segments.slice(0, -1).map((seg, i) => {
    const nextSeg = leg.segments[i + 1];
    const layoverMins = Math.round(
      (new Date(nextSeg.departure.at).getTime() - new Date(seg.arrival.at).getTime()) / 60000
    );
    return { code: seg.arrival.iataCode, mins: layoverMins };
  });

  return (
    <div className={`relative ${legIndex > 0 ? "mt-1" : ""}`}>
      {/* Leg header: "Fri 18 Sept · Outbound" with pushpin */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-[11px] sm:text-xs font-semibold text-slate-400 tracking-wide">
          <span className="text-slate-500">{formatDate(dep.departure.at)}</span>
          <span className="mx-1.5 text-slate-300">·</span>
          <span className="capitalize">{label}</span>
        </p>
        <span className="text-primary text-xs opacity-60">📌</span>
      </div>

      {/* Flight Main Row */}
      <div className="flex items-start justify-between gap-3 sm:gap-6">

        {/* Departure block */}
        <div className="shrink-0 text-left min-w-[55px] sm:min-w-[70px]">
          <p className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none tabular-nums">
            {formatTime(dep.departure.at)}
          </p>
          <p className="text-xs font-semibold text-slate-500 tracking-wider mt-1">
            {dep.departure.iataCode}
          </p>
        </div>

        {/* Center: Duration + Airline + Path */}
        <div className="flex-1 flex flex-col items-center justify-center px-1 min-w-0">

          {/* Duration & Logo Row */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] sm:text-xs font-semibold whitespace-nowrap tabular-nums">
              {parseDuration(leg.duration)}
            </span>
            <div className="h-5 w-7 sm:w-9 flex items-center justify-center shrink-0">
              <AirlineLogo code={dep.carrierCode} />
            </div>
          </div>

          {/* Visual Flight Path */}
          <div className="w-full flex items-center px-0.5">
            <div className="h-[6px] w-[6px] rounded-full border-2 border-slate-300 bg-white shrink-0" />
            <div className="flex-1 h-[1.5px] bg-slate-200 relative">
              {stops > 0 && layovers.map((lv, idx) => (
                <div
                  key={idx}
                  className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white"
                  style={{ left: `${((idx + 1) / (stops + 1)) * 100}%`, transform: `translate(-50%, -50%)` }}
                  title={`${lv.code} (${minsToLabel(lv.mins)})`}
                />
              ))}
            </div>
            <div className="h-[6px] w-[6px] rounded-full border-2 border-slate-300 bg-white shrink-0" />
          </div>

          {/* Direct or Stops Label */}
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-1.5">
            {stops === 0
              ? "Direct"
              : layovers.length > 0
                ? `${stops} stop · ${layovers.map(l => l.code).join(", ")}`
                : `${stops} stop`
            }
          </p>
        </div>

        {/* Arrival block */}
        <div className="shrink-0 text-right min-w-[55px] sm:min-w-[70px]">
          <div className="flex items-start justify-end gap-0.5">
            <p className={`text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none tabular-nums ${isOvernight ? "border-b border-dashed border-slate-300 pb-0.5" : ""}`}>
              {formatTime(arr.arrival.at)}
            </p>
            {isOvernight && (
              <span className="text-[10px] font-bold text-primary leading-none mt-0.5">
                +{nightOffset}
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-500 tracking-wider mt-1">
            {arr.arrival.iataCode}
          </p>
        </div>

      </div>

      {/* Layover info for multi-stop */}
      {stops > 0 && (
        <div className="flex items-center gap-2 mt-2 ml-[55px] sm:ml-[70px]">
          {layovers.map((lv, idx) => (
            <span key={idx} className="inline-flex items-center text-[10px] text-slate-400 font-medium">
              <span className="h-1 w-1 rounded-full bg-amber-400 mr-1" />
              {minsToLabel(lv.mins)} in {lv.code}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}


function NightsBadge({ nights, city }: { nights: number; city: string }) {
  if (nights <= 0) return null;
  return (
    <div className="relative flex items-center justify-center my-3">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-dashed border-slate-200" />
      </div>
      <span className="relative z-10 inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 text-slate-600 text-[11px] font-normal px-3 py-1 rounded-full shadow-2xs">
        {nights} nights in {city}
      </span>
    </div>
  );
}

// ─── Baggage Popover Content ──────────────────────────────────────────────────

function BaggagePopoverContent({ offer }: { offer: FlightOffer }) {
  const baggage = offer.baggageAllowance;
  const qty     = baggage?.quantity ?? 0;
  const weight  = baggage?.weight;
  const unit    = (baggage?.weightUnit ?? "KG").toUpperCase();
  
  const checkedIncluded = qty > 0 || (weight ?? 0) > 0;
  const checkedDetail = checkedIncluded
    ? (weight ? `${qty > 0 ? `${qty}× ` : ""}${weight} ${unit}` : `${qty} bag${qty > 1 ? "s" : ""}`)
    : null;

  const ITEMS = [
    { d: "M20.583 2.25a.806.806 0 0 1 1.167 0 .806.806 0 0 1 0 1.167l-4.907 4.906h.008l-1.149 1.141L3.417 21.75c-.25.333-.834.333-1.167 0a.806.806 0 0 1 0-1.167l1.809-1.808c-.177-.327-.259-.692-.259-1.129 0-.692.353-7.091.42-7.448.093-.468.285-.828.641-1.18.28-.285.656-.517 1-.62.089-.029.521-.06.97-.077l.056-.002c.56-.017.75-.022.849-.12a.4.4 0 0 0 .085-.147c.053-.39.31-1.078.59-1.487.187-.268.576-.673.856-.88.408-.309.856-.509 1.429-.637.18-.04.432-.056.856-.044 1.113.031 1.72.108 2.225.36.7.356 1.309.977 1.649 1.685q.059.121.108.25zm-8.753 8.754H7c-.417 0-.667.25-.667.667 0 .416.334.666.667.666h.137c.167 0 .334.167.334.417v.833c0 .417.124.667.666.667.582 0 .667-.254.667-.667.006-.587 0-.833 0-.833 0-.25.167-.417.417-.417h1.275zM9.364 8.078q.035.038.07.071l.048.05c.085.108.53.105 1.363.1l.556-.002h.809q.44.001.79.007c.604.007 1.001.012 1.158-.045a2 2 0 0 1-.048-.165c-.163-.663-.694-1.65-2.558-1.65-.996 0-1.873.597-2.17 1.57zM15.785 11.004l2.421-2.405c.197.114.386.258.544.419.356.352.552.716.64 1.18.064.36.42 6.788.42 7.448 0 .693-.204 1.201-.66 1.662-.324.324-.62.504-1.028.616-.255.07-.402.08-1.311.08H15.79V20H14.5l.001.004H9.123V20H7.832v.004H6.723l7.72-7.667H16.5c.334 0 .667-.25.667-.666a.657.657 0 0 0-.667-.667z", label: "Personal item", detail: "Under-seat bag", included: true },
    { d: "M14.91 9.083c-.25 0-.417-.166-.417-.416v-4.5c0-.25.167-.417.417-.417.583 0 .833-.417.833-.917S15.493 2 14.91 2H9.077c-.584 0-.834.417-.834.833 0 .417.25.834.75.834q.5.125.5.5v4.416c0 .25-.166.417-.416.417h-.834c-1.166.083-2.083 1-2.083 2.083v8c0 1 .667 1.834 1.667 2 .083 0 .166.167.166.25 0 .5.334.667.834.667s.833-.167.833-.667a.18.18 0 0 1 .167-.166h4.166a.18.18 0 0 1 .167.166c0 .5.333.667.833.667s.834-.167.834-.667c0-.083.25-.25.333-.25 1-.166 1.667-1.083 1.667-2v-8c0-1.083-.75-2-1.917-2zm0 4.25h-3.5c-.25 0-.417.167-.417.417v.833c0 .334-.25.667-.666.667s-.667-.25-.667-.667v-.833c0-.25-.167-.417-.333-.417h-.25a.657.657 0 0 1-.667-.666c0-.417.25-.667.667-.667h5.833c.333 0 .667.25.667.667a.657.657 0 0 1-.667.666m-2.5-9.666c.25 0 .417.166.417.416V8.58c0 .25-.167.417-.417.417h-.833c-.25 0-.417-.167-.417-.417V4.083c0-.25.167-.416.417-.416z", label: "Cabin bag", detail: "7-10 kg carry-on", included: true },
    { d: "M15.91 5.333c-1.417 0-1.417-.166-1.417-.416v-.75c0-.25.167-.417.417-.417.583 0 .833-.417.833-.917S15.494 2 14.91 2H9.077c-.584 0-.834.417-.834.833 0 .417.25.834.75.834q.5.125.5.5v.666c0 .25-.166.417-.416.417H6.243c-1.166.083-2.083 1-2.083 2.083v11.75c0 1 .667 1.834 1.667 2 .083 0 .166.167.166.25 0 .5.334.667.834.667s.833-.167.833-.667a.18.18 0 0 1 .167-.166h8.166a.18.18 0 0 1 .167.166c0 .5.334.667.834.667s.833-.167.833-.667c0-.083.25-.25.333-.25 1-.166 1.667-1.083 1.667-2V7.333c0-1.083-.75-2-1.917-2zM15.6 8.75a.75.75 0 0 1 1.5 0v8.5a.75.75 0 0 1-1.5 0zm-4.3 0a.75.75 0 0 1 1.5 0v8.5a.75.75 0 0 1-1.5 0zM7.75 8a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-1.5 0v-8.5A.75.75 0 0 1 7.75 8m3.41-3.917c0-.25.167-.416.417-.416h.833c.25 0 .417.166.417.416v.747c0 .25-.167.417-.417.417h-.833c-.25 0-.417-.167-.417-.417z", label: "Checked bag", detail: checkedDetail, included: checkedIncluded },
  ];

  return (
    <div className="p-4 w-[330px] sm:w-[350px]">
      <p className="text-sm font-bold text-slate-900">Baggage breakdown</p>
      <p className="text-[11px] text-slate-400 mt-0.5 mb-3.5">Included per passenger &bull; based on airline fare rules</p>
      <div className="space-y-3">
        {ITEMS.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <svg className="h-4 w-4 shrink-0 fill-current text-slate-500" viewBox="0 0 24 24"><path d={item.d} /></svg>
              <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">{item.label}</span>
              {item.detail && <span className="text-[11px] text-slate-400 whitespace-nowrap">({item.detail})</span>}
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-auto whitespace-nowrap">
              {item.included ? (
                <>
                  <svg className="h-3.5 w-3.5 shrink-0 fill-current text-emerald-500" viewBox="0 0 24 24"><path d="M6.445 12.668a.9.9 0 1 0-1.302 1.242l3.572 3.745a.9.9 0 0 0 1.335-.036l8.591-10.037a.9.9 0 0 0-1.367-1.17l-7.598 8.876a.48.48 0 0 1-.712.02z" /></svg>
                  <span className="text-xs text-emerald-700 font-semibold">Included</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5 shrink-0 fill-current text-slate-400" viewBox="0 0 24 24"><path d="M17.656 6.333a.9.9 0 0 1 0 1.273l-4.046 4.052a.48.48 0 0 0 0 .678l4.047 4.053a.9.9 0 0 1 .08 1.18l-.081.092a.9.9 0 0 1-1.273 0l-4.044-4.05a.48.48 0 0 0-.68 0l-4.042 4.05a.9.9 0 1 1-1.274-1.273l4.047-4.052a.48.48 0 0 0 0-.678L6.343 7.606a.9.9 0 0 1-.08-1.18l.081-.093a.9.9 0 0 1 1.273.001l4.043 4.049a.48.48 0 0 0 .679 0l4.044-4.049a.9.9 0 0 1 1.273 0" /></svg>
                  <span className="text-xs text-slate-400 font-medium">Not included</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlightCard({
  offer, carriers, onSelect,
}: {
  offer: FlightOffer;
  carriers: Record<string, string>;
  onSelect: (offer: FlightOffer) => void;
}) {
  const { formatPrice } = useCurrency();
  const [saved, setSaved]         = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const price  = parseFloat(offer.price.total);

  const checkedBagQty = offer.baggageAllowance?.quantity ?? (offer.baggageAllowance?.weight ? 1 : 0);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/itinerary/${offer.id}`
    : `https://amdglobal.com/itinerary/${offer.id}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 group/card">

      {/* ── Two-column wrapper: Segments left, Price/Actions right ── */}
      <div className="flex flex-col md:flex-row">

        {/* ══ LEFT COLUMN: Flight segments ══ */}
        <div className="flex-1 p-4 sm:p-5 md:border-r md:border-slate-100">
          {offer.itineraries.map((leg, i) => {
            const prevLeg = i > 0 ? offer.itineraries[i - 1] : null;
            let nightsBetween = 0;
            let destCity = "";
            if (prevLeg) {
              const arrTime = new Date(prevLeg.segments[prevLeg.segments.length - 1].arrival.at).getTime();
              const depTime = new Date(leg.segments[0].departure.at).getTime();
              nightsBetween = Math.max(1, Math.round((depTime - arrTime) / (1000 * 60 * 60 * 24)));
              destCity = AIRLINE_NAMES[prevLeg.segments[prevLeg.segments.length - 1].arrival.iataCode] ?? prevLeg.segments[prevLeg.segments.length - 1].arrival.iataCode;
            }

            return (
              <Fragment key={i}>
                {nightsBetween > 0 && (
                  <NightsBadge nights={nightsBetween} city={destCity} />
                )}
                <LegRow leg={leg} legIndex={i} totalLegs={offer.itineraries.length} carriers={carriers} />
              </Fragment>
            );
          })}

          {/* ── Bottom: Baggage pills ── */}
          <div className="flex items-center pt-3 mt-3 border-t border-dashed border-slate-100">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 text-xs text-slate-600 hover:text-primary font-medium transition-colors cursor-pointer"
                >
                  {/* Personal / Cabin item */}
                  <span className="flex items-center gap-0.5">
                    <span className="font-semibold">1</span>
                    <svg className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.583 2.25a.806.806 0 0 1 1.167 0 .806.806 0 0 1 0 1.167l-4.907 4.906h.008l-1.149 1.141L3.417 21.75c-.25.333-.834.333-1.167 0a.806.806 0 0 1 0-1.167l1.809-1.808c-.177-.327-.259-.692-.259-1.129 0-.692.353-7.091.42-7.448.093-.468.285-.828.641-1.18.28-.285.656-.517 1-.62.089-.029.521-.06.97-.077l.056-.002c.56-.017.75-.022.849-.12a.4.4 0 0 0 .085-.147c.053-.39.31-1.078.59-1.487.187-.268.576-.673.856-.88.408-.309.856-.509 1.429-.637.18-.04.432-.056.856-.044 1.113.031 1.72.108 2.225.36.7.356 1.309.977 1.649 1.685q.059.121.108.25zm-8.753 8.754H7c-.417 0-.667.25-.667.667 0 .416.334.666.667.666h.137c.167 0 .334.167.334.417v.833c0 .417.124.667.666.667.582 0 .667-.254.667-.667.006-.587 0-.833 0-.833 0-.25.167-.417.417-.417h1.275z" />
                    </svg>
                  </span>

                  {/* Checked bag */}
                  <span className="flex items-center gap-0.5">
                    <span className="font-semibold">{checkedBagQty}</span>
                    <svg className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.91 5.333c-1.417 0-1.417-.166-1.417-.416v-.75c0-.25.167-.417.417-.417.583 0 .833-.417.833-.917S15.494 2 14.91 2H9.077c-.584 0-.834.417-.834.833 0 .417.25.834.75.834q.5.125.5.5v.666c0 .25-.166.417-.416.417H6.243c-1.166.083-2.083 1-2.083 2.083v11.75c0 1 .667 1.834 1.667 2 .083 0 .166.167.166.25 0 .5.334.667.834.667s.833-.167.833-.667a.18.18 0 0 1 .167-.166h8.166a.18.18 0 0 1 .167.166c0 .5.334.667.834.667s.833-.167.833-.667c0-.083.25-.25.333-.25 1-.166 1.667-1.083 1.667-2V7.333c0-1.083-.75-2-1.917-2z" />
                    </svg>
                  </span>

                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" onClick={(e) => e.stopPropagation()}>
                <BaggagePopoverContent offer={offer} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* ══ RIGHT COLUMN: Share/Heart, Price, Select ══ */}
        <div className="flex flex-col items-stretch justify-between p-4 sm:p-5 md:w-[180px] lg:w-[200px] md:shrink-0 border-t md:border-t-0 border-slate-100 gap-3 md:gap-0">

          {/* Share + Heart (top-right on desktop, left on mobile) */}
          <div className="flex items-center justify-between md:justify-end w-full md:mb-auto">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShareOpen(true); }}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Share flight"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSaved((v) => !v); }}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                title="Save flight"
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    saved ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-slate-600"
                  }`}
                />
              </button>
            </div>

            {/* Mobile price */}
            <div className="md:hidden text-right">
              <p className="text-xl font-bold text-slate-900 tracking-tight leading-none tabular-nums">
                {formatPrice(price)}
              </p>
            </div>
          </div>

          {/* Price (center on desktop) */}
          <div className="hidden md:block text-center md:my-auto w-full">
            <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-none tabular-nums text-center">
              {formatPrice(price)}
            </p>
          </div>

          {/* Select Button (100% width on desktop and mobile) */}
          <div className="w-full md:mt-auto">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSelect(offer); }}
              className="w-full flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold tracking-wide transition-all shadow-sm shadow-primary/20 active:scale-[0.97] cursor-pointer"
            >
              <span>Select</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

      {shareOpen && (
        <ShareItineraryModal
          url={shareUrl}
          title={`Flight from ${offer.itineraries[0].segments[0].departure.iataCode} to ${offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.iataCode}`}
          onClose={(e?: React.MouseEvent) => { e?.stopPropagation(); setShareOpen(false); }}
        />
      )}

    </div>
  );
}


// ─── Page ─────────────────────────────────────────────────────────────────────

function SearchContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  // Memoize all search params as a stable string to prevent infinite re-fetch
  const from        = searchParams.get("from") ?? "";
  const to          = searchParams.get("to") ?? "";
  const dept        = searchParams.get("dept") ?? "";
  const ret         = searchParams.get("ret") ?? undefined;
  const passengers  = parseInt(searchParams.get("passengers") ?? "1", 10);
  const travelClass = (searchParams.get("class") ?? "ECONOMY") as TravelClass;
  const tripType    = (searchParams.get("tripType") ?? "one-way") as "one-way" | "round-trip" | "multi-city";
  const currency    = "USD" as Currency;

  // Memoize parsedLegs so its reference is stable across renders
  const parsedLegs = useMemo(() => {
    const legsParam = searchParams.get("legs");
    if (!legsParam) return null;
    try {
      const raw = JSON.parse(legsParam);
      return (raw as { from: string; to: string; date?: string; dept?: string; departureDate?: string }[]).map((l) => ({
        from: l.from,
        to:   l.to,
        date: l.date ?? l.dept ?? l.departureDate ?? "",
      }));
    } catch { return null; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("legs")]);

  const [results, setResults]     = useState<FlightOffer[]>([]);
  const [carriers, setCarriers]   = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [failedLegs, setFailedLegs] = useState<string[]>([]);
  const [sortKey, setSortKey]     = useState<SortKey | OtherSort>("best");
  const [displayCount, setDisplayCount] = useState(30);
  const initialBags = parseInt(searchParams.get("bags") ?? searchParams.get("checkedBags") ?? "0", 10);
  const [filters, setFilters]           = useState<FilterState>(() => ({
    ...getDefaultFilters(9999),
    checkedBags: initialBags,
  }));
  const [selectedFlight, setSelectedFlight] = useState<FlightOffer | null>(null);
  const [fareTierOffer, setFareTierOffer]   = useState<FlightOffer | null>(null);

  // Reset display count when results or filters change
  useEffect(() => {
    setDisplayCount(30);
  }, [filters, sortKey, results.length]);

  function handleSelectFlight(offer: FlightOffer) {
    setFareTierOffer(offer);
  }

  function handleFareTierConfirm(tier: FareTier, finalPrice: number, upgradedOffer?: FlightOffer) {
    if (!fareTierOffer) return;
    const paxCount = parseInt(new URLSearchParams(window.location.search).get("passengers") ?? "1", 10);
    const chosenOffer = upgradedOffer || fareTierOffer;
    sessionStorage.setItem("amd_checkout_offer", JSON.stringify({
      offer:         chosenOffer,
      carriers,
      fareClass:     tier.label,
      selectedPrice: finalPrice,
      passengers:    paxCount,
    }));
    setFareTierOffer(null);
    router.push("/checkout");
  }

  function applySort(arr: FlightOffer[], key: SortKey | OtherSort, cars: Record<string, string>): FlightOffer[] {
    const a = [...arr];
    switch (key) {
      case "cheapest":
        return a.sort((x, y) => parseFloat(x.price.total) - parseFloat(y.price.total));
      case "quickest":
        return a.sort((x, y) => totalMins(x) - totalMins(y));
      case "best": {
        const prices    = a.map(o => parseFloat(o.price.total));
        const durations = a.map(o => totalMins(o));
        const minP = Math.min(...prices),  maxP = Math.max(...prices);
        const minD = Math.min(...durations), maxD = Math.max(...durations);
        const rP = maxP - minP || 1, rD = maxD - minD || 1;
        return a.sort((x, y) => {
          const sX = ((parseFloat(x.price.total) - minP) / rP) * 0.6 + ((totalMins(x) - minD) / rD) * 0.4;
          const sY = ((parseFloat(y.price.total) - minP) / rP) * 0.6 + ((totalMins(y) - minD) / rD) * 0.4;
          return sX - sY;
        });
      }
      case "price_desc":
        return a.sort((x, y) => parseFloat(y.price.total) - parseFloat(x.price.total));
      case "dep_asc":
        return a.sort((x, y) => new Date(x.itineraries[0].segments[0].departure.at).getTime() - new Date(y.itineraries[0].segments[0].departure.at).getTime());
      case "dep_desc":
        return a.sort((x, y) => new Date(y.itineraries[0].segments[0].departure.at).getTime() - new Date(x.itineraries[0].segments[0].departure.at).getTime());
      case "arr_asc": {
        return a.sort((x, y) => {
          const lx = x.itineraries[0].segments, ly = y.itineraries[0].segments;
          return new Date(lx[lx.length-1].arrival.at).getTime() - new Date(ly[ly.length-1].arrival.at).getTime();
        });
      }
      case "arr_desc": {
        return a.sort((x, y) => {
          const lx = x.itineraries[0].segments, ly = y.itineraries[0].segments;
          return new Date(ly[ly.length-1].arrival.at).getTime() - new Date(lx[lx.length-1].arrival.at).getTime();
        });
      }
      default: return a;
    }
  }

  const [sortedResults, setSortedResults] = useState<FlightOffer[]>([]);

  // Derive filtered list from sorted results
  const filteredResults = useMemo(() => {
    return sortedResults.filter((offer) => {

      const price = parseFloat(offer.price.total);
      const outbound = offer.itineraries[0];
      const ret      = offer.itineraries[1];

      // Stops
      const maxStops = offer.itineraries.reduce((max, it) => Math.max(max, it.segments.length - 1), 0);
      if (filters.stops === "direct" && maxStops > 0) return false;
      if (filters.stops === "1stop"  && maxStops > 1) return false;
      if (filters.stops === "2stop"  && maxStops > 2) return false;

      // Price
      if (price < filters.minPrice || price > filters.maxPrice) return false;

      // Airlines
      if (filters.selectedAirlines.size > 0) {
        if (filters.selectedAirlines.has("__NONE__")) return false;
        const offerCarriers = offer.validatingAirlineCodes ?? [outbound.segments[0].carrierCode];
        const hasMatch = offerCarriers.some((c) => filters.selectedAirlines.has(c));
        if (!hasMatch) return false;
      }

      // Overnight stopovers (prohibit if user unchecks allowOvernightStop)
      if (!filters.allowOvernightStop) {
        const hasOvernightStop = offer.itineraries.some((itin) => {
          return itin.segments.slice(0, -1).some((seg, idx) => {
            const nextSeg = itin.segments[idx + 1];
            const arrDate = new Date(seg.arrival.at).toDateString();
            const nextDepDate = new Date(nextSeg.departure.at).toDateString();
            return arrDate !== nextDepDate;
          });
        });
        if (hasOvernightStop) return false;
      }

      // Outbound departure time
      const outDepAt  = new Date(outbound.segments[0].departure.at);
      const outDepMin = outDepAt.getHours() * 60 + outDepAt.getMinutes();
      if (outDepMin < filters.outDepFrom || outDepMin > filters.outDepTo) return false;

      // Outbound arrival time
      const outLastSeg = outbound.segments[outbound.segments.length - 1];
      const outArrAt   = new Date(outLastSeg.arrival.at);
      const outArrMin  = outArrAt.getHours() * 60 + outArrAt.getMinutes();
      if (outArrMin < filters.outArrFrom || outArrMin > filters.outArrTo) return false;

      // Return times (only if return leg exists)
      if (ret) {
        const retDepAt  = new Date(ret.segments[0].departure.at);
        const retDepMin = retDepAt.getHours() * 60 + retDepAt.getMinutes();
        if (retDepMin < filters.retDepFrom || retDepMin > filters.retDepTo) return false;

        const retLastSeg = ret.segments[ret.segments.length - 1];
        const retArrAt   = new Date(retLastSeg.arrival.at);
        const retArrMin  = retArrAt.getHours() * 60 + retArrAt.getMinutes();
        if (retArrMin < filters.retArrFrom || retArrMin > filters.retArrTo) return false;
      }

      // Total flight duration — skip for multi-city (multiple legs naturally exceed single-flight limit)
      if (offer.itineraries.length === 1) {
        const totalFlightMins = offer.itineraries.reduce((sum, it) => {
          const m = it.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
          return sum + (parseInt(m?.[1] ?? "0") * 60) + parseInt(m?.[2] ?? "0");
        }, 0);
        if (totalFlightMins > filters.maxFlightDuration) return false;
      }

      // Max layover duration (between connecting segments)
      if (filters.maxLayoverDuration < 24 * 60) {
        const exceedsLayover = offer.itineraries.some((itin) => {
          return itin.segments.slice(0, -1).some((seg, idx) => {
            const nextSeg = itin.segments[idx + 1];
            const seg1Arr = new Date(seg.arrival.at).getTime();
            const seg2Dep = new Date(nextSeg.departure.at).getTime();
            const layoverMins = Math.round((seg2Dep - seg1Arr) / 60000);
            return layoverMins > filters.maxLayoverDuration;
          });
        });
        if (exceedsLayover) return false;
      }

      // Excluded transit / layover countries
      if (filters.excludedCountries.size > 0) {
        const hasExcludedCountry = offer.itineraries.some((itin) => {
          return itin.segments.slice(0, -1).some((seg) => {
            const layoverIata = seg.arrival.iataCode;
            const country = getAirportCountry(layoverIata);
            if (!country) return false;
            for (const code of filters.excludedCountries) {
              const names = COUNTRY_CODE_TO_NAMES[code] ?? [];
              if (names.some((n) => country.toLowerCase().includes(n.toLowerCase()))) {
                return true;
              }
            }
            return false;
          });
        });
        if (hasExcludedCountry) return false;
      }

      // Days of week (outbound departure day)
      if (filters.activeDays.size > 0) {
        const depDay = new Date(outbound.segments[0].departure.at).getDay();
        if (!filters.activeDays.has(depDay)) return false;
      }

      // Baggage filter (Checked Bags)
      if (filters.checkedBags > 0) {
        const checkedQty = offer.baggageAllowance?.quantity ?? (offer.baggageAllowance?.weight ? 1 : 0);
        if (checkedQty < filters.checkedBags) return false;
      }

      // Baggage filter (Cabin Bags)
      if (filters.cabinBags > 0) {
        const cabinQty = 1; // Standard commercial flights include 1 cabin bag
        if (cabinQty < filters.cabinBags) return false;
      }

      return true;
    });
  }, [sortedResults, filters]);

  // Derive available airlines + absolute max price from raw results
  const availableAirlines = useMemo(() => {
    const seen = new Map<string, string>();
    results.forEach((o) => {
      const codes = o.validatingAirlineCodes?.length
        ? o.validatingAirlineCodes
        : [o.itineraries[0].segments[0].carrierCode];
      codes.forEach((code) => {
        if (!seen.has(code)) seen.set(code, carriers[code] ?? AIRLINE_NAMES[code] ?? code);
      });
    });
    return Array.from(seen.entries()).map(([code, name]) => ({ code, name }));
  }, [results, carriers]);

  const absoluteMaxPrice = useMemo(() => {
    if (!results.length) return 9999;
    return Math.ceil(Math.max(...results.map((o) => parseFloat(o.price.total))));
  }, [results]);

  const absoluteMinPrice = useMemo(() => {
    if (!results.length) return 0;
    return Math.floor(Math.min(...results.map((o) => parseFloat(o.price.total))));
  }, [results]);

  // Reset filters when new results arrive
  useEffect(() => {
    setFilters(getDefaultFilters(absoluteMaxPrice, absoluteMinPrice));
  }, [absoluteMaxPrice, absoluteMinPrice]);

  // Re-sort whenever sortKey changes
  useEffect(() => {
    setSortedResults(applySort(results, sortKey, carriers));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortKey, results, carriers]);

  function handleSort(key: SortKey | OtherSort) {
    setSortKey(key);
    setSortedResults(applySort(results, key, carriers));
  }

const fetchFlights = useCallback(async () => {
    const isMultiCity = tripType === "multi-city";

    if (isMultiCity) {
      if (!parsedLegs || parsedLegs.length === 0 || parsedLegs.some((l) => !l.from || !l.to || !l.date)) {
        setError("Missing multi-city search parameters. Please go back and try again.");
        setLoading(false);
        return;
      }
    } else if (!from || !to || !dept) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setResults([]);
    setSortedResults([]);
    setError(null);
    setIsSyncing(true);

    const basePayload = {
      tripType,
      origin:        isMultiCity ? parsedLegs![0].from : from,
      destination:   isMultiCity ? parsedLegs![parsedLegs!.length - 1].to : to,
      departureDate: isMultiCity ? parsedLegs![0].date : dept,
      returnDate:    ret,
      passengers,
      travelClass,
      currency,
      ...(isMultiCity && {
        legs: parsedLegs!.map((l) => ({
          origin:        l.from,
          destination:   l.to,
          departureDate: l.date,
        })),
      }),
    };

    console.log("Fetching live flights from Amadeus API...", basePayload);

    // Live Amadeus GDS Search (Skeleton displays while querying)
    try {
      const res = await fetch("/api/flights/search", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(basePayload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const errMsg = body?.error ?? `Search failed (${res.status})`;
        if (errMsg.toLowerCase().includes("hasn't returned any results") || errMsg.toLowerCase().includes("no results")) {
          setResults([]);
          setLoading(false);
          setIsSyncing(false);
          return;
        }
        throw new Error(errMsg);
      }

      const data: FlightSearchResponse & { cached?: boolean; failedLegs?: string[] } = await res.json();
      const fetched = data.data ?? [];
      setResults(fetched);
      setCarriers(data.dictionaries?.carriers ?? {});
      setFromCache(data.cached === true);
      setFailedLegs(data.failedLegs ?? []);
      setSortedResults(applySort(fetched, sortKey, data.dictionaries?.carriers ?? {}));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, dept, ret, passengers, travelClass, tripType, parsedLegs]);

  useEffect(() => {
    console.log("Search params changed, triggering fetchFlights", { from, to, dept });
    fetchFlights();
  }, [fetchFlights]);

  // Dynamic page title
  useEffect(() => {
    const origin = tripType === "multi-city" && parsedLegs
      ? parsedLegs.map(l => l.from).join(" → ") + " → " + parsedLegs[parsedLegs.length - 1].to
      : from && to ? `${from} → ${to}` : null;
    document.title = origin ? `${origin} · Flights · AMD Global` : "Flight Search · AMD Global";
    return () => { document.title = "AMD Global Travel"; };
  }, [from, to, tripType, parsedLegs]);

  // (scroll pinning removed — compact bar is always in header)

  return (
    <>
    {/* ── Header Bar — fixed at top on mobile (Kiwi navbar + search bar), centered in desktop header ── */}
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none md:h-16 flex flex-col md:flex-row md:items-center md:justify-center md:px-4 bg-white md:bg-transparent border-b border-slate-200/80 md:border-b-0 shadow-xs md:shadow-none">
      <div className="pointer-events-auto w-full md:max-w-md">
        <ModifySearchBar compact />
      </div>
    </div>

    <main className="min-h-screen bg-background pt-[115px] sm:pt-20 md:pt-16">
      {/* ── Top progress bar ── */}
      {loading ? (
        <div className="fixed top-[115px] sm:top-20 md:top-16 left-0 right-0 z-40 h-[3px] bg-slate-100 overflow-hidden">
          <div className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.8),0_0_5px_hsl(var(--primary)/0.5)] animate-[progress-fill_2.5s_ease-out_forwards]" />
        </div>
      ) : (
        <div className="fixed top-[115px] sm:top-20 md:top-16 left-0 right-0 z-40 h-[3px] bg-transparent overflow-hidden pointer-events-none">
          <div className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.8),0_0_5px_hsl(var(--primary)/0.5)] animate-[progress-complete_0.4s_ease-out_forwards]" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── 2-Column Layout ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: Filter Sidebar ── */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0">
            <FilterSidebar
              availableAirlines={availableAirlines}
              absoluteMaxPrice={absoluteMaxPrice}
              absoluteMinPrice={absoluteMinPrice}
              filters={filters}
              onChange={setFilters}
            />
          </aside>

          {/* ── Right: Sort Bar + Flight Cards ── */}
          <section className="flex-1 w-full min-w-0">

            {/* Loading */}
            {loading && (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FlightSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Search failed</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
                <button
                  onClick={fetchFlights}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
                >
                  Try again
                </button>
              </div>
            )}

            {/* No results from API */}
            {!loading && !error && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <Plane className="h-10 w-10 text-muted-foreground/40" />
                <p className="font-semibold text-foreground">No flights found</p>
                <p className="text-sm text-muted-foreground">Try different dates or a nearby airport.</p>
              </div>
            )}

            {/* Results */}
            {!loading && !error && results.length > 0 && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-sm text-muted-foreground">
                    {filteredResults.length} of {results.length} flight{results.length > 1 ? "s" : ""}
                  </p>
                  {isSyncing ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin shrink-0 text-amber-600" />
                      <span>Searching live flights...</span>
                    </span>
                  ) : fromCache ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-0.5 text-[11px] font-semibold text-secondary">
                      Instant · cached result
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                      ✓ Live Verified Flights
                    </span>
                  )}
                </div>

                {/* Failed legs warning */}
                {failedLegs.length > 0 && (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800">Some legs unavailable</p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        No flights found for: <span className="font-medium">{failedLegs.join(", ")}</span>. Results shown for available legs only.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Date price strip — hidden on mobile ── */}
                {tripType !== "multi-city" && (
                  <div className="hidden sm:block">
                    <DatePriceStrip
                      origin={from}
                      destination={to}
                      selectedDate={dept}
                      returnDate={ret}
                      passengers={passengers}
                      travelClass={travelClass === "ECONOMY" ? "1" : travelClass === "PREMIUM_ECONOMY" ? "2" : travelClass === "BUSINESS" ? "3" : "4"}
                      onDateSelect={(iso) => {
                        const p = new URLSearchParams(searchParams.toString());
                        p.set("dept", iso);
                        router.push(`/search?${p.toString()}`);
                      }}
                    />
                  </div>
                )}

                {/* Sort tab bar — responsive on all screens */}
                <div className="block mb-3">
                  <SortTabBar offers={filteredResults.length > 0 ? filteredResults : results} carriers={carriers} sortKey={sortKey} onSort={handleSort} />
                </div>

                {/* No results after filtering */}
                {filteredResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                    <Plane className="h-10 w-10 text-muted-foreground/40" />
                    <p className="font-semibold text-foreground">No flights match your filters</p>
                    <p className="text-sm text-muted-foreground">Try adjusting or resetting your filters.</p>
                    <button
                      onClick={() => setFilters(getDefaultFilters(absoluteMaxPrice, absoluteMinPrice))}
                      className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {filteredResults.slice(0, displayCount).map((offer) => (
                        <FlightCard
                          key={offer.id}
                          offer={offer}
                          carriers={carriers}
                          onSelect={handleSelectFlight}
                        />
                      ))}
                    </div>

                    {/* Show More Flights Button */}
                    {displayCount < filteredResults.length && (
                      <div className="pt-6 pb-2 flex flex-col items-center gap-2">
                        <button
                          onClick={() => setDisplayCount((prev) => Math.min(prev + 30, filteredResults.length))}
                          className="px-6 py-2.5 rounded-xl bg-card border border-border shadow-sm text-sm font-semibold text-foreground hover:bg-muted/80 transition-all flex items-center gap-2 group"
                        >
                          <span>Show More Flights (+{Math.min(30, filteredResults.length - displayCount)} more)</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:translate-y-0.5 transition-transform" />
                        </button>
                        <p className="text-xs text-muted-foreground">
                          Showing {Math.min(displayCount, filteredResults.length)} of {filteredResults.length} available flights
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>

    {/* ── Flight Details Modal ── */}
    {selectedFlight && (
      <FlightDetailsModal
        offer={selectedFlight}
        carriers={carriers}
        onClose={() => setSelectedFlight(null)}
      />
    )}

    {/* ── Fare Tier Modal ── */}
    {fareTierOffer && (
      <FareTierModal
        offer={fareTierOffer}
        carriers={carriers}
        onClose={() => setFareTierOffer(null)}
        onConfirm={handleFareTierConfirm}
      />
    )}
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container py-8"><FlightSkeleton /></div>}>
      <SearchContent />
    </Suspense>
  );
}
