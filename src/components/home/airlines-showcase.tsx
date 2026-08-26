"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";
import { MapPin, Globe2, Sparkles, ShieldCheck } from "lucide-react";

// Ultra High-Definition Vector Logos & High-Res Landmark Photos
const AIRLINES = [
  {
    name: "Saudia",
    code: "SV",
    hub: "Jeddah (JED) • Riyadh (RUH)",
    badge: "UMRAH SPECIAL",
    badgeBg: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-400/20 dark:text-amber-300",
    iataBg: "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-500/20",
    image: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80",
    logoSvg: (
      <svg className="h-6 w-auto text-emerald-800 dark:text-emerald-400" viewBox="0 0 100 40" fill="currentColor">
        {/* Palm Trees & Crossed Swords */}
        <path d="M50 2 L56 16 L72 16 L59 26 L64 40 L50 30 L36 40 L41 26 L28 16 L44 16 Z" fill="#047857" />
      </svg>
    ),
  },
  {
    name: "Pakistan Int.",
    code: "PK",
    hub: "ISB • LHE • KHI",
    badge: "DIRECT FLIGHTS",
    badgeBg: "bg-emerald-500/10 text-emerald-800 border-emerald-500/30 dark:bg-emerald-400/20 dark:text-emerald-300",
    iataBg: "bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-slate-500/20",
    image: "https://images.unsplash.com/photo-1627837577626-ee40ab805a89?w=800&q=80",
    logoSvg: (
      <div className="flex items-center gap-1.5 font-black text-emerald-900 dark:text-emerald-400 tracking-tighter text-base font-mono">
        <div className="h-5 w-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">🇵🇰</div>
        <span>PIA</span>
      </div>
    ),
  },
  {
    name: "Emirates",
    code: "EK",
    hub: "Dubai International (DXB)",
    badge: "OFFICIAL PARTNER",
    badgeBg: "bg-rose-500/10 text-rose-700 border-rose-500/30 dark:bg-rose-400/20 dark:text-rose-300",
    iataBg: "bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-rose-500/20",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    logoSvg: (
      <div className="flex items-center gap-1 text-rose-600 font-extrabold tracking-tight text-base font-heading">
        Emirates
      </div>
    ),
  },
  {
    name: "Qatar Airways",
    code: "QR",
    hub: "Hamad International (DOH)",
    badge: "WORLD'S 5-STAR",
    badgeBg: "bg-purple-500/10 text-purple-800 border-purple-500/30 dark:bg-purple-400/20 dark:text-purple-300",
    iataBg: "bg-gradient-to-br from-purple-900 to-indigo-950 text-white shadow-purple-900/20",
    image: "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=800&q=80",
    logoSvg: (
      <div className="flex items-center gap-1.5 font-black text-purple-950 dark:text-purple-300 text-sm tracking-tight">
        <span className="h-2 w-2 rounded-full bg-purple-800" /> QATAR AIRWAYS
      </div>
    ),
  },
  {
    name: "Turkish Airlines",
    code: "TK",
    hub: "Istanbul Hub (IST)",
    badge: "TOP GLOBAL",
    badgeBg: "bg-red-500/10 text-red-700 border-red-500/30 dark:bg-red-400/20 dark:text-red-300",
    iataBg: "bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-red-500/20",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
    logoSvg: (
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black">
          🇹🇷
        </div>
        <span className="font-black text-slate-900 dark:text-white text-xs tracking-tight">TURKISH AIRLINES</span>
      </div>
    ),
  },
  {
    name: "Lufthansa",
    code: "LH",
    hub: "Frankfurt • Munich",
    badge: "EU DIRECT",
    badgeBg: "bg-blue-500/10 text-blue-800 border-blue-500/30 dark:bg-blue-400/20 dark:text-blue-300",
    iataBg: "bg-gradient-to-br from-blue-900 to-slate-900 text-white shadow-blue-900/20",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
    logoSvg: (
      <div className="flex items-center gap-1.5">
        <div className="h-5 w-5 rounded-full bg-amber-400 border border-slate-900 flex items-center justify-center text-[9px] font-black text-slate-900">
          🦅
        </div>
        <span className="font-extrabold text-slate-900 dark:text-white text-xs tracking-tight">Lufthansa</span>
      </div>
    ),
  },
  {
    name: "Etihad Airways",
    code: "EY",
    hub: "Abu Dhabi (AUH)",
    badge: "PREMIUM PARTNER",
    badgeBg: "bg-amber-500/10 text-amber-800 border-amber-500/30 dark:bg-amber-400/20 dark:text-amber-300",
    iataBg: "bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 font-black shadow-amber-500/20",
    image: "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&q=80",
    logoSvg: (
      <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-black tracking-widest text-xs uppercase">
        <span>ETIHAD AIRWAYS</span>
      </div>
    ),
  },
  {
    name: "British Airways",
    code: "BA",
    hub: "London Heathrow (LHR)",
    badge: "UK DIRECT",
    badgeBg: "bg-indigo-500/10 text-indigo-800 border-indigo-500/30 dark:bg-indigo-400/20 dark:text-indigo-300",
    iataBg: "bg-gradient-to-br from-indigo-900 to-blue-950 text-white shadow-indigo-900/20",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    logoSvg: (
      <div className="flex items-center gap-1.5">
        <span className="text-sm">🇬🇧</span>
        <span className="font-black text-slate-900 dark:text-white text-xs tracking-tighter">BRITISH AIRWAYS</span>
      </div>
    ),
  },
];

