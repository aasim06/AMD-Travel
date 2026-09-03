"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthModal } from "@/components/auth/auth-modal";
import AskAiDrawer from "@/components/ai/AskAiDrawer";
import {
  Menu,
  X,
  MessageCircle,
  UserRound,
  ChevronDown,
  Plane,
  Hotel,
  Car,
  Package,
  Moon,
  FileText,
  MapPin,
  BookOpen,
  Globe,
  Crown,
  Bell,
  LogIn,
  UserPlus,
  Settings,
  Sparkles,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { useCurrency } from "@/context/currency-context";
import type { CurrencyCode } from "@/lib/currency";

// ─── Drawer nav items ─────────────────────────────────────────────────────────

const PRIMARY_NAV = [
  { label: "Flights",         href: "/",                 icon: Plane,    soon: false },
  { label: "Stays / Hotels",  href: "/stays",            icon: Hotel,    soon: false },
  { label: "Cars",            href: "/cars",             icon: Car,      soon: false },
  { label: "Tour Packages",   href: "/tour-deals",       icon: Package,  soon: false },
  { label: "Umrah",           href: "/umrah-packages",   icon: Moon,     soon: false },
  { label: "Visa",            href: "/visa",             icon: FileText, soon: false },
];

const SECONDARY_NAV = [
  { label: "Explore Destinations", href: "/tour-deals",   icon: MapPin,        soon: false },
  { label: "My Bookings / Trips",  href: "/bookings",     icon: BookOpen,      soon: false },
  { label: "Contact Us",           href: "/contact",      icon: MessageCircle, soon: false },
  { label: "Language & Currency",  href: "/settings",     icon: Globe,         soon: false },
];

// ─── Logo mark (shared) ───────────────────────────────────────────────────────

function LogoMark() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary shadow-card group-hover:shadow-card-hover transition-shadow shrink-0">
        <svg viewBox="0 0 36 36" fill="none" className="h-5 w-5" aria-hidden>
          <circle cx="18" cy="18" r="10" stroke="white" strokeWidth="1.8" strokeDasharray="4 2.5" opacity="0.5" />
          <path d="M8 20.5l5-2.5 2.5-6 1.5 5.5 4-1.5-1 4.5 5.5-2-3 4.5-14.5 1 0.5-3.5z" fill="white" opacity="0.95" />
          <path d="M10 18.5 Q18 10 26 18.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-heading font-extrabold text-base text-foreground tracking-tight">
          AMD<span className="text-primary"> Global</span>
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground tracking-widest uppercase">
          Travel
        </span>
      </div>
    </Link>
  );
}

// ─── Currency dropdown ───────────────────────────────────────────────────────

const CURRENCY_META: Record<string, { flagSvg: React.ReactNode; symbol: string; label: string; langLabel: string }> = {
  USD: {
    flagSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="h-4 w-6 overflow-hidden shrink-0">
        <rect width="60" height="30" fill="#B22234"/>
        {[0,1,2,3,4,5,6].map(i => <rect key={i} y={i*4+2} width="60" height="2" fill="white"/>)}
        <rect width="24" height="16" fill="#3C3B6E"/>
        {Array.from({length:9}).map((_,i) => (
          <text key={i} x={3 + (i%3)*8} y={5 + Math.floor(i/3)*5} fontSize="4" fill="white">★</text>
        ))}
      </svg>
    ),
    symbol: "$", label: "US Dollar", langLabel: "English (en)",
  },
  EUR: {
    flagSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" className="h-4 w-6 overflow-hidden shrink-0">
        <rect width="60" height="40" fill="#003399"/>
        {Array.from({length:12}).map((_,i) => {
          const angle = (i * 30 - 90) * Math.PI / 180;
          const cx = Number((30 + Math.cos(angle) * 12).toFixed(2));
          const cy = Number((20 + Math.sin(angle) * 12).toFixed(2));
          return <text key={i} x={cx} y={cy} fontSize="5" fill="#FFCC00" textAnchor="middle" dominantBaseline="middle">★</text>;
        })}
      </svg>
    ),
    symbol: "€", label: "Euro", langLabel: "Deutsch (de)",
  },
};

