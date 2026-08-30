"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, PhoneCall, ArrowUp, X, Headset } from "lucide-react";

export function FloatingSupport() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const totalScrollable = docHeight - window.innerHeight;

      if (scrollY > 40) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      if (totalScrollable > 0) {
        const progress = (scrollY / totalScrollable) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    document.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
      document.removeEventListener("scroll", updateProgress);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // SVG Circle Geometry (viewBox 0 0 52 52, cx=26, cy=26, r=22)
  const radius = 22;
  const circumference = 2 * Math.PI * radius; // ~138.23
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 md:bottom-6 md:right-6 z-40 flex flex-col items-end gap-2.5 pointer-events-auto">
      
      {/* Expanded Quick Action Popover Menu */}
      {isExpanded && (
        <div className="flex flex-col gap-2 rounded-2xl bg-white/95 p-3 shadow-2xl backdrop-blur-md border border-slate-200/90 dark:bg-slate-900/95 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-200 min-w-[220px] max-w-[90vw]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Headset className="w-4 h-4 text-primary" />
              <span>24/7 Live Support</span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Ask AMD AI Assistant */}
          <button
            type="button"
            onClick={() => {
              setIsExpanded(false);
              window.dispatchEvent(new CustomEvent("open-ask-ai-drawer"));
            }}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 dark:text-slate-200 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 transition-colors w-full text-left cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff8a3d] text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span>Ask AMD AI Assistant</span>
              <span className="text-[10px] text-slate-400 font-normal">Instant Smart Guide</span>
            </div>
          </button>

          {/* WhatsApp Direct Chat */}
          <a
            href="https://wa.me/4917972968560?text=Hello%20AMD%20Global%20Travel!%20I%20need%20assistance%20with%20flight%20booking."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span>WhatsApp Live Chat</span>
              <span className="text-[10px] text-slate-400 font-normal">Instant 24/7 Agent</span>
            </div>
          </a>

          {/* Phone Hotline Direct Call */}
          <a
            href="tel:+4917972968560"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span>Call Direct Hotline</span>
              <span className="text-[10px] text-slate-400 font-normal">+49 179 72968560</span>
            </div>
          </a>
        </div>
      )}

      {/* Main Buttons Bar */}
      <div className="flex items-center gap-3">
        
        {/* Instant Real-Time Progress Back to Top Button */}
        {showBackToTop && (
          <div className="relative flex items-center justify-center w-12 h-12 transition-all duration-300 animate-in fade-in zoom-in-75">
            
            {/* SVG Circular Progress Ring */}
            <svg className="w-12 h-12 -rotate-90 transform pointer-events-none drop-shadow-xs" viewBox="0 0 52 52">
              {/* Background Track Circle */}
              <circle
                cx="26"
                cy="26"
                r={radius}
                className="stroke-slate-300 dark:stroke-slate-800"
                strokeWidth="4"
                fill="none"
              />
              {/* Real-time Progress Circle */}
              <circle
                cx="26"
                cy="26"
                r={radius}
                className="stroke-primary"
                style={{ transition: "none" }}
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Arrow Button */}
            <button
              type="button"
              onClick={scrollToTop}
              title={`Back to top (${Math.round(scrollProgress)}%)`}
              className="absolute inset-[4px] flex items-center justify-center rounded-full bg-white text-slate-800 shadow-lg border border-slate-100 hover:bg-primary hover:text-primary-foreground dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-primary transition-colors duration-200 cursor-pointer group"
            >
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </button>
          </div>
        )}

        {/* Live Support Trigger Button */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="relative flex items-center gap-2 rounded-full border border-primary/30 bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
          </span>
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Need Help?</span>
        </button>

      </div>

    </div>
  );
}
