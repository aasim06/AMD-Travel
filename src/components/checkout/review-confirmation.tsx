"use client";

import { CheckCircle, Download, Share2, Plane, Calendar, User, Mail, QrCode, Clock } from "lucide-react";
import type { CheckoutData } from "./types";
import type { FlightOffer } from "@/types/flight";
import { AIRLINE_NAMES } from "@/types/flight";
import { useCurrency } from "@/context/currency-context";
import { useCallback } from "react";
import { generateFlightTicketPdf } from "@/lib/flightTicketPdfGenerator";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// ─── Review Step ──────────────────────────────────────────────────────────────

interface ReviewStepProps {
  formData:      CheckoutData;
  offer:         FlightOffer;
  carriers:      Record<string, string>;
  fareClass:     string;
  selectedPrice: number;
  onConfirm:     () => void;
  onBack:        () => void;
}

export function ReviewStep({ formData, offer, carriers, fareClass, selectedPrice, onConfirm, onBack }: ReviewStepProps) {
  const { formatPrice } = useCurrency();

  return (
    <div className="space-y-5">

      {/* Passengers summary */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.04) 0px 2px 16px" }}>
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <p className="text-sm font-bold text-slate-800">Passenger Details</p>
        </div>
        <div className="divide-y divide-slate-100">
          {formData.passengers.map((p, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{p.title} {p.firstName} {p.lastName}</p>
                <p className="text-[11px] text-slate-400">{p.nationality} · Passport: {p.passportNumber}</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {i === 0 ? "Lead" : `Pax ${i + 1}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5" style={{ boxShadow: "rgba(0,0,0,0.04) 0px 2px 16px" }}>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Contact</p>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-slate-400 text-[11px]">Email</p>
            <p className="font-semibold text-slate-800">{formData.contact.email}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Phone</p>
            <p className="font-semibold text-slate-800">{formData.contact.countryCode} {formData.contact.phone}</p>
          </div>
        </div>
      </div>

      {/* Flight summary */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.04) 0px 2px 16px" }}>
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
          <p className="text-sm font-bold text-slate-800">Flight Details</p>
        </div>
        {offer.itineraries.map((itin, i) => {
          const dep = itin.segments[0];
          const arr = itin.segments.at(-1)!;
          const airline = carriers[dep.carrierCode] ?? AIRLINE_NAMES[dep.carrierCode] ?? dep.carrierCode;
          return (
            <div key={i} className="px-5 py-4 flex items-center gap-4 border-b border-slate-100 last:border-0">
              <Plane className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">
                  {dep.departure.iataCode} → {arr.arrival.iataCode}
                </p>
                <p className="text-[11px] text-slate-400">{formatDate(dep.departure.at)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800 tabular-nums">
                  {formatTime(dep.departure.at)} – {formatTime(arr.arrival.at)}
                </p>
                <p className="text-[11px] text-primary font-semibold">{fareClass} · {airline}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl px-5 py-4 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-800">Total Amount</p>
        <p className="text-2xl font-bold text-primary">{formatPrice(selectedPrice)}</p>
      </div>

      {/* Actions */}
      <button
        type="button"
        onClick={onConfirm}
        className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
      >
        Proceed to Payment →
      </button>
      <button type="button" onClick={onBack} className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-1">
        ← Edit Passengers
      </button>
    </div>
  );
}

// ─── Confirmation Step ────────────────────────────────────────────────────────

interface ConfirmationStepProps {
  pnr:           string;
  bookingSource?: string | null;
  formData:      CheckoutData;
  offer:         FlightOffer;
  carriers:      Record<string, string>;
  selectedPrice: number;
}

export function ConfirmationStep({ pnr, bookingSource, formData, offer, carriers, selectedPrice }: ConfirmationStepProps) {
  const { formatPrice } = useCurrency();
  const dep = offer.itineraries[0].segments[0];
  const arr = offer.itineraries[offer.itineraries.length - 1].segments.at(-1)!;

  const handleDownload = useCallback(async () => {
    try {
      await generateFlightTicketPdf({
        pnr,
        offer,
        formData,
        carriers,
        selectedPrice,
        formattedPrice: formatPrice(selectedPrice),
        bookingSource,
      });
    } catch (err) {
      console.error("[E-Ticket PDF Error]:", err);
    }
  }, [pnr, offer, formData, carriers, selectedPrice, formatPrice, bookingSource]);

  const handleShare = useCallback(async () => {
    const text =
      `AMD Global Travel — Booking Confirmed!\n` +
      `PNR: ${pnr}\n` +
      `${dep.departure.iataCode} → ${arr.arrival.iataCode}\n` +
      `${new Date(dep.departure.at).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}\n` +
      `Total: ${formatPrice(selectedPrice)}`;

    if (navigator.share) {
      await navigator.share({ title: "Flight Booking — AMD Global", text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("Booking details copied to clipboard!");
    }
  }, [pnr, dep, arr, selectedPrice, formatPrice]);

  return (
    <div className="space-y-6">

      {/* Success banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
        <div className="flex justify-center mb-3">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
        <p className="text-lg font-bold text-emerald-800">Booking Confirmed!</p>
        <p className="text-sm text-emerald-600 mt-1">
          Your e-ticket has been sent to <span className="font-semibold">{formData.contact.email}</span>
        </p>

        {/* PNR */}
        <div className="mt-4 inline-flex flex-col items-center bg-white border border-slate-200 rounded-2xl px-8 py-4 shadow-sm relative group">
          {bookingSource === "AMADEUS_LIVE" ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-3 py-1 rounded-full mb-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              Live Amadeus GDS PNR (Verified)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100/80 border border-amber-300 px-3 py-1 rounded-full mb-1">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Demo / Test PNR Code (Sandbox)
            </span>
          )}
          <div className="flex items-center gap-3">
            <p className="text-3xl font-black text-slate-900 tracking-[0.25em] font-mono">{pnr}</p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(pnr);
                alert(`PNR Code ${pnr} copied to clipboard!`);
              }}
              className="text-xs text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Prominent Action Buttons */}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-slate-900/10 active:scale-[0.98]"
          >
            <Download className="h-4 w-4 text-amber-400" />
            <span>Download Official E-Ticket (PDF)</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Share Details</span>
          </button>
        </div>
      </div>

      {/* Itinerary card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.04) 0px 2px 16px" }}>
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-800">Your Itinerary</p>
          <div className="flex gap-2">
            <button type="button" onClick={handleDownload} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors" title="Download PDF">
              <Download className="h-3.5 w-3.5 text-slate-500" />
            </button>
            <button type="button" onClick={handleShare} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors" title="Share">
              <Share2 className="h-3.5 w-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Route */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-2xl font-black text-slate-900">{dep.departure.iataCode}</p>
              <p className="text-xs text-slate-400">{formatTime(dep.departure.at)}</p>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <Plane className="h-4 w-4 text-primary" />
              <div className="w-full border-t border-dashed border-slate-200 mt-1" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900">{arr.arrival.iataCode}</p>
              <p className="text-xs text-slate-400">{formatTime(arr.arrival.at)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(dep.departure.at)}
          </div>

          {/* Passengers */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            {formData.passengers.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 font-medium">{p.title} {p.firstName} {p.lastName}</span>
                <span className="text-[11px] text-slate-400 font-mono">{p.passportNumber}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
            <span className="text-sm text-slate-500">Total Paid</span>
            <span className="text-lg font-bold text-slate-900">{formatPrice(selectedPrice)}</span>
          </div>
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-3.5">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Next Steps</p>
        {[
          {
            icon: Mail,
            title: "E-Ticket Delivery",
            text: "Official airline e-ticket with barcode has been sent to your email",
          },
          {
            icon: QrCode,
            title: "Airport Check-In",
            text: "Present your PNR code at the airport check-in desk or online portal",
          },
          {
            icon: Clock,
            title: "Departure Advisory",
            text: "Online check-in opens 24–48 hours prior to scheduled departure",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => window.location.href = "/"}
        className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
      >
        Back to Home
      </button>
    </div>
  );
}
