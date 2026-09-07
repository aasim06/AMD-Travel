"use client";

// AMD Global Travel - Modern Non-blocking Cookie Consent Sheet
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
    <>
      {/* Dim backdrop only when detailed settings are open */}
      {showPreferences && (
        <div
          className="fixed inset-0 z-[95] bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setShowPreferences(false)}
          aria-hidden="true"
        />
      )}

      {/* Modern Bottom Docked / Floating Cookie Card */}
      <aside
        role="dialog"
        aria-modal={showPreferences}
        aria-label="Cookie Consent"
        className={`fixed z-[100] transition-all duration-300 ease-out animate-in slide-in-from-bottom-6 ${
          showPreferences
            ? "inset-x-3 bottom-3 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-md"
            : "bottom-0 inset-x-0 sm:bottom-6 sm:right-6 sm:inset-x-auto sm:max-w-md sm:mx-0"
        }`}
      >
        <div className="relative rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-[0_-10px_35px_rgba(0,0,0,0.12)] sm:shadow-[0_16px_45px_rgba(0,0,0,0.18)] p-5 sm:p-5 max-h-[85vh] overflow-y-auto">
          
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
                    Cookie Preferences
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/70 dark:border-emerald-800/60 px-1.5 py-0.5 rounded-full shrink-0">
                    <ShieldCheck className="w-2.5 h-2.5" /> GDPR
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDeclineAll}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Decline & close"
              aria-label="Decline and close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Text */}
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            We use cookies to optimize search speed, remember your currency, and provide personalized travel offers. Learn more in our{" "}
            <Link
              href="/legal/cookies"
              className="text-primary hover:underline font-semibold"
            >
              Cookie Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/legal/privacy"
              className="text-primary hover:underline font-semibold"
            >
              Privacy Policy
            </Link>.
          </p>

          {/* Expandable Preferences Drawer */}
          {showPreferences && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in duration-200">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Select Allowed Cookies
              </p>

              {/* Necessary Cookies (Locked) */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex flex-col pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      Essential Cookies
                    </span>
                    <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      Always On
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Required for site security, navigation & bookings.
                  </span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>

              {/* Analytics Cookies Toggle */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100/70 transition-colors text-xs">
                <div className="flex flex-col pr-2">
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    Analytics & Performance
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Helps us analyze traffic to improve flight search speeds.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
                />
              </label>

              {/* Marketing Cookies Toggle */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100/70 transition-colors text-xs">
                <div className="flex flex-col pr-2">
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    Marketing & Discounts
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Used to show relevant travel deals and flight offers.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, marketing: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
                />
              </label>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="mt-4 pt-1 flex flex-col gap-2.5">
            {showPreferences ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreferences(false)}
                  className="flex-1 text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="flex-1 text-xs font-bold py-2.5 px-4 rounded-xl bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/25 transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Choices
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDeclineAll}
                    className="flex-1 text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-center whitespace-nowrap"
                  >
                    Essential Only
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="flex-1 text-xs font-bold py-2.5 px-4 rounded-xl bg-primary text-white hover:opacity-95 shadow-md shadow-primary/25 transition-all cursor-pointer text-center whitespace-nowrap active:scale-98"
                  >
                    Accept All
                  </button>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowPreferences(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer py-0.5"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Customize preferences</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </aside>
    </>
  );
}
