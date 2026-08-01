import { VisaApplicationForm } from "@/components/visa/visa-form";
import {
  FileText, ShieldCheck, Clock, HeadphonesIcon,
  CheckCircle2, Globe, ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
    title: "100% Secure",
    desc: "Bank-grade encryption",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: <Clock className="h-5 w-5 text-sky-400" />,
    title: "Fast Processing",
    desc: "2–3 business days",
    bg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    icon: <HeadphonesIcon className="h-5 w-5 text-violet-400" />,
    title: "24/7 Support",
    desc: "Always here to help",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    icon: <Globe className="h-5 w-5 text-amber-400" />,
    title: "100+ Countries",
    desc: "Worldwide coverage",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
];

const STEPS = [
  { num: "01", label: "Fill the Form",    desc: "Complete all required fields" },
  { num: "02", label: "Upload Documents", desc: "Attach passport & photo" },
  { num: "03", label: "Submit & Pay",     desc: "Review and submit" },
  { num: "04", label: "Get Your Visa",    desc: "Receive within 2–3 days" },
];

export default function VisaPage() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* ── Hero ── */}
      <div
        className="w-full border-b border-[#0B1D3A] relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse at top right, #1e4080 0%, #0B1D3A 55%, #060f22 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 pt-12 pb-10 sm:pt-16 sm:pb-14 relative">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/40 text-xs mb-6">
            <span>Home</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-white/70 font-medium">Visa Services</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-white/50 text-sm font-medium tracking-wide uppercase">Visa Application</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
                Apply for Your Visa<br />
                <span style={{ color: 'rgb(252 211 77 / 93%)', display: 'block', marginTop: '0.75rem' }}>Quickly &amp; Securely</span>
              </h1>
              <p className="text-white/55 text-sm sm:text-base max-w-lg leading-relaxed">
                Complete the form below and our expert team will process your application and get back to you within 2–3 business days.
              </p>
            </div>

            {/* Trust score badge */}
            <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm text-center">
              <p className="text-3xl font-bold text-white">98%</p>
              <p className="text-xs text-white/50 mt-0.5">Approval Rate</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-3 w-3 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[10px] text-white/35 mt-1">4.9 / 5 · 2,400+ reviews</p>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mt-8">
            {FEATURES.map(f => (
              <div key={f.title} className={`flex items-center gap-2.5 border rounded-xl px-3.5 py-2.5 backdrop-blur-sm ${f.bg}`}>
                {f.icon}
                <div>
                  <p className="text-xs font-bold text-white">{f.title}</p>
                  <p className="text-[10px] text-white/45">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Process Steps ── */}
        <div className="">
          <div className="max-w-5xl mx-auto px-4 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STEPS.map((s, i) => (
                <div key={s.num} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-blue-300">{s.num}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/80">{s.label}</p>
                    <p className="text-[10px] text-white/35">{s.desc}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="h-3.5 w-3.5 text-white/20 hidden sm:block ml-auto shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
