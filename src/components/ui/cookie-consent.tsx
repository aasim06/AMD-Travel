"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, SlidersHorizontal, Check, X, ChevronDown, ChevronUp, Lock } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = "amd_cookie_consent_v1";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    // Check if user already gave consent
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Delay entrance slightly for polished user experience
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }

    // Allow re-opening via global event (e.g. from footer link)
    const handleOpen = () => {
      try {
        const current = localStorage.getItem(STORAGE_KEY);
        if (current) {
          const parsed = JSON.parse(current);
          if (parsed.preferences) {
            setPreferences(parsed.preferences);
          }
        }
      } catch (e) {
        // ignore JSON parse error
      }
      setShowPreferences(true);
      setIsVisible(true);
    };

    window.addEventListener("open-cookie-preferences", handleOpen);
    return () => window.removeEventListener("open-cookie-preferences", handleOpen);
  }, []);

  // Prevent background scroll when modal is active
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVisible]);

  const saveConsent = (status: "accepted" | "declined" | "customized", customPrefs?: CookiePreferences) => {
    const finalPrefs: CookiePreferences = customPrefs || {
      necessary: true,
      analytics: status === "accepted",
      marketing: status === "accepted",
    };

    const consentData = {
      status,
      preferences: finalPrefs,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(consentData));

    // Dispatch event so any tracking/analytics listeners can adjust
    window.dispatchEvent(
      new CustomEvent("amd-cookie-consent-updated", {
        detail: consentData,
      })
    );

    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    saveConsent("accepted", {
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleDeclineAll = () => {
    saveConsent("declined", {
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const handleSavePreferences = () => {
    saveConsent("customized", preferences);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cookie Preferences and Consent"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Background Dim & Blur Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        aria-hidden="true"
      />

      {/* Centered Modal Card */}
      <div className="relative w-full max-w-lg sm:max-w-xl rounded-3xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0f172a] shadow-[0_25px_80px_rgba(0,0,0,0.45)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.85)] p-6 sm:p-7 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300 transition-all">
        
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 relative">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-xs">
              <Cookie className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  We value your privacy
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-700/60 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> GDPR Safe
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                AMD Global Travel Cookie & Privacy Consent
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDeclineAll}
            className="text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Decline non-essential & close"
            aria-label="Decline and close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description Text */}
        <p className="mt-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
          We use cookies to improve your flight search, remember your preferences (such as currency), and personalize travel offers. Read our{" "}
          <Link
            href="/legal/cookies"
            className="text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 font-semibold underline underline-offset-2 transition-colors"
          >
            Cookie Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/legal/privacy"
            className="text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80 font-semibold underline underline-offset-2 transition-colors"
          >
            Privacy Policy
          </Link>{" "}
          for more details.
        </p>

        {/* Expandable Preferences Drawer */}
        {showPreferences && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2.5 animate-in fade-in duration-200">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Customize Cookie Settings
            </p>

            {/* Necessary Cookies (Locked) */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                    Essential / Necessary
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                    Always On
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-1">
                  Required for site security, navigation & currency memory.
                </span>
              </div>
              <div className="flex items-center text-slate-400 shrink-0">
                <Lock className="w-4 h-4 mr-1 text-slate-400" />
              </div>
            </div>

            {/* Analytics Cookies Toggle */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors">
              <div className="flex flex-col pr-2">
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                  Analytics & Performance
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-1">
                  Helps us measure site traffic and improve booking speeds.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                }
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </label>

            {/* Marketing Cookies Toggle */}
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors">
              <div className="flex flex-col pr-2">
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                  Marketing & Deals
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-1">
                  Used to deliver personalized discounts and relevant flights.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, marketing: e.target.checked }))
                }
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowPreferences((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full sm:w-auto justify-center"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showPreferences ? "Hide Settings" : "Preferences"}</span>
            {showPreferences ? (
              <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {showPreferences ? (
              <button
                type="button"
                onClick={handleSavePreferences}
                className="w-full sm:w-auto text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-95 active:scale-95 shadow-lg shadow-primary/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleDeclineAll}
                  className="flex-1 sm:flex-none text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-center"
                >
                  Decline Non-Essential
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-none text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-95 active:scale-95 shadow-lg shadow-primary/25 transition-all cursor-pointer text-center"
                >
                  Accept All
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
