"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plane,
  Users,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  Share2,
  Heart,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { FlightOffer, FlightSearchResponse, TravelClass, Currency } from "@/types/flight";
import { AIRLINE_NAMES, AIRLINE_LOGO_FALLBACKS } from "@/types/flight";
import { useCurrency } from "@/context/currency-context";
import { FilterSidebar, getDefaultFilters } from "@/components/flight/filter-sidebar";
import type { FilterState } from "@/components/flight/filter-sidebar";
import { FlightDetailsModal } from "@/components/flight/flight-details-modal";
import { ShareItineraryModal } from "@/components/flight/share-itinerary-modal";
import { FlightSkeleton } from "@/components/flight/flight-skeleton";

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
    <div className="flex items-stretch bg-card rounded-2xl border border-border shadow-card mb-4 overflow-hidden">
      {TABS.map((tab, i) => {
        const active = sortKey === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSort(tab.key)}
            className={`relative flex-1 flex flex-col items-center justify-center py-3 px-2 text-center transition-colors border-b-2 ${
              active
                ? "border-primary bg-primary/5"
                : "border-transparent hover:bg-muted/50"
            } ${i > 0 ? "border-l border-l-border" : ""}`}
          >
            <span className={`text-xs font-bold ${active ? "text-primary" : "text-foreground"}`}>
              {tab.label}
            </span>
            {tab.stats && (
              <span className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">
                {tab.stats.price} · {tab.stats.dur}
              </span>
            )}
          </button>
        );
      })}

      {/* Other sort dropdown */}
      <div className="relative border-l border-border">
        <button
          type="button"
          onClick={() => setDropOpen(v => !v)}
          className={`h-full flex flex-col items-center justify-center gap-0 px-3 min-w-[72px] transition-colors border-b-2 ${
            isOther
              ? "border-primary bg-primary/5 text-primary"
              : "border-transparent text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <span className="flex items-center gap-1 text-xs font-bold whitespace-nowrap">
            {isOther ? "Sorted" : "Other sort"}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${dropOpen ? "rotate-180" : ""}`} />
          </span>
          {isOther && otherLabel && (
            <span className="text-[10px] text-primary mt-0.5 whitespace-nowrap max-w-[80px] truncate">{otherLabel}</span>
          )}
        </button>

        {dropOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-30" onClick={() => setDropOpen(false)} />

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-100 z-40 text-xs divide-y divide-slate-100 overflow-hidden">
              {/* Take-off group */}
              <div className="py-1">
                {(["dep_asc", "dep_desc"] as OtherSort[]).map(val => {
                  const opt = OTHER_SORT_OPTIONS.find(o => o.value === val)!;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { onSort(val); setDropOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-colors"
                    >
                      <span>{opt.label}</span>
                      {sortKey === val && <span className="text-primary font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
              {/* Landing group */}
              <div className="py-1">
                {(["arr_asc", "arr_desc"] as OtherSort[]).map(val => {
                  const opt = OTHER_SORT_OPTIONS.find(o => o.value === val)!;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { onSort(val); setDropOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-colors"
                    >
                      <span>{opt.label}</span>
                      {sortKey === val && <span className="text-primary font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
              {/* Price group */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => { onSort("price_desc"); setDropOpen(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-colors"
                >
                  <span>Highest price</span>
                  {sortKey === "price_desc" && <span className="text-primary font-bold">✓</span>}
                </button>
              </div>
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
      <div className="h-10 w-24 bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-primary tracking-wide">{initials}</span>
      </div>
    );
  }

  return (
    <div className="h-10 w-24 bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden px-1">
      <img src={urls[idx]} alt={name} className="h-9 w-full object-contain" onError={handleError} />
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
  const label   = totalLegs === 1 ? "Outbound" : legIndex === 0 ? "Outbound" : "Return";

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

  // Aircraft type from first segment
  const aircraft = dep.aircraft && dep.aircraft !== "---" ? dep.aircraft : null;

  return (
    <div>
      {/* Leg label */}
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
        {formatDate(dep.departure.at)} &bull; {label}
      </p>

      {/* Timeline row */}
      <div className="flex items-center gap-3">

        {/* Departure */}
        <div className="shrink-0 text-left w-16">
          <p className="text-lg font-bold text-slate-900 leading-none tabular-nums">{formatTime(dep.departure.at)}</p>
          <p className="text-xs font-bold text-primary mt-0.5">{dep.departure.iataCode}</p>
        </div>

        {/* Center */}
        <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">

          {/* Top row: airline logo + duration + aircraft */}
          <div className="flex items-center gap-2">
            <AirlineLogo code={dep.carrierCode} />
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-semibold text-slate-600">
                {parseDuration(leg.duration)}
              </span>
              {aircraft && (
                <span className="text-[9px] text-slate-400 leading-none mt-0.5 whitespace-nowrap">{aircraft}</span>
              )}
            </div>
          </div>

          {/* Flight path with stop dots */}
          <div className="w-full flex items-center">
            {/* Origin dot */}
            <div className="h-2 w-2 rounded-full border-2 border-primary bg-white shrink-0" />

            {stops === 0 ? (
              <>
                <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                <Plane className="h-3.5 w-3.5 text-primary shrink-0 -rotate-0" />
                <div className="flex-1 border-t-2 border-dashed border-slate-200" />
              </>
            ) : (
              layovers.map((lv, i) => (
                <>
                  <div key={`line-${i}`} className="flex-1 border-t-2 border-dashed border-slate-200" />
                  {/* Stop dot + label */}
                  <div key={`stop-${i}`} className="flex flex-col items-center shrink-0 mx-0.5">
                    <span className="text-[9px] font-semibold text-amber-600 leading-none mb-0.5">{lv.code}</span>
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400 border-2 border-white shadow-sm" />
                    <span className="text-[8px] text-slate-400 leading-none mt-0.5 whitespace-nowrap">{minsToLabel(lv.mins)}</span>
                  </div>
                  {i === layovers.length - 1 && (
                    <>
                      <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                      <Plane className="h-3.5 w-3.5 text-primary shrink-0" />
                      <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                    </>
                  )}
                </>
              ))
            )}

            {/* Destination dot */}
            <div className="h-2 w-2 rounded-full border-2 border-primary bg-white shrink-0" />
          </div>

          {/* Bottom: direct / stops label */}
          <span className={`text-[10px] font-semibold ${
            stops === 0 ? "text-emerald-600" : "text-amber-600"
          }`}>
            {stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Arrival */}
        <div className="shrink-0 text-right w-16">
          <div className="flex items-start justify-end gap-0.5">
            <p className="text-lg font-bold text-slate-900 leading-none tabular-nums">{formatTime(arr.arrival.at)}</p>
            {isOvernight && (
              <span className="text-[9px] font-bold text-rose-500 leading-none mt-0.5">
                +{nightOffset}
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-primary mt-0.5">{arr.arrival.iataCode}</p>
        </div>

      </div>
    </div>
  );
}

function NightsBadge({ depAt, arrAt }: { depAt: string; arrAt: string }) {
  const nights = Math.round(
    (new Date(arrAt).getTime() - new Date(depAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (nights <= 0) return null;
  const arr = new Date(arrAt);
  const city = arr.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return (
    <div className="flex items-center justify-center py-2">
      <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-[11px] font-medium px-3 py-1 rounded-full">
        <span className="h-1 w-1 rounded-full bg-slate-400" />
        {nights} night{nights > 1 ? "s" : ""} &bull; {city}
      </span>
    </div>
  );
}

// ─── Baggage Popover Content ──────────────────────────────────────────────────

function BaggagePopoverContent({ offer }: { offer: FlightOffer }) {
  const baggage = offer.baggageAllowance;
  const qty     = baggage?.quantity ?? 0;
  const weight  = baggage?.weight;
  const unit    = baggage?.weightUnit ?? "kg";
  const checkedDetail = qty > 0 ? (weight ? `${qty}× ${weight}${unit}` : `${qty} bag${qty > 1 ? "s" : ""}`) : null;

  const ITEMS = [
    { d: "M20.583 2.25a.806.806 0 0 1 1.167 0 .806.806 0 0 1 0 1.167l-4.907 4.906h.008l-1.149 1.141L3.417 21.75c-.25.333-.834.333-1.167 0a.806.806 0 0 1 0-1.167l1.809-1.808c-.177-.327-.259-.692-.259-1.129 0-.692.353-7.091.42-7.448.093-.468.285-.828.641-1.18.28-.285.656-.517 1-.62.089-.029.521-.06.97-.077l.056-.002c.56-.017.75-.022.849-.12a.4.4 0 0 0 .085-.147c.053-.39.31-1.078.59-1.487.187-.268.576-.673.856-.88.408-.309.856-.509 1.429-.637.18-.04.432-.056.856-.044 1.113.031 1.72.108 2.225.36.7.356 1.309.977 1.649 1.685q.059.121.108.25zm-8.753 8.754H7c-.417 0-.667.25-.667.667 0 .416.334.666.667.666h.137c.167 0 .334.167.334.417v.833c0 .417.124.667.666.667.582 0 .667-.254.667-.667.006-.587 0-.833 0-.833 0-.25.167-.417.417-.417h1.275zM9.364 8.078q.035.038.07.071l.048.05c.085.108.53.105 1.363.1l.556-.002h.809q.44.001.79.007c.604.007 1.001.012 1.158-.045a2 2 0 0 1-.048-.165c-.163-.663-.694-1.65-2.558-1.65-.996 0-1.873.597-2.17 1.57zM15.785 11.004l2.421-2.405c.197.114.386.258.544.419.356.352.552.716.64 1.18.064.36.42 6.788.42 7.448 0 .693-.204 1.201-.66 1.662-.324.324-.62.504-1.028.616-.255.07-.402.08-1.311.08H15.79V20H14.5l.001.004H9.123V20H7.832v.004H6.723l7.72-7.667H16.5c.334 0 .667-.25.667-.666a.657.657 0 0 0-.667-.667z", label: "Personal item", detail: null, included: qty > 0 },
    { d: "M14.91 9.083c-.25 0-.417-.166-.417-.416v-4.5c0-.25.167-.417.417-.417.583 0 .833-.417.833-.917S15.493 2 14.91 2H9.077c-.584 0-.834.417-.834.833 0 .417.25.834.75.834q.5.125.5.5v4.416c0 .25-.166.417-.416.417h-.834c-1.166.083-2.083 1-2.083 2.083v8c0 1 .667 1.834 1.667 2 .083 0 .166.167.166.25 0 .5.334.667.834.667s.833-.167.833-.667a.18.18 0 0 1 .167-.166h4.166a.18.18 0 0 1 .167.166c0 .5.333.667.833.667s.834-.167.834-.667c0-.083.25-.25.333-.25 1-.166 1.667-1.083 1.667-2v-8c0-1.083-.75-2-1.917-2zm0 4.25h-3.5c-.25 0-.417.167-.417.417v.833c0 .334-.25.667-.666.667s-.667-.25-.667-.667v-.833c0-.25-.167-.417-.333-.417h-.25a.657.657 0 0 1-.667-.666c0-.417.25-.667.667-.667h5.833c.333 0 .667.25.667.667a.657.657 0 0 1-.667.666m-2.5-9.666c.25 0 .417.166.417.416V8.58c0 .25-.167.417-.417.417h-.833c-.25 0-.417-.167-.417-.417V4.083c0-.25.167-.416.417-.416z", label: "Cabin bag", detail: null, included: qty > 0 },
    { d: "M15.91 5.333c-1.417 0-1.417-.166-1.417-.416v-.75c0-.25.167-.417.417-.417.583 0 .833-.417.833-.917S15.494 2 14.91 2H9.077c-.584 0-.834.417-.834.833 0 .417.25.834.75.834q.5.125.5.5v.666c0 .25-.166.417-.416.417H6.243c-1.166.083-2.083 1-2.083 2.083v11.75c0 1 .667 1.834 1.667 2 .083 0 .166.167.166.25 0 .5.334.667.834.667s.833-.167.833-.667a.18.18 0 0 1 .167-.166h8.166a.18.18 0 0 1 .167.166c0 .5.334.667.834.667s.833-.167.833-.667c0-.083.25-.25.333-.25 1-.166 1.667-1.083 1.667-2V7.333c0-1.083-.75-2-1.917-2zM15.6 8.75a.75.75 0 0 1 1.5 0v8.5a.75.75 0 0 1-1.5 0zm-4.3 0a.75.75 0 0 1 1.5 0v8.5a.75.75 0 0 1-1.5 0zM7.75 8a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-1.5 0v-8.5A.75.75 0 0 1 7.75 8m3.41-3.917c0-.25.167-.416.417-.416h.833c.25 0 .417.166.417.416v.747c0 .25-.167.417-.417.417h-.833c-.25 0-.417-.167-.417-.417z", label: "Checked bag", detail: checkedDetail, included: qty > 0 },
  ];

  return (
    <div className="p-4 w-72">
      <p className="text-sm font-semibold text-slate-900">Baggage breakdown</p>
      <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Based on standard airline policy · may vary</p>
      <div className="space-y-2.5">
        {ITEMS.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 fill-current text-slate-500" viewBox="0 0 24 24"><path d={item.d} /></svg>
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
              {item.detail && <span className="text-xs text-slate-400">({item.detail})</span>}
            </div>
            <div className="flex items-center gap-1 ml-4">
              {item.included ? (
                <>
                  <svg className="h-4 w-4 shrink-0 fill-current text-emerald-500" viewBox="0 0 24 24"><path d="M6.445 12.668a.9.9 0 1 0-1.302 1.242l3.572 3.745a.9.9 0 0 0 1.335-.036l8.591-10.037a.9.9 0 0 0-1.367-1.17l-7.598 8.876a.48.48 0 0 1-.712.02z" /></svg>
                  <span className="text-xs text-slate-600">Included</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 shrink-0 fill-current text-slate-400" viewBox="0 0 24 24"><path d="M17.656 6.333a.9.9 0 0 1 0 1.273l-4.046 4.052a.48.48 0 0 0 0 .678l4.047 4.053a.9.9 0 0 1 .08 1.18l-.081.092a.9.9 0 0 1-1.273 0l-4.044-4.05a.48.48 0 0 0-.68 0l-4.042 4.05a.9.9 0 1 1-1.274-1.273l4.047-4.052a.48.48 0 0 0 0-.678L6.343 7.606a.9.9 0 0 1-.08-1.18l.081-.093a.9.9 0 0 1 1.273.001l4.043 4.049a.48.48 0 0 0 .679 0l4.044-4.049a.9.9 0 0 1 1.273 0" /></svg>
                  <span className="text-xs text-slate-400">Not available</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Flight Card ──────────────────────────────────────────────────────────────

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
  const perPax = parseFloat(offer.price.perPassenger);
  const router = useRouter();

  function goToCheckout() {
    const paxCount = parseInt(new URLSearchParams(window.location.search).get("passengers") ?? "1", 10);
    sessionStorage.setItem("amd_checkout_offer", JSON.stringify({
      offer,
      carriers,
      fareClass: "Economy",
      passengers: paxCount,
    }));
    router.push("/checkout");
  }

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/itinerary/${offer.id}`
    : `https://amdglobal.com/itinerary/${offer.id}`;

  return (
    <div onClick={() => onSelect(offer)} className="cursor-pointer bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col md:flex-row" style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 50px' }}>

      {/* ── Left: Route Details (70%) ── */}
      <div className="flex-1 p-5 space-y-4 min-w-0">

        {offer.itineraries.map((leg, i) => (
          <div key={i}>
            {/* Nights badge between legs */}
            {i > 0 && (
              <NightsBadge
                depAt={offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.at}
                arrAt={leg.segments[0].departure.at}
              />
            )}
            <LegRow
              leg={leg}
              legIndex={i}
              totalLegs={offer.itineraries.length}
              carriers={carriers}
            />
          </div>
        ))}

        {/* Baggage & badges row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-dashed border-slate-200">
          {/* Baggage */}
          <Popover>
          <PopoverTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-primary transition-colors cursor-pointer"
          >
            {/* Personal item */}
            <svg className="h-3.5 w-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-label="Personal item">
              <path d="M20.583 2.25a.806.806 0 0 1 1.167 0 .806.806 0 0 1 0 1.167l-4.907 4.906h.008l-1.149 1.141L3.417 21.75c-.25.333-.834.333-1.167 0a.806.806 0 0 1 0-1.167l1.809-1.808c-.177-.327-.259-.692-.259-1.129 0-.692.353-7.091.42-7.448.093-.468.285-.828.641-1.18.28-.285.656-.517 1-.62.089-.029.521-.06.97-.077l.056-.002c.56-.017.75-.022.849-.12a.4.4 0 0 0 .085-.147c.053-.39.31-1.078.59-1.487.187-.268.576-.673.856-.88.408-.309.856-.509 1.429-.637.18-.04.432-.056.856-.044 1.113.031 1.72.108 2.225.36.7.356 1.309.977 1.649 1.685q.059.121.108.25zm-8.753 8.754H7c-.417 0-.667.25-.667.667 0 .416.334.666.667.666h.137c.167 0 .334.167.334.417v.833c0 .417.124.667.666.667.582 0 .667-.254.667-.667.006-.587 0-.833 0-.833 0-.25.167-.417.417-.417h1.275zM9.364 8.078q.035.038.07.071l.048.05c.085.108.53.105 1.363.1l.556-.002h.809q.44.001.79.007c.604.007 1.001.012 1.158-.045a2 2 0 0 1-.048-.165c-.163-.663-.694-1.65-2.558-1.65-.996 0-1.873.597-2.17 1.57zM15.785 11.004l2.421-2.405c.197.114.386.258.544.419.356.352.552.716.64 1.18.064.36.42 6.788.42 7.448 0 .693-.204 1.201-.66 1.662-.324.324-.62.504-1.028.616-.255.07-.402.08-1.311.08H15.79V20H14.5l.001.004H9.123V20H7.832v.004H6.723l7.72-7.667H16.5c.334 0 .667-.25.667-.666a.657.657 0 0 0-.667-.667z" />
            </svg>
            <span className="font-medium">0</span>
            <div className="h-3 w-px bg-slate-300 mx-1" />
            {/* Cabin bag */}
            <svg className="h-3.5 w-3.5 text-slate-600 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-label="Cabin bag">
              <path d="M14.91 9.083c-.25 0-.417-.166-.417-.416v-4.5c0-.25.167-.417.417-.417.583 0 .833-.417.833-.917S15.493 2 14.91 2H9.077c-.584 0-.834.417-.834.833 0 .417.25.834.75.834q.5.125.5.5v4.416c0 .25-.166.417-.416.417h-.834c-1.166.083-2.083 1-2.083 2.083v8c0 1 .667 1.834 1.667 2 .083 0 .166.167.166.25 0 .5.334.667.834.667s.833-.167.833-.667a.18.18 0 0 1 .167-.166h4.166a.18.18 0 0 1 .167.166c0 .5.333.667.833.667s.834-.167.834-.667c0-.083.25-.25.333-.25 1-.166 1.667-1.083 1.667-2v-8c0-1.083-.75-2-1.917-2zm0 4.25h-3.5c-.25 0-.417.167-.417.417v.833c0 .334-.25.667-.666.667s-.667-.25-.667-.667v-.833c0-.25-.167-.417-.333-.417h-.25a.657.657 0 0 1-.667-.666c0-.417.25-.667.667-.667h5.833c.333 0 .667.25.667.667a.657.657 0 0 1-.667.666m-2.5-9.666c.25 0 .417.166.417.416V8.58c0 .25-.167.417-.417.417h-.833c-.25 0-.417-.167-.417-.417V4.083c0-.25.167-.416.417-.416z" />
            </svg>
            <span className="font-medium">0</span>
            <div className="h-3 w-px bg-slate-300 mx-1" />
            {/* Checked bag */}
            <svg className="h-3.5 w-3.5 text-slate-600 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-label="Checked bag">
              <path d="M15.91 5.333c-1.417 0-1.417-.166-1.417-.416v-.75c0-.25.167-.417.417-.417.583 0 .833-.417.833-.917S15.494 2 14.91 2H9.077c-.584 0-.834.417-.834.833 0 .417.25.834.75.834q.5.125.5.5v.666c0 .25-.166.417-.416.417H6.243c-1.166.083-2.083 1-2.083 2.083v11.75c0 1 .667 1.834 1.667 2 .083 0 .166.167.166.25 0 .5.334.667.834.667s.833-.167.833-.667a.18.18 0 0 1 .167-.166h8.166a.18.18 0 0 1 .167.166c0 .5.334.667.834.667s.833-.167.833-.667c0-.083.25-.25.333-.25 1-.166 1.667-1.083 1.667-2V7.333c0-1.083-.75-2-1.917-2zM15.6 8.75a.75.75 0 0 1 1.5 0v8.5a.75.75 0 0 1-1.5 0zm-4.3 0a.75.75 0 0 1 1.5 0v8.5a.75.75 0 0 1-1.5 0zM7.75 8a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-1.5 0v-8.5A.75.75 0 0 1 7.75 8m3.41-3.917c0-.25.167-.416.417-.416h.833c.25 0 .417.166.417.416v.747c0 .25-.167.417-.417.417h-.833c-.25 0-.417-.167-.417-.417z" />
            </svg>
            <span className="font-medium">{offer.baggageAllowance?.quantity ?? 0}</span>
          </button>
          </PopoverTrigger>
          <PopoverContent align="start" onClick={(e) => e.stopPropagation()}>
            <BaggagePopoverContent offer={offer} />
          </PopoverContent>
          </Popover>

          {/* Self-transfer badge for multi-city */}
          {offer.itineraries.length > 1 && (
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-full">
              <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21.92 9.19a1.29 1.29 0 0 0-1.207-.84h-5.225a.43.43 0 0 1-.405-.287l-1.876-5.316a1.288 1.288 0 0 0-2.412 0l-.004.013L8.92 8.063a.43.43 0 0 1-.405.286H3.29a1.288 1.288 0 0 0-.827 2.276l4.45 3.691a.43.43 0 0 1 .133.466l-1.87 5.606a1.288 1.288 0 0 0 1.983 1.446l4.59-3.365a.43.43 0 0 1 .507 0l4.587 3.364a1.288 1.288 0 0 0 1.984-1.445l-1.87-5.61a.43.43 0 0 1 .134-.465l4.458-3.697c.41-.35.56-.92.372-1.425" />
              </svg>
              Self-transfer
            </span>
          )}

          {/* Seats left */}
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 ml-auto">
            <Users className="h-3 w-3" />
            {offer.numberOfBookableSeats} seats left
          </span>
        </div>
      </div>

      {/* ── Right: Price & Action (30%) ── */}
      <div className="md:w-52 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 p-5 flex flex-col justify-between items-end">

        {/* Top: share + save */}
        <div className="flex items-center gap-2 self-end mb-3">
          <button type="button" onClick={(e) => { e.stopPropagation(); setShareOpen(true); }}
            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <Share2 className="h-3.5 w-3.5 text-slate-400" />
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); setSaved(v => !v); }}
            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <Heart className={`h-3.5 w-3.5 transition-colors ${
              saved ? "fill-rose-500 text-rose-500" : "text-slate-400"
            }`} />
          </button>
        </div>

        {/* Price block */}
        <div className="text-center w-full">
          <p className="text-2xl font-bold text-slate-900 leading-none">
            {formatPrice(price)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {formatPrice(perPax)} per person
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(offer); }}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors shadow-sm shadow-primary/20 active:scale-[0.98]"
        >
          Select <ArrowRight className="h-4 w-4" />
        </button>
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
  const [failedLegs, setFailedLegs] = useState<string[]>([]);
  const [sortKey, setSortKey]     = useState<SortKey | OtherSort>("best");
  const [filters, setFilters]           = useState<FilterState>(getDefaultFilters(9999));
  const [selectedFlight, setSelectedFlight] = useState<FlightOffer | null>(null);

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
        const offerCarriers = offer.validatingAirlineCodes ?? [outbound.segments[0].carrierCode];
        const hasMatch = offerCarriers.some((c) => filters.selectedAirlines.has(c));
        if (!hasMatch) return false;
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

      // Days of week (outbound departure day)
      if (filters.activeDays.size > 0) {
        const depDay = new Date(outbound.segments[0].departure.at).getDay();
        if (!filters.activeDays.has(depDay)) return false;
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
    setError(null);

    const payload = {
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

    console.log("Fetching flights from API...", payload);

    try {
      const res = await fetch("/api/flights/search", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const errMsg = body?.error ?? `Search failed (${res.status})`;
        if (errMsg.toLowerCase().includes("hasn't returned any results") || errMsg.toLowerCase().includes("no results")) {
          setResults([]);
          setLoading(false);
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

  return (
    <>
    <main className="min-h-screen bg-background">
      {/* ── Top progress bar ── */}
      {loading ? (
        <div className="fixed top-16 left-0 right-0 z-40 h-[3px] bg-slate-100 overflow-hidden">
          <div className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.8),0_0_5px_hsl(var(--primary)/0.5)] animate-[progress-fill_2.5s_ease-out_forwards]" />
        </div>
      ) : (
        <div className="fixed top-16 left-0 right-0 z-40 h-[3px] bg-transparent overflow-hidden pointer-events-none">
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
                {Array.from({ length: 4 }).map((_, i) => <FlightSkeleton key={i} />)}
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
                  {fromCache && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-0.5 text-[11px] font-semibold text-secondary">
                      ⚡ Instant · cached result
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

                <SortTabBar offers={results} carriers={carriers} sortKey={sortKey} onSort={handleSort} />

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
                  <div className="space-y-3">
                    {filteredResults.map((offer) => (
                      <FlightCard
                        key={offer.id}
                        offer={offer}
                        carriers={carriers}
                        onSelect={setSelectedFlight}
                      />
                    ))}
                  </div>
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
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
