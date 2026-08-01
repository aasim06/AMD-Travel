"use client";

import { useState } from "react";
import {
  MapPin, Clock, Users, Star, ArrowRight, MessageCircle,
  Shield, HeartHandshake, Sparkles, Filter, Calendar,
  Plane, Hotel, Bus, Utensils, CheckCircle2, Moon,
} from "lucide-react";

const CATEGORIES = ["All", "Economy", "Standard", "Premium", "Luxury"];

const PACKAGES = [
  {
    id: 1,
    category: "Economy",
    title: "Noor Economy Package",
    duration: "10 Days / 9 Nights",
    groupSize: "Up to 30 People",
    departure: "Frankfurt, Germany",
    rating: 4.7,
    reviews: 312,
    price: 1199,
    originalPrice: 1499,
    badge: "Most Popular",
    badgeColor: "bg-amber-400 text-amber-900",
    makkahNights: 5,
    madinahNights: 4,
    hotel: { makkah: "Al Safwah Royale Orchid ★★★", madinah: "Dallah Taibah ★★★" },
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&q=80",
    includes: ["Return Flights", "Hotel", "Transfers", "Visa"],
  },
  {
    id: 2,
    category: "Standard",
    title: "Barakah Standard Package",
    duration: "12 Days / 11 Nights",
    groupSize: "Up to 25 People",
    departure: "Frankfurt, Germany",
    rating: 4.8,
    reviews: 245,
    price: 1699,
    originalPrice: 2099,
    badge: "Best Value",
    badgeColor: "bg-emerald-500 text-white",
    makkahNights: 7,
    madinahNights: 4,
    hotel: { makkah: "Hilton Suites Makkah ★★★★", madinah: "Anwar Al Madinah Mövenpick ★★★★" },
    image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&q=80",
    includes: ["Return Flights", "4★ Hotel", "Transfers", "Visa", "Guided Ziyarat"],
  },
  {
    id: 3,
    category: "Premium",
    title: "Rahma Premium Package",
    duration: "14 Days / 13 Nights",
    groupSize: "Up to 20 People",
    departure: "Frankfurt, Germany",
    rating: 4.9,
    reviews: 178,
    price: 2499,
    originalPrice: 3099,
    badge: "Top Rated",
    badgeColor: "bg-violet-500 text-white",
    makkahNights: 8,
    madinahNights: 5,
    hotel: { makkah: "Swissôtel Makkah ★★★★★", madinah: "Oberoi Madinah ★★★★★" },
    image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&q=80",
    includes: ["Return Flights", "5★ Hotel", "Private Transfers", "Visa", "Ziyarat", "Breakfast"],
  },
  {
    id: 4,
    category: "Luxury",
    title: "Al Noor Luxury Package",
    duration: "15 Days / 14 Nights",
    groupSize: "Up to 10 People",
    departure: "Frankfurt, Germany",
    rating: 5.0,
    reviews: 94,
    price: 3999,
    originalPrice: 4999,
    badge: "Luxury",
    badgeColor: "bg-rose-500 text-white",
    makkahNights: 9,
    madinahNights: 5,
    hotel: { makkah: "Conrad Makkah ★★★★★", madinah: "Anwar Al Madinah ★★★★★" },
    image: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=600&q=80",
    includes: ["Business Class Flights", "5★ Haramain View", "VIP Transfers", "Visa", "Full Board", "Personal Guide"],
  },
  {
    id: 5,
    category: "Economy",
    title: "Safa Economy Package",
    duration: "8 Days / 7 Nights",
    groupSize: "Up to 35 People",
    departure: "Düsseldorf, Germany",
    rating: 4.6,
    reviews: 198,
    price: 999,
    originalPrice: 1299,
    badge: "Budget Friendly",
    badgeColor: "bg-sky-500 text-white",
    makkahNights: 4,
    madinahNights: 3,
    hotel: { makkah: "Al Kiswah Tower ★★★", madinah: "Dallah Taibah ★★★" },
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&q=80",
    includes: ["Return Flights", "Hotel", "Transfers", "Visa"],
  },
  {
    id: 6,
    category: "Standard",
    title: "Tawakkul Standard Package",
    duration: "10 Days / 9 Nights",
    groupSize: "Up to 25 People",
    departure: "Berlin, Germany",
    rating: 4.7,
    reviews: 156,
    price: 1549,
    originalPrice: 1899,
    badge: "New",
    badgeColor: "bg-indigo-500 text-white",
    makkahNights: 6,
    madinahNights: 3,
    hotel: { makkah: "Mövenpick Hotel Makkah ★★★★", madinah: "Crowne Plaza Madinah ★★★★" },
    image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&q=80",
    includes: ["Return Flights", "4★ Hotel", "Transfers", "Visa", "Ziyarat"],
  },
];

