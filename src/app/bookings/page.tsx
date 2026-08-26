"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search, Plane, Package, Car, CheckCircle2, XCircle,
  AlertCircle, Printer, Share2, X, Mail, Hash,
  Calendar, User, Luggage, ShieldCheck, Bookmark, Globe, Phone, Filter,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketModal, BookingTicketData } from "@/components/bookings/ticket-modal";
import { CancellationModal } from "@/components/bookings/cancellation-modal";
import { cn } from "@/lib/utils";
import { PublicLayout } from "@/components/layout/public-layout";


// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = "confirmed" | "processing" | "completed" | "cancelled";
type BookingType = "flight" | "visa" | "tour" | "car";

interface Booking extends BookingTicketData {
  travelDateRaw: Date;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "b1",
    pnr: "AMD-94820",
    type: "flight",
    status: "confirmed",
    title: "Karachi → Dubai",
    subtitle: "Turkish Airlines · Economy Class",
    bookingDate: "28 Jul 2026",
    travelDate: "15 Aug 2026",
    travelDateRaw: new Date("2026-08-15"),
    passengers: [
      { name: "John Doe", type: "Adult", seat: "14B", passportNo: "AK1934872" },
      { name: "Sara Ahmed", type: "Adult", seat: "14C", passportNo: "AK1934873" },
    ],
    details: {
      airline: "Turkish Airlines",
      flightNo: "TK 709",
      departureCity: "KHI",
      departureAirport: "Jinnah Intl. Airport",
      departureTime: "03:30 AM",
      arrivalCity: "DXB",
      arrivalAirport: "Dubai Intl. Airport",
      arrivalTime: "05:45 AM",
      cabinClass: "Economy",
      baggage: "23kg + 7kg Hand",
      duration: "2h 15m",
      totalAmount: "€348",
    },
  },
  {
    id: "b2",
    pnr: "AMD-67451",
    type: "visa",
    status: "processing",
    title: "UAE Tourist Visa",
    subtitle: "Single Entry · 30 Days",
    bookingDate: "01 Aug 2026",
    travelDate: "10 Aug 2026",
    travelDateRaw: new Date("2026-08-10"),
    passengers: [
      { name: "John Doe", type: "Applicant", passportNo: "AK1934872" },
    ],
    details: {
      country: "United Arab Emirates",
      visaType: "Tourist Visa – Single Entry",
      expressOption: true,
      totalAmount: "€89",
    },
  },
  {
    id: "b3",
    pnr: "AMD-31902",
    type: "tour",
    status: "confirmed",
    title: "Umrah Package – Silver",
    subtitle: "Makkah & Madinah · 14 Nights",
    bookingDate: "10 Jul 2026",
    travelDate: "20 Aug 2026",
    travelDateRaw: new Date("2026-08-20"),
    passengers: [
      { name: "John Doe", type: "Adult" },
      { name: "Sara Ahmed", type: "Adult" },
      { name: "Amina Khan", type: "Child" },
    ],
    details: {
      totalAmount: "€2,490",
    },
  },
  {
    id: "b4",
    pnr: "AMD-55320",
    type: "flight",
    status: "completed",
    title: "Frankfurt → Istanbul",
    subtitle: "Lufthansa · Business Class",
    bookingDate: "01 Jun 2026",
    travelDate: "15 Jun 2026",
    travelDateRaw: new Date("2026-06-15"),
    passengers: [
      { name: "John Doe", type: "Adult", seat: "3A", passportNo: "AK1934872" },
    ],
    details: {
      airline: "Lufthansa",
      flightNo: "LH 1306",
      departureCity: "FRA",
      departureAirport: "Frankfurt Airport",
      departureTime: "10:15 AM",
      arrivalCity: "IST",
      arrivalAirport: "Istanbul Airport",
      arrivalTime: "02:35 PM",
      cabinClass: "Business",
      baggage: "32kg + 12kg Hand",
      duration: "3h 20m",
      totalAmount: "€1,120",
    },
  },
  {
    id: "b5",
    pnr: "AMD-29831",
    type: "visa",
    status: "cancelled",
    title: "Schengen Visa – Germany",
    subtitle: "Multiple Entry · 90 Days",
    bookingDate: "12 Jun 2026",
    travelDate: "25 Jun 2026",
    travelDateRaw: new Date("2026-06-25"),
    passengers: [
      { name: "John Doe", type: "Applicant", passportNo: "AK1934872" },
    ],
    details: {
      country: "Germany",
      visaType: "Schengen – Multiple Entry",
      expressOption: false,
      totalAmount: "€110",
    },
  },
];

