"use client";

import React, { useState, useEffect } from "react";
import {
  Palette,
  Sparkles,
  Plane,
  ShieldCheck,
  Compass,
  MessageCircle,
  Building2,
  Save,
  CheckCircle2,
  Eye,
  Check,
  RefreshCw,
} from "lucide-react";
import {
  useThemeColor,
  parseColorToHex,
  formatColorToHslBare,
} from "@/components/providers/theme-color-provider";

const COLOR_PRESETS = [
  {
    id: "orange",
    name: "Sunburst Orange (Default)",
    subtitle: "Default Brand Theme",
    hsl: "24 100% 62%",
    hex: "#ff8a3d",
    badge: "DEFAULT",
    dotClass: "bg-[#ff8a3d]",
  },
  {
    id: "blue",
    name: "Royal Blue",
    subtitle: "Corporate & Trustworthy",
    hsl: "221 83% 53%",
    hex: "#2563eb",
    badge: "ROYAL BLUE",
    dotClass: "bg-[#2563eb]",
  },
  {
    id: "emerald",
    name: "Emerald Green",
    subtitle: "Eco & Serene Journeys",
    hsl: "160 84% 39%",
    hex: "#059669",
    badge: "EMERALD GREEN",
    dotClass: "bg-[#059669]",
  },
  {
    id: "violet",
    name: "Imperial Violet",
    subtitle: "Modern & Premium",
    hsl: "262 83% 58%",
    hex: "#8b5cf6",
    badge: "IMPERIAL VIOLET",
    dotClass: "bg-[#8b5cf6]",
  },
];