const firstRow = AIRLINES.slice(0, AIRLINES.length / 2);
const secondRow = AIRLINES.slice(AIRLINES.length / 2);

import Image from "next/image";

const AirlineExecutiveCard = ({
  name,
  code,
  hub,
  badge,
  badgeBg,
  iataBg,
  image,
  logoSvg,
}: {
  name: string;
  code: string;
  hub: string;
  badge: string;
  badgeBg: string;
  iataBg: string;
  image: string;
  logoSvg: React.ReactNode;
}) => {
  return (
    <figure
      className={cn(
        "relative flex h-[195px] w-[320px] sm:w-[340px] flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-md hover:shadow-2xl hover:-translate-y-1.5 hover:border-orange-500/40 transition-all duration-300 shrink-0 group cursor-pointer"
      )}
    >
      {/* High-Resolution Landmark Background Photo */}
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 640px) 320px, 340px"
        className="object-cover group-hover:scale-108 transition-transform duration-700 opacity-60"
      />

      {/* Frosted Dual-Layer Vignette Glass Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-white/40 backdrop-blur-[1.5px]" />

      {/* Card Body Container */}
      <div className="relative z-10 p-5 flex flex-col justify-between h-full">
        
        {/* Top Logo Glass Pill */}
        <div className="flex items-center justify-between">
          <div className="h-8 px-3 rounded-full bg-white/90 backdrop-blur-md border border-white/80 flex items-center shadow-xs">
            {logoSvg}
          </div>

          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/60">
            <Globe2 className="w-3 h-3 text-orange-500" />
            Verified
          </span>
        </div>

        {/* Bottom Headline & Details */}
        <div className="mt-auto">
          <h3 className="font-heading font-extrabold text-2xl text-slate-950 tracking-tight leading-none mb-1 group-hover:text-orange-600 transition-colors">
            {name}
          </h3>
          
          <div className="flex items-center gap-1 text-slate-600 text-xs font-semibold mb-3">
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="truncate">{hub}</span>
          </div>

          {/* Badge Pill & IATA Tag */}
          <div className="flex items-center justify-between border-t border-slate-200/60 pt-3">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-2xs",
                badgeBg
              )}
            >
              {badge}
            </span>

            {/* Glowing IATA Badge Circle */}
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-black font-mono tracking-tighter shadow-md",
                  iataBg
                )}
              >
                {code}
              </span>
            </div>
          </div>
        </div>

      </div>
    </figure>
  );
};

export function AirlinesShowcase() {
  return (
    <section className="w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/70 via-slate-50 to-slate-100/60 py-16 lg:py-20 border-y border-slate-200/80 overflow-hidden relative">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-orange-200/20 via-blue-100/30 to-emerald-100/20 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Section Header Title & Badge */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>WORLD CLASS AVIATION PARTNERS</span>
          </div>
          <h2 className="font-heading font-black text-slate-900 text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight uppercase">
            OFFICIAL GLOBAL PARTNER AIRLINES
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2.5 font-medium max-w-lg leading-relaxed">
            Direct GDS booking links &amp; instant e-ticket issuance across 400+ international carriers.
          </p>
        </div>

        {/* Magic UI Double Marquee Carousel */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden gap-6 py-2">
          
          {/* Row 1: Top Row Scrolls RIGHT (reverse={true}) */}
          <Marquee reverse pauseOnHover className="[--duration:28s]">
            {firstRow.map((air) => (
              <AirlineExecutiveCard key={air.code} {...air} />
            ))}
          </Marquee>

          {/* Row 2: Bottom Row Scrolls LEFT (reverse={false}) */}
          <Marquee pauseOnHover className="[--duration:28s]">
            {secondRow.map((air) => (
              <AirlineExecutiveCard key={air.code} {...air} />
            ))}
          </Marquee>

          {/* Left & Right Smooth Edge Dissolve Gradient Masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/5 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-20" />
        
        </div>

      </div>
    </section>
  );
}

export default AirlinesShowcase;
