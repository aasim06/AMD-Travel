"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plane, User, Printer, ShieldCheck, CheckCircle2, Globe, Package, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BookingTicketData {
  id: string;
  pnr: string;
  type: "flight" | "visa" | "tour" | "car";
  title: string;
  subtitle: string;
  status: "confirmed" | "processing" | "completed" | "cancelled";
  bookingDate: string;
  travelDate: string;
  passengers: { name: string; type: string; seat?: string; passportNo?: string }[];
  details: {
    airline?: string;
    flightNo?: string;
    departureCity?: string;
    departureAirport?: string;
    departureTime?: string;
    arrivalCity?: string;
    arrivalAirport?: string;
    arrivalTime?: string;
    cabinClass?: string;
    baggage?: string;
    duration?: string;
    country?: string;
    visaType?: string;
    expressOption?: boolean;
    totalAmount: string;
  };
}

interface TicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingTicketData | null;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-500/15 text-emerald-600 border-emerald-200",
  processing: "bg-amber-500/15 text-amber-600 border-amber-200",
  completed: "bg-sky-500/15 text-sky-600 border-sky-200",
  cancelled: "bg-red-500/15 text-red-500 border-red-200",
};

export function TicketModal({ open, onOpenChange, booking }: TicketModalProps) {
  if (!booking) return null;

  const isFlight = booking.type === "flight";
  const isVisa = booking.type === "visa";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="!max-w-2xl w-full max-h-[92vh] overflow-y-auto p-0 rounded-2xl border border-border shadow-2xl bg-background"
      >
        {/* ── Top Header Bar ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Official E-Ticket & Receipt
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            className="gap-1.5 rounded-lg text-xs font-semibold h-8 px-3 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save PDF
          </Button>
        </div>

        <div className="p-5 space-y-4">

          {/* ── Dark Header Banner ── */}
          <div className="rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/15 border border-primary/25 px-2.5 py-1 rounded-full mb-3">
                  AMD Global Travel · {isFlight ? "Boarding Pass" : isVisa ? "Visa Voucher" : "Travel Voucher"}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate">{booking.title}</h2>
                <p className="text-slate-400 text-sm mt-1">{booking.subtitle}</p>
              </div>

              <div className="shrink-0 bg-white/8 border border-white/10 rounded-xl p-3 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">PNR / Ref</p>
                <p className="text-base font-mono font-bold text-primary tracking-widest mt-0.5">{booking.pnr}</p>
                <span className={cn(
                  "inline-block mt-1.5 text-[10px] font-bold capitalize px-2 py-0.5 rounded-full border",
                  STATUS_COLORS[booking.status]
                )}>
                  {booking.status}
                </span>
              </div>
            </div>
          </div>

          {/* ── Flight Route ── */}
          {isFlight && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Route Visual */}
              <div className="flex items-center justify-between p-5 gap-3">
                <div className="text-left">
                  <p className="text-3xl font-black text-foreground leading-none">{booking.details.departureCity}</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[120px] truncate">{booking.details.departureAirport}</p>
                  <p className="text-sm font-bold text-primary mt-1.5">{booking.details.departureTime}</p>
                </div>

                <div className="flex flex-col items-center flex-1 px-2">
                  <span className="text-[11px] font-semibold text-muted-foreground mb-2">{booking.details.duration}</span>
                  <div className="relative w-full flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <div className="flex-1 h-[1.5px] bg-gradient-to-r from-primary via-primary/50 to-primary mx-1 relative">
                      <div className="absolute -top-[9px] left-1/2 -translate-x-1/2 h-5 w-5 bg-primary/10 rounded-full flex items-center justify-center">
                        <Plane className="h-3 w-3 text-primary rotate-90" />
                      </div>
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 mt-2">Direct Flight</span>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-black text-foreground leading-none">{booking.details.arrivalCity}</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[120px] text-right truncate">{booking.details.arrivalAirport}</p>
                  <p className="text-sm font-bold text-primary mt-1.5">{booking.details.arrivalTime}</p>
                </div>
              </div>

              {/* Flight Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-border divide-x divide-border">
                {[
                  { label: "Airline", val: booking.details.airline },
                  { label: "Flight", val: booking.details.flightNo },
                  { label: "Class", val: booking.details.cabinClass },
                  { label: "Baggage", val: booking.details.baggage },
                ].map((item) => (
                  <div key={item.label} className="p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-bold text-foreground mt-0.5">{item.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Visa / Tour Details ── */}
          {!isFlight && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  {isVisa ? <Globe className="h-5 w-5 text-primary" /> : <Package className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{booking.details.visaType ?? booking.subtitle}</p>
                  <p className="text-xs text-muted-foreground">{booking.details.country ?? "Travel Package"}</p>
                </div>
                {booking.details.expressOption && (
                  <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 px-2 py-1 rounded-full">
                    Express
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-muted-foreground font-medium">Category</p>
                  <p className="font-bold text-foreground capitalize mt-0.5">{booking.type}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-muted-foreground font-medium">Travel Date</p>
                  <p className="font-bold text-foreground mt-0.5">{booking.travelDate}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-muted-foreground font-medium">Status</p>
                  <p className={cn("font-bold capitalize mt-0.5", {
                    "text-emerald-600": booking.status === "confirmed" || booking.status === "completed",
                    "text-amber-600": booking.status === "processing",
                    "text-red-500": booking.status === "cancelled",
                  })}>{booking.status}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Passengers ── */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 border-b border-border">
              <User className="h-3.5 w-3.5 text-primary" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Passenger Information
              </p>
            </div>

            {booking.passengers.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-extrabold flex items-center justify-center text-[11px] shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{p.name}</p>
                    <p className="text-[10px] uppercase text-muted-foreground tracking-wide">{p.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-right">
                  {p.seat && (
                    <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                      Seat {p.seat}
                    </span>
                  )}
                  {p.passportNo && (
                    <span className="text-muted-foreground font-mono hidden sm:inline">
                      {p.passportNo}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Footer Barcode ── */}
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Verified & Confirmed Booking</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Total Paid: <span className="font-bold text-foreground">{booking.details.totalAmount}</span>
                  {" · "}Booked {booking.bookingDate}
                </p>
              </div>
            </div>

            {/* Barcode visual */}
            <div className="bg-white border border-border rounded-lg p-2.5 flex items-center gap-3 shadow-sm shrink-0">
              <div className="grid grid-cols-6 gap-[2px] h-10">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-[1px] bg-slate-900"
                    style={{ width: i % 3 === 0 ? 4 : 2, opacity: 0.7 + Math.random() * 0.3 }}
                  />
                ))}
              </div>
              <p className="text-[8px] font-mono font-bold text-slate-500 tracking-widest rotate-90 origin-center">
                {booking.pnr}
              </p>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
