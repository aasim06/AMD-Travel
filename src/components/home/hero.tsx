"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, Moon } from "lucide-react";
import { FlightSearchForm, CATEGORIES, type CategoryKey } from "@/components/flight/search-form";
import { Typewriter } from "@/components/ui/typewriter";
import { Globe } from "@/components/magicui/globe";

// ─── Component ────────────────────────────────────────────────────────────────

export function Hero({ initialCategory = "flights" }: { initialCategory?: CategoryKey } = {}) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(initialCategory);
  const router = useRouter();
  return (
    <section className="w-full border-b border-[#0B1D3A] overflow-hidden" style={{ background: 'radial-gradient(circle at top right, #1A3B70 0%, #0B1D3A 60%, #061226 100%)' }}>
      <div className="container py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px] gap-6 lg:gap-10 items-center">

          {/* ── Left: Headline + Search ── */}
          <div className="flex flex-col gap-5 min-w-0">

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="font-heading font-extrabold text-white text-2xl xs:text-3xl sm:text-4xl lg:text-[2.6rem] leading-snug tracking-tight">
                {initialCategory === "visa" ? (
                  <>
                    Fast &amp; Hassle-Free <br />
                    <span className="inline-block mt-1 sm:mt-2 min-h-[1.6em] font-black text-amber-400">
                      <Typewriter words={["Visa Services.", "Fast Approvals.", "Easy Online Application."]} />
                    </span>
                  </>
                ) : initialCategory === "umrah" ? (
                  <>
                    Your Sacred Journey <br />
                    <span className="inline-block mt-1 sm:mt-2 min-h-[1.6em] font-black text-amber-400">
                      <Typewriter words={["Starts Here.", "Custom Packages.", "Luxury & Budget Stays."]} />
                    </span>
                  </>
                ) : initialCategory === "cars" ? (
                  <>
                    Rent a Car <br />
                    <span className="inline-block mt-1 sm:mt-2 min-h-[1.6em] font-black text-amber-400">
                      <Typewriter words={["Anywhere, Anytime.", "Best Daily Rates.", "Top Rental Agencies."]} />
                    </span>
                  </>
                ) : (
                  <>
                    Compare Flights From <br />
                    <span className="inline-block mt-1 sm:mt-2 min-h-[1.6em] font-black text-amber-400">
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
                <span>Umrah</span>
              </button>
            </div>

            {/* Search form — contained white card */}
            <div id="hero-search" className="bg-white rounded-3xl border border-slate-100 overflow-visible p-3.5 sm:p-6 animate-fade-in" style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 50px' }}>
              <FlightSearchForm />
            </div>
          </div>

          {/* ── Right: Interactive Magic UI 3D Globe ── */}
          <div className="hidden lg:flex relative items-center justify-center w-full min-h-[380px] overflow-hidden select-none">
            <Globe className="w-full max-w-[380px] lg:max-w-[400px]" />
          </div>

        </div>
      </div>
    </section>
  );
}
