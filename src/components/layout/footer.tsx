import Link from "next/link";
import { Mail, Phone, MapPin, Globe, Camera, Briefcase, X, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Footer() {
  const year = new Date().getFullYear();

  const socialLinks = [
    { href: siteConfig.social.facebook, icon: Globe, label: "Facebook" },
    { href: siteConfig.social.instagram, icon: Camera, label: "Instagram" },
    { href: siteConfig.social.twitter, icon: X, label: "Twitter / X" },
    { href: siteConfig.social.linkedin, icon: Briefcase, label: "LinkedIn" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-12">
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
                  className="flex items-center justify-center h-9 w-9 rounded-full border border-border text-foreground/70 hover:text-primary hover:border-primary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-foreground uppercase tracking-wide">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5">
              {siteConfig.nav.footerQuickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-foreground uppercase tracking-wide">
              Legal
            </h3>
            <ul className="mt-4 space-y-2.5">
              {siteConfig.nav.footerLegal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Payments */}
          <div>
            <h3 className="font-heading font-semibold text-sm text-foreground uppercase tracking-wide">
              We Accept
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">

              {/* Visa */}
              <div className="h-8 px-2.5 border border-border bg-white flex items-center justify-center">
                <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-label="Visa">
                  <text x="0" y="13" fontFamily="Arial" fontWeight="900" fontSize="15" fill="#1A1F71" letterSpacing="-0.5">VISA</text>
                </svg>
              </div>

              {/* Mastercard */}
              <div className="h-8 px-2  border border-border bg-white flex items-center justify-center gap-0">
                <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Mastercard">
                  <circle cx="13" cy="12" r="10" fill="#EB001B" />
                  <circle cx="25" cy="12" r="10" fill="#F79E1B" />
                  <path d="M19 4.8a10 10 0 0 1 0 14.4A10 10 0 0 1 19 4.8z" fill="#FF5F00" />
                </svg>
              </div>

              {/* Amex */}
              <div className="h-8 px-2.5  border border-border bg-[#2E77BC] flex items-center justify-center">
                <svg viewBox="0 0 60 16" className="h-3.5 w-auto" aria-label="American Express">
                  <text x="0" y="13" fontFamily="Arial" fontWeight="800" fontSize="12" fill="white" letterSpacing="0.5">AMEX</text>
                </svg>
              </div>

              {/* PayPal */}
              <div className="h-8 px-2.5  border border-border bg-white flex items-center justify-center">
                <svg viewBox="0 0 60 20" className="h-5 w-auto" aria-label="PayPal">
                  <text x="0" y="15" fontFamily="Arial" fontWeight="800" fontSize="14" fill="#003087">Pay</text>
                  <text x="22" y="15" fontFamily="Arial" fontWeight="800" fontSize="14" fill="#009CDE">Pal</text>
                </svg>
              </div>

              {/* Apple Pay */}
              <div className="h-8 px-2.5 border border-border bg-black flex items-center justify-center gap-1">
                <svg viewBox="0 0 14 16" className="h-4 w-auto fill-white" aria-label="Apple Pay" aria-hidden="true">
                  <path d="M9.02 2.06c.52-.63.87-1.5.77-2.37-.75.03-1.65.5-2.18 1.13-.48.55-.9 1.44-.79 2.29.84.06 1.69-.42 2.2-1.05zM9.78 3.3c-1.21-.07-2.24.69-2.82.69-.58 0-1.47-.65-2.43-.63C3.2 3.38 1.9 4.2 1.18 5.47c-1.46 2.52-.38 6.26 1.04 8.31.69.99 1.52 2.1 2.6 2.06.99-.04 1.38-.65 2.58-.65 1.2 0 1.55.65 2.6.63 1.12-.02 1.83-1.02 2.52-2.01.79-1.14 1.11-2.25 1.13-2.31-.02-.01-2.17-.84-2.19-3.33-.02-2.08 1.7-3.08 1.78-3.13-.97-1.44-2.49-1.6-3.06-1.64z"/>
                </svg>
                <svg viewBox="0 0 30 12" className="h-3 w-auto" aria-label="Pay text">
                  <text x="0" y="10" fontFamily="Arial" fontWeight="600" fontSize="10" fill="white">Pay</text>
                </svg>
              </div>

            </div>
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Prices shown in {siteConfig.locale.defaultCurrency} by default. All bookings
              are secured with industry-standard encryption.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for global travelers, powered by {siteConfig.shortName}.
          </p>
        </div>
      </div>
    </footer>
  );
}
