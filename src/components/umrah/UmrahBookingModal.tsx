"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X, CalendarDays, MapPin, CheckCircle2, User, Mail, Phone,
  FileText, ShieldCheck, ArrowRight, Sparkles, Loader2,
  ExternalLink, ChevronDown, Moon, Hotel, Users, Plus, Minus,
  Plane, HeartHandshake
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface UmrahPackageItem {
  id: string | number;
  title: string;
  category: string;
  duration: string;
  departure: string;
  price: number;
  originalPrice?: number;
  makkahNights: number;
  madinahNights: number;
  hotel: { makkah: string; madinah: string };
  image: string;
  includes: string[];
}

interface UmrahBookingModalProps {
  packageItem: UmrahPackageItem | null;
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

export function UmrahBookingModal({ packageItem, isOpen, onClose }: UmrahBookingModalProps) {
  // Default departure date (15 days from today)
  const defaultDeparture = new Date();
  defaultDeparture.setDate(defaultDeparture.getDate() + 14);

  const [departureDate, setDepartureDate] = useState<Date | undefined>(defaultDeparture);
  const [departureCity, setDepartureCity] = useState(packageItem?.departure || "Frankfurt, Germany");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Pilgrim counters
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  // Lead pilgrim details
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [passportNo, setPassportNo] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  if (!isOpen || !packageItem) return null;

  const totalPilgrims = adults + children + infants;
  // Adult full price, child 80% price, infant 30% price
  const totalAmount = Math.round(
    adults * packageItem.price +
    children * (packageItem.price * 0.8) +
    infants * (packageItem.price * 0.3)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      setErrorMsg("Please fill in your full name and WhatsApp phone number.");
      return;
    }

    if (!departureDate) {
      setErrorMsg("Please select a departure date.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bookings/umrah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: packageItem.id,
          packageTitle: packageItem.title,
          packageCategory: packageItem.category,
          packageImage: packageItem.image,
          departureCity,
          departureDate: formatISO(departureDate),
          adults,
          children,
          infants,
          totalPilgrims,
          totalAmount,
          currency: "EUR",
          customerName,
          customerEmail,
          customerPhone,
          passportNo,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit Umrah reservation.");
      }

      setBookingSuccess(json);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while reserving your Umrah package.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setBookingSuccess(null);
    setErrorMsg("");
    onClose();
  };

  // WhatsApp pre-filled link
  const getWhatsAppUrl = () => {
    if (!bookingSuccess) return "#";
    const refPnr = bookingSuccess.pnr || "AMD-UMRAH-RESERVATION";
    const message = `Salam AMD Global Travel!\n\nI have submitted an Umrah Package Reservation on your website.\n\n*Package:* ${packageItem.title} (${packageItem.category})\n*Booking Ref (PNR):* ${refPnr}\n*Travel Date:* ${formatDate(departureDate || null)}\n*Departure City:* ${departureCity}\n*Pilgrims:* ${adults} Adults, ${children} Children, ${infants} Infants (Total: ${totalPilgrims})\n*Total Price:* €${totalAmount.toLocaleString()}\n*Lead Pilgrim:* ${customerName}\n*WhatsApp:* ${customerPhone}\n\nPlease confirm availability and payment details!`;
    return `https://wa.me/4917972968560?text=${encodeURIComponent(message)}`;
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 py-8 sm:py-12 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div data-lenis-prevent className="relative w-full max-w-3xl sm:max-w-4xl max-h-[86vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-auto">

        {/* ── Modal Header with Brand Royal Navy & Crescent Touch ── */}
        <div
          className="relative text-white p-6 sm:p-7 shrink-0"
          style={{
            background: "radial-gradient(circle at top right, #1A3B70 0%, #0B1D3A 60%, #061226 100%)",
          }}
        >
          <button
            type="button"
            onClick={resetAndClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#FF5722] text-xs font-bold uppercase tracking-wider mb-2">
            <Moon className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            <span>Blessed Journey Reservation</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-outfit text-white tracking-tight">
            {bookingSuccess ? "Umrah Package Reserved!" : `Book ${packageItem.title}`}
          </h2>
          <p className="text-white/80 text-xs sm:text-sm mt-1">
            {bookingSuccess
              ? "Your Umrah reservation code has been generated & saved to database."
              : "Reserve your Umrah package & customize pilgrim details in under 60 seconds."}
          </p>
        </div>

        {/* ── Modal Body ── */}
        {bookingSuccess ? (
          /* SUCCESS VIEW */
          <div data-lenis-prevent className="p-6 sm:p-8 space-y-6 text-center overflow-y-auto flex-1 min-h-0">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full mb-2">
                Umrah Booking Reference (PNR)
              </span>
              <h3 className="text-3xl font-black tracking-wider font-mono text-slate-800">
                {bookingSuccess.pnr}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Saved in AMD Global Travel database. Zero pre-payment required to hold reservation.
              </p>
            </div>

            {/* Summary Voucher Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3 text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 text-sm block">{packageItem.title}</span>
                  <span className="text-[11px] text-emerald-700 font-semibold">{packageItem.duration} • {packageItem.category}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-600 text-base">€{totalAmount.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 block">Total for {totalPilgrims} Pilgrims</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Departure Date</span>
                  <strong className="text-slate-800 text-xs">{formatDate(departureDate || null)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Departure City</span>
                  <strong className="text-slate-800 text-xs">{departureCity}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pilgrims</span>
                  <strong className="text-slate-800 text-xs">{adults} Adult, {children} Child, {infants} Infant</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Makkah & Madinah Hotels</span>
                  <strong className="text-slate-800 text-xs block">{packageItem.hotel.makkah} ({packageItem.makkahNights}N)</strong>
                  <strong className="text-slate-800 text-xs block">{packageItem.hotel.madinah} ({packageItem.madinahNights}N)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Lead Pilgrim</span>
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

            {/* Sticky Umrah Package Preview Card */}
            <div className="sticky top-0 z-20 flex items-start gap-4 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm transition-all -mt-2">
              <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                <Image src={packageItem.image} alt={packageItem.title} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate">{packageItem.title}</h4>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {packageItem.category}
                  </span>
                </div>
                
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span>Makkah ({packageItem.makkahNights} Nights)</span>
                  <span>•</span>
                  <span>Madinah ({packageItem.madinahNights} Nights)</span>
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-black text-slate-800">€{packageItem.price.toLocaleString()}/person</span>
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {packageItem.duration}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Dates & Departure City ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Departure Date Popover */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-primary" />
                  Target Departure Date
                </label>

                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-800">
                        {formatDate(departureDate || null)}
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[92vw] sm:w-[680px] max-w-[95vw] p-0 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden" align="start">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Select Umrah Departure Date (2 Months View)</h4>
                        <p className="text-[10px] text-slate-400">Choose your preferred departure day</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCalendarOpen(false)}
                        className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                    <div className="p-2 sm:p-3 overflow-x-auto">
                      <Calendar
                        mode="single"
                        numberOfMonths={2}
                        selected={departureDate}
                        onSelect={(d) => {
                          if (d) setDepartureDate(d);
                        }}
                        disabled={{ before: new Date() }}
                        className="p-1 sm:p-2"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Departure City */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-primary" />
                  Departure Airport / City
                </label>
                <select
                  value={departureCity}
                  onChange={(e) => setDepartureCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                >
                  <option value="Frankfurt, Germany">Frankfurt, Germany (FRA)</option>
                  <option value="Munich, Germany">Munich, Germany (MUC)</option>
                  <option value="Düsseldorf, Germany">Düsseldorf, Germany (DUS)</option>
                  <option value="Berlin, Germany">Berlin, Germany (BER)</option>
                  <option value="London, UK">London Heathrow / Gatwick (LHR)</option>
                  <option value="Islamabad, Pakistan">Islamabad, Pakistan (ISB)</option>
                  <option value="Lahore, Pakistan">Lahore, Pakistan (LHE)</option>
                  <option value="Custom Location">Other / Direct Consultation</option>
                </select>
              </div>

            </div>

            {/* ── Pilgrim Count Selection ── */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Number of Pilgrims
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Adults */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Adults</span>
                    <span className="text-[10px] text-slate-400">Age 12+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center text-xs font-extrabold text-slate-800">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Children</span>
                    <span className="text-[10px] text-slate-400">Age 2-11</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center text-xs font-extrabold text-slate-800">{children}</span>
                    <button
                      type="button"
                      onClick={() => setChildren(children + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Infants</span>
                    <span className="text-[10px] text-slate-400">Under 2 yrs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInfants(Math.max(0, infants - 1))}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center text-xs font-extrabold text-slate-800">{infants}</span>
                    <button
                      type="button"
                      onClick={() => setInfants(infants + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Price Summary Banner ── */}
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Estimated Total Package Price
                </span>
                <span className="text-xs text-slate-300">
                  {totalPilgrims} {totalPilgrims === 1 ? "Pilgrim" : "Pilgrims"} • Free Umrah Visa Guidance
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white font-outfit">
                  €{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* ── Lead Pilgrim Contact Details ── */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Lead Pilgrim Details
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
                    Passport No (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PK-849201"
                    value={passportNo}
                    onChange={(e) => setPassportNo(e.target.value)}
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
                    <span>Saving Umrah Reservation...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Umrah Reservation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>No advance payment required. 100% money-back guarantee on visa & packages.</span>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
