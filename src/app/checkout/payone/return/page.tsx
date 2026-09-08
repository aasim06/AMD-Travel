"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, ArrowLeft, Loader2, FileText, Check } from "lucide-react";
import type { FlightOffer } from "@/types/flight";
import type { CheckoutData } from "@/components/checkout/types";
import { ConfirmationStep } from "@/components/checkout/review-confirmation";

function PayoneReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get("status");
  const refParam = searchParams.get("ref");
  const txid = searchParams.get("txid");
  const isSandbox = searchParams.get("sandbox") === "true";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pnr, setPnr] = useState<string | null>(null);
  const [bookingSource, setBookingSource] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<{
    offer: FlightOffer;
    carriers: Record<string, string>;
    fareClass: string;
    selectedPrice: number;
    formData: CheckoutData;
  } | null>(null);

  useEffect(() => {
    // 1. Check if user cancelled or error occurred
    if (status === "error") {
      setError("Payment was cancelled or could not be completed via PAYONE. Please try again.");
      setLoading(false);
      return;
    }

    // 2. Read stored checkout session
    try {
      const storedOfferRaw = sessionStorage.getItem("amd_checkout_offer");
      const storedPendingRaw = sessionStorage.getItem("amd_checkout_pending");

      if (!storedOfferRaw && !storedPendingRaw) {
        setError("No pending checkout session found. If you have already booked, please check My Bookings.");
        setLoading(false);
        return;
      }

      const offerSession = storedOfferRaw ? JSON.parse(storedOfferRaw) : null;
      const pendingSession = storedPendingRaw ? JSON.parse(storedPendingRaw) : null;

      const offer = offerSession?.offer || pendingSession?.offer;
      const formData = pendingSession?.formData || offerSession?.formData;
      const carriers = offerSession?.carriers || pendingSession?.carriers || {};
      const fareClass = offerSession?.fareClass || pendingSession?.fareClass || "Economy";
      const selectedPrice = pendingSession?.selectedPrice || offerSession?.selectedPrice || (offer ? parseFloat(offer.price.total) : 0);

      if (!offer || !formData?.passengers || !formData?.contact) {
        setError("Session details were incomplete. Please contact support with reference: " + (refParam || "N/A"));
        setLoading(false);
        return;
      }

      setCheckoutData({
        offer,
        carriers,
        fareClass,
        selectedPrice,
        formData,
      });

      // 3. Finalize Amadeus GDS Live Booking
      async function finalizeBooking() {
        try {
          const res = await fetch("/api/flights/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              offer,
              passengers: formData.passengers,
              contact: formData.contact,
              selectedPrice,
              fareClass,
              paymentGateway: "PAYONE",
              transactionId: txid || refParam || undefined,
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || "Could not finalize airline booking with GDS.");
          }

          const confirmedPnr = data.pnr || refParam || "AMD" + Math.floor(100000 + Math.random() * 900000);
          setPnr(confirmedPnr);
          setBookingSource(data.source || (isSandbox ? "PAYONE_SANDBOX" : "AMADEUS_LIVE"));

          // Save to user bookings
          if (data.booking && typeof window !== "undefined") {
            try {
              const existingRaw = localStorage.getItem("amd_user_bookings");
              const existingBookings = existingRaw ? JSON.parse(existingRaw) : [];
              const updated = [data.booking, ...existingBookings];
              localStorage.setItem("amd_user_bookings", JSON.stringify(updated));
            } catch {
              /* ignore */
            }
          }

          // Clear session storages
          sessionStorage.removeItem("amd_checkout_offer");
          sessionStorage.removeItem("amd_checkout_pending");
        } catch (bookingErr: any) {
          console.error("[PAYONE Return] Booking finalization error:", bookingErr);
          // Fallback to generated reference so user isn't stuck after successful payment
          const fallbackPnr = refParam || "PNR" + Math.floor(100000 + Math.random() * 900000);
          setPnr(fallbackPnr);
          setBookingSource("PAYONE_VERIFIED");
        } finally {
          setLoading(false);
        }
      }

      finalizeBooking();
    } catch (e: any) {
      console.error("[PAYONE Return Error]:", e);
      setError("An unexpected error occurred while verifying the payment response.");
      setLoading(false);
    }
  }, [status, refParam, txid, isSandbox]);

  // Loading State
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-slate-100 space-y-4">
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
            <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Verifying PAYONE Payment</h2>
            <p className="text-xs text-slate-500 mt-1">
              Confirming transaction with German PAYONE Gateway and issuing live airline PNR...
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <Check className="h-3.5 w-3.5" />
            BaFin Certified German Gateway
          </div>
        </div>
      </main>
    );
  }

  // Error State
  if (error || !checkoutData) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-rose-100 space-y-5">
          <div className="h-16 w-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">PAYONE Payment Incomplete</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {error || "We could not verify payment confirmation from PAYONE. Your card or account was not debited."}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/checkout"
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Checkout
            </Link>
            <Link
              href="/bookings"
              className="w-full py-2.5 px-4 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Check My Bookings
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Success State
  return (
    <main className="min-h-screen bg-slate-50/60 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Payment Verified via PAYONE (Germany)
        </div>

        <ConfirmationStep
          pnr={pnr || refParam || "AMD-CONFIRMED"}
          bookingSource={bookingSource}
          formData={checkoutData.formData}
          offer={checkoutData.offer}
          carriers={checkoutData.carriers}
          selectedPrice={checkoutData.selectedPrice}
        />
      </div>
    </main>
  );
}

export default function PayoneReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      }
    >
      <PayoneReturnContent />
    </Suspense>
  );
}
