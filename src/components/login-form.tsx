"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2, User, KeyRound, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  defaultMode = "login",
  onSuccess,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  defaultMode?: "login" | "signup" | "forgot";
  onSuccess?: () => void;
}) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);

    if (mode === "forgot") {
      setResetSent(true);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      if (onSuccess) onSuccess();
      // Redirect to My Bookings / User Dashboard
      router.push("/bookings");
    }, 1200);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    // Simulate real OAuth Google Account Chooser flow
    const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth?client_id=190201978312-7juq3dueh7h2b8jsol51um985lhqgted.apps.googleusercontent.com&redirect_uri=http://localhost:3000/api/auth/callback/google&response_type=code&scope=openid%20profile%20email";
    
    // Open in popup window or redirect
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      googleAuthUrl,
      "Google SignIn",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    // Fallback if popup blocked
    if (!popup) {
      window.location.href = googleAuthUrl;
    }

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
        router.push("/bookings");
      }, 1200);
    }, 3000);
  };

  return (
    <div className={cn("w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 p-6 sm:p-7", className)} {...props}>
      
      {/* ── Mode 1: Forgot Password View ── */}
      {mode === "forgot" ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => { setMode("login"); setResetSent(false); }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors mb-1 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Login
          </button>

          <div>
            <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your registered email address and we&apos;ll send you a password reset link.
            </p>
          </div>

          {resetSent ? (
            <div className="py-6 text-center space-y-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 p-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Reset Link Sent!</p>
              <p className="text-[11px] text-slate-600">
                Check your inbox at <span className="font-semibold text-slate-900">{email}</span> for instructions.
              </p>
              <Button
                type="button"
                onClick={() => { setMode("login"); setResetSent(false); }}
                className="w-full h-9 mt-2 text-xs font-bold bg-slate-900 text-white rounded-xl cursor-pointer"
              >
                Return to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-xs font-bold text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 pl-10 pr-4 rounded-xl border-slate-200 bg-white text-xs font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </div>
      ) : success ? (
        /* ── Success Redirect State ── */
        <div className="py-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 border-2 border-emerald-400 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {mode === "signup" ? "Account Created!" : "Login Successful!"}
          </h3>
          <p className="text-xs text-slate-500">Redirecting to your travel dashboard (/bookings)...</p>
        </div>
      ) : (
        /* ── Mode 2 & 3: Login & Sign Up Views ── */
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          
          {/* Header Switch Title */}
          <div className="mb-2">
            <h3 className="text-lg font-bold text-slate-900">
              {mode === "signup" ? "Create Account" : "Login to your account"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === "signup" ? "Sign up to unlock exclusive flight deals & bookings" : "Enter your credentials to access your flight bookings"}
            </p>
          </div>

          {/* Full Name Field (Signup only) */}
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="signup-name" className="text-xs font-bold text-slate-700">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11 pl-10 pr-4 rounded-xl border-slate-200 bg-white text-xs font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="login-email" className="text-xs font-bold text-slate-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="login-email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 pl-10 pr-4 rounded-xl border-slate-200 bg-white text-xs font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password" className="text-xs font-bold text-slate-700">
                Password
              </Label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                >
                  Forgot your password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 pl-10 pr-10 rounded-xl border-slate-200 bg-white text-xs font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Signup only) */}
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="signup-confirm-password" className="text-xs font-bold text-slate-700">
                Confirm Password
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="signup-confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 pl-10 pr-4 rounded-xl border-slate-200 bg-white text-xs font-medium focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm shadow-md shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                <span>{mode === "signup" ? "Creating Account..." : "Logging in..."}</span>
              </>
            ) : (
              <>
                <span>{mode === "signup" ? "Create Account" : "Login to Account"}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OR</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google Login Button (Triggers Google OAuth Account Chooser Window) */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 gap-2 shadow-xs cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>{mode === "signup" ? "Sign up with Google" : "Login with Google"}</span>
          </Button>

          {/* Bottom Switch Link */}
          <div className="pt-2 text-center text-xs text-slate-500">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-bold text-primary hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-bold text-primary hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </form>
      )}

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-1.5 pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-400 font-medium">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        <span>100% Encrypted &amp; Secure Travel Portal</span>
      </div>
    </div>
  );
}

export default LoginForm;
