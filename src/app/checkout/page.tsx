"use client";

export const dynamic = "force-dynamic";

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
  const [fareClass,   setFareClass]   = useState<string>(() => sessionData?.fareClass ?? "Economy");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(() => sessionData?.selectedPrice ?? null);
  const [passengers]  = useState<number>(() => sessionData?.passengers ?? 1);
  const [step,      setStep]      = useState<CheckoutStep>("passengers");
  const [formData,  setFormData]  = useState<Partial<CheckoutData>>({});
  const [pnr,           setPnr]           = useState<string | null>(null);
  const [bookingSource, setBookingSource] = useState<string | null>(null);
  const [isBooking,     setIsBooking]     = useState(false);
  const [bookingError,  setBookingError]  = useState<string | null>(null);

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

  function handleUpgrade(newFareClass: string, newPrice: number) {
    setFareClass(newFareClass);
    setSelectedPrice(newPrice);
  }

  function handleReviewConfirm() {
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handlePaymentSuccess() {
    setIsBooking(true);
    setBookingError(null);

    try {
      const response = await fetch("/api/flights/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offer,
          passengers: formData.passengers,
          contact: formData.contact,
          selectedPrice: selectedPrice ?? (offer ? parseFloat(offer.price.total) : 0),
          fareClass,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate Amadeus booking");
      }

      const generatedPnr = data.pnr;
      setPnr(generatedPnr);
      setBookingSource(data.source || null);

      // Save to localStorage for My Bookings tab persistence
      if (data.booking && typeof window !== "undefined") {
        try {
          const existingRaw = localStorage.getItem("amd_user_bookings");
          const existingBookings = existingRaw ? JSON.parse(existingRaw) : [];
          const updatedBookings = [data.booking, ...existingBookings];
          localStorage.setItem("amd_user_bookings", JSON.stringify(updatedBookings));
        } catch {
          /* ignore */
        }
      }

      setStep("confirmation");
      window.scrollTo({ top: 0, behavior: "smooth" });
      sessionStorage.removeItem("amd_checkout_offer");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error processing booking";
      console.error("[Checkout] Booking failed:", msg);
      setBookingError(msg);
    } finally {
      setIsBooking(false);
    }
  }

  const stepLabel = step === "confirmation" ? "confirm" : step;

  return (
    <main className="min-h-screen bg-slate-50/60 relative">
      {/* ── Booking Processing Modal Overlay ── */}
      {isBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4">
          <div className="bg-white text-slate-900 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-4 border border-slate-100">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Creating Amadeus Booking</h3>
              <p className="text-xs text-slate-500 mt-1">Connecting to GDS to issue live PNR reference & e-ticket...</p>
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 py-1.5 px-3 rounded-full inline-block">
              Amadeus Live API
            </div>
          </div>
        </div>
      )}

      <div className="container py-8">

        {/* Page title */}
        {step !== "confirmation" && (
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900">Complete your booking</h1>
          </div>
        )}

        {/* Booking error alert */}
        {bookingError && (
          <div className="mb-6 p-5 rounded-2xl bg-rose-50/90 border-2 border-rose-300 text-rose-800 text-sm shadow-md flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              ✕
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-rose-900">Amadeus Live Booking Failed</h4>
              <p className="text-xs text-rose-700 mt-1 font-mono break-all">{bookingError}</p>
            </div>
            <button
              type="button"
              onClick={() => setBookingError(null)}
              className="text-xs font-bold text-rose-800 hover:text-rose-950 bg-rose-200/60 hover:bg-rose-200 px-3 py-1.5 rounded-xl transition-colors shrink-0 ml-2"
            >
              Dismiss
            </button>
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
                bookingSource={bookingSource}
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
                onUpgrade={step === "passengers" ? handleUpgrade : undefined}
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
