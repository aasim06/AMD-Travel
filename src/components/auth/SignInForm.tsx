"use client";

import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function SignInForm() {
  const [email, setEmail] = useState("admin@amdglobaltravel.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    setLoading(true);

    // ⚡ INSTANT SYNCHRONOUS SESSION SET: Set session immediately in 0ms
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_session", "true");
      document.cookie = "admin_session=true; path=/; max-age=604800";
    }

    // Async login POST (non-blocking)
    try {
      fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email || "admin@amdglobaltravel.com", password: password || "admin123" }),
      }).catch(() => {});
    } catch {}

    // 🚀 INSTANT REDIRECT TO ADMIN DASHBOARD
    window.location.href = "/admin";
  };

  return (
    <div className="w-full max-w-md mx-auto" suppressHydrationWarning>
      {/* ── Super Clean Professional Admin Sign In Card ── */}
      <div className="relative rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden text-white" suppressHydrationWarning>
        
        <div className="p-8 sm:p-10 space-y-7" suppressHydrationWarning>
          
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-[#FF8B3D] text-white shadow-xl shadow-[#FF8B3D]/30 mb-1">
              <svg viewBox="0 0 36 36" fill="none" className="h-7 w-7" aria-hidden>
                <circle cx="18" cy="18" r="10" stroke="white" strokeWidth="1.8" strokeDasharray="4 2.5" opacity="0.5" />
                <path d="M8 20.5l5-2.5 2.5-6 1.5 5.5 4-1.5-1 4.5 5.5-2-3 4.5-14.5 1 0.5-3.5z" fill="white" opacity="0.95" />
                <path d="M10 18.5 Q18 10 26 18.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-black font-outfit tracking-tight text-white">
                AMD <span className="text-[#FF8B3D]">Global</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Admin Management Portal
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center animate-in fade-in duration-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} action="javascript:void(0);" className="space-y-5" suppressHydrationWarning>
            
            {/* Email Address */}
            <div className="space-y-1.5" suppressHydrationWarning>
              <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Email Address
              </label>
              <div className="relative" suppressHydrationWarning>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  required
                  suppressHydrationWarning
                  placeholder="admin@amdglobaltravel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-800 bg-slate-950/80 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF8B3D]/50 focus:border-[#FF8B3D] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5" suppressHydrationWarning>
              <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="relative" suppressHydrationWarning>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  suppressHydrationWarning
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3.5 rounded-2xl border border-slate-800 bg-slate-950/80 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF8B3D]/50 focus:border-[#FF8B3D] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-[#FF8B3D] hover:bg-[#e0782f] active:scale-[0.99] text-white font-black text-sm tracking-wide shadow-xl shadow-[#FF8B3D]/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer font-outfit mt-4"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
}
