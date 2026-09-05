"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  Crown,
  Lock,
} from "lucide-react";
import type { FlightOffer } from "@/types/flight";
import { AIRLINE_NAMES, AIRLINE_LOGO_FALLBACKS } from "@/types/flight";
import { useCurrency } from "@/context/currency-context";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FareTier {
  id: "light" | "standard" | "flex";
  label: string;
  badge: string;
  tagline: string;
  priceAdd: number;
  recommended: boolean;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  accentPillBg: string;
  features: {
    icon: "luggage" | "cabin" | "personal" | "seat" | "changes" | "refund" | "priority";
    label: string;
    value: string;
    included: boolean;
    highlight?: boolean;
  }[];
}

// ─── Airline Logo Component ───────────────────────────────────────────────────

const LOCAL_LOGOS: Record<string, string> = {
  "9P": "/airlines/9P.jpg",
  PF: "/airlines/PF.png",
};

function AirlineLogo({ code, className = "" }: { code: string; className?: string }) {
  const urls = [
    LOCAL_LOGOS[code],
    `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${code}.svg`,
    `https://content.airhex.com/content/logos/airlines_${code}_350_100_r.png`,
    AIRLINE_LOGO_FALLBACKS[code],
  ].filter(Boolean) as string[];

  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  const name = AIRLINE_NAMES[code] ?? code;
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  function handleError() {
    if (idx + 1 < urls.length) setIdx(idx + 1);
    else setFailed(true);
  }

  if (failed) {
    return (
      <div className={`bg-primary/10 rounded-lg flex items-center justify-center font-bold text-xs text-primary ${className}`}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={urls[idx]}
      alt={name}
      onError={handleError}
      className={`object-contain ${className}`}
      loading="lazy"
    />
  );
}

// ─── Tier Builder ─────────────────────────────────────────────────────────────

function buildTiers(basePrice: number, checkedBagQty: number): FareTier[] {
  const hasBaseBag = checkedBagQty > 0;
  const standardBagDesc = hasBaseBag
    ? `${checkedBagQty} × 23 KG included`
    : "1 × 23 KG included";
  const flexBagDesc = hasBaseBag
    ? `${checkedBagQty + 1} × 23 KG included`
    : "2 × 23 KG included (46 KG Total)";

  return [
    {
      id: "light",
      label: "Economy Light",
      badge: "Basic Fare",
      tagline: hasBaseBag ? "Essential fare · Bag included" : "Hand baggage only · Best price",
      priceAdd: 0,
      recommended: false,
      accentBg: "bg-slate-50/80 dark:bg-slate-900/60",
      accentBorder: "border-slate-200 dark:border-slate-800",
      accentText: "text-slate-700 dark:text-slate-300",
      accentPillBg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      features: [
        {
          icon: "personal",
          label: "Personal Item",
          value: "1 Small under-seat bag (Laptop/Handbag)",
          included: true,
        },
        {
          icon: "cabin",
          label: "Cabin Carry-on",
          value: "1 × 7 KG Overhead bag",
          included: true,
        },
        {
          icon: "luggage",
          label: "Checked Baggage",
          value: hasBaseBag ? `${checkedBagQty} × 23 KG included` : "Not included",
          included: hasBaseBag,
          highlight: hasBaseBag,
        },
        {
          icon: "seat",
          label: "Seat Selection",
          value: "Standard seat allocated at check-in",
          included: false,
        },
        {
          icon: "changes",
          label: "Flight Changes",
          value: "Fee applies + fare difference",
          included: false,
        },
        {
          icon: "refund",
          label: "Cancellation & Refund",
          value: "Non-refundable ticket",
          included: false,
        },
        {
          icon: "priority",
          label: "Boarding Priority",
          value: "Standard Boarding (Group 4)",
          included: false,
        },
      ],
    },
    {
      id: "standard",
      label: "Economy Standard",
      badge: "Most Popular",
      tagline: "Seat selection + checked baggage included",
      priceAdd: Math.round(basePrice * 0.12),
      recommended: true,
      accentBg: "bg-primary/5 dark:bg-primary/10",
      accentBorder: "border-primary",
      accentText: "text-primary",
      accentPillBg: "bg-primary/15 text-primary border border-primary/30",
      features: [
        {
          icon: "personal",
          label: "Personal Item",
          value: "1 Small under-seat bag (Laptop/Handbag)",
          included: true,
        },
        {
          icon: "cabin",
          label: "Cabin Carry-on",
          value: "1 × 7 KG Overhead bag",
          included: true,
        },
        {
          icon: "luggage",
          label: "Checked Baggage",
          value: standardBagDesc,
          included: true,
          highlight: true,
        },
        {
          icon: "seat",
          label: "Seat Selection",
          value: "Choose standard seat in advance",
          included: true,
        },
        {
          icon: "changes",
          label: "Flight Changes",
          value: "Flexible changes allowed (low fee)",
          included: true,
        },
        {
          icon: "refund",
          label: "Cancellation & Refund",
          value: "Partial refund with airline fee",
          included: false,
        },
        {
          icon: "priority",
          label: "Boarding Priority",
          value: "General Boarding (Group 3)",
          included: true,
        },
      ],
    },
    {
      id: "flex",
      label: "Economy Flex",
      badge: "Maximum Freedom",
      tagline: "Full refundability + 2 bags + free changes",
      priceAdd: Math.round(basePrice * 0.28),
      recommended: false,
      accentBg: "bg-slate-50 dark:bg-slate-900/50",
      accentBorder: "border-slate-300 dark:border-slate-700",
      accentText: "text-slate-800 dark:text-slate-200",
      accentPillBg: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700",
      features: [
        {
          icon: "personal",
          label: "Personal Item",
          value: "1 Small under-seat bag (Laptop/Handbag)",
          included: true,
        },
        {
          icon: "cabin",
          label: "Cabin Carry-on",
          value: "1 × 7 KG Overhead bag",
          included: true,
        },
        {
          icon: "luggage",
          label: "Checked Baggage",
          value: flexBagDesc,
          included: true,
          highlight: true,
        },
        {
          icon: "seat",
          label: "Seat Selection",
          value: "Any seat free (Standard & Preferred)",
          included: true,
        },
        {
          icon: "changes",
          label: "Flight Changes",
          value: "100% Free date changes up to 24h before",
          included: true,
          highlight: true,
        },
        {
          icon: "refund",
          label: "Cancellation & Refund",
          value: "100% Refundable ticket (Zero penalty)",
          included: true,
          highlight: true,
        },
        {
          icon: "priority",
          label: "Boarding Priority",
          value: "Priority Check-in & Boarding (Group 1)",
          included: true,
        },
      ],
    },
  ];
}

// ─── Modal Props ──────────────────────────────────────────────────────────────

interface FareTierModalProps {
  offer: FlightOffer;
  carriers: Record<string, string>;
  onClose: () => void;
  onConfirm: (tier: FareTier, finalPrice: number) => void;
}

// ─── Modal Component ──────────────────────────────────────────────────────────

export function FareTierModal({ offer, carriers, onClose, onConfirm }: FareTierModalProps) {
  const { formatPrice } = useCurrency();
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const basePrice = parseFloat(offer.price.total);
  const checkedBagQty =
    offer.baggageAllowance?.quantity ?? (offer.baggageAllowance?.weight ? 1 : 0);
  const tiers = buildTiers(basePrice, checkedBagQty);

  // Active selected tier state (defaults to "standard")
  const [selectedTierId, setSelectedTierId] = useState<"light" | "standard" | "flex">("standard");

  const cardRefLight = useRef<HTMLDivElement>(null);
  const cardRefStandard = useRef<HTMLDivElement>(null);
  const cardRefFlex = useRef<HTMLDivElement>(null);

  const getCardRef = useCallback((id: "light" | "standard" | "flex") => {
    if (id === "light") return cardRefLight;
    if (id === "standard") return cardRefStandard;
    return cardRefFlex;
  }, []);

  const activeTier = tiers.find((t) => t.id === selectedTierId) || tiers[1];
  const activeFinalPrice = basePrice + activeTier.priceAdd;

  const firstSeg = offer.itineraries[0].segments[0];
  const lastSeg =
    offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1];
  const carrierCode = firstSeg.carrierCode;
  const airlineName = carriers[carrierCode] ?? AIRLINE_NAMES[carrierCode] ?? carrierCode;
  const stops = offer.itineraries[0].segments.length - 1;

  // Format departure date e.g. "Wed, 14 Oct 2026"
  const depDateStr = React.useMemo(() => {
    try {
      const d = new Date(firstSeg.departure.at);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  }, [firstSeg.departure.at]);

  // Duration
  const durationFormatted = React.useMemo(() => {
    const raw = offer.itineraries[0].duration;
    const match = raw.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return raw;
    const h = match[1] ? `${match[1]}h` : "";
    const m = match[2] ? `${match[2]}m` : "";
    return [h, m].filter(Boolean).join(" ");
  }, [offer.itineraries]);

  // Smooth scroll to card on mobile tab selection
  const scrollToTier = (id: "light" | "standard" | "flex") => {
    setSelectedTierId(id);
    const ref = getCardRef(id);
    if (ref.current && scrollContainerRef.current) {
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  };

  // Center on recommended card (standard) on mount on mobile
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      const timer = setTimeout(() => {
        cardRefStandard.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Update selected tier as user swipes horizontally on mobile
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let timeoutId: any;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.innerWidth >= 640) return;
        const containerCenter = container.scrollLeft + container.clientWidth / 2;
        let closestId: "light" | "standard" | "flex" = selectedTierId;
        let closestDist = Infinity;

        (["light", "standard", "flex"] as const).forEach((id) => {
          const el = getCardRef(id).current;
          if (!el) return;
          const elCenter = el.offsetLeft + el.offsetWidth / 2;
          const dist = Math.abs(containerCenter - elCenter);
          if (dist < closestDist) {
            closestDist = dist;
            closestId = id;
          }
        });

        if (closestId !== selectedTierId) {
          setSelectedTierId(closestId);
        }
      }, 60);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [selectedTierId, getCardRef]);

  // ESC to close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  // Lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      ref={overlayRef}
      data-lenis-prevent="true"
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-6 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Main Luxury Modal Card — Expanded width (max-w-[1220px]) with theme styling */}
      <div
        data-lenis-prevent="true"
        className="relative w-full sm:w-[94vw] max-w-[1220px] bg-white dark:bg-slate-900 rounded-t-[20px] sm:rounded-[20px] shadow-2xl overflow-hidden max-h-[96dvh] sm:max-h-[94dvh] flex flex-col border border-slate-200/60 dark:border-slate-800 transition-all overscroll-contain"
        style={{ overscrollBehavior: "contain" }}
      >

        {/* ── Top Header Bar ── */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-11 rounded-lg bg-slate-50 dark:bg-slate-800 p-1 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
              <AirlineLogo code={carrierCode} className="h-full w-full object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                Choose your fare
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">
                <span className="font-medium text-slate-600 dark:text-slate-300">{airlineName}</span>
                <span>·</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">{firstSeg.departure.iataCode} → {lastSeg.arrival.iataCode}</span>
                <span>·</span>
                <span>{stops === 0 ? "Direct" : `${stops} stop`} · {durationFormatted}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close fare selector"
            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Mobile Segmented Control ── */}
        <div className="sm:hidden px-3 py-2 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="grid grid-cols-3 gap-0.5 p-0.5 bg-slate-200/60 dark:bg-slate-800 rounded-[10px]">
            {tiers.map((tier) => {
              const isSelected = selectedTierId === tier.id;
              const finalPrice = basePrice + tier.priceAdd;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => scrollToTier(tier.id)}
                  className={`py-1.5 px-2 rounded-[8px] flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-white dark:bg-slate-700 shadow-sm"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <span className={`text-[10px] leading-tight ${isSelected ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium'}`}>
                    {tier.label.replace("Economy ", "")}
                  </span>
                  <span className={`text-[11px] mt-px ${isSelected ? 'font-bold text-primary' : 'font-medium'}`}>
                    {formatPrice(finalPrice)}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-1 pt-1.5">
            {tiers.map((t) => (
              <span
                key={t.id}
                className={`h-1 rounded-full transition-all ${
                  selectedTierId === t.id ? "w-3 bg-primary" : "w-1 bg-slate-300 dark:bg-slate-600"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── Cards Area ── */}
        <div
          ref={scrollContainerRef}
          data-lenis-prevent="true"
          className="flex sm:grid sm:grid-cols-3 overflow-x-auto sm:overflow-x-visible overflow-y-auto snap-x snap-mandatory sm:snap-none gap-2.5 sm:gap-3 lg:gap-4 px-3 sm:px-4 lg:px-5 py-3 sm:py-4 flex-1 custom-scrollbar overscroll-contain touch-pan-x"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
          }}
        >
          {tiers.map((tier) => {
            const finalPrice = basePrice + tier.priceAdd;
            const isSelected = selectedTierId === tier.id;
            const cardRef = getCardRef(tier.id);

            return (
              <div
                key={tier.id}
                ref={cardRef}
                onClick={() => setSelectedTierId(tier.id)}
                className={`group relative flex flex-col rounded-xl border transition-all duration-150 cursor-pointer overflow-hidden shrink-0 sm:shrink snap-center w-[80vw] max-w-[320px] sm:w-auto sm:max-w-none ${
                  isSelected
                    ? "border-primary ring-1 ring-primary/25 bg-white dark:bg-slate-900"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900"
                }`}
              >
                {/* Top Ribbon */}
                {tier.recommended ? (
                  <div className="bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider py-1 px-3 text-center flex items-center justify-center gap-1">
                    <Zap className="h-2.5 w-2.5 fill-current" />
                    Recommended
                  </div>
                ) : tier.id === "flex" ? (
                  <div className="bg-slate-800 text-white text-[10px] font-semibold uppercase tracking-wider py-1 px-3 text-center flex items-center justify-center gap-1">
                    <Crown className="h-2.5 w-2.5 fill-current" />
                    Premium
                  </div>
                ) : (
                  <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-medium uppercase tracking-wider py-1 px-3 text-center">
                    Basic
                  </div>
                )}

                {/* Header */}
                <div className="px-3.5 pt-3 pb-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight">
                        {tier.label}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        {tier.tagline}
                      </p>
                    </div>
                    {/* Radio */}
                    <div
                      className={`h-[18px] w-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-all mt-0.5 ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                      {formatPrice(finalPrice)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">/person</span>
                    {tier.priceAdd > 0 && (
                      <span className="text-[9px] font-medium text-primary ml-auto">
                        +{formatPrice(tier.priceAdd)}
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5">Incl. taxes & fees</p>
                </div>

                {/* Feature List */}
                <div className="flex-1 px-3.5 py-2.5 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-0">
                    {tier.features.map((feat, fi) => (
                      <div
                        key={fi}
                        className={`flex items-center gap-2 py-[5px] ${
                          fi < tier.features.length - 1 ? 'border-b border-slate-50 dark:border-slate-800/50' : ''
                        }`}
                      >
                        {feat.included ? (
                          <Check className={`h-3 w-3 shrink-0 stroke-[2.5] ${
                            feat.highlight ? 'text-primary' : 'text-emerald-500'
                          }`} />
                        ) : (
                          <X className="h-3 w-3 shrink-0 stroke-[2] text-slate-300 dark:text-slate-600" />
                        )}
                        <span
                          className={`text-[11px] leading-tight ${
                            feat.included
                              ? feat.highlight
                                ? 'text-slate-800 dark:text-slate-100 font-medium'
                                : 'text-slate-600 dark:text-slate-300 font-normal'
                              : 'text-slate-400 dark:text-slate-500 font-normal line-through'
                          }`}
                        >
                          {feat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="p-3 mt-auto shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfirm(tier, finalPrice);
                    }}
                    className={`w-full py-2.5 px-3 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] ${
                      isSelected || tier.recommended
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    Select {tier.label.replace("Economy ", "")}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom Bar ── */}
        <div className="px-4 sm:px-6 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
          {/* Trust */}
          <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-400">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              <span>Amadeus GDS</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Lock className="h-2.5 w-2.5 text-blue-500" />
              <span>SSL Encrypted</span>
            </div>
          </div>

          {/* Mobile bottom CTA */}
          <div className="sm:hidden flex items-center gap-3 w-full">
            <div className="flex-1 min-w-0">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">{activeTier.label}</span>
              <span className="text-base font-bold text-slate-900 dark:text-white leading-tight">{formatPrice(activeFinalPrice)}</span>
            </div>
            <button
              type="button"
              onClick={() => onConfirm(activeTier, activeFinalPrice)}
              className="py-2.5 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-[12px] flex items-center gap-1.5 active:scale-[0.97] cursor-pointer"
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Desktop CTA */}
          <button
            type="button"
            onClick={() => onConfirm(activeTier, activeFinalPrice)}
            className="hidden sm:flex items-center gap-2 py-2 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-[12px] active:scale-[0.98] cursor-pointer hover:bg-primary/90 transition-colors"
          >
            Continue with {activeTier.label.replace("Economy ", "")} · {formatPrice(activeFinalPrice)}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