function CurrencyDropdown() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const active = CURRENCY_META[currency];

  return (
    <div ref={ref} className="relative flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-foreground/80 rounded-lg hover:bg-accent hover:text-primary transition-colors border border-slate-200/60 dark:border-slate-800/60"
      >
        {active?.flagSvg}
        <span className="hidden xs:inline">{active?.symbol}</span>
        <span>{currency}</span>
        <ChevronDown className={`h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 bg-white dark:bg-gray-900 shadow-xl overflow-hidden z-[80] animate-in fade-in slide-in-from-top-2 duration-150">
          {siteConfig.locale.supportedCurrencies.map((cur) => {
            const meta = CURRENCY_META[cur];
            const isActive = cur === currency;
            return (
              <li key={cur}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setCurrency(cur as CurrencyCode);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-accent ${
                    isActive ? "text-primary font-semibold bg-primary/5" : "text-foreground/80"
                  }`}
                >
                  {meta?.flagSvg}
                  <span className="flex flex-col text-left min-w-0">
                    <span className="font-semibold text-xs">{cur} <span className="font-normal text-muted-foreground">{meta?.symbol}</span></span>
                    <span className="text-[10px] text-muted-foreground font-medium">{meta?.label} · {meta?.langLabel}</span>
                  </span>
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── User Popover ────────────────────────────────────────────────────────────

function UserPopover() {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup" | "lookup">("signin");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  useEffect(() => {
    const handleAuthEvent = () => handleOpenAuth("signin");
    window.addEventListener("open-auth-modal", handleAuthEvent);
    return () => window.removeEventListener("open-auth-modal", handleAuthEvent);
  }, []);

  const handleOpenAuth = (tab: "signin" | "signup" | "lookup") => {
    setAuthTab(tab);
    setOpen(false);
    setAuthOpen(true);
  };

  return (
    <>
      <div ref={ref} className="relative flex items-center">
        <button
          type="button"
          aria-label="User account"
          onClick={() => setOpen(v => !v)}
          className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <UserRound className="h-5 w-5" />
        </button>

        {open && (
          <div className="absolute top-full right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.15)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="px-4 py-4 bg-gradient-to-br from-primary/8 to-primary/3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <UserRound className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Welcome back!</p>
                  <p className="text-[11px] text-slate-400">Sign in to manage your trips</p>
                </div>
              </div>
            </div>

            {/* Auth buttons */}
            <div className="p-3 space-y-2">
              <button
                type="button"
                onClick={() => handleOpenAuth("signin")}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors text-left"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleOpenAuth("signup")}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-primary/30 transition-colors text-left"
              >
                <UserPlus className="h-4 w-4 text-primary" />
                Create Account
              </button>
            </div>

            {/* Divider */}
            <div className="mx-3 border-t border-slate-100" />

            {/* Quick links */}
            <div className="p-3 space-y-0.5">
              <button
                type="button"
                onClick={() => handleOpenAuth("signin")}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors text-left"
              >
                <BookOpen className="h-4 w-4 text-slate-400" />
                My Bookings
              </button>
              <Link href="/settings" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors">
                <Settings className="h-4 w-4 text-slate-400" />
                Settings
              </Link>
              <Link href="/admin" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors font-semibold">
                <Crown className="h-4 w-4 text-amber-500" />
                Admin Panel
              </Link>
            </div>
          </div>
        )}
      </div>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab={authTab}
      />
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Listen for toggle drawer from mobile bottom dock
  useEffect(() => {
    const handleToggle = () => setDrawerOpen(prev => !prev);
    const handleOpenAi = () => setAiDrawerOpen(true);
    window.addEventListener("toggle-mobile-drawer", handleToggle);
    window.addEventListener("open-ask-ai-drawer", handleOpenAi);
    return () => {
      window.removeEventListener("toggle-mobile-drawer", handleToggle);
      window.removeEventListener("open-ask-ai-drawer", handleOpenAi);
    };
  }, []);

  const whatsappHref = `https://wa.me/${siteConfig.contact.whatsapp.replace(/\+/g, "")}`;

  const isSearchPage = pathname?.startsWith("/search");

  return (
    <>
      {/* ── Top navbar ── */}
      <header className={`sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm transition-all duration-300 ${isSearchPage ? "hidden md:block" : ""}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between gap-4">

          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="hidden md:flex items-center justify-center h-9 w-9 rounded-md text-foreground hover:bg-accent hover:text-primary transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <LogoMark />
          </div>

          {/* Right: currency + Ask AI + user account */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Ask AI Trigger Button */}
            <button
              type="button"
              onClick={() => setAiDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff8a3d] hover:bg-[#ea792d] text-white text-xs font-bold shadow-md shadow-[#ff8a3d]/20 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="tracking-tight font-outfit">Ask AI</span>
            </button>

            {/* Currency selector */}
            <CurrencyDropdown />

            {/* Bell */}
            <button
              type="button"
              aria-label="Notifications"
              className="hidden sm:flex items-center justify-center h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-primary transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border-2 border-white" />
            </button>

            {/* User popover */}
            <UserPopover />
          </div>
        </div>
      </header>

      {/* ── Backdrop overlay ── */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
      />

      {/* ── Left sidebar drawer ── */}
      <aside
        className={`fixed top-0 left-0 z-[70] h-full w-72 bg-card border-r border-border shadow-glass flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navigation drawer"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <LogoMark />
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer body — scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* Featured AMD AI Assistant Card */}
          <div className="mb-3 p-3 rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                setAiDrawerOpen(true);
              }}
              className="w-full flex items-center justify-between gap-2.5 text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 font-outfit">AMD AI Travel Guide</p>
                  <p className="text-[10px] text-slate-400">Ask flights, visa & packages</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-[#FF8A3D] text-white tracking-wider">
                AI
              </span>
            </button>
          </div>

          {/* Primary nav */}
          {PRIMARY_NAV.map(({ label, href, icon: Icon, soon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                prefetch={true}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/75 hover:bg-accent hover:text-primary"
                }`}
              >
                <span className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                }`}>
                  <Icon className="h-4 w-4" />
                </span>
                {label}
                {soon && (
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-amber-400/15 text-amber-600 border border-amber-400/30 px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
                {active && !soon && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-3 border-t border-border" />

          {/* Secondary nav */}
          {SECONDARY_NAV.map(({ label, href, icon: Icon, soon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/75 hover:bg-accent hover:text-primary"
                }`}
              >
                <span className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                }`}>
                  <Icon className="h-4 w-4" />
                </span>
                {label}
                {soon && (
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-amber-400/15 text-amber-600 border border-amber-400/30 px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div className="shrink-0 px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground/70 hover:text-success hover:border-success hover:bg-success/5 transition-all"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <Link
              href="/bookings"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-card hover:shadow-card-hover transition-shadow"
            >
              <UserRound className="h-4 w-4" />
              Bookings
            </Link>
          </div>
          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </aside>

      {/* Kayak-Style AI Assistant Left Slide-Over Drawer */}
      <AskAiDrawer isOpen={aiDrawerOpen} onClose={() => setAiDrawerOpen(false)} />
    </>
  );
}
