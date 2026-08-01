"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { FlightOffer } from "@/types/flight";
import type { CheckoutData, CheckoutStep } from "@/components/checkout/types";
import { StepIndicator, PassengerForm } from "@/components/checkout/passenger-form";
import { BookingSummary } from "@/components/checkout/booking-summary";
import { ReviewStep, ConfirmationStep } from "@/components/checkout/review-confirmation";
import { PaymentStep } from "@/components/checkout/payment-step";

// ─── PNR generator ────────────────────────────────────────────────────────────

function generatePNR(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  // Read sessionStorage synchronously during first render to avoid a
  // "loading spinner" flash caused by deferring the read to useEffect.
  function readCheckoutSession() {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("amd_checkout_offer");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  const [sessionData] = useState(() => readCheckoutSession());
  const [offer]       = useState<FlightOffer | null>(() => sessionData?.offer ?? null);
  const [carriers]    = useState<Record<string, string>>(() => sessionData?.carriers ?? {});
  const [fareClass]   = useState<string>(() => sessionData?.fareClass ?? "Economy");
  const [selectedPrice] = useState<number | null>(() => sessionData?.selectedPrice ?? null);
  const [passengers]  = useState<number>(() => sessionData?.passengers ?? 1);
  const [step,      setStep]      = useState<CheckoutStep>("passengers");
  const [formData,  setFormData]  = useState<Partial<CheckoutData>>({});
  const [pnr,       setPnr]       = useState<string | null>(null);

  useEffect(() => {
    if (!offer) {
      router.replace("/search");
    }
  }, [offer, router]);

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  function handlePassengersSubmit(data: CheckoutData) {
    setFormData(data);
    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReviewConfirm() {
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePaymentSuccess() {
    const newPnr = generatePNR();
    setPnr(newPnr);
    setStep("confirmation");
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Clear session
    sessionStorage.removeItem("amd_checkout_offer");
  }

  const stepLabel = step === "confirmation" ? "confirm" : step;

  return (
    <main className="min-h-screen bg-slate-50/60">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Page title */}
        {step !== "confirmation" && (
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900">Complete your booking</h1>
          </div>
        )}

        {/* Step indicator */}
        {step !== "confirmation" && <StepIndicator current={stepLabel} />}

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left: Active step ── */}
          <div className="flex-1 w-full min-w-0">

            {step === "passengers" && (
              <PassengerForm
                passengerCount={passengers}
                defaultValues={formData}
                onSubmit={handlePassengersSubmit}
              />
            )}

            {step === "review" && formData.passengers && formData.contact && (
              <ReviewStep
                formData={formData as CheckoutData}
                offer={offer}
                carriers={carriers}
                fareClass={fareClass}
                selectedPrice={selectedPrice ?? parseFloat(offer.price.total)}
                onConfirm={handleReviewConfirm}
                onBack={() => setStep("passengers")}
              />
            )}

            {step === "payment" && formData.passengers && formData.contact && (
              <PaymentStep
                formData={formData as CheckoutData}
                totalPrice={selectedPrice ?? parseFloat(offer.price.total)}
                currency={offer.price.currency}
                onPay={handlePaymentSuccess}
                onBack={() => setStep("review")}
              />
            )}

            {step === "confirmation" && pnr && formData.passengers && formData.contact && (
              <ConfirmationStep
                pnr={pnr}
                formData={formData as CheckoutData}
                offer={offer}
                carriers={carriers}
                selectedPrice={selectedPrice ?? parseFloat(offer.price.total)}
              />
            )}
          </div>

          {/* ── Right: Booking summary ── */}
          {step !== "confirmation" && (
            <aside className="w-full lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-24">
              <BookingSummary
                offer={offer}
                carriers={carriers}
                fareClass={fareClass}
                passengers={passengers}
                selectedPrice={selectedPrice}
              />
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
