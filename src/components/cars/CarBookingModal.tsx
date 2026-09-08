"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import type { DateRange as DayPickerRange } from "react-day-picker";
import {
  X, CalendarDays, MapPin, CheckCircle2, User, Mail, Phone,
  FileText, ShieldCheck, ArrowRight, Sparkles, Loader2,
  ExternalLink, ChevronDown, Check, Car, Fuel, Settings, Users,
  Clock, ShieldAlert
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CarItem {
  id: string | number;
  name: string;
  category: string;
  type: string;
  seats: number;
  transmission: string;
  fuel: string;
  pricePerDay: number;
  originalPrice?: number;
  image: string;
  location: string;
  features?: string[];
  includes?: string[];
}

interface CarBookingModalProps {
  car: CarItem | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(d: Date | null) {
  if (!d) return "Select Date";
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function CarBookingModal({ car, isOpen, onClose }: CarBookingModalProps) {
  // Default dates: pickup tomorrow, dropoff in 3 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const defaultPickup = new Date(today);
  defaultPickup.setDate(defaultPickup.getDate() + 1);

  const defaultDropoff = new Date(defaultPickup);
  defaultDropoff.setDate(defaultDropoff.getDate() + 3);

  const [dateRange, setDateRange] = useState<DayPickerRange | undefined>({
    from: defaultPickup,
    to: defaultDropoff,
  });

  const [pickupLocation, setPickupLocation] = useState(car?.location || "Frankfurt Airport Terminal 1");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Customer details form
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [driverLicense, setDriverLicense] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isOpen || !car) return null;

  // Calculate total rental days & price
  const pickup = dateRange?.from ?? defaultPickup;
  const dropoff = dateRange?.to ?? pickup;

  const diffTime = Math.max(1000 * 60 * 60 * 24, dropoff.getTime() - pickup.getTime());
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalAmount = totalDays * car.pricePerDay;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg("Please fill in your full name and phone number.");
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      setErrorMsg("Please select valid pickup and dropoff dates.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bookings/car", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: car.id,
          carName: car.name,
          carCategory: car.category,
          carImage: car.image,
          pickupLocation,
          dropoffLocation: pickupLocation,
          pickupDate: formatISO(pickup),
          dropoffDate: formatISO(dropoff),
          totalDays,
          totalAmount,
          currency: "EUR",
          customerName,
          customerEmail,
          customerPhone,
          driverLicense,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit booking reservation.");
      }

      setBookingSuccess(json);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while creating your reservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setBookingSuccess(null);
    setErrorMsg("");
    onClose();
  };

  // WhatsApp formatted string
  const getWhatsAppUrl = () => {
    if (!bookingSuccess) return "#";
    const refPnr = bookingSuccess.pnr || "AMD-CAR-RESERVATION";
    const message = `Hi AMD Global Travel!\n\nI have created a Car Booking Reservation on your website.\n\n*Vehicle:* ${car.name} (${car.category})\n*Booking Ref (PNR):* ${refPnr}\n*Dates:* ${formatDate(pickup)} to ${formatDate(dropoff)} (${totalDays} Days)\n*Pickup Location:* ${pickupLocation}\n*Total Estimated:* €${totalAmount}\n*Driver Name:* ${customerName}\n*WhatsApp:* ${customerPhone}\n\nPlease confirm availability and details!`;
    return `https://wa.me/4917972968560?text=${encodeURIComponent(message)}`;
  };

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
    >
      {/* Background click to dismiss on desktop */}
      <div className="absolute inset-0 -z-10" onClick={resetAndClose} />

      {/* ── Dialog Card (Bottom Sheet on Mobile, Centered Modal on Desktop) ── */}
      <div
        data-lenis-prevent
        className="relative w-full max-w-3xl sm:max-w-4xl h-[92vh] sm:h-auto sm:max-h-[88vh] flex flex-col bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 z-20 w-12 h-1 rounded-full bg-white/40" />

        {/* ── Modal Header with Brand Navy Gradient ── */}
        <div
          className="relative text-white p-5 sm:p-6 pt-6 sm:pt-6 shrink-0"
          style={{
            background: "radial-gradient(circle at top right, #1A3B70 0%, #0B1D3A 60%, #061226 100%)",
          }}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer z-10 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 text-orange-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span>Instant Reservation Request</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-outfit text-white tracking-tight pr-10">
            {bookingSuccess ? "Booking Reserved!" : `Book ${car.name}`}
          </h2>
          <p className="text-white/80 text-xs sm:text-sm mt-1">
            {bookingSuccess
              ? "Your reservation reference has been generated & saved to database."
              : "Complete your rental details to get instant confirmation & voucher."}
          </p>
        </div>

        {/* ── Modal Body ── */}
        {bookingSuccess ? (
          /* SUCCESS CONFIRMATION VIEW */
          <div data-lenis-prevent className="p-5 sm:p-8 space-y-5 text-center overflow-y-auto flex-1 min-h-0 custom-scrollbar">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full mb-2">
                Booking Reference (PNR)
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-wider font-mono text-slate-800">
                {bookingSuccess.pnr}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Saved in AMD Global Travel database successfully.
              </p>
            </div>

            {/* Voucher Card */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 text-left space-y-3 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 text-sm block">{car.name}</span>
                  <span className="text-[11px] text-slate-400">{car.type} • {car.transmission}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-600 text-base">€{totalAmount}</span>
                  <span className="text-[10px] text-slate-400 block">Total for {totalDays} Days</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Date</span>
                  <strong className="text-slate-800 text-xs">{formatDate(pickup)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Dropoff Date</span>
                  <strong className="text-slate-800 text-xs">{formatDate(dropoff)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Location</span>
                  <strong className="text-slate-800 text-xs truncate block">{pickupLocation}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Driver</span>
                  <strong className="text-slate-800 text-xs truncate block">{customerName}</strong>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 active:scale-98"
              >
                <span>Confirm via WhatsApp Now</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={resetAndClose}
                className="w-full py-3 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Done / Close Window
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW WITH STICKY FOOTER */
          <form data-lenis-prevent onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            
            {/* Scrollable Form Content */}
            <div className="p-4 sm:p-6 md:p-7 space-y-5 overflow-y-auto flex-1 min-h-0 custom-scrollbar">

              {/* Car Preview Card (Compact & Non-intrusive) */}
              <div className="flex items-center gap-3.5 p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                  <Image src={car.image} alt={car.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{car.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                      {car.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {car.seats} Seats • {car.transmission} • {car.fuel}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-slate-900">€{car.pricePerDay}/day</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      Full Insurance Included
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Popover Date Picker & Location ── */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Rental Dates & Location
                </label>

                {/* Date Picker Trigger Popover */}
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full text-left p-3 sm:p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-orange-50 group-hover:bg-orange-100/70 flex items-center justify-center text-primary shrink-0 transition-colors">
                          <CalendarDays className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Pickup & Dropoff Dates
                          </span>
                          <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                            <span>{formatDate(pickup)}</span>
                            <span className="text-slate-400">→</span>
                            <span>{formatDate(dropoff)}</span>
                            <span className="text-[10px] font-extrabold bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-1">
                              {totalDays} {totalDays === 1 ? "Day" : "Days"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-transform shrink-0 ml-2" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-[95vw] sm:w-[640px] max-w-[95vw] p-0 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[110] overflow-hidden"
                    align="center"
                  >
                    <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">
                          {isDesktop ? "Select Rental Period (2 Months)" : "Select Rental Period"}
                        </h4>
                        <p className="text-[10px] text-slate-400">Choose your pickup date and dropoff date</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCalendarOpen(false)}
                        className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 cursor-pointer transition-colors shadow-xs"
                      >
                        Done
                      </button>
                    </div>
                    <div className="p-1 sm:p-3 overflow-x-auto flex justify-center">
                      <Calendar
                        mode="range"
                        numberOfMonths={isDesktop ? 2 : 1}
                        selected={dateRange}
                        onSelect={(range) => {
                          setDateRange(range);
                        }}
                        disabled={{ before: today }}
                        className="p-1 sm:p-2"
                      />
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Pickup Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Pickup & Return Location
                  </label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="e.g. Frankfurt Airport Terminal 1, Munich Airport, Hotel..."
                    className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                    required
                  />
                </div>
              </div>

              {/* ── Driver Contact Details ── */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Driver & Contact Details
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mohammad Asim"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      WhatsApp / Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +49 170 1234567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      Driver's License No (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DL-9482019"
                      value={driverLicense}
                      onChange={(e) => setDriverLicense(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

            </div>

            {/* ── Sticky Bottom Action Footer (Always Visible Above Nav Bar) ── */}
            <div className="shrink-0 p-4 sm:px-6 sm:py-4 bg-white border-t border-slate-200/80 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] z-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                {/* Total Price Summary */}
                <div className="flex items-center justify-between sm:block">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Estimated Rental Total
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 font-outfit">
                        €{totalAmount}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        ({totalDays} {totalDays === 1 ? "day" : "days"} × €{car.pricePerDay})
                      </span>
                    </div>
                  </div>

                  <div className="sm:hidden flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Pay on Pickup</span>
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="flex flex-col items-end gap-1 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto min-w-[220px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Reserving Car...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Car Reservation</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Zero pre-payment. Free cancellation up to 24h.</span>
                  </div>
                </div>

              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
