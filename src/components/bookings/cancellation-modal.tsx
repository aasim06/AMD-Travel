"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle, X, RefreshCw, Info } from "lucide-react";

interface CancellationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pnr?: string;
  title?: string;
  totalAmount?: string;
}

const CANCEL_REASONS = [
  "Change of travel plans",
  "Medical emergency",
  "Visa application rejected",
  "Flight schedule changed",
  "Family emergency",
  "Work-related conflict",
  "Other reason",
];

export function CancellationModal({ open, onOpenChange, pnr, title, totalAmount }: CancellationModalProps) {
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const refundAmount = totalAmount
    ? `€${(parseFloat(totalAmount.replace(/[^0-9.]/g, "")) * 0.8).toFixed(2)}`
    : "€0.00";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  const handleClose = () => {
    setReason("");
    setSubmitted(false);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-3xl border-destructive/20 p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/20 p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">Cancel Booking</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">PNR: <span className="font-mono font-bold text-foreground">{pnr}</span></p>
            </div>
          </div>
        </div>

        {submitted ? (
          /* ── Success State ── */
          <div className="p-8 flex flex-col items-center gap-5 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-100 dark:border-emerald-800 flex items-center justify-center">
              <RefreshCw className="h-7 w-7 text-emerald-500" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">Cancellation Request Submitted</p>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Your cancellation request for <span className="font-semibold">{title}</span> has been received.
                Our team will process it within <span className="font-semibold">24–48 hours</span>.
              </p>
            </div>
            <div className="w-full p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-sm">
              <p className="text-muted-foreground">Estimated Refund Amount</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{refundAmount}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Subject to airline/provider cancellation fees</p>
            </div>
            <Button onClick={handleClose} className="w-full rounded-xl font-bold">
              Done
            </Button>
          </div>
        ) : (
          /* ── Cancellation Form ── */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Booking Summary */}
            <div className="p-4 rounded-2xl bg-muted/40 text-sm border border-border">
              <p className="text-muted-foreground">Booking</p>
              <p className="font-semibold text-foreground mt-0.5 truncate">{title}</p>
              <div className="flex justify-between mt-3 pt-3 border-t border-border text-xs">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-foreground">{totalAmount}</span>
              </div>
              <div className="flex justify-between mt-1.5 text-xs">
                <span className="text-muted-foreground">Estimated Refund (80%)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{refundAmount}</span>
              </div>
            </div>

            {/* Notice */}
            <div className="flex gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 text-xs">
              <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                Cancellation fees apply based on fare rules. Refunds are processed within 5–10 business days to your original payment method.
              </p>
            </div>

            {/* Reason Select */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Reason for Cancellation <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-1 gap-2">
                {CANCEL_REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-sm ${
                      reason === r
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="accent-primary h-4 w-4 shrink-0"
                    />
                    {r}
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 rounded-xl font-semibold"
              >
                Keep Booking
              </Button>
              <Button
                type="submit"
                disabled={!reason || loading}
                className="flex-1 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white border-0"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Request Cancellation"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
