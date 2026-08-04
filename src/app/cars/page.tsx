"use client";

import { useState } from "react";
import { Hero } from "@/components/home/hero";
import { PublicLayout } from "@/components/layout/public-layout";
import {
  MapPin, Star, ArrowRight, MessageCircle, Filter,
  Users, Fuel, Settings, Shield, CheckCircle2,
  Car, Zap, Wind,
} from "lucide-react";


const CATEGORIES = ["All", "Economy", "SUV", "Luxury", "Van", "Electric"];

const CARS = [
  {
    id: 1,
    category: "Economy",
    name: "Volkswagen Golf",
    type: "Hatchback",
    seats: 5,
    transmission: "Automatic",
    fuel: "Petrol",
    pricePerDay: 45,
    originalPrice: 60,
    rating: 4.7,
    reviews: 284,
    badge: "Most Popular",
    badgeColor: "bg-amber-400 text-amber-900",
    features: ["Free Cancellation", "Insurance Included", "Unlimited KM"],
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&q=80",
    location: "Frankfurt Airport",
  },
  {
    id: 2,
    category: "SUV",
    name: "BMW X5",
    type: "SUV",
    seats: 5,
    transmission: "Automatic",
    fuel: "Diesel",
    pricePerDay: 120,
    originalPrice: 160,
    rating: 4.9,
    reviews: 156,
    badge: "Top Rated",
    badgeColor: "bg-violet-500 text-white",
    features: ["Free Cancellation", "Insurance Included", "GPS Included"],
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80",
    location: "Munich Airport",
  },
  {
    id: 3,
    category: "Luxury",
    name: "Mercedes S-Class",
    type: "Sedan",
    seats: 5,
    transmission: "Automatic",
    fuel: "Petrol",
    pricePerDay: 220,
    originalPrice: 299,
    rating: 5.0,
    reviews: 89,
    badge: "Luxury",
    badgeColor: "bg-rose-500 text-white",
    features: ["Chauffeur Available", "Insurance Included", "Airport Pickup"],
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80",
    location: "Berlin Airport",
  },
  {
    id: 4,
    category: "Van",
    name: "Mercedes Vito",
    type: "Minivan",
    seats: 8,
    transmission: "Automatic",
    fuel: "Diesel",
    pricePerDay: 95,
    originalPrice: 130,
    rating: 4.8,
    reviews: 112,
    badge: "Best for Groups",
    badgeColor: "bg-emerald-500 text-white",
    features: ["Free Cancellation", "Insurance Included", "Unlimited KM"],
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80",
    location: "Hamburg Airport",
  },
  {
    id: 5,
    category: "Electric",
    name: "Tesla Model 3",
    type: "Sedan",
    seats: 5,
    transmission: "Automatic",
    fuel: "Electric",
    pricePerDay: 110,
    originalPrice: 149,
    rating: 4.9,
    reviews: 203,
    badge: "Eco Friendly",
    badgeColor: "bg-sky-500 text-white",
    features: ["Free Cancellation", "Insurance Included", "Supercharger Access"],
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80",
    location: "Frankfurt Airport",
  },
  {
    id: 6,
    category: "Economy",
    name: "Opel Corsa",
    type: "Hatchback",
    seats: 5,
    transmission: "Manual",
    fuel: "Petrol",
    pricePerDay: 32,
    originalPrice: 45,
    rating: 4.5,
    reviews: 321,
    badge: "Budget Pick",
    badgeColor: "bg-sky-500 text-white",
    features: ["Free Cancellation", "Insurance Included", "Unlimited KM"],
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=80",
    location: "Düsseldorf Airport",
  },
];

const PERKS = [
  { icon: <Shield className="h-5 w-5 text-emerald-500" />, bg: "bg-emerald-50 border-emerald-100", title: "Full Insurance", desc: "Comprehensive coverage on every rental" },
  { icon: <CheckCircle2 className="h-5 w-5 text-blue-500" />, bg: "bg-blue-50 border-blue-100", title: "Free Cancellation", desc: "Cancel up to 24h before pickup" },
  { icon: <MapPin className="h-5 w-5 text-violet-500" />, bg: "bg-violet-50 border-violet-100", title: "Airport Pickup", desc: "Pick up & drop off at major airports" },
  { icon: <Car className="h-5 w-5 text-amber-500" />, bg: "bg-amber-50 border-amber-100", title: "200+ Cars", desc: "Economy to luxury, we have it all" },
];

function fuelIcon(fuel: string) {
  if (fuel === "Electric") return <Zap className="h-3 w-3" />;
  if (fuel === "Diesel") return <Wind className="h-3 w-3" />;
  return <Fuel className="h-3 w-3" />;
}

export default function CarsPage() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? CARS : CARS.filter(c => c.category === active);

  return (
    <main className="min-h-screen bg-slate-50">



      <Hero initialCategory="cars" />

      {/* ── Perks ── */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PERKS.map(p => (
            <div key={p.title} className={`rounded-2xl border p-4 flex flex-col gap-2.5 ${p.bg}`} style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div className="h-9 w-9 rounded-xl bg-white/70 flex items-center justify-center">
                {p.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">{p.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{p.desc}</p>
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
          <span className="ml-auto text-xs text-slate-400 font-medium">{filtered.length} cars found</span>
        </div>
      </div>

      {/* ── Cars Grid ── */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(car => (
            <div
              key={car.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${car.badgeColor}`}>
                  {car.badge}
                </span>
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-rose-600 text-[10px] font-bold px-2 py-1 rounded-full">
                  {Math.round((1 - car.pricePerDay / car.originalPrice) * 100)}% OFF
                </span>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                  <MapPin className="h-3 w-3" /> {car.location}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-bold text-slate-800 mb-0.5">{car.name}</h3>
                <p className="text-xs text-slate-400 mb-3">{car.type}</p>

                {/* Specs */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Users className="h-3.5 w-3.5 text-slate-400" /> {car.seats} Seats
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Settings className="h-3.5 w-3.5 text-slate-400" /> {car.transmission}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    {fuelIcon(car.fuel)} {car.fuel}
                  </span>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {car.features.map(f => (
                    <span key={f} className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-2.5 w-2.5" />{f}
                    </span>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-4">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-slate-700">{car.rating}</span>
                  <span className="text-[11px] text-slate-400">({car.reviews} reviews)</span>
                </div>

                {/* Price + CTA */}
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold text-slate-800">€{car.pricePerDay}</span>
                      <span className="text-xs text-slate-400 line-through">€{car.originalPrice}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">per day</p>
                  </div>
                  <a
                    href={`https://wa.me/4917972968560?text=Hi, I'm interested in renting a ${car.name} (€${car.pricePerDay}/day)`}
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
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Need something special?</p>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Get a Custom Car Rental Quote</h2>
              <p className="text-white/50 text-sm">Tell us your dates, location, and preferences — we&apos;ll find the perfect car for you.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="https://wa.me/4917972968560?text=Hi, I'd like a custom car rental quote"
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
