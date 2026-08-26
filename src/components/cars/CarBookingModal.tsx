"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { DateRange as DayPickerRange } from "react-day-picker";
import {
  X, CalendarDays, MapPin, CheckCircle2, User, Mail, Phone,
  FileText, ShieldCheck, ArrowRight, Sparkles, Loader2,
  ExternalLink, ChevronDown, Check, Car, Fuel, Settings, Users
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

  // Customer details form
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [driverLicense, setDriverLicense] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  if (!isOpen || !car) return null;

  // Calculate total rental days & price
  const pickup = dateRange?.from ?? defaultPickup;
  const dropoff = dateRange?.to ?? pickup;

  const diffTime = Math.max(1000 * 60 * 60 * 24, dropoff.getTime() - pickup.getTime());
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalAmount = totalDays * car.pricePerDay;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
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
    <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 py-8 sm:py-12 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div data-lenis-prevent className="relative w-full max-w-3xl sm:max-w-4xl max-h-[86vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-auto">

        {/* ── Modal Header with Brand Navy Gradient & Star Accents ── */}
        <div
          className="relative text-white p-6 sm:p-7 shrink-0"
          style={{
            background: "radial-gradient(circle at top right, #1A3B70 0%, #0B1D3A 60%, #061226 100%)",
          }}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={resetAndClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#FF5722] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Instant Reservation Request</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-outfit text-white tracking-tight">
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
          <div data-lenis-prevent className="p-6 sm:p-8 space-y-6 text-center overflow-y-auto flex-1 min-h-0">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full mb-2">
                Booking Reference (PNR)
              </span>
              <h3 className="text-3xl font-black tracking-wider font-mono text-slate-800">
                {bookingSuccess.pnr}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Saved in AMD Global Travel database successfully.
              </p>
            </div>

            {/* Voucher Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3 text-xs">
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
                  <strong className="text-slate-800 text-xs">{pickupLocation}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Driver</span>
                  <strong className="text-slate-800 text-xs">{customerName}</strong>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
              >
                <span>Confirm via WhatsApp Now</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={resetAndClose}
                className="w-full py-3 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Done / Close Window
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <form data-lenis-prevent onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">

            {/* Sticky Car Preview Card */}
            <div className="sticky top-0 z-20 flex items-center gap-4 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm transition-all -mt-2">
              <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                <Image src={car.image} alt={car.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{car.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {car.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {car.seats} Seats • {car.transmission} • {car.fuel}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-black text-slate-800">€{car.pricePerDay}/day</span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Full Coverage Included
                  </span>
                </div>
              </div>
            </div>

            {/* ── Professional Popover Date Picker & Location ── */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Rental Dates & Location
              </label>

              {/* Date Picker Trigger Popover */}
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 group-hover:bg-slate-200/70 flex items-center justify-center text-slate-600 transition-colors">
                        <CalendarDays className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Pickup & Dropoff Dates
                        </span>
                        <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                          <span>{formatDate(pickup)}</span>
                          <span className="text-slate-400">→</span>
                          <span>{formatDate(dropoff)}</span>
                          <span className="text-[10px] font-extrabold bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-1">
                            {totalDays} {totalDays === 1 ? "Day" : "Days"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-transform" />
                  </button>
                </PopoverTrigger>

                <PopoverContent className="w-[92vw] sm:w-[680px] max-w-[95vw] p-0 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden" align="center">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Select Rental Period (2 Months View)</h4>
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
                  <div className="p-2 sm:p-3 overflow-x-auto">
                    <Calendar
                      mode="range"
                      numberOfMonths={2}
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
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* ── Price Summary Banner ── */}
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Estimated Rental Total
                </span>
                <span className="text-xs text-slate-300">
                  {totalDays} {totalDays === 1 ? "Day" : "Days"} × €{car.pricePerDay}/day
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white font-outfit">
                  €{totalAmount}
                </span>
              </div>
            </div>

            {/* ── Driver Contact Details ── */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Driver & Contact Details
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                    placeholder="+49 170 1234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Reservation...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Car Reservation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero pre-payment required. Pay on arrival & pickup.</span>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
