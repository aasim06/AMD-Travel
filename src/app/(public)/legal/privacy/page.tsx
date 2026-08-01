import { ArrowRight, ShieldCheck, Lock, Eye, Database, Bell, Globe, Mail, RefreshCw } from "lucide-react";

const SECTIONS = [
  {
    id: "information-we-collect",
    icon: <Database className="h-5 w-5 text-blue-500" />,
    iconBg: "bg-blue-50 border-blue-100",
    title: "Information We Collect",
    content: [
      {
        subtitle: "Personal Information",
        text: "When you use AMD Global Travel, we collect information you provide directly, including your full name, email address, phone number, passport details, date of birth, and payment information when making bookings.",
      },
      {
        subtitle: "Travel Information",
        text: "We collect details about your travel preferences, booking history, flight searches, visa applications, and any special requirements you provide during the booking process.",
      },
      {
        subtitle: "Technical Information",
        text: "We automatically collect certain technical data including your IP address, browser type, device information, pages visited, time spent on our platform, and referring URLs to improve our services.",
      },
    ],
  },
  {
    id: "how-we-use",
    icon: <Eye className="h-5 w-5 text-violet-500" />,
    iconBg: "bg-violet-50 border-violet-100",
    title: "How We Use Your Information",
    content: [
      {
        subtitle: "Service Delivery",
        text: "We use your information to process flight bookings, visa applications, tour packages, and other travel services you request. This includes communicating booking confirmations, itineraries, and important travel updates.",
      },
      {
        subtitle: "Customer Support",
        text: "Your information helps us respond to your inquiries, resolve disputes, troubleshoot issues, and provide personalised assistance through our support channels including email and WhatsApp.",
      },
      {
        subtitle: "Service Improvement",
        text: "We analyse usage patterns and feedback to improve our platform, develop new features, and enhance the overall travel booking experience for all our customers.",
      },
      {
        subtitle: "Legal Compliance",
        text: "We may use your information to comply with applicable laws, regulations, and legal processes, including anti-fraud measures and identity verification requirements.",
      },
    ],
  },
  {
    id: "data-sharing",
    icon: <Globe className="h-5 w-5 text-emerald-500" />,
    iconBg: "bg-emerald-50 border-emerald-100",
    title: "Data Sharing & Third Parties",
    content: [
      {
        subtitle: "Travel Partners",
        text: "To complete your bookings, we share necessary information with airlines, hotels, car rental companies, visa processing authorities, and other travel service providers. These partners are bound by their own privacy policies.",
      },
      {
        subtitle: "Payment Processors",
        text: "Payment information is securely transmitted to our certified payment processors (Stripe, PayPal, etc.). We do not store your full card details on our servers.",
      },
      {
        subtitle: "No Sale of Data",
        text: "We do not sell, rent, or trade your personal information to third parties for their marketing purposes. Any sharing is strictly limited to what is necessary to provide our services.",
      },
    ],
  },
  {
    id: "data-security",
    icon: <Lock className="h-5 w-5 text-rose-500" />,
    iconBg: "bg-rose-50 border-rose-100",
    title: "Data Security",
    content: [
      {
        subtitle: "Encryption",
        text: "All data transmitted between your device and our servers is encrypted using industry-standard TLS/SSL protocols. Sensitive data such as passport details and payment information is encrypted at rest.",
      },
      {
        subtitle: "Access Controls",
        text: "Access to your personal data is strictly limited to authorised AMD Global Travel staff who need it to perform their job functions. All staff are trained on data protection best practices.",
      },
      {
        subtitle: "Breach Notification",
        text: "In the unlikely event of a data breach that affects your personal information, we will notify you and the relevant authorities within 72 hours as required by applicable data protection laws.",
      },
    ],
  },
  {
    id: "your-rights",
    icon: <ShieldCheck className="h-5 w-5 text-amber-500" />,
    iconBg: "bg-amber-50 border-amber-100",
    title: "Your Rights",
    content: [
      {
        subtitle: "Access & Portability",
        text: "You have the right to request a copy of the personal data we hold about you at any time. We will provide this in a structured, commonly used, machine-readable format.",
      },
      {
        subtitle: "Correction & Deletion",
        text: "You may request correction of inaccurate data or deletion of your personal information, subject to our legal obligations to retain certain records for regulatory compliance.",
      },
      {
        subtitle: "Opt-Out",
        text: "You can opt out of marketing communications at any time by clicking the unsubscribe link in any email or contacting us directly. This will not affect transactional communications related to your bookings.",
      },
      {
        subtitle: "GDPR Rights (EU Residents)",
        text: "If you are located in the European Union, you have additional rights under the General Data Protection Regulation (GDPR), including the right to restrict processing and the right to lodge a complaint with your local supervisory authority.",
      },
    ],
  },
  {
    id: "cookies",
    icon: <Bell className="h-5 w-5 text-sky-500" />,
    iconBg: "bg-sky-50 border-sky-100",
    title: "Cookies & Tracking",
    content: [
      {
        subtitle: "Essential Cookies",
        text: "We use essential cookies to keep you logged in, remember your preferences, and ensure the platform functions correctly. These cannot be disabled without affecting core functionality.",
      },
      {
        subtitle: "Analytics Cookies",
        text: "With your consent, we use analytics cookies (e.g. Google Analytics) to understand how visitors interact with our platform, helping us improve the user experience.",
      },
      {
        subtitle: "Managing Cookies",
        text: "You can manage or disable cookies through your browser settings at any time. Note that disabling certain cookies may affect the functionality of our services.",
      },
    ],
  },
  {
    id: "data-retention",
    icon: <RefreshCw className="h-5 w-5 text-indigo-500" />,
    iconBg: "bg-indigo-50 border-indigo-100",
    title: "Data Retention",
    content: [
      {
        subtitle: "Retention Period",
        text: "We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Booking records are typically retained for 7 years for tax and regulatory purposes.",
      },
      {
        subtitle: "Account Deletion",
        text: "If you delete your account, we will remove your personal data within 30 days, except where retention is required by law or for legitimate business purposes such as resolving disputes.",
      },
    ],
  },
  {
    id: "contact",
    icon: <Mail className="h-5 w-5 text-teal-500" />,
    iconBg: "bg-teal-50 border-teal-100",
    title: "Contact & Complaints",
    content: [
      {
        subtitle: "Data Controller",
        text: "AMD Global Travel, Charlottenstraße 17, 52070 Aachen, Germany is the data controller responsible for your personal information.",
      },
      {
        subtitle: "Get In Touch",
        text: "For any privacy-related questions, requests, or complaints, please contact our Data Protection team at team@amdglobal.org or via WhatsApp at +49 179 7296856. We aim to respond within 5 business days.",
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
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
            <span className="text-white/70 font-medium">Privacy Policy</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-white/50 text-sm font-medium tracking-wide uppercase">Legal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-white/55 text-sm sm:text-base max-w-xl leading-relaxed mb-6">
            Your privacy matters to us. This policy explains how AMD Global Travel collects, uses, and protects your personal information.
          </p>

          <div className="flex flex-wrap gap-4 text-xs text-white/40">
            <span>Last updated: <span className="text-white/70 font-medium">January 2025</span></span>
            <span>·</span>
            <span>Effective: <span className="text-white/70 font-medium">January 1, 2025</span></span>
            <span>·</span>
            <span>Jurisdiction: <span className="text-white/70 font-medium">Germany / EU (GDPR)</span></span>
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
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-3"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-semibold">Your data is safe with us.</span> AMD Global Travel is committed to protecting your privacy and complying with the EU General Data Protection Regulation (GDPR) and all applicable data protection laws.
              </p>
            </div>

            {SECTIONS.map((section) => (
              <div key={section.id} id={section.id}
                className="bg-white rounded-2xl border border-slate-200 p-6"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${section.iconBg}`}>
                    {section.icon}
                  </div>
                  <h2 className="text-base font-bold text-slate-800">{section.title}</h2>
                </div>

                {/* Content blocks */}
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
                This Privacy Policy may be updated from time to time. We will notify you of significant changes via email or a prominent notice on our website.
                Continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs">
                <a href="/contact" className="text-primary font-semibold hover:underline">Contact Us</a>
                <span className="text-slate-200">|</span>
                <a href="/legal/terms" className="text-primary font-semibold hover:underline">Terms of Service</a>
                <span className="text-slate-200">|</span>
                <a href="/legal/cookies" className="text-primary font-semibold hover:underline">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
