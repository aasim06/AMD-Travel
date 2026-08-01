import { ArrowRight, Cookie, Settings, BarChart2, Shield, Bell, Globe, Mail, ToggleLeft } from "lucide-react";

const COOKIE_TYPES = [
  {
    name: "Essential Cookies",
    required: true,
    color: "bg-blue-500",
    description: "Always active — required for the platform to function.",
    examples: [
      { name: "session_id", purpose: "Keeps you logged in during your visit", duration: "Session" },
      { name: "csrf_token", purpose: "Protects against cross-site request forgery attacks", duration: "Session" },
      { name: "currency_pref", purpose: "Remembers your selected currency", duration: "1 year" },
      { name: "cookie_consent", purpose: "Stores your cookie preferences", duration: "1 year" },
    ],
  },
  {
    name: "Analytics Cookies",
    required: false,
    color: "bg-violet-500",
    description: "Help us understand how visitors use our platform.",
    examples: [
      { name: "_ga", purpose: "Google Analytics — tracks unique visitors", duration: "2 years" },
      { name: "_gid", purpose: "Google Analytics — distinguishes users", duration: "24 hours" },
      { name: "_gat", purpose: "Google Analytics — throttles request rate", duration: "1 minute" },
    ],
  },
  {
    name: "Functional Cookies",
    required: false,
    color: "bg-emerald-500",
    description: "Enable enhanced features and personalisation.",
    examples: [
      { name: "recent_searches", purpose: "Remembers your recent flight searches", duration: "30 days" },
      { name: "lang_pref", purpose: "Stores your language preference", duration: "1 year" },
      { name: "passenger_details", purpose: "Pre-fills passenger info for faster booking", duration: "90 days" },
    ],
  },
  {
    name: "Marketing Cookies",
    required: false,
    color: "bg-amber-500",
    description: "Used to deliver relevant advertisements.",
    examples: [
      { name: "_fbp", purpose: "Facebook Pixel — tracks conversions from ads", duration: "90 days" },
      { name: "ads/ga-audiences", purpose: "Google Ads — remarketing audiences", duration: "Session" },
    ],
  },
];

const SECTIONS = [
  {
    id: "what-are-cookies",
    icon: <Cookie className="h-5 w-5 text-amber-500" />,
    iconBg: "bg-amber-50 border-amber-100",
    title: "What Are Cookies?",
    content: [
      {
        subtitle: "Definition",
        text: "Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.",
      },
      {
        subtitle: "How They Work",
        text: "When you visit AMD Global Travel, our server sends a cookie to your browser, which stores it on your device. On your next visit, your browser sends the cookie back to our server, allowing us to recognise you and remember your preferences.",
      },
      {
        subtitle: "Similar Technologies",
        text: "In addition to cookies, we may use similar tracking technologies such as web beacons, pixel tags, and local storage to collect information about your interactions with our platform.",
      },
    ],
  },
  {
    id: "cookie-types",
    icon: <Settings className="h-5 w-5 text-blue-500" />,
    iconBg: "bg-blue-50 border-blue-100",
    title: "Types of Cookies We Use",
    isCookieTable: true,
  },
  {
    id: "analytics",
    icon: <BarChart2 className="h-5 w-5 text-violet-500" />,
    iconBg: "bg-violet-50 border-violet-100",
    title: "Analytics & Performance",
    content: [
      {
        subtitle: "Google Analytics",
        text: "We use Google Analytics to understand how visitors interact with our platform. This helps us identify popular pages, understand user journeys, and improve our services. Google Analytics data is anonymised and aggregated.",
      },
      {
        subtitle: "Data Collected",
        text: "Analytics cookies collect information such as pages visited, time spent on each page, referring websites, browser type, and device information. This data does not identify you personally.",
      },
      {
        subtitle: "Opting Out",
        text: "You can opt out of Google Analytics tracking by installing the Google Analytics Opt-out Browser Add-on available at tools.google.com/dlpage/gaoptout.",
      },
    ],
  },
  {
    id: "third-party",
    icon: <Globe className="h-5 w-5 text-emerald-500" />,
    iconBg: "bg-emerald-50 border-emerald-100",
    title: "Third-Party Cookies",
    content: [
      {
        subtitle: "Payment Providers",
        text: "Our payment partners (Stripe, PayPal) may set cookies to process payments securely and prevent fraud. These cookies are governed by the respective provider's privacy and cookie policies.",
      },
      {
        subtitle: "Social Media",
        text: "If you share content from our platform on social media, those platforms may set cookies on your device. AMD Global Travel has no control over these third-party cookies.",
      },
      {
        subtitle: "Advertising Partners",
        text: "With your consent, we work with advertising partners to show you relevant travel offers on other websites. These partners may use cookies to track your interactions with our ads.",
      },
    ],
  },
  {
    id: "managing-cookies",
    icon: <ToggleLeft className="h-5 w-5 text-sky-500" />,
    iconBg: "bg-sky-50 border-sky-100",
    title: "Managing Your Cookie Preferences",
    content: [
      {
        subtitle: "Cookie Banner",
        text: "When you first visit AMD Global Travel, you will be presented with a cookie consent banner. You can choose to accept all cookies, reject non-essential cookies, or customise your preferences.",
      },
      {
        subtitle: "Browser Settings",
        text: "You can also manage cookies through your browser settings. Most browsers allow you to view, delete, and block cookies. Note that blocking essential cookies may affect the functionality of our platform.",
      },
      {
        subtitle: "Browser-Specific Instructions",
        text: "Chrome: Settings → Privacy and Security → Cookies. Firefox: Options → Privacy & Security. Safari: Preferences → Privacy. Edge: Settings → Cookies and Site Permissions.",
      },
      {
        subtitle: "Do Not Track",
        text: "Some browsers offer a 'Do Not Track' feature. AMD Global Travel respects Do Not Track signals where technically feasible, though not all third-party services may honour this setting.",
      },
    ],
  },
  {
    id: "your-rights",
    icon: <Shield className="h-5 w-5 text-rose-500" />,
    iconBg: "bg-rose-50 border-rose-100",
    title: "Your Rights (GDPR)",
    content: [
      {
        subtitle: "Consent",
        text: "Under GDPR, we require your explicit consent before placing non-essential cookies on your device. You can withdraw your consent at any time by updating your cookie preferences.",
      },
      {
        subtitle: "Right to Object",
        text: "You have the right to object to the use of cookies for profiling or direct marketing purposes. You can exercise this right through our cookie preference centre or by contacting us directly.",
      },
      {
        subtitle: "Data Subject Rights",
        text: "For information about your broader data protection rights, including access, rectification, and erasure, please refer to our Privacy Policy.",
      },
    ],
  },
  {
    id: "updates",
    icon: <Bell className="h-5 w-5 text-indigo-500" />,
    iconBg: "bg-indigo-50 border-indigo-100",
    title: "Policy Updates",
    content: [
      {
        subtitle: "Changes to This Policy",
        text: "We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business practices. We will notify you of significant changes via a notice on our website.",
      },
      {
        subtitle: "Version History",
        text: "This is version 1.0 of our Cookie Policy, effective January 1, 2025. Previous versions are available upon request.",
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
        subtitle: "Cookie Enquiries",
        text: "If you have any questions about our use of cookies, please contact us at team@amdglobal.org or via WhatsApp at +49 179 7296856.",
      },
      {
        subtitle: "Registered Address",
        text: "AMD Global Travel, Charlottenstraße 17, 52070 Aachen, Germany.",
      },
    ],
  },
];

