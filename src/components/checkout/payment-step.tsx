"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Lock } from "lucide-react";
import type { CheckoutData } from "./types";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ─── Inner form (must be inside <Elements>) ───────────────────────────────────

function StripeForm({
  totalPrice,
  currency,
  onPay,
  onBack,
}: {
  totalPrice: number;
  currency: string;
  onPay: () => void;
  onBack: () => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + "/checkout" },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onPay();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Secure header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl">
        <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        <span className="text-[11px] font-semibold text-emerald-700">
          Secured by Stripe · 256-bit SSL · PCI DSS Compliant
        </span>
      </div>

      {/* Stripe Payment Element */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5" style={{ boxShadow: "rgba(0,0,0,0.04) 0px 2px 16px" }}>
        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card", "paypal"],
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* Pay button */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-70"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Processing payment…
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Pay {currency} {totalPrice.toLocaleString()} securely
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
    </form>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

interface PaymentStepProps {
  formData:   CheckoutData;
  totalPrice: number;
  currency:   string;
  onPay:      () => void;
  onBack:     () => void;
}

export function PaymentStep({ formData, totalPrice, currency, onPay, onBack }: PaymentStepProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [fetchError,   setFetchError]   = useState<string | null>(null);

  const email       = formData.contact.email;
  const passengerName = `${formData.passengers[0].firstName} ${formData.passengers[0].lastName}`;

  useEffect(() => {
    fetch("/api/payment", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: totalPrice, currency, email, passengerName }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) setFetchError(data.error);
        else setClientSecret(data.clientSecret);
      })
      .catch(() => setFetchError("Could not initialize payment. Please try again."));
  }, [totalPrice, currency, email, passengerName]);

  if (fetchError) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
          {fetchError}
        </p>
        <button type="button" onClick={onBack} className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-1">
          ← Back to Review
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary:       "hsl(207, 90%, 54%)",
            borderRadius:       "12px",
            fontFamily:         "inherit",
            colorText:          "#1e293b",
            colorTextSecondary: "#64748b",
          },
        },
      }}
    >
      <StripeForm
        totalPrice={totalPrice}
        currency={currency}
        onPay={onPay}
        onBack={onBack}
      />
    </Elements>
  );
}
