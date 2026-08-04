import { ArrowRight, FileText, UserCheck, CreditCard, Plane, AlertTriangle, Scale, RefreshCw, ShieldCheck, Mail } from "lucide-react";

const SECTIONS = [
  {
    id: "acceptance",
    icon: <UserCheck className="h-5 w-5 text-blue-500" />,
    iconBg: "bg-blue-50 border-blue-100",
    title: "Acceptance of Terms",
    content: [
      {
        subtitle: "Agreement",
        text: "By accessing or using AMD Global Travel's website, mobile application, or any of our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.",
      },
      {
        subtitle: "Eligibility",
        text: "You must be at least 18 years of age to use our services and make bookings. By using our platform, you confirm that you are of legal age and have the legal capacity to enter into a binding agreement.",
      },
      {
        subtitle: "Updates to Terms",
        text: "AMD Global Travel reserves the right to modify these Terms of Service at any time. We will notify users of significant changes via email or a prominent notice on our website. Continued use of our services after changes constitutes acceptance.",
      },
    ],
  },
  {
    id: "booking-services",
    icon: <Plane className="h-5 w-5 text-violet-500" />,
    iconBg: "bg-violet-50 border-violet-100",
    title: "Booking & Services",
    content: [
      {
        subtitle: "Service Description",
        text: "AMD Global Travel provides an online platform for booking flights, visa services, tour packages, umrah packages, hotel stays, and car rentals. We act as an intermediary between you and the relevant travel service providers.",
      },
      {
        subtitle: "Booking Confirmation",
        text: "A booking is only confirmed once you receive a written confirmation from AMD Global Travel via email. We reserve the right to cancel any booking that cannot be confirmed with the relevant service provider.",
      },
      {
        subtitle: "Accuracy of Information",
        text: "You are responsible for ensuring all passenger details, travel dates, and other information provided during booking are accurate. AMD Global Travel is not liable for losses arising from incorrect information provided by the customer.",
      },
      {
        subtitle: "Third-Party Services",
        text: "Many services offered through our platform are provided by third-party suppliers (airlines, hotels, visa authorities). These suppliers have their own terms and conditions which also apply to your booking.",
      },
    ],
  },
  {
    id: "payments",
    icon: <CreditCard className="h-5 w-5 text-emerald-500" />,
    iconBg: "bg-emerald-50 border-emerald-100",
    title: "Payments & Pricing",
    content: [
      {
        subtitle: "Pricing",
        text: "All prices displayed on our platform are in the selected currency and include applicable taxes unless stated otherwise. Prices are subject to availability and may change without notice until a booking is confirmed.",
      },
      {
        subtitle: "Payment Methods",
        text: "We accept Visa, Mastercard, American Express, PayPal, and Apple Pay. All payments are processed securely through our certified payment partners. AMD Global Travel does not store your full card details.",
      },
      {
        subtitle: "Service Fees",
        text: "AMD Global Travel may charge service fees in addition to the base price of travel products. These fees will be clearly displayed before you complete your booking and are non-refundable unless stated otherwise.",
      },
      {
        subtitle: "Currency",
        text: "Prices may be displayed in EUR, USD, or PKR. The final charge will be in the currency selected at checkout. Exchange rates are indicative and your bank may apply additional conversion fees.",
      },
    ],
  },
  {
    id: "cancellations",
    icon: <RefreshCw className="h-5 w-5 text-amber-500" />,
    iconBg: "bg-amber-50 border-amber-100",
    title: "Cancellations & Refunds",
    content: [
      {
        subtitle: "Cancellation Policy",
        text: "Cancellation policies vary depending on the airline, hotel, or service provider. The applicable cancellation policy will be clearly displayed during the booking process. Some bookings may be non-refundable.",
      },
      {
        subtitle: "Refund Processing",
        text: "Approved refunds will be processed within 7–14 business days to the original payment method. AMD Global Travel's service fees are generally non-refundable. Refund timelines may vary depending on your bank or payment provider.",
      },
      {
        subtitle: "Visa Applications",
        text: "Visa application fees are non-refundable once the application has been submitted to the relevant embassy or consulate, regardless of the outcome. AMD Global Travel's visa service fee is also non-refundable.",
      },
      {
        subtitle: "Force Majeure",
        text: "AMD Global Travel is not liable for cancellations or changes caused by events beyond our control, including natural disasters, pandemics, government travel restrictions, strikes, or acts of terrorism.",
      },
    ],
  },
  {
    id: "user-responsibilities",
    icon: <UserCheck className="h-5 w-5 text-sky-500" />,
    iconBg: "bg-sky-50 border-sky-100",
    title: "User Responsibilities",
    content: [
      {
        subtitle: "Travel Documents",
        text: "You are solely responsible for ensuring you hold valid travel documents including passports, visas, and any required health certificates. AMD Global Travel is not liable for denied boarding or entry due to inadequate documentation.",
      },
      {
        subtitle: "Account Security",
        text: "You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorised use of your account. AMD Global Travel is not liable for losses resulting from unauthorised account access.",
      },
      {
        subtitle: "Prohibited Use",
        text: "You agree not to use our platform for any unlawful purpose, to make fraudulent bookings, to impersonate any person, or to interfere with the operation of our services. Violation may result in immediate account termination.",
      },
      {
        subtitle: "Compliance with Laws",
        text: "You agree to comply with all applicable laws and regulations in your country of residence and any country you travel to. AMD Global Travel is not responsible for any legal consequences arising from your travel activities.",
      },
    ],
  },
  {
    id: "liability",
    icon: <AlertTriangle className="h-5 w-5 text-rose-500" />,
    iconBg: "bg-rose-50 border-rose-100",
    title: "Limitation of Liability",
    content: [
      {
        subtitle: "No Warranty",
        text: "AMD Global Travel provides its services on an 'as is' basis. We do not warrant that our platform will be uninterrupted, error-free, or free from viruses or other harmful components.",
      },
      {
        subtitle: "Indirect Damages",
        text: "To the maximum extent permitted by law, AMD Global Travel shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.",
      },
      {
        subtitle: "Maximum Liability",
        text: "Our total liability to you for any claim arising from your use of our services shall not exceed the total amount paid by you for the specific booking giving rise to the claim.",
      },
    ],
  },
  {
    id: "intellectual-property",
    icon: <ShieldCheck className="h-5 w-5 text-indigo-500" />,
    iconBg: "bg-indigo-50 border-indigo-100",
    title: "Intellectual Property",
    content: [
      {
        subtitle: "Ownership",
        text: "All content on the AMD Global Travel platform, including text, graphics, logos, images, and software, is the property of AMD Global Travel or its content suppliers and is protected by applicable intellectual property laws.",
      },
      {
        subtitle: "Permitted Use",
        text: "You may access and use our platform for personal, non-commercial purposes only. You may not reproduce, distribute, modify, or create derivative works from any content without our express written permission.",
      },
    ],
  },
  {
    id: "governing-law",
    icon: <Scale className="h-5 w-5 text-teal-500" />,
    iconBg: "bg-teal-50 border-teal-100",
    title: "Governing Law & Disputes",
    content: [
      {
        subtitle: "Governing Law",
        text: "These Terms of Service are governed by and construed in accordance with the laws of Germany. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Aachen, Germany.",
      },
      {
        subtitle: "Dispute Resolution",
        text: "We encourage you to contact us first to resolve any disputes amicably. If a resolution cannot be reached, disputes may be referred to mediation before formal legal proceedings are initiated.",
      },
      {
        subtitle: "EU Consumer Rights",
        text: "If you are an EU consumer, you may also have the right to use the European Commission's Online Dispute Resolution platform at ec.europa.eu/consumers/odr for resolving disputes.",
      },
    ],
  },
  {
    id: "contact",
    icon: <Mail className="h-5 w-5 text-pink-500" />,
    iconBg: "bg-pink-50 border-pink-100",
    title: "Contact Information",
    content: [
      {
        subtitle: "Registered Address",
        text: "AMD Global Travel, Charlottenstraße 17, 52070 Aachen, Germany.",
      },
      {
        subtitle: "Get In Touch",
        text: "For any questions regarding these Terms of Service, please contact us at team@amdglobal.org or via WhatsApp at +49 179 7296856. Our team is available Monday to Saturday, 9am – 7pm CET.",
      },
    ],
  },
];

export default function TermsOfServicePage() {
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
            <span className="text-white/70 font-medium">Terms of Service</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-white/50 text-sm font-medium tracking-wide uppercase">Legal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-white/55 text-sm sm:text-base max-w-xl leading-relaxed mb-6">
            Please read these terms carefully before using AMD Global Travel's services. By using our platform, you agree to be bound by these terms.
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
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-3"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <FileText className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 leading-relaxed">
                <span className="font-semibold">Please read these terms carefully.</span> These Terms of Service constitute a legally binding agreement between you and AMD Global Travel governing your use of our platform and services.
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

            {/* Footer note */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p className="text-xs text-slate-400 leading-relaxed">
                These Terms of Service were last updated in January 2025. AMD Global Travel reserves the right to update these terms at any time. Your continued use of our services constitutes acceptance of any changes.
              </p>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs">
                <a href="/contact" className="text-primary font-semibold hover:underline">Contact Us</a>
                <span className="text-slate-200">|</span>
                <a href="/legal/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</a>
                <span className="text-slate-200">|</span>
                <a href="/legal/refunds" className="text-primary font-semibold hover:underline">Refund Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