export default function CookiePolicyPage() {
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
            <span className="text-white/70 font-medium">Cookie Policy</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
              <Cookie className="h-5 w-5 text-white" />
            </div>
            <span className="text-white/50 text-sm font-medium tracking-wide uppercase">Legal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
            Cookie Policy
          </h1>
          <p className="text-white/55 text-sm sm:text-base max-w-xl leading-relaxed mb-6">
            This policy explains how AMD Global Travel uses cookies and similar technologies to improve your experience on our platform.
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
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-3">
              <Cookie className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-semibold">We value your privacy.</span> We only use cookies that are necessary for our platform to function or that you have explicitly consented to. You can manage your preferences at any time.
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

                {section.isCookieTable ? (
                  <div className="space-y-5">
                    {COOKIE_TYPES.map((type) => (
                      <div key={type.name}>
                        <div className="flex items-center gap-2.5 mb-3">
                          <span className={`h-2 w-2 rounded-full ${type.color} shrink-0`} />
                          <span className="text-sm font-semibold text-slate-700">{type.name}</span>
                          {type.required && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Always On</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{type.description}</p>
                        <div className="rounded-xl border border-slate-100 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-left px-3 py-2 font-semibold text-slate-500">Cookie Name</th>
                                <th className="text-left px-3 py-2 font-semibold text-slate-500">Purpose</th>
                                <th className="text-left px-3 py-2 font-semibold text-slate-500 whitespace-nowrap">Duration</th>
                              </tr>
                            </thead>
                            <tbody>
                              {type.examples.map((ex, i) => (
                                <tr key={ex.name} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                  <td className="px-3 py-2 font-mono text-[11px] text-primary font-medium">{ex.name}</td>
                                  <td className="px-3 py-2 text-slate-500">{ex.purpose}</td>
                                  <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{ex.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {section.content?.map((block) => (
                      <div key={block.subtitle}>
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">{block.subtitle}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{block.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p className="text-xs text-slate-400 leading-relaxed">
                This Cookie Policy may be updated from time to time. Continued use of our services constitutes acceptance of the updated policy.
              </p>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs">
                <a href="/contact" className="text-primary font-semibold hover:underline">Contact Us</a>
                <span className="text-slate-200">|</span>
                <a href="/legal/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</a>
                <span className="text-slate-200">|</span>
                <a href="/legal/terms" className="text-primary font-semibold hover:underline">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
