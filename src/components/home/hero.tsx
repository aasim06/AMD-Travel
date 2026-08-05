"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FlightSearchForm, CATEGORIES, type CategoryKey } from "@/components/flight/search-form";
import { useCurrency } from "@/context/currency-context";
import { useState } from "react";
import { Car, Moon } from "lucide-react";
import { Typewriter } from "@/components/ui/typewriter";

// ─── Destination cards data ────────────────────────────────────────────────────

const DESTINATIONS = [
  { city: "Dubai",    country: "UAE",          code: "DXB", priceUSD: 320, gradient: "from-[#0f4c81] to-[#1a7abf]", emoji: "🏙️", tag: "Popular"  },
  { city: "London",   country: "UK",           code: "LHR", priceUSD: 580, gradient: "from-[#1a1a2e] to-[#16213e]", emoji: "🎡", tag: "Trending" },
  { city: "Istanbul", country: "Turkey",       code: "IST", priceUSD: 410, gradient: "from-[#7b2d8b] to-[#c0392b]", emoji: "🕌", tag: "Hot Deal" },
  { city: "Jeddah",   country: "Saudi Arabia", code: "JED", priceUSD: 290, gradient: "from-[#1a6b3c] to-[#27ae60]", emoji: "🕋", tag: "Umrah"    },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Hero({ initialCategory = "flights" }: { initialCategory?: CategoryKey } = {}) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(initialCategory);
  const { formatPrice } = useCurrency();
  const router = useRouter();
  return (
    <section className="w-full border-b border-[#0B1D3A]" style={{ background: 'radial-gradient(circle at top right, #1A3B70 0%, #0B1D3A 60%, #061226 100%)' }}>
      <div className="container py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_460px] gap-8 lg:gap-12 items-center">

          {/* ── Left: Headline + Search ── */}
          <div className="flex flex-col gap-5 min-w-0">

            {/* Eyebrow */}
            {/* <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-slate-300 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35] animate-pulse" />
              Trusted by 500,000+ travellers worldwide
            </div> */}

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="font-heading font-extrabold text-white text-balance text-2xl xs:text-3xl sm:text-4xl lg:text-[2.6rem] leading-snug tracking-tight">
                {initialCategory === "visa" ? (
                  <>
                    Fast &amp; Hassle-Free <br />
                    <span className="inline-block mt-1 sm:mt-2 min-h-[1.2em] font-black text-amber-400">
                      <Typewriter words={["Visa Services.", "Fast Approvals.", "Easy Online Application."]} />
                    </span>
                  </>
                ) : initialCategory === "umrah" ? (
                  <>
                    Your Sacred Journey <br />
                    <span className="inline-block mt-1 sm:mt-2 min-h-[1.2em] font-black text-amber-400">
                      <Typewriter words={["Starts Here.", "Custom Packages.", "Luxury & Budget Stays."]} />
                    </span>
                  </>
                ) : initialCategory === "cars" ? (
                  <>
                    Rent a Car <br />
                    <span className="inline-block mt-1 sm:mt-2 min-h-[1.2em] font-black text-amber-400">
                      <Typewriter words={["Anywhere, Anytime.", "Best Daily Rates.", "Top Rental Agencies."]} />
                    </span>
                  </>
                ) : (
                  <>
                    Compare Flights From <br />
                    <span className="inline-block mt-1 sm:mt-2 min-h-[1.2em] font-black text-amber-400">
                      <Typewriter words={["100s Of Airlines.", "Best Ticket Prices.", "Top Global Routes.", "Exclusive Flight Deals."]} />
                    </span>
                  </>
                )}
              </h1>
            </div>

            {/* Category tabs — 2x2 grid on mobile so no tabs are hidden, single row on desktop */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    if (cat.key === "visa") { router.push("/visa"); return; }
                    if (cat.key === "flights") { router.push("/"); return; }
                    setActiveCategory(cat.key);
                  }}
                  className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    activeCategory === cat.key
                      ? "bg-white text-primary shadow-md font-bold"
                      : "text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/15"
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              ))}
              <Link
                href="/cars"
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  initialCategory === "cars"
                    ? "bg-white text-primary shadow-md font-bold"
                    : "text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/15"
                }`}
              >
                <Car className="h-4 w-4" />
                <span>Cars</span>
              </Link>
              <button
                type="button"
                onClick={() => router.push("/umrah-packages")}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  initialCategory === "umrah"
                    ? "bg-white text-primary shadow-md font-bold"
                    : "text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/15"
                }`}
              >
                <Moon className="h-4 w-4" />
                <span>Umrah Packages</span>
              </button>
            </div>

            {/* Search form — contained white card */}
            <div id="hero-search" className="bg-white rounded-3xl border border-slate-100 overflow-visible p-3.5 sm:p-6 animate-fade-in" style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 50px' }}>
              <FlightSearchForm />
            </div>

            {/* Trust row */}
            {/* <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {[
                "No hidden fees",
                "150+ Airlines",
                "Best price guarantee",
                "24/7 Support",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-slate-300 text-xs font-medium">
                  <svg className="h-3 w-3 text-[#FF6B35] shrink-0" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M10.28 2.28a.75.75 0 0 0-1.06 0L4.5 7 2.78 5.28a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.06 0l5.25-5.25a.75.75 0 0 0 0-1.06Z" />
                  </svg>
                  {t}
                </span>
              ))}
            </div> */}
          </div>

          {/* ── Right: Destination grid ── */}
          <div className="hidden lg:flex flex-col gap-3 self-center">

            {/* 2×2 grid */}
            <div className="grid grid-cols-2 gap-3">
              {DESTINATIONS.map((dest) => (
                <div
                  key={dest.code}
                  className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${dest.gradient} p-3.5 aspect-[4/3] flex flex-col justify-between cursor-pointer group hover:scale-[1.02] transition-transform duration-300 shadow-md`}
                >
                  {/* Tag */}
                  <span className="self-start rounded-full bg-black/20 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                    {dest.tag}
                  </span>

                  {/* Emoji */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl opacity-25 group-hover:opacity-40 transition-opacity select-none pointer-events-none">
                    {dest.emoji}
                  </div>

                  {/* Bottom info */}
                  <div>
                    <p className="text-white font-heading font-bold text-sm leading-tight">
                      {dest.city}
                    </p>
                    <p className="text-white/60 text-[11px]">{dest.country} · {dest.code}</p>
                    <p className="text-amber-300 font-semibold text-xs mt-0.5">from {formatPrice(dest.priceUSD)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA strip */}
            <Link href="/tour-deals" className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between gap-3 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors group">
              <div>
                <p className="text-slate-800 text-sm font-semibold">Explore all destinations</p>
                <p className="text-slate-400 text-xs mt-0.5">500+ routes available</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <svg className="h-4 w-4 text-primary" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
}
