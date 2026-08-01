import { ContactForm } from "@/components/contact/contact-form";
import {
  Mail, Phone, MapPin, MessageCircle, Clock,
  ArrowRight, HeadphonesIcon, ShieldCheck, Zap,
} from "lucide-react";

const CONTACT_CARDS = [
  {
    icon: <Mail className="h-5 w-5 text-blue-500" />,
    bg: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-500/10",
    label: "Email Us",
    value: "team@amdglobal.org",
    href: "mailto:team@amdglobal.org",
    sub: "We reply within 24 hours",
  },
  {
    icon: <MessageCircle className="h-5 w-5 text-emerald-500" />,
    bg: "bg-emerald-50 border-emerald-100",
    iconBg: "bg-emerald-500/10",
    label: "WhatsApp",
    value: "+49 179 7296856",
    href: "https://wa.me/4917972968560",
    sub: "Chat with us instantly",
  },
  {
    icon: <MapPin className="h-5 w-5 text-violet-500" />,
    bg: "bg-violet-50 border-violet-100",
    iconBg: "bg-violet-500/10",
    label: "Our Office",
    value: "Charlottenstraße 17",
    href: "https://maps.google.com/?q=Charlottenstraße+17,+52070+Aachen,+Germany",
    sub: "52070 Aachen, Germany",
  },
  {
    icon: <Clock className="h-5 w-5 text-amber-500" />,
    bg: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-500/10",
    label: "Working Hours",
    value: "Mon – Sat: 9am – 7pm",
    href: null,
    sub: "CET / Central European Time",
  },
];

const FEATURES = [
  {
    icon: <Zap className="h-4.5 w-4.5 text-amber-400" />,
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "Fast Response",
    desc: "Within 24 hours",
  },
  {
    icon: <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />,
    bg: "bg-emerald-500/10 border-emerald-500/20",
    title: "Secure & Private",
    desc: "Your data is safe",
  },
  {
    icon: <HeadphonesIcon className="h-4.5 w-4.5 text-sky-400" />,
    bg: "bg-sky-500/10 border-sky-500/20",
    title: "Expert Support",
    desc: "Travel specialists",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* ── Hero ── */}
      <div
        className="w-full border-b border-[#0B1D3A] relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse at top right, #1e4080 0%, #0B1D3A 55%, #060f22 100%)" }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 pt-12 pb-10 sm:pt-16 sm:pb-14 relative">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/40 text-xs mb-6">
            <span>Home</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-white/70 font-medium">Contact Us</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                  <HeadphonesIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-white/50 text-sm font-medium tracking-wide uppercase">Get In Touch</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
                We&apos;re Here to<br />
                <span style={{ color: "rgb(252 211 77 / 93%)", display: "block", marginTop: "0.75rem" }}>
                  Help You Travel
                </span>
              </h1>
              <p className="text-white/55 text-sm sm:text-base max-w-lg leading-relaxed">
                Have a question about your booking, visa, or travel plans? Our expert team is ready to assist you every step of the way.
              </p>
            </div>

            {/* Stats badge */}
            <div className="flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm text-center">
              <p className="text-3xl font-bold text-white">24h</p>
              <p className="text-xs text-white/50 mt-0.5">Response Time</p>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-[11px] text-white/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  Available Mon – Sat
                </div>
                <div className="flex items-center gap-2 text-[11px] text-white/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                  WhatsApp Support
                </div>
              </div>
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
      </div>

      {/* ── Contact Cards ── */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTACT_CARDS.map(card => (
            <div key={card.label}
              className={`rounded-2xl border p-4 ${card.bg} flex flex-col gap-3`}
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{card.label}</p>
                {card.href ? (
                  <a href={card.href} target={card.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-slate-800 hover:text-primary transition-colors mt-0.5 block">
                    {card.value}
                  </a>
                ) : (
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{card.value}</p>
                )}
                <p className="text-[11px] text-slate-400 mt-0.5">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Contact Form ── */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">Send Us a Message</h2>
              <p className="text-sm text-slate-400 mt-1">Fill in the form and we&apos;ll get back to you shortly.</p>
            </div>
            <ContactForm />
          </div>

          {/* ── Right Sidebar ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Map embed */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <iframe
                title="AMD Global Travel Office"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2517.3!2d6.0838!3d50.7753!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c0999b5f3b1b1b%3A0x0!2sCharlottenstra%C3%9Fe+17%2C+52070+Aachen%2C+Germany!5e0!3m2!1sen!2sde!4v1"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="px-4 py-3 flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-700">Charlottenstraße 17</p>
                  <p className="text-xs text-slate-400">52070 Aachen, Germany</p>
                </div>
                <a href="https://maps.google.com/?q=Charlottenstraße+17,+52070+Aachen,+Germany"
                  target="_blank" rel="noopener noreferrer"
                  className="ml-auto text-[11px] font-semibold text-primary hover:underline shrink-0">
                  Get Directions
                </a>
              </div>
            </div>

            {/* FAQ quick links */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 className="text-sm font-bold text-slate-800 mb-4">Frequently Asked</h3>
              <div className="space-y-2.5">
                {[
                  "How do I cancel or change my booking?",
                  "What documents are needed for a visa?",
                  "How long does visa processing take?",
                  "Do you offer group travel packages?",
                ].map(q => (
                  <div key={q}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all cursor-pointer group">
                    <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-primary">?</span>
                    </span>
                    <p className="text-xs font-medium text-slate-600 group-hover:text-slate-800 transition-colors leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a href="https://wa.me/4917972968560" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 bg-emerald-500 hover:bg-emerald-600 transition-colors rounded-2xl p-4 group"
              style={{ boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}>
              <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Chat on WhatsApp</p>
                <p className="text-[11px] text-emerald-100 mt-0.5">+49 179 7296856 · Instant reply</p>
              </div>
              <ArrowRight className="h-4 w-4 text-white/70 group-hover:translate-x-1 transition-transform shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
