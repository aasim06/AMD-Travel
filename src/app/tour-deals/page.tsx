"use client";

import { useState } from "react";
import {
  MapPin, Clock, Users, Star, ArrowRight, Plane,
  MessageCircle, Sparkles, Shield, HeartHandshake, Filter,
  Calendar, Tag,
} from "lucide-react";

const CATEGORIES = ["All", "Europe", "Asia", "Middle East", "Africa", "Americas"];

const DEALS = [
  {
    id: 1,
    category: "Europe",
    destination: "Paris, France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
    badge: "Best Seller",
    badgeColor: "bg-amber-400 text-amber-900",
    duration: "7 Days / 6 Nights",
    groupSize: "2–12 People",
    rating: 4.9,
    reviews: 214,
    price: 1299,
    originalPrice: 1699,
    includes: ["Flights", "Hotel", "Tours"],
    highlights: ["Eiffel Tower", "Louvre Museum", "Seine River Cruise"],
  },
  {
    id: 2,
    category: "Asia",
    destination: "Bali, Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
    badge: "Hot Deal",
    badgeColor: "bg-rose-500 text-white",
    duration: "10 Days / 9 Nights",
    groupSize: "2–8 People",
    rating: 4.8,
    reviews: 187,
    price: 1099,
    originalPrice: 1499,
    includes: ["Flights", "Villa", "Transfers"],
    highlights: ["Ubud Rice Terraces", "Tanah Lot Temple", "Seminyak Beach"],
  },
  {
    id: 3,
    category: "Middle East",
    destination: "Dubai, UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
    badge: "Luxury",
    badgeColor: "bg-violet-500 text-white",
    duration: "5 Days / 4 Nights",
    groupSize: "2–10 People",
    rating: 4.9,
    reviews: 302,
    price: 899,
    originalPrice: 1199,
    includes: ["Flights", "5★ Hotel", "Desert Safari"],
    highlights: ["Burj Khalifa", "Desert Safari", "Dubai Mall"],
  },
  {
    id: 4,
    category: "Europe",
    destination: "Istanbul, Turkey",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80",
    badge: "New",
    badgeColor: "bg-sky-500 text-white",
    duration: "6 Days / 5 Nights",
    groupSize: "2–15 People",
    rating: 4.7,
    reviews: 143,
    price: 749,
    originalPrice: 999,
    includes: ["Flights", "Hotel", "City Tour"],
    highlights: ["Hagia Sophia", "Grand Bazaar", "Bosphorus Cruise"],
  },
  {
    id: 5,
    category: "Africa",
    destination: "Marrakech, Morocco",
    image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80",
    badge: "Popular",
    badgeColor: "bg-emerald-500 text-white",
    duration: "5 Days / 4 Nights",
    groupSize: "2–10 People",
    rating: 4.6,
    reviews: 98,
    price: 649,
    originalPrice: 849,
    includes: ["Flights", "Riad", "Guided Tours"],
    highlights: ["Medina Souks", "Jardin Majorelle", "Atlas Mountains"],
  },
  {
    id: 6,
    category: "Asia",
    destination: "Tokyo, Japan",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    badge: "Premium",
    badgeColor: "bg-indigo-500 text-white",
    duration: "9 Days / 8 Nights",
    groupSize: "2–8 People",
    rating: 5.0,
    reviews: 76,
    price: 1899,
    originalPrice: 2399,
    includes: ["Flights", "Hotel", "JR Pass"],
    highlights: ["Mount Fuji", "Shibuya Crossing", "Kyoto Temples"],
  },
  {
    id: 7,
    category: "Americas",
    destination: "New York, USA",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80",
    badge: "City Break",
    badgeColor: "bg-slate-700 text-white",
    duration: "5 Days / 4 Nights",
    groupSize: "2–6 People",
    rating: 4.8,
    reviews: 165,
    price: 1199,
    originalPrice: 1549,
    includes: ["Flights", "Hotel", "City Card"],
    highlights: ["Times Square", "Central Park", "Statue of Liberty"],
  },
  {
    id: 8,
    category: "Middle East",
    destination: "Maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80",
    badge: "Honeymoon",
    badgeColor: "bg-pink-500 text-white",
    duration: "7 Days / 6 Nights",
    groupSize: "2 People",
    rating: 5.0,
    reviews: 89,
    price: 2499,
    originalPrice: 3199,
    includes: ["Flights", "Water Villa", "All-Inclusive"],
    highlights: ["Overwater Bungalow", "Snorkeling", "Sunset Cruise"],
  },
];

