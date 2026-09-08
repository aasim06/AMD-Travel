"use client";

import { useState } from "react";
import { ShieldCheck, Building2, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import type { CheckoutData } from "./types";
import type { FlightOffer } from "@/types/flight";

interface PaymentStepProps {
  formData: CheckoutData;
  totalPrice: number;
  currency: string;
  offer?: FlightOffer | null;
  carriers?: Record<string, string>;
  fareClass?: string;
  onPay: () => void;
  onBack: () => void;
}

export function PaymentStep({
  formData,
  totalPrice,
  currency,
  offer,
  carriers,
  fareClass,
  onBack,
}: PaymentStepProps) {
  const [payoneMethod, setPayoneMethod] = useState<"sofort" | "giropay" | "sepa" | "card">("sofort");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = [
    {
      id: "sofort" as const,
      name: "Sofort / Klarna Pay Now",
      sub: "Instant direct bank transfer via German online banking PIN/TAN",
      badge: "Fast & Popular in Germany",
      type: "sb" as const,
      onlineType: "PNT" as const,
    },
    {
      id: "giropay" as const,
      name: "Giropay",
      sub: "Direct debit from German Sparkasse, Postbank & Bank accounts",
      badge: "German Bank Account",
      type: "sb" as const,
      onlineType: "GPY" as const,
    },
    {
      id: "sepa" as const,
      name: "SEPA Lastschrift",
      sub: "Direct debit authorization across European Union checking accounts",
      badge: "EU Standard",
      type: "elv" as const,
      onlineType: undefined,
    },
    {
      id: "card" as const,
      name: "Credit Card (PAYONE)",
      sub: "Visa, Mastercard with German 3D-Secure 2.0 authorization",
      badge: "Zero Surcharge",
      type: "cc" as const,
      onlineType: undefined,
    },
  ];

  async function handlePayoneCheckout() {
    setLoading(true);
    setError(null);

    const activeMethod = methods.find((m) => m.id === payoneMethod) || methods[0];

    try {
      // 1. Save checkout state to pending storage so return handler can finalize
      if (typeof window !== "undefined") {
        const pendingData = {
          offer,
          carriers,
          fareClass,
          selectedPrice: totalPrice,
          formData,
          selectedGateway: "PAYONE",
          payoneMethod,
          timestamp: Date.now(),
        };
        sessionStorage.setItem("amd_checkout_pending", JSON.stringify(pendingData));
      }

      // 2. Call backend PAYONE API
      const primaryPassenger = formData.passengers[0];
      const res = await fetch("/api/payment/payone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          currency: currency || "EUR",
          firstName: primaryPassenger.firstName,
          lastName: primaryPassenger.lastName,
          email: formData.contact.email,
          paymentType: activeMethod.type,
          onlineBankTransferType: activeMethod.onlineType,
          bookingType: "flight",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not initiate payment session with PAYONE");
      }

      if (data.redirectUrl) {
        // Redirect to PAYONE hosted checkout / test simulator
        window.location.href = data.redirectUrl;
      } else {
        throw new Error("No redirect URL received from PAYONE gateway");
      }
    } catch (err: any) {
      console.error("[PAYONE Checkout Error]:", err);
      setError(err?.message || "Failed to connect to PAYONE gateway. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* German Gateway Trust Banner */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 tracking-tight">PAYONE</span>
              <span className="text-[10px] text-blue-700 font-semibold bg-blue-100/80 px-1.5 py-0.5 rounded">
                Official Gateway
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              BS PAYONE GmbH (Frankfurt am Main) · BaFin Regulated · PCI-DSS Level 1
            </p>
          </div>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
          Germany 🇩🇪
        </span>
      </div>

      {/* Payment methods list */}
      <div
        className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3"
        style={{ boxShadow: "rgba(0,0,0,0.04) 0px 2px 16px" }}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Choose Payment Method:
        </p>

        <div className="space-y-2.5">
          {methods.map((method) => {
            const isSelected = payoneMethod === method.id;
            return (
              <label
                key={method.id}
                onClick={() => setPayoneMethod(method.id)}
                className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/[0.03] shadow-sm ring-1 ring-primary/30"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/40"
                }`}
              >
                <div className="mt-0.5">
                  <input
                    type="radio"
                    name="payone_method"
                    value={method.id}
                    checked={isSelected}
                    onChange={() => setPayoneMethod(method.id)}
                    className="h-4 w-4 text-primary border-slate-300 focus:ring-primary"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-800">{method.name}</span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                      {method.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{method.sub}</p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Security Info */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Instant booking confirmation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Official Amadeus e-ticket</span>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <p className="text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Payone Submit Button */}
      <button
        type="button"
        onClick={handlePayoneCheckout}
        disabled={loading}
        className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/15 active:scale-[0.98] disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-4 w-4 text-white" />
            Connecting to PAYONE Gateway…
          </>
        ) : (
          <>
            <Building2 className="h-4 w-4 text-amber-400" />
            <span>
              Pay {currency} {totalPrice.toLocaleString()} via PAYONE
            </span>
            <ArrowRight className="h-4 w-4 opacity-70 ml-1" />
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-1"
      >
        ← Back to Review
      </button>
    </div>
  );
}
