import { ArrowRight, RefreshCw, Plane, FileText, CreditCard, AlertTriangle, Clock, Mail, ShieldCheck } from "lucide-react";

const SECTIONS = [
  {
    id: "overview",
    icon: <RefreshCw className="h-5 w-5 text-blue-500" />,
    iconBg: "bg-blue-50 border-blue-100",
    title: "Overview",
    content: [
      {
        subtitle: "Our Commitment",
        text: "AMD Global Travel is committed to providing fair and transparent refund policies. We understand that travel plans can change, and we aim to make the refund process as straightforward as possible.",
      },
      {
        subtitle: "Third-Party Policies",
        text: "As an intermediary, many refunds are subject to the policies of airlines, hotels, and other service providers. AMD Global Travel will always act on your behalf to secure the maximum refund available under the applicable policy.",
      },
    ],
  },
  {
    id: "flight-refunds",
    icon: <Plane className="h-5 w-5 text-violet-500" />,
    iconBg: "bg-violet-50 border-violet-100",
    title: "Flight Refunds",
    content: [
      {
        subtitle: "Refundable Tickets",
        text: "If you have purchased a refundable fare, you are entitled to a full refund of the base fare and taxes, minus any applicable cancellation fees charged by the airline. AMD Global Travel's service fee is non-refundable.",
      },
      {
        subtitle: "Non-Refundable Tickets",
        text: "Non-refundable tickets are not eligible for a cash refund. However, depending on the airline's policy, you may be eligible for a travel credit or voucher for future use. We will advise you of available options.",
      },
      {
        subtitle: "Airline Cancellations",
        text: "If an airline cancels your flight, you are entitled to a full refund of the ticket price including taxes and fees. AMD Global Travel will process this refund on your behalf within 7–14 business days of receiving the funds from the airline.",
      },
      {
        subtitle: "Partially Used Tickets",
        text: "Refunds for partially used tickets are calculated based on the unused portion of the journey, subject to the airline's fare rules. Some fares may not permit partial refunds.",
      },
    ],
  },
  {
    id: "visa-refunds",
    icon: <FileText className="h-5 w-5 text-emerald-500" />,
    iconBg: "bg-emerald-50 border-emerald-100",
    title: "Visa Application Refunds",
    content: [
      {
        subtitle: "Application Fees",
        text: "Visa application fees paid to embassies or consulates are strictly non-refundable, regardless of the outcome of the application. This applies whether the visa is approved, rejected, or withdrawn.",
      },
      {
        subtitle: "AMD Global Travel Service Fee",
        text: "Our visa processing service fee is non-refundable once the application has been submitted. If you cancel before submission, a partial refund of the service fee may be considered at our discretion.",
      },
      {
        subtitle: "Visa Rejection",
        text: "AMD Global Travel is not responsible for visa rejections by embassies or consulates. We do not guarantee visa approval. In the event of a rejection, we will advise you on reapplication options.",
      },
    ],
  },
  {
    id: "package-refunds",
    icon: <ShieldCheck className="h-5 w-5 text-amber-500" />,
    iconBg: "bg-amber-50 border-amber-100",
    title: "Tour & Umrah Package Refunds",
    content: [
      {
        subtitle: "Cancellation Timeline",
        text: "Refunds for tour and Umrah packages depend on when you cancel. Cancellations made more than 30 days before departure are eligible for a full refund minus the deposit. Cancellations within 30 days may incur penalties.",
      },
      {
        subtitle: "Cancellation Charges",
        text: "30+ days before departure: Full refund minus deposit. 15–29 days: 50% refund. 7–14 days: 25% refund. Less than 7 days: No refund. These are general guidelines; specific package terms may vary.",
      },
      {
        subtitle: "Deposits",
        text: "Deposits paid to secure a package booking are generally non-refundable unless the cancellation is due to circumstances beyond your control, such as a medical emergency supported by documentation.",
      },
    ],
  },
  {
    id: "service-fee",
    icon: <CreditCard className="h-5 w-5 text-sky-500" />,
    iconBg: "bg-sky-50 border-sky-100",
    title: "AMD Global Travel Service Fees",
    content: [
      {
        subtitle: "Non-Refundable Fees",
        text: "AMD Global Travel's service and booking fees are non-refundable in all circumstances. These fees cover the cost of processing your booking, customer support, and platform maintenance.",
      },
      {
        subtitle: "Fee Transparency",
        text: "All applicable service fees are clearly displayed before you complete your booking. By proceeding with a booking, you acknowledge and accept that these fees are non-refundable.",
      },
    ],
  },
  {
    id: "refund-process",
    icon: <Clock className="h-5 w-5 text-indigo-500" />,
    iconBg: "bg-indigo-50 border-indigo-100",
    title: "Refund Process & Timeline",
    content: [
      {
        subtitle: "How to Request a Refund",
        text: "To request a refund, contact our team via email at team@amdglobal.org or WhatsApp at +49 179 7296856. Please provide your booking reference number, reason for cancellation, and any supporting documentation.",
      },
      {
        subtitle: "Processing Time",
        text: "Once a refund is approved, we will process it within 7–14 business days. The time for the refund to appear in your account depends on your bank or payment provider and may take an additional 3–5 business days.",
      },
      {
        subtitle: "Refund Method",
        text: "Refunds are issued to the original payment method used at the time of booking. We are unable to process refunds to a different card or account for security reasons.",
      },
      {
        subtitle: "Refund Status",
        text: "You can check the status of your refund by contacting our customer support team. We will provide regular updates throughout the refund process.",
      },
    ],
  },
  {
    id: "exceptions",
    icon: <AlertTriangle className="h-5 w-5 text-rose-500" />,
    iconBg: "bg-rose-50 border-rose-100",
    title: "Exceptions & Special Circumstances",
    content: [
      {
        subtitle: "Force Majeure",
        text: "In cases of force majeure — including natural disasters, pandemics, government travel bans, or war — AMD Global Travel will work with service providers to secure refunds or credits where possible, but cannot guarantee full refunds.",
      },
      {
        subtitle: "Medical Emergencies",
        text: "In the event of a serious medical emergency preventing travel, we may be able to request a refund or credit from the service provider on compassionate grounds. Medical documentation will be required.",
      },
      {
        subtitle: "Bereavement",
        text: "In the event of a bereavement, please contact us immediately. We will do our best to assist you in obtaining a refund or rebooking, subject to the policies of the relevant service providers.",
      },
    ],
  },
  {
    id: "contact",
    icon: <Mail className="h-5 w-5 text-teal-500" />,
    iconBg: "bg-teal-50 border-teal-100",
    title: "Contact Us",
    content: [
      {
        subtitle: "Refund Enquiries",
        text: "For all refund-related enquiries, please contact our team at team@amdglobal.org or via WhatsApp at +49 179 7296856. Our team is available Monday to Saturday, 9am – 7pm CET.",
      },
      {
        subtitle: "Registered Address",
        text: "AMD Global Travel, Charlottenstraße 17, 52070 Aachen, Germany.",
      },
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* ── Hero ── */}
      <div
        className="w-full border-b border-[#0B1D3A] relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse at top right, #1e4080 0%, #0B1D3A 55%, #060f22 100%)" }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 pt-12 pb-12 sm:pt-16 sm:pb-16 relative">
          <div className="flex items-center gap-2 text-white/40 text-xs mb-6">
            <span>Home</span>
            <ArrowRight className="h-3 w-3" />
            <span>Legal</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-white/70 font-medium">Refund Policy</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
              <RefreshCw className="h-5 w-5 text-white" />
            </div>
            <span className="text-white/50 text-sm font-medium tracking-wide uppercase">Legal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
            Refund Policy
          </h1>
          <p className="text-white/55 text-sm sm:text-base max-w-xl leading-relaxed mb-6">
            We believe in fair and transparent refunds. This policy outlines your rights and the process for requesting refunds on flights, visas, and travel packages.
          </p>

          <div className="flex flex-wrap gap-4 text-xs text-white/40">
            <span>Last updated: <span className="text-white/70 font-medium">January 2025</span></span>
            <span>·</span>
            <span>Effective: <span className="text-white/70 font-medium">January 1, 2025</span></span>
            <span>·</span>
            <span>Jurisdiction: <span className="text-white/70 font-medium">Germany / EU</span></span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ── Sticky Table of Contents ── */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 p-4"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Contents</p>
              <nav className="space-y-0.5">
                {SECTIONS.map((s, i) => (
                  <a key={s.id} href={`#${s.id}`}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors group">
                    <span className="text-[10px] font-bold text-slate-300 group-hover:text-primary/50 w-4 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── Sections ── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Intro card */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex gap-3">
              <RefreshCw className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800 leading-relaxed">
                <span className="font-semibold">Fair refunds, clearly explained.</span> Our refund policy is designed to be transparent and fair. Please read each section carefully as policies vary by service type.
              </p>
            </div>

            {SECTIONS.map((section) => (
              <div key={section.id} id={section.id}
                className="bg-white rounded-2xl border border-slate-200 p-6"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${section.iconBg}`}>
                    {section.icon}
                  </div>
                  <h2 className="text-base font-bold text-slate-800">{section.title}</h2>
                </div>
                <div className="space-y-4">
                  {section.content.map((block) => (
                    <div key={block.subtitle}>
                      <h3 className="text-sm font-semibold text-slate-700 mb-1">{block.subtitle}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{block.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p className="text-xs text-slate-400 leading-relaxed">
                This Refund Policy may be updated from time to time. Continued use of our services constitutes acceptance of the updated policy.
              </p>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs">
                <a href="/contact" className="text-primary font-semibold hover:underline">Contact Us</a>
                <span className="text-slate-200">|</span>
                <a href="/legal/terms" className="text-primary font-semibold hover:underline">Terms of Service</a>
                <span className="text-slate-200">|</span>
                <a href="/legal/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
