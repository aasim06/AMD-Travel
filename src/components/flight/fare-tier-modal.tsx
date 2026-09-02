"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  Luggage,
  Backpack,
  Armchair,
  RefreshCcw,
  Sparkles,
  Plane,
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

  const renderIcon = (icon: string, included: boolean) => {
    const cls = `h-3.5 w-3.5 shrink-0 ${
      included ? "text-slate-700 dark:text-slate-300" : "text-slate-300 dark:text-slate-600"
    }`;
    switch (icon) {
      case "luggage":
        return <Luggage className={cls} />;
      case "cabin":
        return <Backpack className={cls} />;
      case "personal":
        return <Luggage className={cls} />;
      case "seat":
        return <Armchair className={cls} />;
      case "changes":
        return <RefreshCcw className={cls} />;
      case "refund":
        return <ShieldCheck className={cls} />;
      case "priority":
        return <Zap className={cls} />;
      default:
        return <Plane className={cls} />;
    }
  };

  return createPortal(
    <div
      ref={overlayRef}
      data-lenis-prevent="true"
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Main Luxury Modal Card — Expanded width (max-w-[1220px]) with theme styling */}
      <div
        data-lenis-prevent="true"
        className="relative w-full sm:w-[94vw] max-w-[1220px] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[96dvh] sm:max-h-[94dvh] flex flex-col border border-slate-200/80 dark:border-slate-800 transition-all overscroll-contain"
        style={{ overscrollBehavior: "contain" }}
      >

        {/* ── Top Header Bar (Compact & Sleek) ── */}
        <div className="px-5 sm:px-7 py-3 sm:py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-950/60 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Airline Logo Box */}
            <div className="h-9 w-12 sm:h-10 sm:w-14 rounded-xl bg-white dark:bg-slate-800 p-1 shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0">
              <AirlineLogo code={carrierCode} className="h-full w-full object-contain" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight font-heading leading-none">
                  Choose your fare
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="h-2.5 w-2.5" /> Step 2 of 3
                </span>
              </div>

              {/* Route & Flight summary subline */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex-wrap leading-none">
                <span className="font-bold text-slate-800 dark:text-slate-200">{airlineName}</span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                  <span>{firstSeg.departure.iataCode}</span>
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span>{lastSeg.arrival.iataCode}</span>
                </span>
                {depDateStr && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="hidden xs:inline">{depDateStr}</span>
                  </>
                )}
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {stops === 0 ? "Non-stop direct" : `${stops} stop${stops > 1 ? "s" : ""}`}
                  {durationFormatted ? ` (${durationFormatted})` : ""}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close fare selector"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer shrink-0"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* ── Mobile Segmented Control (Tabs on small screens) ── */}
        <div className="sm:hidden px-4 pt-2.5 pb-2 bg-slate-100/70 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/60 dark:border-slate-800">
            {tiers.map((tier) => {
              const isSelected = selectedTierId === tier.id;
              const finalPrice = basePrice + tier.priceAdd;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => scrollToTier(tier.id)}
                  className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 font-medium"
                  }`}
                >
                  {tier.recommended && (
                    <span className="absolute -top-2.5 px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-wider shadow-xs">
                      Popular
                    </span>
                  )}
                  <span className="text-[11px] leading-tight truncate w-full px-1 font-heading">
                    {tier.label.replace("Economy ", "")}
                  </span>
                  <span className="text-xs font-black mt-0.5">
                    {formatPrice(finalPrice)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Swipe indicator label */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1.5 px-1">
            <span>← Swipe cards to compare</span>
            <div className="flex items-center gap-1">
              {tiers.map((t) => (
                <span
                  key={t.id}
                  className={`h-1.5 rounded-full transition-all ${
                    selectedTierId === t.id ? "w-4 bg-primary" : "w-1.5 bg-slate-300 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>
            <span>Swipe →</span>
          </div>
        </div>

        {/* ── Modal Content: 3-Column Luxury Fare Tier Cards (Desktop & Tablet) / Swipeable (Mobile) ── */}
        <div
          ref={scrollContainerRef}
          data-lenis-prevent="true"
          className="flex sm:grid sm:grid-cols-3 overflow-x-auto sm:overflow-x-visible overflow-y-auto snap-x snap-mandatory sm:snap-none gap-3.5 sm:gap-4 lg:gap-5 p-4 sm:p-5 lg:p-6 pb-6 sm:pb-5 flex-1 custom-scrollbar overscroll-contain touch-pan-x"
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
                className={`group relative flex flex-col rounded-3xl border-2 transition-all duration-200 cursor-pointer overflow-hidden shrink-0 sm:shrink snap-center w-[86vw] max-w-[360px] sm:w-auto ${
                  isSelected
                    ? "border-primary shadow-xl shadow-primary/10 ring-2 ring-offset-2 ring-primary/40 dark:ring-offset-slate-900 scale-[1.01] bg-white dark:bg-slate-900"
                    : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg bg-white dark:bg-slate-900"
                }`}
              >
                {/* Top Ribbon — Clean solid theme colors, NO gradients */}
                {tier.recommended ? (
                  <div className="bg-primary text-primary-foreground text-[10px] sm:text-[11px] font-bold uppercase tracking-wider py-1.5 sm:py-2 px-3 text-center flex items-center justify-center gap-1.5 shadow-xs">
                    <Zap className="h-3 w-3 fill-current" />
                    Most Popular · Best Value
                  </div>
                ) : tier.id === "flex" ? (
                  <div className="bg-slate-900 text-white dark:bg-slate-800 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider py-1.5 sm:py-2 px-3 text-center flex items-center justify-center gap-1.5 shadow-xs">
                    <Crown className="h-3 w-3 fill-current" />
                    Maximum Flexibility
                  </div>
                ) : (
                  <div className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider py-1.5 sm:py-2 px-3 text-center">
                    Basic Fare · Lowest Cost
                  </div>
                )}

                {/* Header Box */}
                <div className={`p-3.5 sm:p-4 pb-2.5 sm:pb-3 ${tier.accentBg} border-b border-slate-100 dark:border-slate-800/60`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${tier.accentPillBg}`}>
                      {tier.badge}
                    </span>

                    {/* Selection Radio Circle */}
                    <div
                      className={`h-4.5 w-4.5 sm:h-5 sm:w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1.5 sm:mt-2 font-heading">
                    {tier.label}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight truncate">
                    {tier.tagline}
                  </p>

                  {/* Price Block */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-baseline justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-heading leading-none">
                          {formatPrice(finalPrice)}
                        </span>
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-400">/ pax</span>
                      </div>

                      <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Includes all airport taxes &amp; fees
                      </p>
                    </div>

                    {tier.priceAdd > 0 ? (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                        +{formatPrice(tier.priceAdd)}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        Base Price
                      </span>
                    )}
                  </div>
                </div>

                {/* Feature Matrix Checklist (Clean, single-line, compact) */}
                <div className="flex-1 p-3.5 sm:p-4 space-y-2 sm:space-y-2.5 bg-white dark:bg-slate-900">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    What is included
                  </p>

                  <div className="space-y-2">
                    {tier.features.map((feat, fi) => (
                      <div key={fi} className="flex items-center gap-2 group/item text-xs">
                        {/* Status Icon */}
                        <div className="shrink-0">
                          {feat.included ? (
                            <div className="h-3.5 w-3.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                              <Check className="h-2 w-2 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 flex items-center justify-center">
                              <X className="h-2 w-2 stroke-[2]" />
                            </div>
                          )}
                        </div>

                        {/* Icon + Label + Value on one clean line */}
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          {renderIcon(feat.icon, feat.included)}
                          <span
                            className={`font-bold text-[11px] truncate shrink-0 ${
                              feat.included
                                ? feat.highlight
                                  ? "text-primary font-extrabold"
                                  : "text-slate-900 dark:text-slate-100"
                                : "text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-600"
                            }`}
                          >
                            {feat.label}:
                          </span>

                          <span
                            className={`text-[11px] truncate ${
                              feat.included
                                ? feat.highlight
                                  ? "text-slate-800 dark:text-slate-200 font-semibold"
                                  : "text-slate-600 dark:text-slate-400"
                                : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            {feat.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA Button — Solid Theme Color, NO Gradients */}
                <div className="p-3 sm:p-4 pt-2.5 sm:pt-3 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 mt-auto shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfirm(tier, finalPrice);
                    }}
                    className={`w-full py-2.5 sm:py-3 px-4 rounded-xl sm:rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] ${
                      isSelected || tier.recommended
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-slate-100 hover:bg-primary hover:text-primary-foreground text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-primary dark:hover:text-primary-foreground border border-slate-200 dark:border-slate-700 shadow-2xs"
                    }`}
                  >
                    <span>Select {tier.label.replace("Economy ", "")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom Sticky Bar (Trust Guarantee & Mobile Action Bar) ── */}
        <div className="px-5 sm:px-7 py-2.5 sm:py-3 border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 shrink-0">
          
          {/* Trust Guarantees */}
          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 text-xs w-full sm:w-auto justify-center sm:justify-start">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Amadeus Live GDS Verified
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">·</span>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>

          {/* Mobile Bottom Checkout Action Button — Solid Theme Color */}
          <div className="sm:hidden w-full flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Selected: {activeTier.label}
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white font-heading leading-tight">
                {formatPrice(activeFinalPrice)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onConfirm(activeTier, activeFinalPrice)}
              className="flex-1 max-w-[200px] py-3 px-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
}
