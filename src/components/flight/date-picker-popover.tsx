"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { DateRange as DayPickerRange } from "react-day-picker";
import { CalendarDays, X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCurrency } from "@/context/currency-context";
import { RATES, SYMBOLS } from "@/lib/currency";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DateRange {
  departure:  Date | null;
  returnDate: Date | null;
}

interface DatePickerPopoverProps {
  value:       DateRange;
  onChange:    (range: DateRange) => void;
  isRoundTrip: boolean;
  mobileSheet?: boolean;
  error?:      boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplay(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatShort(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
}

// ─── Mock price helper ────────────────────────────────────────────────────────

function getMockPrice(date: Date): number | null {
  const seed = (date.getDate() * 37 + date.getMonth() * 13) % 100;
  if (seed > 60) return null;
  return 180 + seed * 4;
}

function getCheapestInMonth(year: number, month: number): number {
  let min = Infinity;
  const days = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const p = getMockPrice(new Date(year, month, d));
    if (p !== null && p < min) min = p;
  }
  return min;
}

// ─── Custom day cell with price indicator ────────────────────────────────────

function PricedDay({
  date,
  cheapestLeft,
  cheapestRight,
  isSelected,
  isMiddle,
  symbol,
  rate,
}: {
  date: Date;
  cheapestLeft: number;
  cheapestRight: number;
  isSelected?: boolean;
  isMiddle?: boolean;
  symbol: string;
  rate: number;
}) {
  const price     = getMockPrice(date);
  const cheapest  = Math.min(cheapestLeft, cheapestRight);
  const isCheap   = price !== null && price === cheapest;
  const converted = price !== null ? Math.round(price * rate) : null;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full select-none py-1">
      <span className={cn(
        "text-xs sm:text-sm font-semibold leading-none",
        isSelected ? "text-white font-bold" : isMiddle ? "text-slate-900 font-bold" : "text-slate-700"
      )}>
        {date.getDate()}
      </span>
      {converted !== null ? (
        <span
          className={cn(
            "text-[9px] sm:text-[10px] leading-none mt-1 transition-colors",
            isSelected
              ? "text-white/95 font-medium"
              : isMiddle
              ? "text-primary font-bold"
              : isCheap
              ? "text-emerald-600 font-bold"
              : "text-slate-400"
          )}
        >
          {symbol}{converted}
        </span>
      ) : (
        <span className="h-[9px] sm:h-[10px] mt-1" />
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DatePickerPopover({
  value, onChange, isRoundTrip, mobileSheet, error,
}: DatePickerPopoverProps) {
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const { currency } = useCurrency();
  const symbol = SYMBOLS[currency];
  const rate   = RATES[currency];

  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(value.departure ?? today);

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Derive cheapest prices for the two visible months
  const rightMonthDate = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  const cheapestLeft   = getCheapestInMonth(month.getFullYear(), month.getMonth());
  const cheapestRight  = getCheapestInMonth(rightMonthDate.getFullYear(), rightMonthDate.getMonth());

  // Convert our DateRange ↔ react-day-picker DateRange
  const selected: DayPickerRange | undefined =
    value.departure
      ? { from: value.departure, to: value.returnDate ?? undefined }
      : undefined;

  function handleSelect(range: DayPickerRange | undefined) {
    if (!range) {
      onChange({ departure: null, returnDate: null });
      return;
    }
    const dep = range.from ?? null;
    const ret = range.to   ?? null;
    onChange({ departure: dep, returnDate: isRoundTrip ? ret : null });
    // Auto-close when both dates picked (round-trip) or any date (one-way)
    if (!isRoundTrip && dep) { setOpen(false); return; }
    if (isRoundTrip && dep && ret) {
      // Small timeout for visual confirmation
      setTimeout(() => setOpen(false), 200);
    }
  }

  function clearDates() {
    onChange({ departure: null, returnDate: null });
  }

  // Quick shortcuts
  function applyShortcut(daysFromNow: number, tripDays?: number) {
    const dep = new Date();
    dep.setDate(dep.getDate() + daysFromNow);
    let ret: Date | null = null;
    if (isRoundTrip && tripDays) {
      ret = new Date(dep);
      ret.setDate(ret.getDate() + tripDays);
    }
    onChange({ departure: dep, returnDate: ret });
    setMonth(dep);
    if (!isRoundTrip || (isRoundTrip && ret)) {
      setOpen(false);
    }
  }

  // Trigger label
  const depLabel = formatDisplay(value.departure);
  const retLabel = formatDisplay(value.returnDate);
  const triggerText = depLabel
    ? isRoundTrip
      ? `${depLabel}${retLabel ? ` → ${retLabel}` : " → Return?"}`
      : depLabel
    : isRoundTrip ? "Departure — Return" : "Select date";

  // Guide header text
  const guideText = !value.departure
    ? "Select Departure Date"
    : isRoundTrip && !value.returnDate
    ? "Select Return Date"
    : "Dates Selected";

  // ── Shared calendar panel ─────────────────────────────────────────────────
  function CalendarPanel({ onClose }: { onClose: () => void }) {
    return (
      <div className="flex flex-col w-full bg-white rounded-2xl overflow-hidden max-h-[85vh]">
        {/* Top Header */}
        <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                {guideText}
              </span>
              {isRoundTrip && !isMobile && (
                <span className="text-[11px] font-medium text-slate-400">· 2-Month View</span>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="h-7 w-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Departure vs Return Badges */}
          <div className="grid grid-cols-2 gap-2">
            <div className={cn(
              "px-3 py-1.5 rounded-xl border transition-all",
              value.departure ? "border-primary/40 bg-white shadow-xs" : "border-slate-200 bg-white/60"
            )}>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Departure</span>
              <span className="text-xs font-bold text-slate-800 truncate block">
                {value.departure ? formatShort(value.departure) : "Select date"}
              </span>
            </div>

            {isRoundTrip ? (
              <div className={cn(
                "px-3 py-1.5 rounded-xl border transition-all",
                value.returnDate ? "border-primary/40 bg-white shadow-xs" : "border-slate-200 bg-white/60"
              )}>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Return</span>
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {value.returnDate ? formatShort(value.returnDate) : "Select date"}
                </span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center">
                <span className="text-[11px] text-slate-400 font-medium">One-way trip</span>
              </div>
            )}
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => applyShortcut(1, isRoundTrip ? 7 : undefined)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-primary/40 hover:bg-white text-[10px] font-semibold text-slate-600 hover:text-primary transition-all whitespace-nowrap"
            >
              Tomorrow {isRoundTrip ? "(1 wk)" : ""}
            </button>
            <button
              type="button"
              onClick={() => applyShortcut(7, isRoundTrip ? 7 : undefined)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-primary/40 hover:bg-white text-[10px] font-semibold text-slate-600 hover:text-primary transition-all whitespace-nowrap"
            >
              Next Week
            </button>
            <button
              type="button"
              onClick={() => applyShortcut(14, isRoundTrip ? 10 : undefined)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-primary/40 hover:bg-white text-[10px] font-semibold text-slate-600 hover:text-primary transition-all whitespace-nowrap"
            >
              In 2 Weeks
            </button>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="p-3 sm:p-5 overflow-y-auto max-h-[58vh]">
          <Calendar
            mode="range"
            numberOfMonths={isMobile ? 1 : isRoundTrip ? 2 : 1}
            selected={selected}
            onSelect={handleSelect}
            month={month}
            onMonthChange={setMonth}
            disabled={{ before: today }}
            showOutsideDays={false}
            className="p-0 select-none"
            classNames={{
              months:              "flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-start",
              month:               "w-full sm:w-[280px] flex flex-col gap-3",
              caption:             "relative flex items-center justify-center h-10 px-1 mb-1",
              caption_label:       "text-sm sm:text-base font-bold text-slate-800",
              nav:                 "flex items-center gap-1",
              nav_button:          cn(
                "h-8 w-8 rounded-xl border border-slate-200 bg-white",
                "flex items-center justify-center transition-colors shadow-xs",
                "hover:bg-slate-50 text-slate-600 hover:text-primary hover:border-primary/40"
              ),
              nav_button_previous: "absolute left-0",
              nav_button_next:     "absolute right-0",
              table:               "w-full border-collapse",
              head_row:            "grid grid-cols-7 mb-2",
              head_cell:           "text-center text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1",
              row:                 "grid grid-cols-7 w-full mt-1.5",
              cell:                "relative h-11 sm:h-12 p-0 text-center flex items-center justify-center focus-within:z-20",
              day:                 cn(
                "w-full h-full p-0 font-medium rounded-xl text-slate-700 transition-all",
                "hover:bg-slate-100 hover:text-slate-900",
                "focus:outline-none focus:ring-2 focus:ring-primary/30"
              ),
              day_selected:        "!bg-primary !text-white !rounded-xl font-bold shadow-md shadow-primary/20",
              day_range_start:     "!bg-primary !text-white !rounded-l-2xl !rounded-r-none font-bold shadow-md shadow-primary/20",
              day_range_end:       "!bg-primary !text-white !rounded-r-2xl !rounded-l-none font-bold shadow-md shadow-primary/20",
              day_range_middle:    "!bg-primary/15 !text-slate-900 !font-bold !rounded-none hover:!bg-primary/20",
              day_today:           "border border-primary/40 font-bold text-primary",
              day_outside:         "opacity-0 pointer-events-none",
              day_disabled:        "text-slate-300 opacity-25 cursor-not-allowed hover:bg-transparent",
              day_hidden:          "invisible",
            }}
            components={{
              IconLeft:  () => <ChevronLeft className="h-4 w-4" />,
              IconRight: () => <ChevronRight className="h-4 w-4" />,
              DayContent: ({ date, activeModifiers }) => (
                <PricedDay
                  date={date}
                  cheapestLeft={cheapestLeft}
                  cheapestRight={cheapestRight}
                  isSelected={!activeModifiers.range_middle && (activeModifiers.range_start || activeModifiers.range_end || (activeModifiers.selected && !activeModifiers.range_start && !activeModifiers.range_end))}
                  isMiddle={Boolean(activeModifiers.range_middle)}
                  symbol={symbol}
                  rate={rate}
                />
              ),
            }}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/80">
          <button
            type="button"
            onClick={clearDates}
            className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
          >
            Clear Dates
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Apply Dates</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Trigger button (shared) ───────────────────────────────────────────────
  function TriggerButton({ onClick }: { onClick: () => void }) {
    return (
      <div className="relative flex-1 min-w-0">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1 px-1">
          {isRoundTrip ? "Departure — Return" : "Departure"}
        </label>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "flex items-center gap-2 w-full h-14 rounded-xl border bg-card px-3 text-left transition-all",
            open
              ? "border-primary ring-2 ring-primary/30"
              : error
              ? "border-rose-400 ring-2 ring-rose-200"
              : "border-border hover:border-primary/50"
          )}
        >
          <CalendarDays className="h-4 w-4 text-primary shrink-0" />
          <span className={cn("flex-1 text-sm font-medium truncate", depLabel ? "text-foreground" : "text-muted-foreground")}>
            {triggerText}
          </span>
          {depLabel && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); clearDates(); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); clearDates(); } }}
              className="shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </button>
      </div>
    );
  }

  // ── Mobile bottom-sheet ───────────────────────────────────────────────────
  if (mobileSheet) {
    return (
      <>
        <TriggerButton onClick={() => setOpen(v => !v)} />
        {open && typeof document !== "undefined" && createPortal(
          <div className="fixed inset-0 z-[999999] flex flex-col justify-end sm:justify-center items-center p-3 pb-4 sm:p-6">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
              onClick={() => setOpen(false)}
            />
            <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 animate-in slide-in-from-bottom-4 duration-250">
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />
              <CalendarPanel onClose={() => setOpen(false)} />
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  // ── Desktop Shadcn Popover ────────────────────────────────────────────────
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex-1 min-w-0 cursor-pointer">
          <TriggerButton onClick={() => setOpen(v => !v)} />
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto p-0 rounded-2xl border border-slate-200 shadow-[0_12px_48px_rgba(0,0,0,0.14)] z-[99999] overflow-hidden"
        onInteractOutside={() => setOpen(false)}
      >
        <CalendarPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
