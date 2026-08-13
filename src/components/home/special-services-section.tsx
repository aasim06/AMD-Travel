"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Compass,
  Sparkles,
  Hotel,
  ShieldCheck,
  Plane,
  FileCheck,
  Clock,
  UserCheck,
} from "lucide-react";
import { useCurrency } from "@/context/currency-context";

export function SpecialServicesSection() {
  const { t } = useCurrency();

  return (
    <section className="relative bg-slate-50/60 py-16 lg:py-24 border-t border-slate-100/80 overflow-hidden">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/10 via-blue-50/30 to-transparent blur-3xl pointer-events-none" />

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>SPECIAL SERVICES</span>
          </div>
          <h2 className="font-heading font-extrabold text-slate-900 text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight tracking-tight">
            {t("services.title", "Tailored Travel Solutions")}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-3 max-w-xl text-center font-normal leading-relaxed">
            {t("services.subtitle", "From sacred pilgrimages to global visa assistance, explore our specialized travel offerings.")}
          </p>
        </div>

        {/* 2-Column Balanced Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* Card 1: Umrah Special Offer */}
          <div className="group relative flex flex-col justify-between rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
            
            {/* Subtle background glow */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-500" />

            <div>
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Umrah Special</span>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-md">
                  Exclusive Packages
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 mb-3 leading-tight">
                {t("services.umrahTitle", "Spiritual Journeys Tailored For You")}
              </h3>
              <p className="text-slate-500 text-sm mb-7 leading-relaxed">
                {t("services.umrahSubtitle", "Experience a seamless and serene pilgrimage with fully customized Umrah services.")}
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-9">
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 group-hover:bg-emerald-50/30 transition-colors">
                  <div className="p-2 rounded-lg bg-emerald-100/80 text-emerald-700 shrink-0 mt-0.5">
                    <Hotel className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">3-Star to 5-Star Hotels</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Luxury stays in Makkah &amp; Madinah steps from the Haram.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 group-hover:bg-emerald-50/30 transition-colors">
                  <div className="p-2 rounded-lg bg-emerald-100/80 text-emerald-700 shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Complete Visa &amp; Transport</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Hassle-free visa handling with private &amp; group ground transport.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 group-hover:bg-emerald-50/30 transition-colors">
                  <div className="p-2 rounded-lg bg-emerald-100/80 text-emerald-700 shrink-0 mt-0.5">
                    <Plane className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Flexible Flight Options</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Direct &amp; indirect flight connections from all major airports.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href="/umrah-packages"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all duration-300 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 w-full"
              >
                <span>Explore Umrah Packages</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Visa Assistance */}
          <div className="group relative flex flex-col justify-between rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500" />
            
            {/* Subtle background glow */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-all duration-500" />

            <div>
              {/* Card Header & Badge */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Global Visa Services</span>
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-100/60 px-2.5 py-1 rounded-md">
                  High Approval Rate
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 mb-3 leading-tight">
                {t("services.visaTitle", "Hassle-Free Visa Processing")}
              </h3>
              <p className="text-slate-500 text-sm mb-7 leading-relaxed">
                {t("services.visaSubtitle", "Fast-track your global travels with expert visa guidance and reliable support.")}
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-9">
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                  <div className="p-2 rounded-lg bg-blue-100/80 text-blue-700 shrink-0 mt-0.5">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Worldwide Destinations</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Tourist &amp; Business visas for UAE, Schengen, UK, &amp; Saudi Arabia.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                  <div className="p-2 rounded-lg bg-blue-100/80 text-blue-700 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Document &amp; Appointment Prep</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Full assistance with document review, form filing &amp; embassy slots.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                  <div className="p-2 rounded-lg bg-blue-100/80 text-emerald-700 shrink-0 mt-0.5">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Dedicated Visa Agents</h4>
                    <p className="text-xs text-slate-600 mt-0.5">1-on-1 guidance from experienced specialists for maximum approval success.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href="/visa"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 w-full"
              >
                <span>Apply For Visa</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default SpecialServicesSection;
