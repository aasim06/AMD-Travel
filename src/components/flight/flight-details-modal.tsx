"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  X, Plane, Check, Luggage, ShieldCheck, Users,
  ArrowRight, ChevronDown,
} from "lucide-react";
import type { FlightOffer } from "@/types/flight";
import { AIRLINE_NAMES, AIRCRAFT_NAMES } from "@/types/flight";
import { useCurrency } from "@/context/currency-context";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return iso;
  return [m[1] ? `${m[1]}h` : "", m[2] ? `${m[2]}m` : ""].filter(Boolean).join(" ");
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
}

function layoverMins(arrAt: string, depAt: string) {
  return Math.round((new Date(depAt).getTime() - new Date(arrAt).getTime()) / 60000);
}

function minsToLabel(m: number) {
  const h = Math.floor(m / 60), mm = m % 60;
  return mm > 0 ? `${h}h ${mm}m` : `${h}h`;
}

// ─── Airline Logo ─────────────────────────────────────────────────────────────

function AirlineLogo({ code, className = "" }: { code: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return (
    <div className={`bg-slate-100 flex items-center justify-center ${className}`}>
      <Plane className="h-4 w-4 text-slate-400" />
    </div>
  );
  return (
    <div className={`bg-white border border-slate-100 flex items-center justify-center overflow-hidden px-1.5 ${className}`}>
      <img
        src={`https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${code}.svg`}
        alt={code} className="h-5 w-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

// ─── Flight Segment ───────────────────────────────────────────────────────────

function FlightSegment({
  seg, offer, carriers, isLast,
}: {
  seg: FlightOffer["itineraries"][0]["segments"][0];
  offer: FlightOffer;
  carriers: Record<string, string>;
  isLast: boolean;
}) {
  const airline  = carriers[seg.carrierCode] ?? AIRLINE_NAMES[seg.carrierCode] ?? seg.carrierCode;
  const aircraft = AIRCRAFT_NAMES[seg.aircraft] ?? seg.aircraft;

  return (
    <div className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div className="h-2.5 w-2.5 rounded-full border-2 border-primary bg-white" />
        <div className="w-px flex-1 bg-slate-200 my-1" style={{ minHeight: 52 }} />
        <div className="h-2.5 w-2.5 rounded-full border-2 border-primary bg-white" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-2">
        {/* Departure */}
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-xl font-bold text-slate-900 leading-none">{fmtTime(seg.departure.at)}</span>
          <span className="text-xs text-slate-400">{fmtDateShort(seg.departure.at)}</span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          {seg.departure.iataCode}{seg.departure.terminal ? ` · Terminal ${seg.departure.terminal}` : ""}
        </p>

        {/* Airline + duration */}
        <div className="flex items-center gap-2 mb-3">
          <AirlineLogo code={seg.carrierCode} className="h-7 w-14 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-700">{airline}</span>
            <span className="text-[11px] text-slate-400">{seg.carrierCode}{seg.flightNumber} · {aircraft}</span>
          </div>
          <span className="ml-auto text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {parseDuration(seg.duration)}
          </span>
        </div>

        {/* Arrival */}
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-xl font-bold text-slate-900 leading-none">{fmtTime(seg.arrival.at)}</span>
          <span className="text-xs text-slate-400">{fmtDateShort(seg.arrival.at)}</span>
        </div>
        <p className="text-xs text-slate-500">
          {seg.arrival.iataCode}{seg.arrival.terminal ? ` · Terminal ${seg.arrival.terminal}` : ""}
        </p>

        {/* Baggage — last segment only */}
        {isLast && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {[
              { label: "Personal item", ok: true },
              { label: "Cabin bag", ok: true },
              {
                label: offer.baggageAllowance?.quantity
                  ? `${offer.baggageAllowance.quantity}× Checked bag`
                  : "No checked bag",
                ok: !!offer.baggageAllowance?.quantity,
              },
            ].map((b) => (
              <span
                key={b.label}
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                  b.ok
                    ? "bg-primary/5 border-primary/20 text-primary"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <Luggage className="h-3 w-3" />{b.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Accordion Leg ────────────────────────────────────────────────────────────

function AccordionLeg({
  offer, legIndex, carriers, defaultOpen,
}: {
  offer: FlightOffer;
  legIndex: number;
  carriers: Record<string, string>;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const leg      = offer.itineraries[legIndex];
  if (!leg) return null;

  const firstSeg  = leg.segments[0];
  const lastSeg   = leg.segments[leg.segments.length - 1];
  const legLabel  = legIndex === 0 ? "Outbound" : "Return";
  const stops     = leg.segments.length - 1;
  const stopLabel = stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`;
  const depTime   = fmtTime(firstSeg.departure.at);
  const arrTime   = fmtTime(lastSeg.arrival.at);

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      {/* ── Accordion header (always visible) ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 hover:bg-slate-100/80 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Direction badge */}
          <span className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
            legIndex === 0
              ? "bg-primary/10 text-primary"
              : "bg-amber-50 text-amber-600"
          }`}>
            {legLabel}
          </span>

          {/* Route summary */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-bold text-slate-800">{firstSeg.departure.iataCode}</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-sm font-bold text-slate-800">{lastSeg.arrival.iataCode}</span>
          </div>

          {/* Time summary */}
          <span className="hidden sm:block text-xs text-slate-500 shrink-0">
            {depTime} → {arrTime}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 ml-3">
          {/* Duration pill */}
          <span className="text-xs font-semibold text-primary bg-primary/8 border border-primary/15 px-2.5 py-1 rounded-full">
            {parseDuration(leg.duration)}
          </span>
          {/* Stop badge */}
          <span className={`hidden sm:block text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            stops === 0 ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
          }`}>
            {stopLabel}
          </span>
          {/* Chevron */}
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* ── Accordion body ── */}
      <div className={`accordion-body ${open ? "open" : ""}`}>
        <div className="px-5 py-5 space-y-0 bg-white">
          {leg.segments.map((seg, si) => {
            const nextSeg   = leg.segments[si + 1];
            const loverMins = nextSeg ? layoverMins(seg.arrival.at, nextSeg.departure.at) : 0;
            const isLast    = si === leg.segments.length - 1;
            return (
              <div key={seg.id}>
                <FlightSegment seg={seg} offer={offer} carriers={carriers} isLast={isLast} />
                {nextSeg && (
                  <div className="flex items-center gap-3 my-3 ml-[18px]">
                    <div className="h-px flex-1 bg-slate-100" />
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      Layover · {seg.arrival.iataCode} · {minsToLabel(loverMins)}
                    </span>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Fare Card ────────────────────────────────────────────────────────────────

type FareType = "basic" | "guarantee";

function FareCard({ type, price, onSelect }: { type: FareType; price: number; onSelect: () => void }) {
  const { formatPrice } = useCurrency();
  const isGuarantee = type === "guarantee";

  const features = isGuarantee
    ? ["Instant refund to original payment", "Free rebooking within 48 hours", "Missed connection protection"]
    : ["Standard booking confirmation", "E-ticket via email", "Airline baggage policy applies"];

  return (
    <div
      className={`rounded-[10px] border p-4 transition-all ${
        isGuarantee
          ? "border-primary/30 bg-primary/[0.03] ring-1 ring-primary/20"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`h-8 w-8 rounded-[10px] flex items-center justify-center shrink-0 ${
            isGuarantee ? "bg-primary/10" : "bg-slate-100"
          }`}>
            {isGuarantee
              ? <ShieldCheck className="h-4 w-4 text-primary" />
              : <Plane className="h-4 w-4 text-slate-500" />
            }
          </div>
          <div>
            <p className={`text-sm font-bold ${isGuarantee ? "text-slate-900" : "text-slate-700"}`}>
              {isGuarantee ? "Flex" : "Basic"}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isGuarantee ? "Full protection & flexibility" : "Standard fare, no extras"}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-lg font-bold ${isGuarantee ? "text-primary" : "text-slate-800"}`}>
            {formatPrice(price)}
          </p>
          <p className="text-[11px] text-slate-400">per person</p>
        </div>
      </div>

      <ul className="space-y-1.5 mb-4">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
              isGuarantee ? "bg-primary/10" : "bg-slate-100"
            }`}>
              <Check className={`h-2.5 w-2.5 ${isGuarantee ? "text-primary" : "text-slate-400"}`} />
            </span>
            <span className="text-xs text-slate-600">{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSelect}
        className={`w-full py-2.5 rounded-[10px] text-sm font-semibold transition-all active:scale-[0.98] ${
          isGuarantee
            ? "bg-primary hover:bg-primary/90 text-white"
            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
        }`}
      >
        Continue · {formatPrice(price)}
      </button>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function FlightDetailsModal({
  offer, carriers, onClose,
}: {
  offer:    FlightOffer;
  carriers: Record<string, string>;
  onClose:  () => void;
}) {
  const router  = useRouter();
  const [visible, setVisible] = useState(false);
  const basePrice      = parseFloat(offer.price.total);
  const guaranteePrice = basePrice + Math.round(basePrice * 0.18);
  const firstSeg = offer.itineraries[0].segments[0];
  const lastLeg  = offer.itineraries[offer.itineraries.length - 1];
  const lastSeg  = lastLeg.segments[lastLeg.segments.length - 1];
  const isRound  = offer.itineraries.length > 1;

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  function handleSelect(fareType: FareType, price: number) {
    router.push(`/checkout?flightId=${offer.id}&fareType=${fareType}&price=${price}`);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4 transition-all duration-300 ${
        visible ? "bg-black/40 backdrop-blur-sm" : "bg-black/0 backdrop-blur-none"
      }`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`relative w-full max-w-4xl bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col transition-all duration-300 ease-out ${
          visible ? "opacity-100 translate-y-0 sm:scale-100" : "opacity-0 translate-y-8 sm:scale-95"
        }`}
        style={{ maxHeight: "85vh" }}
      >
        {/* ── Header (sticky) ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Trip Details</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {firstSeg.departure.iataCode} → {lastSeg.arrival.iataCode}
              {isRound && " · Round trip"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {offer.numberOfBookableSeats && (
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-medium text-slate-600">{offer.numberOfBookableSeats} seats left</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">

          {/* Left: Accordion itinerary — scrollable */}
          <div className="lg:w-[52%] border-b lg:border-b-0 lg:border-r border-slate-100 overflow-y-auto no-scrollbar px-5 py-5 space-y-3">
            {offer.itineraries.map((_, i) => (
              <AccordionLeg
                key={i}
                offer={offer}
                legIndex={i}
                carriers={carriers}
                defaultOpen={i === 0}
              />
            ))}
          </div>

          {/* Right: Fare selection — sticky, non-scrolling on desktop */}
          <div className="lg:w-[48%] overflow-y-auto no-scrollbar px-5 py-5 bg-slate-50/50 flex flex-col">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 shrink-0">Select a fare</p>

            <div className="space-y-3">
              <FareCard
                type="guarantee"
                price={guaranteePrice}
                onSelect={() => handleSelect("guarantee", guaranteePrice)}
              />
              <FareCard
                type="basic"
                price={basePrice}
                onSelect={() => handleSelect("basic", basePrice)}
              />
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-slate-200">
              {["Secure payment", "Price guarantee", "24/7 support"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Check className="h-3 w-3 text-primary" />{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
