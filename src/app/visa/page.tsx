import { Hero } from "@/components/home/hero";
import { VisaApplicationForm } from "@/components/visa/visa-form";
import { CheckCircle2 } from "lucide-react";

export default function VisaPage() {
  return (
    <main className="min-h-screen bg-slate-50">

      <Hero initialCategory="visa" />

      {/* ── Notice bar ── */}
      <div className="bg-amber-50 border-b border-amber-100">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700">
            <span className="font-semibold">Important:</span> Ensure all documents are clear and valid. Incomplete applications may cause delays.
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <VisaApplicationForm />
      </div>

    </main>
  );
}