const FEATURES = [
  { icon: <Shield className="h-4 w-4 text-emerald-400" />, bg: "bg-emerald-500/10 border-emerald-500/20", title: "Price Guarantee", desc: "Best price or we match it" },
  { icon: <HeartHandshake className="h-4 w-4 text-sky-400" />, bg: "bg-sky-500/10 border-sky-500/20", title: "Tailored Trips", desc: "Customised for you" },
  { icon: <Sparkles className="h-4 w-4 text-amber-400" />, bg: "bg-amber-500/10 border-amber-500/20", title: "Curated Deals", desc: "Hand-picked by experts" },
];

const STATS = [
  { value: "50+", label: "Destinations" },
  { value: "5k+", label: "Happy Travellers" },
  { value: "4.9★", label: "Average Rating" },
];

export default function TourDealsPage() {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? DEALS : DEALS.filter(d => d.category === active);

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
            <span className="text-white/70 font-medium">Tour Deals</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Plane className="h-5 w-5 text-white" />
                </div>
                <span className="text-white/50 text-sm font-medium tracking-wide uppercase">Exclusive Packages</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
                Explore the World<br />
                <span style={{ color: "hsl(24 100% 62%)", display: "block", marginTop: "0.75rem" }}>
                  Your Way
                </span>
              </h1>
              <p className="text-white/55 text-sm sm:text-base max-w-lg leading-relaxed">
                Hand-picked tour packages with flights, hotels, and guided experiences — all at unbeatable prices.
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

      {/* ── Filter Bar ── */}
      <div className="max-w-6xl mx-auto px-4 py-6">
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

      {/* ── Deals Grid ── */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(deal => (
            <div
              key={deal.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={deal.image}
                  alt={deal.destination}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Badge */}
                <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${deal.badgeColor}`}>
                  {deal.badge}
                </span>

                {/* Discount */}
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-rose-600 text-[10px] font-bold px-2 py-1 rounded-full">
                  {Math.round((1 - deal.price / deal.originalPrice) * 100)}% OFF
                </span>

                {/* Destination overlay */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-white/90" />
                  <span className="text-white text-xs font-semibold drop-shadow">{deal.destination}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col flex-1">

                {/* Meta row */}
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{deal.duration}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{deal.groupSize}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-slate-700">{deal.rating}</span>
                  <span className="text-[11px] text-slate-400">({deal.reviews} reviews)</span>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {deal.highlights.map(h => (
                    <span key={h} className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                      {h}
                    </span>
                  ))}
                </div>

                {/* Includes */}
                <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                  {deal.includes.map(inc => (
                    <span key={inc} className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                      <Tag className="h-2.5 w-2.5" />{inc}
                    </span>
                  ))}
                </div>

                {/* Price + CTA */}
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold text-slate-800">€{deal.price.toLocaleString()}</span>
                      <span className="text-xs text-slate-400 line-through">€{deal.originalPrice.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" /> per person
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/4917972968560?text=Hi, I'm interested in the ${deal.destination} tour package (€${deal.price})`}
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

        {/* ── WhatsApp CTA Banner ── */}
        <div
          className="mt-6 sm:mt-12 rounded-2xl overflow-hidden relative"
          style={{ background: "radial-gradient(ellipse at top right, #1e4080 0%, #0B1D3A 55%, #060f22 100%)" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
          <div className="relative px-6 py-8 sm:px-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Can&apos;t find what you&apos;re looking for?</p>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Get a Custom Tour Package</h2>
              <p className="text-white/50 text-sm">Tell us your dream destination and budget — we&apos;ll craft the perfect itinerary for you.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
              <a
                href="https://wa.me/4917972968560?text=Hi, I'd like a custom tour package"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-bold text-sm px-5 py-3 rounded-xl w-full sm:w-auto text-center"
                style={{ boxShadow: "0 4px 14px rgba(16,185,129,0.35)" }}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Us
              </a>
              <a
                href="mailto:team@amdglobal.org"
                className="flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/15 transition-colors text-white font-bold text-sm px-5 py-3 rounded-xl w-full sm:w-auto text-center"
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
