"use client";

import Link from "next/link";
import { Mail, MapPin, Globe, Camera, Briefcase, X, MessageCircle, ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useCurrency } from "@/context/currency-context";

export function Footer() {
  const { t } = useCurrency();
  const year = new Date().getFullYear();

  const socialLinks = [
    { href: siteConfig.social.facebook, icon: Globe, label: "Facebook" },
    { href: siteConfig.social.instagram, icon: Camera, label: "Instagram" },
    { href: siteConfig.social.twitter, icon: X, label: "Twitter / X" },
    { href: siteConfig.social.linkedin, icon: Briefcase, label: "LinkedIn" },
  ];

  return (
    <footer className="bg-card border-border">
      {/* Custom Flight & Travel CTA Banner */}
      <div className="border-b border-border text-white">
        <div className="container py-8">
          <div className="relative px-6 py-8 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 shadow-xl overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex-1 text-center sm:text-left z-10">
              <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-2">
                {t("quote.needHelp", "Need a tailored plan?")}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 font-heading">
                {t("quote.title", "Get a Custom Flight & Travel Quote")}
              </h2>
              <p className="text-white/70 text-sm max-w-xl">
                {t("quote.subtitle", "Tell us your preferred dates, destinations, and budget — we'll arrange the best flight deals for your journey.")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0 z-10">
              <a
                href="https://wa.me/4917972968560?text=Hi,%20I'd%20like%20a%20custom%20flight%20quote"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 transition-all text-white font-bold text-sm px-5 py-3 rounded-xl w-full sm:w-auto text-center shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-100"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Us
              </a>
              <a
                href="mailto:team@amdglobal.org"
                className="flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/15 transition-all text-white font-bold text-sm px-5 py-3 rounded-xl w-full sm:w-auto text-center hover:scale-[1.02] active:scale-100"
              >
                Email Us
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 sm:py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + address */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group">
              {/* Icon mark — same as header */}
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary shadow-card group-hover:shadow-card-hover transition-shadow">
                <svg viewBox="0 0 36 36" fill="none" className="h-5 w-5" aria-hidden>
                  <circle cx="18" cy="18" r="10" stroke="white" strokeWidth="1.8" strokeDasharray="4 2.5" opacity="0.5" />
                  <path
                    d="M8 20.5l5-2.5 2.5-6 1.5 5.5 4-1.5-1 4.5 5.5-2-3 4.5-14.5 1 0.5-3.5z"
                    fill="white"
                    opacity="0.95"
                  />
                  <path
                    d="M10 18.5 Q18 10 26 18.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.4"
                  />
                </svg>
              </div>
              {/* Wordmark */}
              <div className="flex flex-col leading-none">
                <span className="font-heading font-extrabold text-base text-foreground tracking-tight">
                  AMD
                  <span className="text-primary"> Global</span>
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase">
                  Travel
                </span>
              </div>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {siteConfig.description}
            </p>

            <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>Charlottenstraße 17, 52070 Aachen Germany</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <a href="mailto:team@amdglobal.org" className="hover:text-primary transition-colors">
                team@amdglobal.org
              </a>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
              <a href="https://wa.me/4917972968560" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                +49 179 7296856
              </a>
            </div>

            {/* Social links */}
            <div className="mt-5 flex items-center gap-2">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-foreground uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Flights
                </Link>
              </li>
              <li>
                <Link href="/umrah-packages" className="text-muted-foreground hover:text-primary transition-colors">
                  Umrah Packages
                </Link>
              </li>
              <li>
                <Link href="/tour-deals" className="text-muted-foreground hover:text-primary transition-colors">
                  Tour Deals
                </Link>
              </li>
              <li>
                <Link href="/visa" className="text-muted-foreground hover:text-primary transition-colors">
                  Visa Services
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="text-muted-foreground hover:text-primary transition-colors">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-foreground uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-foreground uppercase tracking-wider">
              We Accept
            </h3>

            {/* Payment badge grid matching original exact design */}
            <div className="mt-4 flex flex-wrap gap-2.5 items-center">
              
              {/* VISA */}
              <div className="flex items-center justify-center h-8 px-3 rounded border border-slate-200 bg-white shadow-xs">
                <span className="font-black text-sm tracking-tighter text-[#1A1F71] italic font-serif">
                  VISA
                </span>
              </div>

              {/* Mastercard */}
              <div className="flex items-center justify-center h-8 px-3 rounded border border-slate-200 bg-white shadow-xs">
                <div className="relative flex items-center">
                  <div className="w-4 h-4 rounded-full bg-[#EB001B]" />
                  <div className="w-4 h-4 rounded-full bg-[#F79E1B] -ml-2 opacity-90" />
                </div>
              </div>

              {/* AMEX */}
              <div className="flex items-center justify-center h-8 px-3 rounded bg-[#006FCF] text-white shadow-xs">
                <span className="font-extrabold text-xs tracking-wider font-sans">
                  AMEX
                </span>
              </div>

              {/* PayPal */}
              <div className="flex items-center justify-center h-8 px-3 rounded border border-slate-200 bg-white shadow-xs">
                <span className="font-extrabold text-sm text-[#003087]">
                  Pay<span className="text-[#009CDE]">Pal</span>
                </span>
              </div>

              {/* Apple Pay */}
              <div className="flex items-center justify-center h-8 px-3 rounded bg-black text-white shadow-xs">
                <span className="font-bold text-xs tracking-tight flex items-center gap-1 font-sans">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.92-14.4-6.15-3.6-2.9-7.66-7.83-12.18-14.8-5.74-8.82-10.15-18.73-13.23-29.74-3.08-11.01-4.62-21.49-4.62-31.44 0-14.28 3.57-26 10.7-35.16 7.14-9.16 16.14-13.82 27.01-13.98 4.88 0 10.02 1.25 15.42 3.75 5.4 2.5 9.17 3.75 11.31 3.75 1.76 0 5.66-1.31 11.71-3.94 6.05-2.63 11.22-3.87 15.51-3.71 12.02.49 21.6 4.9 28.74 13.23-10.74 6.47-15.99 15.54-15.75 27.21.25 9.16 3.86 16.7 10.84 22.62 4.3 3.65 9.18 6.13 14.65 7.44-2.52 7.37-6.02 15.22-10.5 23.54zM119.22 31.81c0-6.72 2.45-13.06 7.35-19.02 5.25-6.38 11.76-10.03 19.53-10.95.16 1.15.25 2.13.25 2.95 0 6.64-2.52 13.06-7.56 19.27-5.04 6.21-11.45 9.87-19.23 10.98-.16-.82-.34-2.23-.34-3.23z"/>
                  </svg>
                  Pay
                </span>
              </div>

            </div>

            <p className="mt-4 text-[11px] text-muted-foreground/80 leading-tight">
              Prices shown in EUR by default. All bookings are secured with industry-standard encryption.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {year} AMD Global Travel. All rights reserved.</p>
          <p className="text-[11px]">Built for global travelers, powered by AMD Travel.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
