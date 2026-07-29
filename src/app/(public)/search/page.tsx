"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plane,
  Clock,
  Users,
  ArrowRight,
  AlertCircle,
  Luggage,
  ChevronDown,
  Share2,
  Heart,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { FlightOffer, FlightSearchResponse, TravelClass, Currency } from "@/types/flight";
import { AIRLINE_NAMES, AIRCRAFT_NAMES } from "@/types/flight";
import { useCurrency } from "@/context/currency-context";
import { FilterSidebar, getDefaultFilters } from "@/components/flight/filter-sidebar";
import type { FilterState } from "@/components/flight/filter-sidebar";
import { FlightDetailsModal } from "@/components/flight/flight-details-modal";
import { ShareItineraryModal } from "@/components/flight/share-itinerary-modal";

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

function AirlineLogo({ code }: { code: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="h-6 w-12 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
        <Plane className="h-3.5 w-3.5 text-slate-400" />
      </div>
    );
  }

  return (
    <div className="h-8 w-16 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden px-1.5">
      <img
        src={`https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${code}.svg`}
        alt={code}
        className="h-6 w-full object-contain"
        onError={() => setFailed(true)}
      />
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
  const stopCodes = leg.segments.slice(0, -1).map(s => s.arrival.iataCode);

  return (
    <div>
      {/* Leg label */}
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
        {formatDate(dep.departure.at)} &bull; {label}
      </p>

      {/* Timeline row */}
      <div className="flex items-center gap-3">
        {/* Departure */}
        <div className="shrink-0 text-left w-16">
          <p className="text-lg font-bold text-slate-900 leading-none">{formatTime(dep.departure.at)}</p>
          <p className="text-xs font-bold text-primary mt-0.5">{dep.departure.iataCode}</p>
        </div>

        {/* Center: line + info */}
        <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
          {/* Duration + airline */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
              {parseDuration(leg.duration)}
            </span>
            <div className="h-5 w-px bg-slate-200" />
            <AirlineLogo code={dep.carrierCode} />
            <span className="text-[11px] text-slate-500 truncate max-w-[80px] hidden sm:block">{airline}</span>
          </div>
          {/* Dotted path */}
          <div className="w-full flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200" />
            <Plane className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          </div>
          {/* Stops */}
          <span className={`text-[10px] font-semibold ${
            stops === 0 ? "text-emerald-600" : "text-amber-600"
          }`}>
            {stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""} · ${stopCodes.join(", ")}`}
          </span>
        </div>

        {/* Arrival */}
        <div className="shrink-0 text-right w-16">
          <p className="text-lg font-bold text-slate-900 leading-none">{formatTime(arr.arrival.at)}</p>
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

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/itinerary/${offer.id}`
    : `https://amdglobal.com/itinerary/${offer.id}`;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col md:flex-row" style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 50px' }}>

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

        {/* Baggage & perks row */}
        <div className="flex items-center gap-3 pt-1 border-t border-slate-100 flex-wrap">
          {[
            { icon: <Luggage className="h-3 w-3" />, label: "Personal item", ok: true },
            { icon: <Luggage className="h-3 w-3" />, label: "Cabin bag", ok: true },
            {
              icon: <Luggage className="h-3 w-3" />,
              label: offer.baggageAllowance?.quantity
                ? `${offer.baggageAllowance.quantity}× Checked`
                : "No checked bag",
              ok: !!offer.baggageAllowance?.quantity,
            },
            {
              icon: <Users className="h-3 w-3" />,
              label: `${offer.numberOfBookableSeats} seats left`,
              ok: offer.numberOfBookableSeats > 3,
            },
          ].map((item, i) => (
            <span key={i} className={`flex items-center gap-1 text-[11px] font-medium ${
              item.ok ? "text-slate-500" : "text-slate-400"
            }`}>
              <span className={item.ok ? "text-primary" : "text-slate-300"}>{item.icon}</span>
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right: Price & Action (30%) ── */}
      <div className="md:w-52 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 p-5 flex flex-col justify-between items-end">

        {/* Top: share + save */}
        <div className="flex items-center gap-2 self-end mb-3">
          <button type="button" onClick={() => setShareOpen(true)}
            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <Share2 className="h-3.5 w-3.5 text-slate-400" />
          </button>
          <button type="button" onClick={() => setSaved(v => !v)}
            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <Heart className={`h-3.5 w-3.5 transition-colors ${
              saved ? "fill-rose-500 text-rose-500" : "text-slate-400"
            }`} />
          </button>
        </div>

        {/* Price block */}
        <div className="text-center w-full">
          {/* Badge */}
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="h-3 w-3 text-primary" />
            <span className="text-[11px] font-semibold text-primary">Members' Choice</span>
          </div>

          <p className="text-2xl font-bold text-slate-900 leading-none">
            {formatPrice(price)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {formatPrice(perPax)} per person
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => onSelect(offer)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-colors shadow-sm shadow-primary/20 active:scale-[0.98]"
        >
          Select <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {shareOpen && (
        <ShareItineraryModal
          url={shareUrl}
          title={`Flight from ${offer.itineraries[0].segments[0].departure.iataCode} to ${offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.iataCode}`}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden animate-pulse">
      <div className="p-5 space-y-4">
        {/* Airline row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-muted" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-5 w-24 rounded bg-muted ml-auto" />
            <div className="h-3 w-16 rounded bg-muted ml-auto" />
          </div>
        </div>
        {/* Outbound row */}
        <div className="flex items-center gap-3">
          <div className="h-3 w-14 rounded bg-muted shrink-0" />
          <div className="flex items-center gap-2 flex-1">
            <div className="space-y-1 shrink-0">
              <div className="h-5 w-12 rounded bg-muted" />
              <div className="h-3 w-8 rounded bg-muted" />
              <div className="h-3 w-10 rounded bg-muted" />
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="w-full h-px bg-muted" />
              <div className="h-3 w-12 rounded bg-muted" />
            </div>
            <div className="space-y-1 shrink-0">
              <div className="h-5 w-12 rounded bg-muted" />
              <div className="h-3 w-8 rounded bg-muted" />
              <div className="h-3 w-10 rounded bg-muted" />
            </div>
          </div>
        </div>
        {/* Return row placeholder */}
        <div className="flex items-center gap-3">
          <div className="h-3 w-14 rounded bg-muted shrink-0" />
          <div className="flex-1 h-px bg-muted" />
        </div>
      </div>
      {/* Footer */}
      <div className="px-5 py-3 bg-muted/40 border-t border-border flex items-center justify-between">
        <div className="flex gap-4">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
        <div className="h-8 w-20 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SearchPage() {
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
        const carrier = outbound.segments[0].carrierCode;
        if (!filters.selectedAirlines.has(carrier)) return false;
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

      // Total flight duration
      const totalFlightMins = offer.itineraries.reduce((sum, it) => {
        const m = it.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
        return sum + (parseInt(m?.[1] ?? "0") * 60) + parseInt(m?.[2] ?? "0");
      }, 0);
      if (totalFlightMins > filters.maxFlightDuration) return false;

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
      const code = o.itineraries[0].segments[0].carrierCode;
      if (!seen.has(code)) seen.set(code, carriers[code] ?? AIRLINE_NAMES[code] ?? code);
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

  // Stable cache key string — primitives only, no object references
  const cacheKey = useMemo(
    () => [tripType, from, to, dept, ret ?? "", passengers, travelClass, JSON.stringify(parsedLegs)].join("|"),
    [tripType, from, to, dept, ret, passengers, travelClass, parsedLegs]
  );

  const fetchFlights = useCallback(async () => {
    const isMultiCity = tripType === "multi-city";

    if (isMultiCity) {
      if (!parsedLegs || parsedLegs.length === 0 || parsedLegs.some((l) => !l.from || !l.to || !l.date)) {
        setError("Missing multi-city search parameters. Please go back and try again.");
        setLoading(false);
        return;
      }
    } else if (!from || !to || !dept) {
      setError("Missing search parameters. Please go back and try again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // 15-second hard timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const res = await fetch("/api/flights/search", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Search failed (${res.status})`);
      }

      const data: FlightSearchResponse & { cached?: boolean } = await res.json();
      const fetched = data.data ?? [];
      setResults(fetched);
      setCarriers(data.dictionaries?.carriers ?? {});
      setFromCache(data.cached === true);
      setSortedResults(applySort(fetched, sortKey, data.dictionaries?.carriers ?? {}));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Search timed out. Please try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  useEffect(() => { fetchFlights(); }, [fetchFlights]);

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
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-24">
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
                {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
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