export default function CmsForm() {
  const { applyThemeColor } = useThemeColor();
  const [activeTab, setActiveTab] = useState<
    "theme" | "hero" | "popular" | "why" | "services" | "quote" | "footer"
  >("theme");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form State initialized with defaults
  const [settings, setSettings] = useState({
    themePrimaryColor: "24 100% 62%",

    heroTitle: "Compare Flights From",
    heroSubtitle: "Find affordable domestic & international flights with instant e-ticket issuance.",
    typewriterWords: "100s Of Airlines, Best Ticket Deals, Unbeatable Fares",

    popularFlightsTitle: "Popular Flights",
    popularFlightsSubtitle: "Check these popular routes — great prices, updated daily.",

    whyChooseUsTitle: "Travel With Confidence",
    whyChooseUsSubtitle: "Experience seamless booking, transparent pricing, and 24/7 dedicated support.",
    card1Title: "Best Price Guarantee",
    card1Desc: "Real-time fare comparisons with complete price transparency and zero hidden booking fees.",
    card2Title: "24/7 Dedicated Support",
    card2Desc: "Our travel specialists are always available via WhatsApp and hotline to assist with any itinerary changes.",
    card3Title: "Instant E-Ticket Confirmation",
    card3Desc: "Receive fully validated PNR and digital e-tickets directly to your inbox in seconds.",
    card4Title: "Flexible Bookings",
    card4Desc: "Enjoy stress-free trip modifications and hassle-free refund processing for eligible flights.",

    specialServicesTitle: "Tailored Travel Solutions",
    specialServicesSubtitle: "From sacred pilgrimages to global visa assistance, explore our specialized travel offerings.",
    umrahCardTitle: "Spiritual Journeys Tailored For You",
    umrahCardSubtitle: "Experience a seamless and serene pilgrimage with fully customized Umrah services.",
    visaCardTitle: "Hassle-Free Visa Processing",
    visaCardSubtitle: "Fast-track your global travels with expert visa guidance and reliable support.",

    quoteTitle: "Get a Custom Flight & Travel Quote",
    quoteSubtitle: "Tell us your preferred dates, destinations, and budget — we'll arrange the best flight deals for your journey.",
    whatsappNumber: "+4917972968560",
    contactEmail: "team@amdglobal.org",

    officeAddress: "Charlottenstraße 17, 52070 Aachen, Germany",
    officePhone: "+49 179 72968560",
    officeEmail: "team@amdglobal.org",
    copyrightText: "© 2026 AMD Global Travel. All rights reserved.",
  });

  // Fetch ground truth CMS settings from DB on mount
  useEffect(() => {
    async function loadCmsSettings() {
      try {
        const res = await fetch("/api/admin/cms/settings");
        const json = await res.json();
        if (json?.success && json.settings) {
          setSettings((prev) => ({ ...prev, ...json.settings }));
          if (json.settings.themePrimaryColor) {
            applyThemeColor(json.settings.themePrimaryColor);
          }
        }
      } catch (err) {
        console.error("Failed to load CMS settings from DB:", err);
      }
    }
    loadCmsSettings();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleThemeColorSelect = (colorVal: string) => {
    setSettings((prev) => ({ ...prev, themePrimaryColor: colorVal }));
    applyThemeColor(colorVal);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/cms/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data?.success) {
        setShowSuccess(true);
        // Ensure live theme application
        applyThemeColor(settings.themePrimaryColor);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save CMS settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const activeHex = parseColorToHex(settings.themePrimaryColor);
  const activeHsl = formatColorToHslBare(settings.themePrimaryColor);

  return (
    <form onSubmit={handleSaveSettings} className="space-y-6 pb-24">
      {/* Top Banner Alert on Save Success */}
      {showSuccess && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-700 dark:text-emerald-300 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">
              Website CMS content &amp; theme primary color updated and published live to website!
            </span>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-500/20 px-2.5 py-1 rounded-md">
            LIVE PUBLISHED
          </span>
        </div>
      )}

      {/* Live Preview Header Card */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 text-gray-900 dark:text-white shadow-xl transition-all">
        <div className="flex items-center justify-between border-b border-gray-200/80 dark:border-gray-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h3 className="text-xs sm:text-sm font-bold font-mono tracking-wider uppercase text-gray-800 dark:text-white">
              Website Live Preview Engine
            </h3>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-500/20 text-brand-500 hover:bg-brand-500 hover:text-white text-xs font-bold transition-all shadow-2xs"
          >
            <Eye className="w-4 h-4" />
            View Public Site
          </a>
        </div>

        {/* Live Mini Preview Box */}
        <div className="rounded-2xl bg-gray-50 dark:bg-gray-950/80 p-5 border border-gray-200/80 dark:border-gray-800 text-left space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-brand-500 font-bold uppercase tracking-widest block">
              CURRENT LIVE THEME:
            </span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xs">
              <span
                className="w-3.5 h-3.5 rounded-full inline-block border border-gray-300 dark:border-white/20 shadow-xs"
                style={{ backgroundColor: activeHex }}
              />
              <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200">
                {activeHex} <span className="text-gray-400 font-normal">({activeHsl})</span>
              </span>
            </div>
          </div>
          <h4 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white font-heading">
            {settings.heroTitle} <span className="text-brand-500 font-normal">100s Of Airlines</span>
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            {settings.heroSubtitle}
          </p>
        </div>
      </div>

      {/* CMS Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("theme")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "theme"
              ? "bg-brand-500 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/5"
          }`}
        >
          <Palette className="w-4 h-4" />
          0. Brand Theme &amp; Favicon Color
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "hero"
              ? "bg-brand-500 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          1. Hero &amp; Header
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("popular")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "popular"
              ? "bg-brand-500 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/5"
          }`}
        >
          <Plane className="w-4 h-4" />
          2. Popular Flights
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("why")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "why"
              ? "bg-brand-500 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/5"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          3. Why Choose Us
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "services"
              ? "bg-brand-500 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/5"
          }`}
        >
          <Compass className="w-4 h-4" />
          4. Special Services
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("quote")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "quote"
              ? "bg-brand-500 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/5"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          5. Custom Quote Banner
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("footer")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "footer"
              ? "bg-brand-500 text-white shadow-md"
              : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/5"
          }`}
        >
          <Building2 className="w-4 h-4" />
          6. Footer &amp; Contact Info
        </button>
      </div>

      {/* TAB 0: Dynamic Primary Color & Favicon Management */}
      {activeTab === "theme" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit flex items-center gap-2">
              <Palette className="w-5 h-5 text-brand-500" />
              Dynamic Primary Theme &amp; Favicon Management
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select your preferred primary color preset or pick a custom color. Changing this instantly updates the entire website's primary color scheme and browser tab favicon icon live!
            </p>
          </div>

          {/* Color Presets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLOR_PRESETS.map((preset) => {
              const isSelected =
                activeHsl === formatColorToHslBare(preset.hsl) ||
                activeHex.toLowerCase() === preset.hex.toLowerCase();

              return (
                <div
                  key={preset.id}
                  onClick={() => handleThemeColorSelect(preset.hsl)}
                  className={`relative flex flex-col justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-brand-500 bg-brand-50/30 dark:bg-brand-500/15 shadow-lg ring-2 ring-brand-500/30"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-6 h-6 rounded-full inline-block shadow-md border border-white/20"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
                        {preset.badge}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {preset.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {preset.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px] font-mono text-gray-400 dark:text-gray-500">
                    <span>--primary:</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">{preset.hsl}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Color Picker & HSL Input */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Custom Primary Color Picker
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Color Picker (Hex / Canvas)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={activeHex}
                    onChange={(e) => handleThemeColorSelect(e.target.value)}
                    className="h-10 w-14 rounded-xl border border-gray-300 bg-white p-1 cursor-pointer dark:border-gray-700 dark:bg-gray-800"
                  />
                  <span className="text-xs font-mono font-bold text-gray-800 dark:text-gray-200">
                    {activeHex.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  CSS --primary HSL Value
                </label>
                <input
                  type="text"
                  value={settings.themePrimaryColor}
                  onChange={(e) => handleThemeColorSelect(e.target.value)}
                  placeholder="e.g. 24 100% 62%"
                  className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-xs font-mono text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Quick Reset
                </label>
                <button
                  type="button"
                  onClick={() => handleThemeColorSelect("24 100% 62%")}
                  className="h-10 px-4 w-full rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset to Sunburst Orange
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Live Theme Component Preview */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Interactive Component Live Preview
            </h4>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
              >
                Primary Button
              </button>
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl border border-brand-500 text-brand-500 text-xs font-bold hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
              >
                Outline Button
              </button>
              <span className="px-3 py-1.5 rounded-full bg-brand-500/15 text-brand-500 font-mono text-xs font-bold">
                Badge / Tag
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                <span className="w-3 h-3 rounded-full bg-brand-500 animate-pulse" />
                Live Brand Indicator
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Hero Section Content */}
      {activeTab === "hero" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
              Hero Header Banner Content
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Control the main headline text, typewriter words, and subtitle displayed on the public home page.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Main Hero Headline Title
              </label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) => handleInputChange("heroTitle", e.target.value)}
                placeholder="e.g. Compare Flights From"
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-xs font-medium text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Typewriter Animated Words (Comma Separated)
              </label>
              <input
                type="text"
                value={settings.typewriterWords}
                onChange={(e) => handleInputChange("typewriterWords", e.target.value)}
                placeholder="100s Of Airlines, Best Ticket Deals, Unbeatable Fares"
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-xs font-medium text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Hero Subtitle Description
              </label>
              <textarea
                rows={2}
                value={settings.heroSubtitle}
                onChange={(e) => handleInputChange("heroSubtitle", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs font-medium text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Popular Flights Content */}
      {activeTab === "popular" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
              Popular Flights Section
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Customize headline &amp; route cards title on the public home page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Section Headline Title
              </label>
              <input
                type="text"
                value={settings.popularFlightsTitle}
                onChange={(e) => handleInputChange("popularFlightsTitle", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-xs font-medium text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Section Subtitle
              </label>
              <input
                type="text"
                value={settings.popularFlightsSubtitle}
                onChange={(e) => handleInputChange("popularFlightsSubtitle", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-xs font-medium text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Why Choose Us Content */}
      {activeTab === "why" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
              Why Choose Us (&quot;Travel With Confidence&quot;)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Edit the 4 guarantee cards displayed on the public home page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Section Title
              </label>
              <input
                type="text"
                value={settings.whyChooseUsTitle}
                onChange={(e) => handleInputChange("whyChooseUsTitle", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-xs font-medium text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Section Subtitle
              </label>
              <input
                type="text"
                value={settings.whyChooseUsSubtitle}
                onChange={(e) => handleInputChange("whyChooseUsSubtitle", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-xs font-medium text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* 4 Guarantee Cards Editor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/40 space-y-2">
              <span className="text-[10px] font-bold font-mono text-orange-500 uppercase">CARD 1</span>
              <input
                type="text"
                value={settings.card1Title}
                onChange={(e) => handleInputChange("card1Title", e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs font-bold text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <textarea
                rows={2}
                value={settings.card1Desc}
                onChange={(e) => handleInputChange("card1Desc", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/40 space-y-2">
              <span className="text-[10px] font-bold font-mono text-orange-500 uppercase">CARD 2</span>
              <input
                type="text"
                value={settings.card2Title}
                onChange={(e) => handleInputChange("card2Title", e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs font-bold text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <textarea
                rows={2}
                value={settings.card2Desc}
                onChange={(e) => handleInputChange("card2Desc", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/40 space-y-2">
              <span className="text-[10px] font-bold font-mono text-orange-500 uppercase">CARD 3</span>
              <input
                type="text"
                value={settings.card3Title}
                onChange={(e) => handleInputChange("card3Title", e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs font-bold text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <textarea
                rows={2}
                value={settings.card3Desc}
                onChange={(e) => handleInputChange("card3Desc", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/40 space-y-2">
              <span className="text-[10px] font-bold font-mono text-orange-500 uppercase">CARD 4</span>
              <input
                type="text"
                value={settings.card4Title}
                onChange={(e) => handleInputChange("card4Title", e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs font-bold text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <textarea
                rows={2}
                value={settings.card4Desc}
                onChange={(e) => handleInputChange("card4Desc", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Special Services Content */}
      {activeTab === "services" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
              Special Services (&quot;Tailored Travel Solutions&quot;)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Edit titles and subtitles for Umrah Special &amp; Global Visa Services cards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Section Title
              </label>
              <input
                type="text"
                value={settings.specialServicesTitle}
                onChange={(e) => handleInputChange("specialServicesTitle", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-xs font-medium text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Section Subtitle
              </label>
              <input
                type="text"
                value={settings.specialServicesSubtitle}
                onChange={(e) => handleInputChange("specialServicesSubtitle", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-xs font-medium text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-2">
              <span className="text-[10px] font-bold font-mono text-emerald-700 dark:text-emerald-400 uppercase">
                🕌 UMRAH SPECIAL CARD
              </span>
              <input
                type="text"
                value={settings.umrahCardTitle}
                onChange={(e) => handleInputChange("umrahCardTitle", e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs font-bold text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <textarea
                rows={2}
                value={settings.umrahCardSubtitle}
                onChange={(e) => handleInputChange("umrahCardSubtitle", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 dark:border-blue-900/50 dark:bg-blue-950/20 space-y-2">
              <span className="text-[10px] font-bold font-mono text-blue-700 dark:text-blue-400 uppercase">
                🌐 GLOBAL VISA CARD
              </span>
              <input
                type="text"
                value={settings.visaCardTitle}
                onChange={(e) => handleInputChange("visaCardTitle", e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs font-bold text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <textarea
                rows={2}
                value={settings.visaCardSubtitle}
                onChange={(e) => handleInputChange("visaCardSubtitle", e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Custom Quote Banner */}
      {activeTab === "quote" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
              Custom Quote CTA Banner (&quot;Need a Tailored Plan?&quot;)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Edit the bottom dark CTA banner text and WhatsApp / Contact links.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                CTA Headline Title
              </label>
              <input
                type="text"
                value={settings.quoteTitle}
                onChange={(e) => handleInputChange("quoteTitle", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-xs font-medium text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                WhatsApp Hotline Number
              </label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-xs font-medium text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                CTA Subtitle Description
              </label>
              <textarea
                rows={2}
                value={settings.quoteSubtitle}
                onChange={(e) => handleInputChange("quoteSubtitle", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs font-medium text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Footer & Contact Info */}
      {activeTab === "footer" && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-outfit">
              Footer &amp; Office Contact Info
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Update physical office address, phone numbers, and official copyright line.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Physical Office Address
              </label>
              <input
                type="text"
                value={settings.officeAddress}
                onChange={(e) => handleInputChange("officeAddress", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-xs font-medium text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Official Office Phone
              </label>
              <input
                type="text"
                value={settings.officePhone}
                onChange={(e) => handleInputChange("officePhone", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-xs font-medium text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Official Office Email
              </label>
              <input
                type="email"
                value={settings.officeEmail}
                onChange={(e) => handleInputChange("officeEmail", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-xs font-medium text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Footer Copyright Text
              </label>
              <input
                type="text"
                value={settings.copyrightText}
                onChange={(e) => handleInputChange("copyrightText", e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-xs font-medium text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:left-[290px] border-t border-gray-200 bg-white/90 px-6 py-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90 shadow-2xl">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              CMS Status:
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/20 px-2.5 py-1 rounded-md">
              Synced with Database
            </span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-brand-600 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Publishing Changes..." : "Save & Publish Website Content"}
          </button>
        </div>
      </div>

    </form>
  );
}
