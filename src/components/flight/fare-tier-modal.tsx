"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Check, Armchair, RefreshCcw, ShieldCheck, Zap, ArrowRight, Luggage } from "lucide-react";
import type { FlightOffer } from "@/types/flight";
import { useCurrency } from "@/context/currency-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FareTier {
  id: "light" | "standard" | "flex";
  label: string;
  tagline: string;
  priceAdd: number;
  recommended: boolean;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  features: {
    label: string;
    value: string;
    included: boolean;
  }[];
}

// ─── Tier Builder ─────────────────────────────────────────────────────────────

function buildTiers(basePrice: number, checkedBagQty: number): FareTier[] {
  const hasBag = checkedBagQty > 0;

  return [
    {
      id: "light",
      label: "Economy Light",
      tagline: hasBag ? "Bag included" : "Hand baggage only",
      priceAdd: 0,
      recommended: false,
      accentBg: "bg-slate-50",
      accentBorder: "border-slate-200",
      accentText: "text-slate-600",
      features: [
        { label: "Personal item",  value: "1 under-seat bag",                              included: true  },
        { label: "Cabin bag",      value: "1 carry-on",                                   included: true  },
        { label: "Checked bag",    value: hasBag ? `${checkedBagQty}× included` : "Not included", included: hasBag },
        { label: "Seat selection", value: "Not included",                                  included: false },
        { label: "Changes",        value: "Fee applies",                                   included: false },
      ],
    },
    {
      id: "standard",
      label: "Economy Standard",
      tagline: "Most popular · Seat + bag",
      priceAdd: Math.round(basePrice * 0.12),
      recommended: true,
      accentBg: "bg-primary/5",
      accentBorder: "border-primary/40",
      accentText: "text-primary",
      features: [
        { label: "Personal item",  value: "1 under-seat bag",             included: true  },
        { label: "Cabin bag",      value: "1 carry-on included",          included: true  },
        { label: "Checked bag",    value: hasBag ? `${checkedBagQty}× included` : "1 × 23 KG included", included: true  },
        { label: "Seat selection", value: "Standard seat included",       included: true  },
        { label: "Changes",        value: "Fee applies",                  included: false },
      ],
    },
    {
      id: "flex",
      label: "Economy Flex",
      tagline: "Full flexibility + priority",
      priceAdd: Math.round(basePrice * 0.28),
      recommended: false,
      accentBg: "bg-amber-50",
      accentBorder: "border-amber-300",
      accentText: "text-amber-700",
      features: [
        { label: "Personal item",  value: "1 under-seat bag",             included: true  },
        { label: "Cabin bag",      value: "1 carry-on included",          included: true  },
        { label: "Checked bag",    value: hasBag ? `${checkedBagQty}× included` : "2 × 23 KG included", included: true  },
        { label: "Seat selection", value: "Any seat — free",              included: true  },
        { label: "Changes",        value: "Free changes & refund",        included: true  },
      ],
    },
  ];
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface FareTierModalProps {
  offer: FlightOffer;
  carriers: Record<string, string>;
  onClose: () => void;
  onConfirm: (tier: FareTier, finalPrice: number) => void;
}

export function FareTierModal({ offer, carriers, onClose, onConfirm }: FareTierModalProps) {
  const { formatPrice } = useCurrency();
  const overlayRef = useRef<HTMLDivElement>(null);

  const basePrice    = parseFloat(offer.price.total);
  const checkedBagQty = offer.baggageAllowance?.quantity ?? (offer.baggageAllowance?.weight ? 1 : 0);
  const tiers        = buildTiers(basePrice, checkedBagQty);

  const firstSeg    = offer.itineraries[0].segments[0];
  const lastSeg     = offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1];
  const carrierCode = firstSeg.carrierCode;
  const airlineName = carriers[carrierCode] ?? carrierCode;
  const stops       = offer.itineraries[0].segments.length - 1;

  // ESC to close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  // Lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-3xl bg-white sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95dvh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Choose your fare</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {airlineName}
              <span className="mx-1.5 text-slate-300">·</span>
              {firstSeg.departure.iataCode} → {lastSeg.arrival.iataCode}
              <span className="mx-1.5 text-slate-300">·</span>
              {stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cards */}
        <div className="overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {tiers.map((tier) => {
            const finalPrice = basePrice + tier.priceAdd;
            return (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-200
                  ${tier.recommended
                    ? "border-primary shadow-lg shadow-primary/10 scale-[1.01]"
                    : `${tier.accentBorder} hover:border-slate-300`
                  }`}
              >
                {/* Popular badge */}
                {tier.recommended && (
                  <div className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider py-1.5 px-3">
                    <Zap className="h-3 w-3 fill-current" />
                    Most Popular
                  </div>
                )}

                {/* Tier header */}
                <div className={`p-4 pb-3 ${tier.accentBg}`}>
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${tier.accentText}`}>{tier.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{tier.tagline}</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-3 leading-none">{formatPrice(finalPrice)}</p>
                  {tier.priceAdd > 0 && (
                    <p className="text-[10px] text-slate-400 mt-0.5">+{formatPrice(tier.priceAdd)} vs Light fare</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-0.5">per person · incl. taxes</p>
                </div>

                {/* Feature list */}
                <div className="flex-1 p-4 pt-3 space-y-2">
                  {tier.features.map((feat, fi) => (
                    <div key={fi} className="flex items-start gap-2">
                      <span className={`mt-0.5 shrink-0 ${feat.included ? "text-emerald-500" : "text-slate-300"}`}>
                        {feat.included
                          ? <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          : <X className="h-3.5 w-3.5 stroke-[2]" />
                        }
                      </span>
                      <div>
                        <p className={`text-[11px] font-semibold leading-tight ${feat.included ? "text-slate-800" : "text-slate-400"}`}>
                          {feat.label}
                        </p>
                        <p className={`text-[10px] ${feat.included ? "text-slate-500" : "text-slate-400"}`}>
                          {feat.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="p-4 pt-2">
                  <button
                    onClick={() => onConfirm(tier, finalPrice)}
                    className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]
                      ${tier.recommended
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                  >
                    Select <span className="opacity-80">{tier.label.replace("Economy ", "")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center gap-2 shrink-0">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <p className="text-[11px] text-slate-500">
            Prices include all taxes &amp; fees. Fare rules apply. Via Amadeus GDS.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
