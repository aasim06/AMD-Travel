"use client";

import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, HelpCircle, X } from "lucide-react";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid email or password!");
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("admin_session", "true");
        const maxAge = rememberMe ? 604800 * 4 : 86400; // 30 days or 1 day
        document.cookie = `admin_session=true; path=/; max-age=${maxAge}`;
      }

      window.location.href = "/admin";
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto" suppressHydrationWarning>
      {/* ── Super Clean Professional Admin Sign In Card ── */}
      <div
        className="relative rounded-3xl bg-white border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.08),0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden text-slate-900"
        suppressHydrationWarning
      >
        <div className="p-8 sm:p-10 space-y-6" suppressHydrationWarning>
          
          {/* Brand & Security Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#FF8B3D] text-[11px] font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrative Portal</span>
            </div>

            <div className="flex justify-center">
              <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-br from-[#FF8B3D] to-[#FF6B00] text-white shadow-xl shadow-[#FF8B3D]/25 ring-4 ring-orange-50">
                <svg viewBox="0 0 36 36" fill="none" className="h-7 w-7" aria-hidden>
                  <circle cx="18" cy="18" r="10" stroke="white" strokeWidth="1.8" strokeDasharray="4 2.5" opacity="0.5" />
                  <path d="M8 20.5l5-2.5 2.5-6 1.5 5.5 4-1.5-1 4.5 5.5-2-3 4.5-14.5 1 0.5-3.5z" fill="white" opacity="0.95" />
                  <path d="M10 18.5 Q18 10 26 18.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
                </svg>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-black font-outfit tracking-tight text-slate-900">
                AMD <span className="text-[#FF8B3D]">Global</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Enter your administrative credentials to continue
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold text-center animate-in fade-in duration-200">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} action="javascript:void(0);" className="space-y-4" suppressHydrationWarning>
            
            {/* Email Address */}
            <div className="space-y-1.5" suppressHydrationWarning>
              <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Email Address
              </label>
              <div className="relative" suppressHydrationWarning>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="off"
                  suppressHydrationWarning
                  placeholder="admin@amdglobaltravel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF8B3D]/25 focus:border-[#FF8B3D] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5" suppressHydrationWarning>
              <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <div className="relative" suppressHydrationWarning>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  suppressHydrationWarning
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF8B3D]/25 focus:border-[#FF8B3D] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Help Row */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#FF8B3D] focus:ring-[#FF8B3D]/30 accent-[#FF8B3D] cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                  Keep me signed in
                </span>
              </label>

              <button
                type="button"
                onClick={() => setShowHelp(true)}
                className="text-xs font-semibold text-[#FF8B3D] hover:text-[#e0782f] transition-colors"
              >
                Need help?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF8B3D] via-[#FF7A29] to-[#FF6B00] hover:from-[#f77e2d] hover:to-[#f05e00] active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-xl shadow-[#FF8B3D]/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer font-outfit mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Security Footnote */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Encrypted with TLS 1.3 enterprise standards</span>
          </div>

        </div>
      </div>

      {/* ── Help / Recovery Modal ── */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-[#FF8B3D]" />
                <span>Admin Account Assistance</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Administrative credentials are managed under strict security protocols. If you have forgotten your password or lost your portal access, please reach out directly to the Super Admin:
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono select-all">
              support@amdglobaltravel.com
            </div>

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Got it, close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
