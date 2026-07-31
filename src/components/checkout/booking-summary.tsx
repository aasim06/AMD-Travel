"use client";

import { Plane, Clock, ChevronRight } from "lucide-react";
import type { FlightOffer } from "@/types/flight";
import { AIRLINE_NAMES } from "@/types/flight";
import { useCurrency } from "@/context/currency-context";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
}

function parseDuration(iso: string) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return iso;
  return [m[1] ? `${m[1]}h` : "", m[2] ? `${m[2]}m` : ""].filter(Boolean).join(" ");
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BookingSummaryProps {
  offer:         FlightOffer;
  carriers:      Record<string, string>;
  fareClass:     string;
  passengers:    number;
  selectedPrice?: number | null;
  compact?:      boolean;
}

export function BookingSummary({ offer, carriers, fareClass, passengers, selectedPrice, compact }: BookingSummaryProps) {
  const { formatPrice } = useCurrency();

  const totalPrice = selectedPrice ?? parseFloat(offer.price.total);
  const basePrice  = parseFloat(offer.price.base);
  const taxes      = totalPrice - basePrice;
  const perPax     = totalPrice / passengers;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.06) 0px 4px 24px" }}>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-5 py-4">
        <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-0.5">Booking Summary</p>
        <p className="text-white font-bold text-base">
          {offer.itineraries[0].segments[0].departure.iataCode}
          {" → "}
          {offer.itineraries[offer.itineraries.length - 1].segments.at(-1)!.arrival.iataCode}
        </p>
      </div>

      <div className="p-5 space-y-5">

        {/* Itineraries */}
        {offer.itineraries.map((itin, i) => {
          const dep = itin.segments[0];
          const arr = itin.segments.at(-1)!;
          const stops = itin.segments.length - 1;
          const airline = carriers[dep.carrierCode] ?? AIRLINE_NAMES[dep.carrierCode] ?? dep.carrierCode;

          return (
            <div key={i}>
              {i > 0 && <div className="border-t border-dashed border-slate-200 my-4" />}

              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                {i === 0 ? "Outbound" : "Return"} · {formatDate(dep.departure.at)}
              </p>

              <div className="flex items-center gap-3">
                {/* Dep */}
                <div className="shrink-0">
                  <p className="text-xl font-bold text-slate-900 leading-none tabular-nums">{formatTime(dep.departure.at)}</p>
                  <p className="text-xs font-bold text-primary mt-0.5">{dep.departure.iataCode}</p>
                </div>

                {/* Center */}
                <div className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-slate-500">{parseDuration(itin.duration)}</span>
                  <div className="w-full flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full border-2 border-primary bg-white shrink-0" />
                    <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                    <Plane className="h-3 w-3 text-primary shrink-0" />
                    <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                    <div className="h-1.5 w-1.5 rounded-full border-2 border-primary bg-white shrink-0" />
                  </div>
                  <span className={`text-[10px] font-semibold ${stops === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                    {stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? "s" : ""}`}
                  </span>
                </div>

                {/* Arr */}
                <div className="shrink-0 text-right">
                  <p className="text-xl font-bold text-slate-900 leading-none tabular-nums">{formatTime(arr.arrival.at)}</p>
                  <p className="text-xs font-bold text-primary mt-0.5">{arr.arrival.iataCode}</p>
                </div>
              </div>

              {/* Airline + class */}
              <div className="flex items-center gap-2 mt-2.5">
                <span className="text-[11px] text-slate-500">{airline}</span>
                <span className="h-3 w-px bg-slate-200" />
                <span className="text-[11px] font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full">{fareClass}</span>
                {!compact && (
                  <>
                    <span className="h-3 w-px bg-slate-200" />
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-[11px] text-slate-400">{dep.flightNumber}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Price breakdown */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Price Breakdown</p>

          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Base fare × {passengers}</span>
            <span className="font-medium text-slate-800">{formatPrice(basePrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Taxes & fees</span>
            <span className="font-medium text-slate-800">{formatPrice(taxes)}</span>
          </div>
          {offer.baggageAllowance?.quantity ? (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Checked bag ({offer.baggageAllowance.quantity}×{offer.baggageAllowance.weight}{offer.baggageAllowance.weightUnit})</span>
              <span className="font-medium text-emerald-600">Included</span>
            </div>
          ) : null}

          <div className="border-t border-slate-100 pt-3 mt-1 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-800">Total</span>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{formatPrice(totalPrice)}</p>
              <p className="text-[11px] text-slate-400">{formatPrice(perPax)} per person</p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-1.5">
          {[
            "Secure 256-bit SSL encryption",
            "Instant booking confirmation",
            "Free cancellation within 24h",
          ].map((text) => (
            <div key={text} className="flex items-center">
              <span className="text-[11px] text-slate-500 font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
