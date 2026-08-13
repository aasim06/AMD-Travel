"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "How soon do I receive my flight e-ticket after booking?",
    a: "Your official airline e-ticket with PNR confirmation is issued instantly and sent directly to your registered email address within 2 minutes of payment confirmation.",
  },
  {
    q: "What documents are required for Umrah & Tourist Visa processing?",
    a: "For Umrah and Tourist visas, you need a valid passport (minimum 6 months validity), a recent passport-sized photograph with a white background, and your return flight ticket details. Our agents handle form filing and embassy appointments for you.",
  },
  {
    q: "Can I modify or cancel my flight or car rental booking?",
    a: "Yes! All flexible bookings allow date modifications and cancellations up to 24 hours prior to departure. You can manage your booking online or contact our 24/7 support desk.",
  },
  {
    q: "What payment methods do you accept for bookings?",
    a: "We accept all major credit/debit cards (Visa, MasterCard, American Express), Stripe, PayPal, Apple Pay, and direct bank transfers in EUR (€) and USD ($).",
  },
  {
    q: "Are the displayed flight prices inclusive of taxes and luggage?",
    a: "Yes! All prices displayed on AMD Global Travel are 100% transparent with no hidden fees. Standard check-in luggage allowance and airport taxes are included unless specified.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-white py-16 lg:py-24 border-t border-slate-100">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="font-heading font-extrabold text-slate-900 text-3xl sm:text-4xl lg:text-[2.5rem] leading-tight tracking-tight">
            Have Questions? We Have Answers
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-3 max-w-xl text-center leading-relaxed">
            Everything you need to know about booking flights, Umrah packages, and visa services.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm sm:text-base font-bold text-slate-800 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-orange-500" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/60 mt-1 animate-in fade-in duration-200">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
