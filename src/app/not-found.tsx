import Link from "next/link";
import { ArrowLeft, Construction, Plane, Moon, FileText, MessageCircle } from "lucide-react";

const QUICK_LINKS = [
  { label: "Tour Deals", href: "/tour-deals", icon: Plane, desc: "Browse our travel packages" },
  { label: "Umrah Packages", href: "/umrah-packages", icon: Moon, desc: "Sacred journey packages" },
  { label: "Visa Services", href: "/visa", icon: FileText, desc: "Apply for your visa" },
  { label: "Contact Us", href: "/contact", icon: MessageCircle, desc: "We're here to help" },
];

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Hero ── */}
      <div
        className="w-full relative overflow-hidden flex-1 flex flex-col items-center justify-center px-4 py-20"
        style={{ background: "radial-gradient(ellipse at top right, #1e4080 0%, #0B1D3A 55%, #060f22 100%)" }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-lg mx-auto">

          {/* Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="h-20 w-20 rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center backdrop-blur-sm">
              <Construction className="h-9 w-9 text-amber-400" />
            </div>
          </div>

          {/* Under Construction badge */}
          <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 rounded-full px-4 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 text-xs font-bold uppercase tracking-widest">Under Construction</span>
          </div>

          {/* 404 */}
          <h1 className="text-8xl sm:text-9xl font-black text-white/10 leading-none select-none mb-2">
            404
          </h1>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 -mt-4">
            Page Not Found
          </h2>

          <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-8">
            This page is currently being built. Our team is working hard to bring it to life — check back soon!
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 bg-white text-slate-800 font-bold text-sm px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <a
              href="https://wa.me/4917972968560"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors"
              style={{ boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div className="max-w-3xl mx-auto w-full px-4 py-12">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
          Available Pages
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {QUICK_LINKS.map(({ label, href, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            >
              <div className="h-9 w-9 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </main>
  );
}
