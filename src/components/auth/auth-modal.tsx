"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Hash, ArrowRight, ShieldCheck, CheckCircle2, Globe, Apple, Sparkles, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "signin" | "signup" | "lookup";
}

export function AuthModal({ open, onOpenChange, defaultTab = "signin" }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup" | "lookup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [pnr, setPnr] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate authentication / lookup delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      onOpenChange(false);
      router.push("/bookings");
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-md w-full p-0 rounded-3xl border border-border shadow-2xl bg-background overflow-hidden">
        
        {/* Top Decorative Header */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/25 text-[11px] font-bold text-primary uppercase tracking-widest mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              AMD Global Portal
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              {tab === "signin" && "Welcome Back"}
              {tab === "signup" && "Create Your Account"}
              {tab === "lookup" && "Guest Booking Lookup"}
            </h2>
            <p className="text-xs text-slate-300">
              {tab === "signin" && "Sign in to view your tickets, flights & visa applications"}
              {tab === "signup" && "Join AMD Global Travel for exclusive flight deals"}
              {tab === "lookup" && "Enter your PNR code & email to view your booking"}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border bg-muted/40 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
              tab === "signin"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
              tab === "signup"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => setTab("lookup")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
              tab === "lookup"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            PNR Lookup
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">

          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-emerald-500/15 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <p className="text-lg font-extrabold text-foreground">
                {tab === "lookup" ? "Booking Found!" : "Authentication Successful!"}
              </p>
              <p className="text-xs text-muted-foreground">Redirecting to your My Bookings dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-4">

              {/* Name field (for signup) */}
              {tab === "signup" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="pl-9 h-11 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {/* PNR field (for lookup) */}
              {tab === "lookup" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">PNR / Booking Reference Code</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      required
                      type="text"
                      value={pnr}
                      onChange={(e) => setPnr(e.target.value)}
                      placeholder="e.g. AMD-94820"
                      className="pl-9 h-11 rounded-xl font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {tab === "lookup" ? "Email Used at Booking" : "Email Address"}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-9 h-11 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Password field (not needed for lookup) */}
              {tab !== "lookup" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Password</Label>
                    {tab === "signin" && (
                      <button type="button" className="text-[11px] text-primary hover:underline font-semibold">
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 pr-10 h-11 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-primary" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white gap-2 text-xs shadow-md shadow-primary/20"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    {tab === "signin" && "Sign In & View Bookings"}
                    {tab === "signup" && "Create Account"}
                    {tab === "lookup" && "Find My Booking"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Social Login Separator (for signin/signup) */}
              {tab !== "lookup" && (
                <>
                  <div className="relative flex items-center justify-center my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <span className="relative bg-background px-3 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Or Continue With
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAuthSubmit({ preventDefault: () => {} } as any)}
                      className="h-10 rounded-xl text-xs font-semibold gap-2 border-border hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Globe className="h-4 w-4 text-primary" />
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAuthSubmit({ preventDefault: () => {} } as any)}
                      className="h-10 rounded-xl text-xs font-semibold gap-2 border-border hover:border-primary/40 hover:bg-primary/5"
                    >
                      <Apple className="h-4 w-4 text-foreground" />
                      Apple
                    </Button>
                  </div>
                </>
              )}

              {/* Notice Footer */}
              <div className="pt-2 text-center border-t border-border mt-4">
                <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  100% Encrypted & Secure Travel Portal
                </p>
              </div>

            </form>
          )}

        </div>

      </DialogContent>
    </Dialog>
  );
}
