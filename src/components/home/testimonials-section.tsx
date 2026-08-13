import React from "react";
import { Star, Quote, CheckCircle2, HeartHandshake } from "lucide-react";

const REVIEWS = [
  {
    id: 1,
    name: "Dr. Tariq Mahmood",
    location: "Frankfurt, Germany",
    avatarBg: "bg-emerald-500",
    initials: "TM",
    rating: 5,
    tag: "Umrah Executive Package",
    comment:
      "AMD Global Travel handled our family Umrah package seamlessly! The 5-star Makkah hotel was right opposite the Haram, and transfers were on time. Outstanding support!",
    date: "August 2026",
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    location: "London, UK",
    avatarBg: "bg-brand-500",
    initials: "SJ",
    rating: 5,
    tag: "Flight & Car Booking",
    comment:
      "Booked direct flights from London to Dubai and a rental SUV for 7 days. The price was lower than major aggregators and e-tickets arrived in my inbox in 2 minutes!",
    date: "July 2026",
  },
  {
    id: 3,
    name: "Mohammad Usman",
    location: "Berlin, Germany",
    avatarBg: "bg-indigo-500",
    initials: "MU",
    rating: 5,
    tag: "Schengen & Saudi Visa",
    comment:
      "Extremely professional visa consultants! They reviewed my documents, scheduled my appointment, and my visa was approved in less than 5 days. Highly recommended!",
    date: "August 2026",
  },
];

export function TestimonialsSection() {
  return (
    <section className="w-full bg-slate-50/70 py-16 lg:py-24 border-t border-slate-100/90 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-80 bg-gradient-to-r from-orange-100/30 via-emerald-50/20 to-blue-100/30 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span>REAL TRAVELER REVIEWS</span>
          </div>
          <h2 className="font-heading font-extrabold text-slate-900 text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight tracking-tight">
            Loved By Thousands Of Travelers
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-3 max-w-xl text-center leading-relaxed">
            See what verified customers have to say about our flights, Umrah packages, and visa services.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="group relative flex flex-col justify-between rounded-3xl bg-white p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                {/* Top Quote & Rating */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-200 group-hover:text-orange-300 transition-colors" />
                </div>

                {/* Booking Tag */}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 mb-4">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {rev.tag}
                </span>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic mb-6">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* User Avatar & Name */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${rev.avatarBg} text-white font-bold text-xs shadow-xs shrink-0`}>
                  {rev.initials}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{rev.name}</h4>
                  <span className="text-[11px] text-slate-400">{rev.location} • {rev.date}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