const SERVICES = [
  { icon: <Plane className="h-5 w-5 text-blue-500" />, bg: "bg-blue-50 border-blue-100", title: "Return Flights", desc: "Direct & connecting from major German cities" },
  { icon: <Hotel className="h-5 w-5 text-violet-500" />, bg: "bg-violet-50 border-violet-100", title: "Hotel Accommodation", desc: "3★ to 5★ hotels near Haram" },
  { icon: <Bus className="h-5 w-5 text-emerald-500" />, bg: "bg-emerald-50 border-emerald-100", title: "All Transfers", desc: "Airport, hotel & Haramain transfers" },
  { icon: <Utensils className="h-5 w-5 text-amber-500" />, bg: "bg-amber-50 border-amber-100", title: "Meals (Select)", desc: "Breakfast or full board on premium plans" },
  { icon: <Shield className="h-5 w-5 text-rose-500" />, bg: "bg-rose-50 border-rose-100", title: "Visa Processing", desc: "Saudi Umrah visa handled for you" },
  { icon: <HeartHandshake className="h-5 w-5 text-sky-500" />, bg: "bg-sky-50 border-sky-100", title: "24/7 Support", desc: "Dedicated guide throughout your journey" },
];

const FEATURES = [
  { icon: <Shield className="h-4 w-4 text-emerald-400" />, bg: "bg-emerald-500/10 border-emerald-500/20", title: "Visa Included", desc: "We handle everything" },
  { icon: <HeartHandshake className="h-4 w-4 text-sky-400" />, bg: "bg-sky-500/10 border-sky-500/20", title: "Group & Private", desc: "Flexible options" },
  { icon: <Sparkles className="h-4 w-4 text-amber-400" />, bg: "bg-amber-500/10 border-amber-500/20", title: "Trusted Agency", desc: "5,000+ pilgrims served" },
];

const STATS = [
  { value: "5k+", label: "Pilgrims Served" },
  { value: "10+", label: "Years Experience" },
  { value: "4.9★", label: "Average Rating" },
];

