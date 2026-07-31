"use client";

import { useState } from "react";
import type { DateRange as DayPickerRange } from "react-day-picker";
import { CalendarDays, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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

// ─── Mock price helper (same seed logic as before) ───────────────────────────

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
}: {
  date: Date;
  cheapestLeft: number;
  cheapestRight: number;
}) {
  const price    = getMockPrice(date);
  const cheapest = Math.min(cheapestLeft, cheapestRight);
  const isCheap  = price !== null && price === cheapest;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-px">
      <span className="text-sm font-semibold leading-none">{date.getDate()}</span>
      {price !== null && (
        <span
          className={cn(
            "text-[9px] font-medium leading-none",
            isCheap ? "text-emerald-500 font-bold" : "text-slate-400"
          )}
        >
          ${price}
        </span>
      )}
    </div>
  );
}

// ─── Quick-select chips ───────────────────────────────────────────────────────

function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function nextSaturday(from: Date) {
  const d = new Date(from);
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return d;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DatePickerPopover({
  value, onChange, isRoundTrip, mobileSheet, error,
}: DatePickerPopoverProps) {
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const [open, setOpen]           = useState(false);
  const [month, setMonth]         = useState<Date>(
    value.departure ?? today
  );

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
    if (isRoundTrip && dep && ret) { setOpen(false); }
  }

  function clearDates() {
    onChange({ departure: null, returnDate: null });
  }

  // Quick chips
  const sat    = nextSaturday(today);
  const chips  = [
    { label: "Today",        from: today,              to: null                  },
    { label: "Next Weekend", from: sat,                to: addDays(sat, 1)       },
    { label: "1 Week",       from: addDays(today, 3),  to: addDays(today, 10)    },
    { label: "2 Weeks",      from: addDays(today, 3),  to: addDays(today, 17)    },
  ];

  // Trigger label
  const depLabel = formatDisplay(value.departure);
  const retLabel = formatDisplay(value.returnDate);
  const triggerText = depLabel
    ? isRoundTrip
      ? `${depLabel}${retLabel ? ` → ${retLabel}` : " → Return?"}`
      : depLabel
    : isRoundTrip ? "Departure — Return" : "Select date";

  // Footer status
  const footerText = !value.departure
    ? "Select a departure date"
    : !value.returnDate && isRoundTrip
    ? `Depart: ${depLabel} — Select return`
    : `${depLabel}${retLabel ? ` – ${retLabel}` : ""}`;

  // ── Shared calendar panel ─────────────────────────────────────────────────
  function CalendarPanel({ onClose }: { onClose: () => void }) {
    return (
      <div className="flex flex-col">
        {/* Quick chips */}
        {isRoundTrip && (
          <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-slate-100 flex-wrap">
            {chips.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => {
                  onChange({ departure: c.from, returnDate: isRoundTrip ? c.to : null });
                  if (!isRoundTrip || c.to) onClose();
                }}
                className="px-3 py-1 rounded-full border border-slate-200 text-xs font-medium text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* Calendar */}
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={selected}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          disabled={{ before: today }}
          showOutsideDays={false}
          className="p-4"
          classNames={{
            months:              "flex gap-6",
            month:               "flex flex-col gap-3 min-w-[220px]",
            caption:             "relative flex items-center justify-center h-9",
            caption_label:       "text-sm font-bold text-slate-800 pointer-events-none",
            nav:                 "flex items-center gap-1",
            nav_button:          cn(
              "absolute h-7 w-7 rounded-lg border border-slate-200 bg-white",
              "flex items-center justify-center transition-colors",
              "hover:bg-slate-50 text-slate-500 hover:text-primary hover:border-primary/40"
            ),
            nav_button_previous: "left-0",
            nav_button_next:     "right-0",
            table:               "w-full border-collapse mt-1",
            head_row:            "flex",
            head_cell:           "w-10 text-center text-[11px] font-semibold text-slate-400 uppercase",
            row:                 "flex w-full mt-0.5",
            cell:                "relative w-10 h-12 p-0 text-center focus-within:z-20",
            day:                 cn(
              "w-10 h-12 p-0 font-normal rounded-lg text-slate-700 transition-colors",
              "hover:bg-slate-100 hover:text-slate-900",
              "focus:outline-none focus:ring-2 focus:ring-primary/30"
            ),
            day_selected:        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground rounded-lg",
            day_range_start:     "bg-primary text-primary-foreground rounded-l-lg rounded-r-none",
            day_range_end:       "bg-primary text-primary-foreground rounded-r-lg rounded-l-none",
            day_range_middle:    "bg-primary/10 text-primary rounded-none hover:bg-primary/20",
            day_today:           "ring-1 ring-primary/40 font-semibold",
            day_outside:         "opacity-0 pointer-events-none",
            day_disabled:        "text-slate-300 opacity-40 cursor-not-allowed hover:bg-transparent",
            day_hidden:          "invisible",
          }}
          components={{
            DayContent: ({ date }) => (
              <PricedDay
                date={date}
                cheapestLeft={cheapestLeft}
                cheapestRight={cheapestRight}
              />
            ),
          }}
        />

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 truncate">{footerText}</span>
          <div className="flex items-center gap-2 shrink-0">
            {value.departure && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { clearDates(); }}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={onClose}
              className="px-5 text-xs"
            >
              Apply
            </Button>
          </div>
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
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearDates(); }}
              className="shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
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
        {open && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1" />
              <CalendarPanel onClose={() => setOpen(false)} />
            </div>
          </>
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
        className="w-auto p-0 rounded-2xl border border-slate-200 shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
        onInteractOutside={() => setOpen(false)}
      >
        <CalendarPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
