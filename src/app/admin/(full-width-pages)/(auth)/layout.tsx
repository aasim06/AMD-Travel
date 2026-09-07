"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import Link from "next/link";
import React, { useEffect } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

function AuthLayoutContent({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    localStorage.setItem("admin_theme", "light");
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#F8FAFC] text-slate-900 flex flex-col justify-between overflow-x-hidden selection:bg-[#FF8B3D]/20 selection:text-[#FF8B3D]">
      {/* ── Subtle Geometric Dot-Grid Architecture (Linear / Stripe style) ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-45 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Soft Warm Ambient Radial Lighting (Light Mode) ── */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-[480px] bg-[radial-gradient(ellipse_75%_50%_at_50%_-10%,rgba(255,139,61,0.12),rgba(248,250,252,0))] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-white via-[#F8FAFC]/80 to-transparent pointer-events-none"
      />

      {/* ── Top Bar Header ── */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-5 sm:pt-7 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all group backdrop-blur-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 group-hover:text-slate-700 transition-transform" />
          <span>Back to AMD Global</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-500">Portal Status:</span>
          <span className="text-emerald-600 font-bold">Secure Online</span>
        </div>
      </header>

      {/* ── Center Content Box ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-lg flex flex-col items-center justify-center">
          {children}
        </div>
      </main>

      {/* ── Bottom Professional Footer ── */}
      <footer className="relative z-20 w-full max-w-6xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Restricted Management Gateway • Authorized Personnel Only</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>&copy; {new Date().getFullYear()} AMD Global Travel</span>
          <span>&bull;</span>
          <a
            href="mailto:support@amdglobaltravel.com"
            className="hover:text-slate-700 transition-colors"
          >
            Technical Support
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </ThemeProvider>
  );
}

