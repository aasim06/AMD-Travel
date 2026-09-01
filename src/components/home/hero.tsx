"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, Moon, FileText, Plane } from "lucide-react";
import { FlightSearchForm, type CategoryKey } from "@/components/flight/search-form";
import { Typewriter } from "@/components/ui/typewriter";
import { Globe } from "@/components/magicui/globe";
import { useCurrency } from "@/context/currency-context";
import { StarsBackground } from "@/components/ui/stars-background";

export function Hero({ initialCategory = "flights" }: { initialCategory?: CategoryKey } = {}) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(initialCategory);
  const router = useRouter();
  const { t, language } = useCurrency();

  const handleTabClick = (cat: CategoryKey, href: string) => {
    setActiveCategory(cat);
    router.push(href);
  };

  return (
    <section className="relative w-full border-b border-[#0B1D3A] overflow-hidden" style={{ background: 'radial-gradient(circle at top right, #1A3B70 0%, #0B1D3A 60%, #061226 100%)' }}>
      {/* ── Stars Background ── */}
      <StarsBackground className="absolute inset-0 z-0 opacity-70" starColor="#ffffff" speed={60} pointerEvents={false} />

      <div className="container relative z-10 pt-8 pb-28 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px] gap-6 lg:gap-10 items-center">

          {/* ── Left: Headline + Search ── */}
          <div className="flex flex-col gap-5 min-w-0">

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="font-heading font-extrabold text-white text-2xl xs:text-3xl sm:text-4xl lg:text-[2.6rem] leading-snug tracking-tight">
                {initialCategory === "visa" ? (
                  <>
                    {t("hero.visaTitle", "Fast & Hassle-Free Visa Services")} <br />
                    <span className="inline-block mt-1 sm:mt-2 min-h-[1.6em] font-black text-primary">
                      <Typewriter words={language === "de" ? ["Visa-Service.", "Schnelle Genehmigung.", "Einfache Online-Bewerbung."] : ["Visa Services.", "Fast Approvals.", "Easy Online Application."]} />
                    </span>
                  </>
                ) : initialCategory === "umrah" ? (
                  <>
                    {t("hero.umrahTitle", "Your Sacred Journey Starts Here")} <br />
                    <span className="inline-block mt-1 sm:mt-2 min-h-[1.6em] font-black text-primary">
                      <Typewriter words={language === "de" ? ["Beginnt Hier.", "Maßgeschneiderte Pakete.", "Luxus & Budget Hotels."] : ["Starts Here.", "Custom Packages.", "Luxury & Budget Stays."]} />
                    </span>
                  </>
                ) : initialCategory === "cars" ? (
                  <>
                    {t("hero.carsTitle", "Rent a Car Anywhere, Anytime")} <br />
                    <span className="inline-block mt-1 sm:mt-2 min-h-[1.6em] font-black text-primary">
                      <Typewriter words={language === "de" ? ["Überall, Jederzeit.", "Beste Tagespreise.", "Top Autovermietungen."] : ["Anywhere, Anytime.", "Best Daily Rates.", "Top Rental Agencies."]} />
                    </span>
                  </>
                ) : (
                  <>
                    {t("hero.flightsTitle", "Compare Flights From")} <br />
                    <span className="inline-block mt-1 sm:mt-2 min-h-[1.6em] font-black text-primary">
                      <Typewriter words={language === "de" ? ["100+ Fluggesellschaften.", "Beste Ticketpreise.", "Top Globale Routen.", "Exklusive Flugangebote."] : ["100s Of Airlines.", "Best Ticket Prices.", "Top Global Routes.", "Exclusive Flight Deals."]} />
                    </span>
                  </>
                )}
              </h1>
            </div>

            {/* Category tabs with 1-tap instant touch response */}
            <div className="relative z-30 grid grid-cols-2 sm:flex sm:items-center gap-2 w-full">
              
              {/* Flights Tab */}
              <Link
                href="/"
                prefetch={true}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabClick("flights", "/");
                }}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 touch-manipulation cursor-pointer select-none active:scale-95 ${
                  initialCategory === "flights" || activeCategory === "flights"
                    ? "bg-white text-primary shadow-md font-bold"
                    : "text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/15"
                }`}
              >
                <Plane className="h-4 w-4" />
                <span>{t("nav.flights", "Flights")}</span>
              </Link>

              {/* Visa Tab */}
              <Link
                href="/visa"
                prefetch={true}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabClick("visa", "/visa");
                }}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 touch-manipulation cursor-pointer select-none active:scale-95 ${
                  initialCategory === "visa" || activeCategory === "visa"
                    ? "bg-white text-primary shadow-md font-bold"
                    : "text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/15"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>{t("nav.visa", "Visa")}</span>
              </Link>

              {/* Cars Tab */}
              <Link
                href="/cars"
                prefetch={true}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabClick("cars", "/cars");
                }}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 touch-manipulation cursor-pointer select-none active:scale-95 ${
                  initialCategory === "cars" || activeCategory === "cars"
                    ? "bg-white text-primary shadow-md font-bold"
                    : "text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/15"
                }`}
              >
                <Car className="h-4 w-4" />
                <span>{t("nav.cars", "Cars")}</span>
              </Link>

              {/* Umrah Tab */}
              <Link
                href="/umrah-packages"
                prefetch={true}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabClick("umrah", "/umrah-packages");
                }}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 touch-manipulation cursor-pointer select-none active:scale-95 ${
                  initialCategory === "umrah" || activeCategory === "umrah"
                    ? "bg-white text-primary shadow-md font-bold"
                    : "text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/15"
                }`}
              >
                <Moon className="h-4 w-4" />
                <span>{t("nav.umrah", "Umrah")}</span>
              </Link>

            </div>

            {/* Search form — contained white card */}
            <div id="hero-search" className="bg-white rounded-3xl border border-slate-100 overflow-visible p-3.5 sm:p-6 animate-fade-in relative z-20" style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 50px' }}>
              <FlightSearchForm />
            </div>
          </div>

          {/* ── Right: Interactive Magic UI 3D Globe ── */}
          <div className="hidden lg:flex relative items-center justify-center w-full min-h-[380px] overflow-hidden select-none z-10">
            <Globe className="w-full max-w-[380px] lg:max-w-[400px]" />
          </div>

        </div>
      </div>
    </section>
  );
}