// ─── Status Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BookingStatus, { label: string; icon: React.ReactNode; classes: string }> = {
  confirmed: {
    label: "Confirmed",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
  processing: {
    label: "Processing",
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    classes: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400 border-sky-200 dark:border-sky-800",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="h-3.5 w-3.5" />,
    classes: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800",
  },
};

const TYPE_ICON: Record<BookingType, React.ReactNode> = {
  flight: <Plane className="h-5 w-5" />,
  visa: <Globe className="h-5 w-5" />,
  tour: <Package className="h-5 w-5" />,
  car: <Car className="h-5 w-5" />,
};

// ─── Visa Progress Steps ───────────────────────────────────────────────────────

const VISA_STEPS = ["Application Submitted", "Documents Verified", "Embassy Review", "Decision Issued"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyBookingsPage() {
  const [pnrInput, setPnrInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [searched, setSearched] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | BookingType>("all");
  const [activeStatus, setActiveStatus] = useState<"all" | BookingStatus>("all");
  const [ticketBooking, setTicketBooking] = useState<BookingTicketData | null>(null);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedRaw = localStorage.getItem("amd_user_bookings");
        if (storedRaw) {
          const parsed = JSON.parse(storedRaw);
          setUserBookings(parsed);
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  const allBookings = useMemo(() => {
    return [...userBookings, ...MOCK_BOOKINGS];
  }, [userBookings]);

  // Filter bookings
  const filtered = useMemo(() => {
    let result = allBookings;
    if (pnrInput.trim()) {
      result = result.filter((b) =>
        b.pnr.toLowerCase().includes(pnrInput.trim().toLowerCase())
      );
    }
    if (activeCategory !== "all") result = result.filter((b) => b.type === activeCategory);
    if (activeStatus !== "all") result = result.filter((b) => b.status === activeStatus);
    return result;
  }, [allBookings, pnrInput, activeCategory, activeStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const stats = {
    total: allBookings.length,
    confirmed: allBookings.filter((b) => b.status === "confirmed").length,
    processing: allBookings.filter((b) => b.status === "processing").length,
    completed: allBookings.filter((b) => b.status === "completed").length,
  };

  return (
    <main className="min-h-screen bg-background">



      {/* ── Hero / Header ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16 pb-24 sm:pt-20 sm:pb-32 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative container z-10">
          {/* Eye-brow */}
          <div className="flex items-center gap-2 mb-5">
            <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
              <Bookmark className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-white/50">Booking Portal</span>
          </div>

          <h1 className="font-heading font-extrabold text-white text-3xl sm:text-4xl lg:text-5xl leading-tight mb-2">
            My Bookings
          </h1>
          <p className="text-white/55 text-sm sm:text-base max-w-xl leading-relaxed mb-10">
            Track, download tickets, and manage all your flights, visas, tours & Umrah packages in one place.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-4 mb-10">
            {[
              { label: "Total Bookings", value: stats.total, color: "text-white" },
              { label: "Confirmed", value: stats.confirmed, color: "text-emerald-400" },
              { label: "Processing", value: stats.processing, color: "text-amber-400" },
              { label: "Completed", value: stats.completed, color: "text-sky-400" },
            ].map((s) => (
              <div key={s.label} className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-3 text-center">
                <p className={cn("text-2xl font-extrabold", s.color)}>{s.value}</p>
                <p className="text-[11px] text-white/50 font-medium mt-0.5 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Lookup Form Card */}
          <form
            onSubmit={handleSearch}
            className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4">Search Your Booking</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                <input
                  type="text"
                  value={pnrInput}
                  onChange={(e) => setPnrInput(e.target.value)}
                  placeholder="Booking Ref / PNR (e.g. AMD-94820)"
                  className="w-full h-12 bg-white/10 text-white placeholder:text-white/30 border border-white/15 rounded-2xl pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex-1 relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Email used at booking"
                  className="w-full h-12 bg-white/10 text-white placeholder:text-white/30 border border-white/15 rounded-2xl pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <Button
                type="submit"
                className="h-12 rounded-2xl px-6 bg-primary hover:bg-primary/90 text-white font-bold gap-2 shrink-0"
              >
                <Search className="h-4 w-4" />
                Find Booking
              </Button>
            </div>
            {searched && filtered.length === 0 && (
              <p className="text-xs text-red-300 flex items-center gap-1.5 mt-3">
                <AlertCircle className="h-3.5 w-3.5" />
                No booking found for those details. Please check and try again.
              </p>
            )}
          </form>
        </div>
      </section>

      {/* ── Filters & Booking List ── */}
      <section className="container -mt-8 pb-24 space-y-6">

        {/* Filter Bar */}
        <div className="bg-background/90 backdrop-blur-xl border border-border rounded-2xl px-4 py-3 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["all", "flight", "visa", "tour", "car"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all",
                  activeCategory === cat
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {cat === "all" ? "All Bookings" : cat.charAt(0).toUpperCase() + cat.slice(1) + "s"}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {(["all", "confirmed", "processing", "completed", "cancelled"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setActiveStatus(st)}
                className={cn(
                  "px-3 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all border",
                  activeStatus === st
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
                )}
              >
                {st === "all" ? "All Status" : st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Booking Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No bookings found</p>
            <p className="text-sm text-muted-foreground mt-1.5">Try adjusting your filters or search criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const statusCfg = STATUS_CONFIG[booking.status];
              const isVisa = booking.type === "visa";
              const isCancelled = booking.status === "cancelled";
              const isCompleted = booking.status === "completed";

              return (
                <div
                  key={booking.id}
                  className={cn(
                    "rounded-3xl border bg-card shadow-sm transition-all duration-300 overflow-hidden",
                    isCancelled
                      ? "border-red-200 dark:border-red-900/40 opacity-70"
                      : "border-border hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                  )}
                >
                  {/* Card Top Bar */}
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-xl flex items-center justify-center",
                        isCancelled ? "bg-red-100 dark:bg-red-900/30 text-red-500" : "bg-primary/10 text-primary"
                      )}>
                        {TYPE_ICON[booking.type]}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide capitalize">
                          {booking.type} Booking
                        </span>
                        <p className="font-mono text-xs font-bold text-foreground">{booking.pnr}</p>
                      </div>
                    </div>

                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold",
                      statusCfg.classes
                    )}>
                      {statusCfg.icon}
                      {statusCfg.label}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Main Info */}
                      <div className="space-y-1">
                        <h2 className="text-lg font-extrabold text-foreground">{booking.title}</h2>
                        <p className="text-sm text-muted-foreground">{booking.subtitle}</p>

                        {/* Flight Route Visual */}
                        {booking.type === "flight" && (
                          <div className="flex items-center gap-2 mt-2 text-xs font-semibold">
                            <span className="text-foreground font-mono">{booking.details.departureCity}</span>
                            <div className="flex items-center gap-1">
                              <div className="h-[2px] w-8 bg-primary/40 rounded" />
                              <Plane className="h-3.5 w-3.5 text-primary" />
                              <div className="h-[2px] w-8 bg-primary/40 rounded" />
                            </div>
                            <span className="text-foreground font-mono">{booking.details.arrivalCity}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">{booking.details.duration}</span>
                          </div>
                        )}

                        {/* Visa Info */}
                        {isVisa && (
                          <div className="flex items-center gap-2 mt-2">
                            {booking.details.expressOption && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                                Express Processing
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">{booking.details.country}</span>
                          </div>
                        )}

                        {/* Date & Passengers */}
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            Travel: <span className="font-semibold text-foreground">{booking.travelDate}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-primary" />
                            {booking.passengers.length} Passenger{booking.passengers.length > 1 ? "s" : ""}
                          </span>
                          {booking.type === "flight" && (
                            <span className="flex items-center gap-1.5">
                              <Luggage className="h-3.5 w-3.5 text-primary" />
                              {booking.details.baggage}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount & Booked On */}
                      <div className="sm:text-right space-y-1 shrink-0">
                        <p className="text-2xl font-extrabold text-foreground">{booking.details.totalAmount}</p>
                        <p className="text-[11px] text-muted-foreground">Booked on {booking.bookingDate}</p>
                      </div>
                    </div>

                    {/* Visa Progress Tracker */}
                    {isVisa && booking.status === "processing" && (
                      <div className="mt-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3">
                          Application Progress
                        </p>
                        <div className="flex items-center gap-0">
                          {VISA_STEPS.map((step, idx) => {
                            const done = idx < 2;
                            const active = idx === 2;
                            return (
                              <div key={idx} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center gap-1">
                                  <div className={cn(
                                    "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all shrink-0",
                                    done ? "bg-emerald-500 border-emerald-500 text-white"
                                      : active ? "bg-amber-500 border-amber-500 text-white animate-pulse"
                                      : "bg-background border-border text-muted-foreground"
                                  )}>
                                    {done ? "✓" : idx + 1}
                                  </div>
                                  <span className={cn(
                                    "text-[9px] font-semibold text-center max-w-[60px] leading-tight",
                                    done ? "text-emerald-600 dark:text-emerald-400"
                                      : active ? "text-amber-600 dark:text-amber-400"
                                      : "text-muted-foreground"
                                  )}>
                                    {step}
                                  </span>
                                </div>
                                {idx < VISA_STEPS.length - 1 && (
                                  <div className={cn(
                                    "flex-1 h-[2px] mx-1 rounded",
                                    done ? "bg-emerald-400" : "bg-border"
                                  )} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {/* E-Ticket */}
                      {!isCancelled && (
                        <Button
                          size="sm"
                          onClick={() => setTicketBooking(booking)}
                          className="rounded-xl gap-2 font-bold text-xs bg-primary hover:bg-primary/90 text-white"
                        >
                          <Bookmark className="h-3.5 w-3.5" />
                          View E-Ticket
                        </Button>
                      )}

                      {/* Print */}
                      {!isCancelled && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setTicketBooking(booking); setTimeout(() => window.print(), 300); }}
                          className="rounded-xl gap-2 font-semibold text-xs hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Print Ticket
                        </Button>
                      )}

                      {/* Share */}
                      {!isCancelled && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl gap-2 font-semibold text-xs hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          Share
                        </Button>
                      )}

                      {/* Cancel */}
                      {!isCancelled && !isCompleted && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCancelBooking(booking)}
                          className="rounded-xl gap-2 font-semibold text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ml-auto"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel Booking
                        </Button>
                      )}

                      {isCancelled && (
                        <span className="ml-auto text-xs text-muted-foreground italic">
                          This booking has been cancelled.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help Banner */}
        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-background to-background p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mt-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">Need Help with Your Booking?</p>
              <p className="text-sm text-muted-foreground mt-0.5">Our travel experts are available 24/7 to assist you.</p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button variant="outline" className="rounded-xl gap-2 font-semibold hover:bg-primary/5 hover:text-primary hover:border-primary/30" asChild>
              <a href="mailto:support@amdglobaltravel.com">
                <Mail className="h-4 w-4" /> Email Support
              </a>
            </Button>
            <Button className="rounded-xl gap-2 font-bold bg-primary hover:bg-primary/90 text-white" asChild>
              <a href="/contact">
                <Phone className="h-4 w-4" /> Contact Us
              </a>
            </Button>
          </div>
        </div>

      </section>

      {/* ── Modals ── */}
      <TicketModal
        open={!!ticketBooking}
        onOpenChange={(v) => { if (!v) setTicketBooking(null); }}
        booking={ticketBooking}
      />
      <CancellationModal
        open={!!cancelBooking}
        onOpenChange={(v) => { if (!v) setCancelBooking(null); }}
        pnr={cancelBooking?.pnr}
        title={cancelBooking?.title}
        totalAmount={cancelBooking?.details.totalAmount}
      />

    </main>
  );
}
