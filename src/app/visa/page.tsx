import { Hero } from "@/components/home/hero";
import { VisaApplicationForm } from "@/components/visa/visa-form";
import { CheckCircle2 } from "lucide-react";

export default function VisaPage() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* ── 1. Hero Section (Scrolls naturally at top) ── */}
      <Hero initialCategory="visa" />

      {/* ── 2. Notice Bar (Sticks to top when scrolled up to top 0) ── */}
      <div className="sticky top-[64px] z-30 bg-amber-50/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs transition-all">
        <div className="container py-2.5 flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-800">
            <span className="font-semibold">Important:</span> Ensure all documents are clear and valid. Incomplete applications may cause delays.
          </p>
        </div>
      </div>

      {/* ── 3. Form Container (Scrolls smoothly to top 0) ── */}
      <div className="container py-8 sm:py-10">
        <VisaApplicationForm />
      </div>

    </main>
  );
}
