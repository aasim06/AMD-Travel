"use client";

import { useEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DatePrice {
  date:  string;
  price: number | null;
}

interface DatePriceStripProps {
  origin:       string;
  destination:  string;
  selectedDate: string;
  returnDate?:  string;   // pass for round-trip
  passengers:   number;
  travelClass:  string;
  onDateSelect: (iso: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dayLabel(iso: string) {
  return format(parseISO(iso), "EEE d MMM"); // "Sat 1 Aug"
}

const PAGE = 4;

// ─── Skeleton cell ────────────────────────────────────────────────────────────

function SkeletonCell() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 py-2.5">
      <div className="h-3 w-20 rounded-full bg-slate-100 animate-pulse" />
      <div className="h-3 w-12 rounded-full bg-slate-100 animate-pulse" />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function DatePriceStrip({
  origin,
  destination,
  selectedDate,
  returnDate,
  passengers,
  travelClass,
  onDateSelect,
}: DatePriceStripProps) {
  const { formatPrice, currency } = useCurrency();
  const [dates, setDates]         = useState<DatePrice[]>([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(0);
  // animation direction: "left" = going back, "right" = going forward
  const [dir, setDir]             = useState<"left" | "right">("right");
  const [animating, setAnimating] = useState(false);
  const [displayPage, setDisplayPage] = useState(0); // page shown during animation

  // Fetch
  useEffect(() => {
    if (!origin || !destination || !selectedDate) return;
    setLoading(true);
    fetch("/api/flights/date-prices", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        origin, destination,
        centerDate: selectedDate,
        returnDate: returnDate ?? null,
        passengers, travelClass, currency,
        range: 3,
      }),
    })
      .then(r => r.json())
      .then((d: { dates?: DatePrice[] }) => {
        const fetched = d.dates ?? [];
        setDates(fetched);
        const idx = fetched.findIndex(d => d.date === selectedDate);
        const initPage = idx >= 0 ? Math.floor(idx / PAGE) : 0;
        setPage(initPage);
        setDisplayPage(initPage);
      })
      .catch(() => setDates([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, destination, selectedDate, returnDate, passengers, travelClass, currency]);

  if (!origin || !destination) return null;

  const totalPages = Math.max(1, Math.ceil(dates.length / PAGE));
  const visible    = dates.slice(displayPage * PAGE, displayPage * PAGE + PAGE);

  const prices   = dates.map(d => d.price).filter((p): p is number => p !== null);
  const minPrice = prices.length ? Math.min(...prices) : null;

  function goPage(next: number) {
    if (animating) return;
    const d = next > page ? "right" : "left";
    setDir(d);
    setAnimating(true);
    // After exit animation, switch page
    setTimeout(() => {
      setPage(next);
      setDisplayPage(next);
      setAnimating(false);
    }, 220);
  }

  // CSS classes for slide animation
  const slideOut = animating
    ? dir === "right"
      ? "-translate-x-4 opacity-0"
      : "translate-x-4 opacity-0"
    : "translate-x-0 opacity-100";

  return (
    <div
      className="bg-white border border-slate-200 rounded-xl flex items-stretch mb-4"
      style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}
    >
      {/* ── Prev button ── */}
      <div className="flex items-center pl-2 pr-1 shrink-0">
        <button
          type="button"
          disabled={page === 0 || animating}
          onClick={() => goPage(page - 1)}
          className={cn(
            "h-8 w-8 rounded-full border flex items-center justify-center transition-all duration-150",
            "border-slate-200 text-slate-400 bg-white shadow-sm",
            "hover:border-primary/50 hover:text-primary hover:shadow-md",
            "disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* ── Date cells ── */}
      <div className="flex flex-1 overflow-hidden">
        <div
          className={cn(
            "flex flex-1 divide-x divide-slate-100 transition-all duration-200 ease-out",
            slideOut
          )}
        >
          {loading
            ? Array.from({ length: PAGE }).map((_, i) => <SkeletonCell key={i} />)
            : <>
                {visible.map(({ date, price }) => {
                  const isSelected = date === selectedDate;
                  const isCheapest = price !== null && price === minPrice && prices.length > 1;

                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => onDateSelect(date)}
                      className={cn(
                        "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 transition-colors duration-150 relative",
                        isSelected
                          ? "ring-2 ring-inset ring-primary bg-white z-10"
                          : "hover:bg-slate-50"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-semibold whitespace-nowrap",
                        isSelected ? "text-primary" : "text-slate-800"
                      )}>
                        {dayLabel(date)}
                      </span>

                      {price !== null ? (
                        <span className={cn(
                          "text-xs font-medium",
                          isSelected ? "text-primary" : "text-slate-700"
                        )}>
                          {formatPrice(price)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </button>
                  );
                })}

                {/* Fill empty slots */}
                {visible.length < PAGE &&
                  Array.from({ length: PAGE - visible.length }).map((_, i) => (
                    <div key={`e${i}`} className="flex-1" />
                  ))
                }
              </>
          }
        </div>
      </div>

      {/* ── Next button ── */}
      <div className="flex items-center pr-2 pl-1 shrink-0">
        <button
          type="button"
          disabled={page >= totalPages - 1 || animating}
          onClick={() => goPage(page + 1)}
          className={cn(
            "h-8 w-8 rounded-full border flex items-center justify-center transition-all duration-150",
            "border-slate-200 text-slate-400 bg-white shadow-sm",
            "hover:border-primary/50 hover:text-primary hover:shadow-md",
            "disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