export default function UmrahPackagesPage() {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? PACKAGES : PACKAGES.filter(p => p.category === active);

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ── Hero ── */}
      <div
        className="w-full border-b border-[#0B1D3A] relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse at top right, #1e4080 0%, #0B1D3A 55%, #060f22 100%)" }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 pt-12 pb-10 sm:pt-16 sm:pb-14 relative">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/40 text-xs mb-6">
            <span>Home</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-white/70 font-medium">Umrah Packages</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Moon className="h-5 w-5 text-white" />
                </div>
                <span className="text-white/50 text-sm font-medium tracking-wide uppercase">Sacred Journey</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
                Your Umrah Journey<br />
                <span style={{ color: "rgb(252 211 77 / 93%)", display: "block", marginTop: "0.75rem" }}>
                  Starts Here
                </span>
              </h1>
              <p className="text-white/55 text-sm sm:text-base max-w-lg leading-relaxed">
                All-inclusive Umrah packages from Germany — flights, hotels near Haram, visa, and guided ziyarat, all taken care of.
              </p>
            </div>

            {/* Stats */}
            <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm">
              <div className="flex gap-6">
                {STATS.map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-[11px] text-white/45 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mt-8">
            {FEATURES.map(f => (
              <div key={f.title} className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 backdrop-blur-sm ${f.bg}`}>
                {f.icon}
                <div>
                  <p className="text-xs font-bold text-white">{f.title}</p>
                  <p className="text-[10px] text-white/45">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── What's Included ── */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800">What&apos;s Included in Every Package</h2>
          <p className="text-sm text-slate-400 mt-1">All packages cover the essentials — premium tiers add more.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SERVICES.map(s => (
            <div
              key={s.title}
              className={`rounded-2xl border p-4 flex flex-col gap-2.5 ${s.bg}`}
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="h-9 w-9 rounded-xl bg-white/70 flex items-center justify-center">
                {s.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">{s.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="max-w-6xl mx-auto px-4 pb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400 text-sm mr-1">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filter:</span>
          </div>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                active === cat
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400 font-medium">{filtered.length} packages found</span>
        </div>
      </div>

      {/* ── Packages Grid ── */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(pkg => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${pkg.badgeColor}`}>
                  {pkg.badge}
                </span>
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-rose-600 text-[10px] font-bold px-2 py-1 rounded-full">
                  {Math.round((1 - pkg.price / pkg.originalPrice) * 100)}% OFF
                </span>

                {/* Nights overlay */}
                <div className="absolute bottom-3 left-3 flex items-center gap-3">
                  <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    <Moon className="h-3 w-3" /> {pkg.makkahNights}N Makkah
                  </span>
                  <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    <Moon className="h-3 w-3" /> {pkg.madinahNights}N Madinah
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-bold text-slate-800 mb-1">{pkg.title}</h3>

                {/* Meta */}
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{pkg.duration}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{pkg.groupSize}</span>
                </div>

                {/* Departure */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-3">
                  <MapPin className="h-3 w-3 text-primary shrink-0" />
                  <span>Departing from <span className="font-semibold text-slate-700">{pkg.departure}</span></span>
                </div>

                {/* Hotels */}
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 mb-3 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <Hotel className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Makkah</p>
                      <p className="text-xs text-slate-700 font-medium">{pkg.hotel.makkah}</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-100" />
                  <div className="flex items-start gap-2">
                    <Hotel className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Madinah</p>
                      <p className="text-xs text-slate-700 font-medium">{pkg.hotel.madinah}</p>
                    </div>
                  </div>
                </div>

                {/* Includes */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {pkg.includes.map(inc => (
                    <span key={inc} className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-2.5 w-2.5" />{inc}
                    </span>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-4">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-slate-700">{pkg.rating}</span>
                  <span className="text-[11px] text-slate-400">({pkg.reviews} reviews)</span>
                </div>

                {/* Price + CTA */}
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold text-slate-800">€{pkg.price.toLocaleString()}</span>
                      <span className="text-xs text-slate-400 line-through">€{pkg.originalPrice.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" /> per person
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/4917972968560?text=Hi, I'm interested in the ${pkg.title} (€${pkg.price})`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
                  >
                    Book Now <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA Banner ── */}
        <div
          className="mt-12 rounded-2xl overflow-hidden relative"
          style={{ background: "radial-gradient(ellipse at top right, #1e4080 0%, #0B1D3A 55%, #060f22 100%)" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
          <div className="relative px-6 py-8 sm:px-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Need a tailored plan?</p>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Get a Custom Umrah Package</h2>
              <p className="text-white/50 text-sm">Tell us your dates, group size, and budget — we&apos;ll arrange everything for your blessed journey.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="https://wa.me/4917972968560?text=Hi, I'd like a custom Umrah package"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-bold text-sm px-5 py-3 rounded-xl"
                style={{ boxShadow: "0 4px 14px rgba(16,185,129,0.35)" }}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Us
              </a>
              <a
                href="mailto:team@amdglobal.org"
                className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/15 transition-colors text-white font-bold text-sm px-5 py-3 rounded-xl"
              >
                Email Us
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
