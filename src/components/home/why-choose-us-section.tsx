import React from "react";
import { ShieldCheck, Headset, Zap, RefreshCw, type LucideIcon } from "lucide-react";

interface FeatureCard {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: FeatureCard[] = [
  {
    id: "price-guarantee",
    icon: ShieldCheck,
    title: "Best Price Guarantee",
    description:
      "Real-time fare comparisons with complete price transparency and zero hidden booking fees.",
  },
  {
    id: "dedicated-support",
    icon: Headset,
    title: "24/7 Dedicated Support",
    description:
      "Our travel specialists are always available via WhatsApp and hotline to assist with any itinerary changes.",
  },
  {
    id: "instant-confirmation",
    icon: Zap,
    title: "Instant E-Ticket Confirmation",
    description:
      "Receive fully validated PNRs and digital e-tickets directly to your email in seconds.",
  },
  {
    id: "flexible-bookings",
    icon: RefreshCw,
    title: "Flexible Bookings",
    description:
      "Enjoy stress-free trip modifications and hassle-free refund processing for eligible flights.",
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="bg-slate-50/50 py-14 lg:py-20 border-t border-slate-100">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12 lg:mb-16">
          <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-[11px] font-bold uppercase tracking-wider text-orange-500 shadow-xs mb-3">
            WHY CHOOSE US
          </span>
          <h2 className="font-heading font-extrabold text-slate-900 text-3xl sm:text-4xl leading-tight tracking-tight">
            Travel With Confidence
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2.5 max-w-xl text-center font-normal leading-relaxed">
            Experience seamless booking, transparent pricing, and 24/7 dedicated support.
          </p>
        </div>

        {/* 4-Column Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="group flex flex-col rounded-2xl bg-white border border-slate-200/70 p-6 lg:p-7 shadow-xs hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left"
              >
                {/* Icon Badge */}
                <div className="bg-orange-50 text-orange-500 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shrink-0">
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <h3 className="font-heading font-bold text-slate-900 text-lg mb-2 leading-snug">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUsSection;
