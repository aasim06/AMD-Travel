"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DateRange {
  departure: Date | null;
  returnDate: Date | null;
}

interface DatePickerPopoverProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  isRoundTrip: boolean;
  mobileSheet?: boolean;
}

type FlexMode = "exact" | "flexible" | "month";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function isSameDay(a: Date, b: Date) {
  return toKey(a) === toKey(b);
}

function isBefore(a: Date, b: Date) {
  return a < b;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function nextSaturday(from: Date) {
  const d = new Date(from);
  const day = d.getDay();
  d.setDate(d.getDate() + ((6 - day + 7) % 7 || 7));
  return d;
}

function formatDisplay(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_HEADERS = ["M","T","W","T","F","S","S"];

// ─── Mock price map (seeded per day-of-month for realism) ─────────────────────

function getMockPrice(date: Date): number | null {
  const seed = (date.getDate() * 37 + date.getMonth() * 13) % 100;
  if (seed > 60) return null; // not every day has a price
  const base = 180 + (seed * 4);
  return base;
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

// ─── Quick selection chips ────────────────────────────────────────────────────

function getQuickChips(today: Date) {
  const sat = nextSaturday(today);
  const sun = addDays(sat, 1);
  return [
    {
      label: "Today",
      departure: today,
      returnDate: null,
    },
    {
      label: "Next Weekend",
      departure: sat,
      returnDate: sun,
    },
    {
      label: "1 Week Trip",
      departure: addDays(today, 3),
      returnDate: addDays(today, 10),
    },
    {
      label: "2 Weeks Trip",
      departure: addDays(today, 3),
      returnDate: addDays(today, 17),
    },
  ];
}

// ─── Single month grid ────────────────────────────────────────────────────────

interface MonthGridProps {
  year: number;
  month: number;
  departure: Date | null;
  returnDate: Date | null;
  hoverDate: Date | null;
  today: Date;
  isRoundTrip: boolean;
  onDayClick: (d: Date) => void;
  onDayHover: (d: Date | null) => void;
  cheapestInMonth: number;
}

function MonthGrid({
  year, month, departure, returnDate, hoverDate,
  today, isRoundTrip, onDayClick, onDayHover, cheapestInMonth,
}: MonthGridProps) {
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const rangeEnd = isRoundTrip ? (returnDate ?? hoverDate) : null;

  function getDayState(day: number) {
    const date = new Date(year, month, day);
    const isPast = isBefore(date, today);
    const isDep = departure ? isSameDay(date, departure) : false;
    const isRet = returnDate ? isSameDay(date, returnDate) : false;
    const isHov = hoverDate ? isSameDay(date, hoverDate) : false;

    let inRange = false;
    if (departure && rangeEnd) {
      const [s, e] = isBefore(departure, rangeEnd)
        ? [departure, rangeEnd]
        : [rangeEnd, departure];
      inRange = isBefore(s, date) && isBefore(date, e);
    }

    return { date, isPast, isDep, isRet, isHov, inRange };
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex-1 min-w-0">
      {/* Month name */}
      <p className="text-center font-bold text-slate-800 text-sm mb-3">
        {MONTH_NAMES[month]} {year}
      </p>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold text-slate-400 uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;

          const { date, isPast, isDep, isRet, isHov, inRange } = getDayState(day);
          const price = getMockPrice(date);
          const isCheapest = price !== null && price === cheapestInMonth;
          const isSelected = isDep || isRet;

          // Range bridge background
          const rangeEnd2 = isRoundTrip ? (returnDate ?? hoverDate) : null;
          let bridgeLeft = false;
          let bridgeRight = false;
          if (departure && rangeEnd2 && !isPast) {
            const [s, e] = isBefore(departure, rangeEnd2)
              ? [departure, rangeEnd2]
              : [rangeEnd2, departure];
            if (isSameDay(date, s)) bridgeRight = true;
            else if (isSameDay(date, e)) bridgeLeft = true;
            else if (inRange) { bridgeLeft = true; bridgeRight = true; }
          }

          return (
            <div
              key={day}
              className="relative flex flex-col items-center"
              onMouseEnter={() => !isPast && onDayHover(date)}
              onMouseLeave={() => onDayHover(null)}
            >
              {/* Range bridge strip */}
              {(bridgeLeft || bridgeRight) && (
                <div
                  className="absolute top-[6px] h-10 bg-blue-50 pointer-events-none z-0"
                  style={{
                    left: bridgeLeft ? 0 : "50%",
                    right: bridgeRight ? 0 : "50%",
                  }}
                />
              )}

              <button
                type="button"
                disabled={isPast}
                onClick={() => onDayClick(date)}
                className={[
                  "relative z-10 flex flex-col items-center justify-center w-full h-12 rounded-lg transition-all duration-150 my-0.5",
                  isPast
                    ? "opacity-30 cursor-not-allowed"
                    : isSelected
                    ? "bg-[#1A6FFD] text-white"
                    : isHov
                    ? "bg-blue-50 text-slate-900"
                    : inRange
                    ? "bg-blue-50 text-slate-900"
                    : "hover:bg-slate-100 text-slate-800",
                ].join(" ")}
              >
                <span className="text-sm font-semibold leading-none">{day}</span>
                {price !== null && (
                  <span
                    className={[
                      "text-[10px] font-medium mt-0.5 leading-none",
                      isSelected
                        ? "text-white/80"
                        : isCheapest
                        ? "text-emerald-600 font-bold"
                        : "text-slate-500",
                    ].join(" ")}
                  >
                    ${price}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DatePickerPopover({ value, onChange, isRoundTrip, mobileSheet }: DatePickerPopoverProps) {
  const today = startOfDay(new Date());

  const [open, setOpen] = useState(false);
  const [flexMode, setFlexMode] = useState<FlexMode>("exact");
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [leftMonth, setLeftMonth] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));

  const ref         = useRef<HTMLDivElement>(null);
  const triggerRef   = useRef<HTMLButtonElement>(null);
  const savedScrollY = useRef(0);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  // Lock body scroll while mobile date sheet is open
  useEffect(() => {
    if (!mobileSheet || !open) return;
    const y = window.scrollY;
    savedScrollY.current = y;
    document.body.style.position = "fixed";
    document.body.style.top      = `-${y}px`;
    document.body.style.width    = "100%";
    return () => {
      document.body.style.position = "";
      document.body.style.top      = "";
      document.body.style.width    = "";
      window.scrollTo({ top: savedScrollY.current, behavior: "instant" as ScrollBehavior });
    };
  }, [mobileSheet, open]);

  // Recalculate fixed position on open, scroll, and resize
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 680;
    const viewportWidth = window.innerWidth;
    const left = Math.min(rect.left, viewportWidth - popoverWidth - 16);
    setPopoverStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left: Math.max(8, left),
      width: Math.min(popoverWidth, viewportWidth - 16),
      zIndex: 999,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open || mobileSheet) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, mobileSheet, updatePosition]);

  // Right month is always left + 1
  const rightMonth = (() => {
    const m = leftMonth.month + 1;
    return m > 11
      ? { year: leftMonth.year + 1, month: 0 }
      : { year: leftMonth.year, month: m };
  })();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleDayClick = useCallback(
    (date: Date) => {
      const { departure, returnDate: ret } = value;

      if (!departure || (departure && ret)) {
        // Start fresh — set departure
        onChange({ departure: date, returnDate: null });
      } else {
        // Departure already set — set return (or swap if before)
        if (!isRoundTrip) {
          onChange({ departure: date, returnDate: null });
        } else if (isBefore(date, departure)) {
          onChange({ departure: date, returnDate: departure });
        } else {
          onChange({ departure, returnDate: date });
          setOpen(false);
        }
      }
    },
    [value, onChange, isRoundTrip]
  );

  function prevMonth() {
    setLeftMonth((lm) => {
      if (lm.month === 0) return { year: lm.year - 1, month: 11 };
      return { year: lm.year, month: lm.month - 1 };
    });
  }

  function nextMonth() {
    setLeftMonth((lm) => {
      if (lm.month === 11) return { year: lm.year + 1, month: 0 };
      return { year: lm.year, month: lm.month + 1 };
    });
  }

  function clearDates() {
    onChange({ departure: null, returnDate: null });
  }

  const chips = getQuickChips(today);

  const depLabel = formatDisplay(value.departure);
  const retLabel = formatDisplay(value.returnDate);

  const triggerText = depLabel
    ? isRoundTrip
      ? `${depLabel}${retLabel ? ` → ${retLabel}` : " → Return?"}`
      : depLabel
    : isRoundTrip
    ? "Departure — Return"
    : "Select date";

  const cheapestLeft = getCheapestInMonth(leftMonth.year, leftMonth.month);
  const cheapestRight = getCheapestInMonth(rightMonth.year, rightMonth.month);

  const FLEX_TABS = [
    { label: "Specific dates", value: "exact" as FlexMode },
    { label: "Flexible dates", value: "flexible" as FlexMode },
  ];

  const footerText = (() => {
    if (!value.departure) return "Select a departure date";
    const dep = formatDisplay(value.departure)!;
    if (!value.returnDate) return isRoundTrip ? `Depart: ${dep} — Select return` : `Selected: ${dep}`;
    return `Selected: ${dep} – ${formatDisplay(value.returnDate)}`;
  })();

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      {/* ── Trigger button ── */}
      <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1 px-1">
        {isRoundTrip ? "Departure — Return" : "Departure"}
      </label>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          if (mobileSheet) (e.currentTarget as HTMLButtonElement).focus({ preventScroll: true });
          setOpen((v) => !v);
        }}
        className={[
          "flex items-center gap-2 w-full h-14 rounded-xl border bg-card px-3 text-left transition-all",
          open
            ? "border-primary ring-2 ring-primary/30"
            : "border-border hover:border-primary/50",
        ].join(" ")}
      >
        <CalendarDays className="h-4 w-4 text-primary shrink-0" />
        <span
          className={[
            "flex-1 text-sm font-medium truncate",
            depLabel ? "text-foreground" : "text-muted-foreground",
          ].join(" ")}
        >
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

      {/* ── Popover / Bottom-sheet ── */}
      {open && mobileSheet && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />
      )}
      {open && (
        <div
          style={mobileSheet ? undefined : popoverStyle}
          className={mobileSheet
            ? "fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl overflow-hidden animate-fade-in"
            : "rounded-2xl border border-border bg-white shadow-card-hover overflow-hidden animate-fade-in"
          }
        >
          {/* ── Top header ── */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
            {/* Trip type pill */}
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {isRoundTrip ? "Return" : "One-way"}
            </span>
            {/* Specific / Flexible tabs */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
              {FLEX_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setFlexMode(tab.value)}
                  className={[
                    "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
                    flexMode === tab.value
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Month navigation + dual grids ── */}
          <div className="px-5 pt-4">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={prevMonth}
                className="h-8 w-8 rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:text-[#1A6FFD] hover:border-[#1A6FFD] transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-8 text-sm font-bold text-slate-400 pointer-events-none select-none">
                <span>{MONTH_NAMES[leftMonth.month]} {leftMonth.year}</span>
                <span>{MONTH_NAMES[rightMonth.month]} {rightMonth.year}</span>
              </div>
              <button
                type="button"
                onClick={nextMonth}
                className="h-8 w-8 rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:text-[#1A6FFD] hover:border-[#1A6FFD] transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <MonthGrid
                year={leftMonth.year}
                month={leftMonth.month}
                departure={value.departure}
                returnDate={value.returnDate}
                hoverDate={hoverDate}
                today={today}
                isRoundTrip={isRoundTrip}
                onDayClick={handleDayClick}
                onDayHover={setHoverDate}
                cheapestInMonth={cheapestLeft}
              />
              <MonthGrid
                year={rightMonth.year}
                month={rightMonth.month}
                departure={value.departure}
                returnDate={value.returnDate}
                hoverDate={hoverDate}
                today={today}
                isRoundTrip={isRoundTrip}
                onDayClick={handleDayClick}
                onDayHover={setHoverDate}
                cheapestInMonth={cheapestRight}
              />
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-5 py-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-4">
            <span className="text-sm text-slate-600">{footerText}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-[#1A6FFD] hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition-all"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Utility export ───────────────────────────────────────────────────────────

export { formatISO };
