"use client";

import React from "react";
import { ShieldCheck, Lock, Zap, Headset, Award, CheckCircle2 } from "lucide-react";

interface TrustSealsProps {
  variant?: "full" | "compact" | "banner";
  className?: string;
}

export function TrustSeals({ variant = "full", className = "" }: TrustSealsProps) {
  if (variant === "compact") {
    return (
      <div className={`grid grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 ${className}`}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 leading-none">IATA Certified</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Verified Agency</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
            <Lock className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 leading-none">256-Bit SSL</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Secure Checkout</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
            <Zap className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 leading-none">Instant PNR</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Live E-Ticket</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 shrink-0">
            <Headset className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 leading-none">24/7 Support</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Live Experts</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className={`w-full bg-slate-900 border-y border-slate-800 text-white py-4 ${className}`}>
        <div className="container flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <span className="text-xs font-bold block text-white">IATA Accredited Agency</span>
              <span className="text-[10px] text-slate-400">Official Flight Booking Partner</span>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-blue-400" />
            <div>
              <span className="text-xs font-bold block text-white">256-Bit SSL Encrypted</span>
              <span className="text-[10px] text-slate-400">Bank-Grade Data Protection</span>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800 hidden md:block" />
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-amber-400" />
            <div>
              <span className="text-xs font-bold block text-white">Instant PNR Confirmation</span>
              <span className="text-[10px] text-slate-400">Automated E-Ticket Delivery</span>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800 hidden lg:block" />
          <div className="flex items-center gap-3">
            <Headset className="h-5 w-5 text-indigo-400" />
            <div>
              <span className="text-xs font-bold block text-white">24/7 Priority Support</span>
              <span className="text-[10px] text-slate-400">Live Assistance Anywhere</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full default layout
  return (
    <div className={`w-full py-8 border-b border-border ${className}`}>
      <div className="container">
        <div className="text-center mb-6 max-w-xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-2">
            <Award className="h-3.5 w-3.5" />
            Why Book With AMD Travel
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground font-heading">
            Guaranteed Peace of Mind & Secure Bookings
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1 */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground font-heading">IATA Authorized Agency</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Direct integration with global airline GDS systems for verified fares.
              </p>
              <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verified Partner</span>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground font-heading">256-Bit SSL Encrypted</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Bank-level PCI-DSS payment protection for all cards & transfers.
              </p>
              <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-blue-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>100% Secure Checkout</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground font-heading">Instant E-Ticket PNR</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Receive valid PNR & downloadable PDF e-ticket within seconds.
              </p>
              <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-amber-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Instant Confirmation</span>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 shrink-0">
              <Headset className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground font-heading">24/7 Dedicated Support</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Real human travel experts available via Phone, Email & WhatsApp.
              </p>
              <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-indigo-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Always Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
