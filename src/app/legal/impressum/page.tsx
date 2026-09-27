import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileText,
  Mail,
  Phone,
  Scale,
  ShieldCheck,
  MapPin,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Impressum (Legal Notice) | AMD Global Travel",
  description:
    "Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz) für AMD Global Travel / AMD Mobility Solutions UG.",
};

const SECTIONS = [
  {
    id: "angaben-ddg",
    icon: <Building2 className="h-5 w-5 text-blue-500" />,
    iconBg: "bg-blue-50 border-blue-100",
    title: "Angaben gemäß § 5 DDG / Company Information",
    content: [
      {
        subtitle: "Unternehmensname (Company Legal Name)",
        text: "AMD Mobility Solutions UG (haftungsbeschränkt)",
      },
      {
        subtitle: "Geschäftsbezeichnung (Trade Brand)",
        text: "AMD Global Travel (www.amdglobal.de)",
      },
      {
        subtitle: "Anschrift (Registered Office Address)",
        text: "Kaiserstraße 61, 60329 Frankfurt am Main, Deutschland (Germany)",
      },
    ],
  },
  {
    id: "register-steuer",
    icon: <FileCheck className="h-5 w-5 text-emerald-500" />,
    iconBg: "bg-emerald-50 border-emerald-100",
    title: "Registereintrag & Steuernummer (Registration & Tax ID)",
    content: [
      {
        subtitle: "Handelsregister (Commercial Register)",
        text: "Eingetragen im Handelsregister des Amtsgerichts Frankfurt am Main",
      },
      {
        subtitle: "Registernummer (HRB)",
        text: "HRB 144523",
      },
      {
        subtitle: "Umsatzsteuer-Identifikationsnummer (USt-IdNr.)",
        text: "DE4651 13492 (gemäß § 27 a Umsatzsteuergesetz)",
      },
      {
        subtitle: "IATA-Akkreditierung (IATA Accreditation)",
        text: "Akkreditierte IATA-Reiseagentur (International Air Transport Association Accredited Agent) für autorisierte Flugreservierungen und GDS-Ticketierung.",
      },
    ],
  },
  {
    id: "kontakt",
    icon: <Phone className="h-5 w-5 text-indigo-500" />,
    iconBg: "bg-indigo-50 border-indigo-100",
    title: "Kontakt (Contact Information)",
    content: [
      {
        subtitle: "Telefon (Phone)",
        text: "+49 69 94548001",
      },
      {
        subtitle: "E-Mail",
        text: "team@amdglobal.org / support@amdglobal.de",
      },
      {
        subtitle: "Website",
        text: "https://amdglobal.de",
      },
    ],
  },
  {
    id: "streitbeilegung",
    icon: <Scale className="h-5 w-5 text-violet-500" />,
    iconBg: "bg-violet-50 border-violet-100",
    title: "Streitbeilegung (Dispute Resolution)",
    content: [
      {
        subtitle: "EU-Streitschlichtung (EU Online Dispute Resolution)",
        text: "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/. Unsere E-Mail-Adresse finden Sie oben im Impressum.",
      },
      {
        subtitle: "Verbraucherstreitbeilegung / Universalschlichtungsstelle",
        text: "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
      },
    ],
  },
  {
    id: "haftung",
    icon: <ShieldCheck className="h-5 w-5 text-amber-500" />,
    iconBg: "bg-amber-50 border-amber-100",
    title: "Haftungsausschluss (Disclaimer)",
    content: [
      {
        subtitle: "Haftung für Inhalte (Liability for Content)",
        text: "Als Diensteanbieter sind wir gemäß § 7 Abs.1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.",
      },
      {
        subtitle: "Haftung für Links (Liability for External Links)",
        text: "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.",
      },
      {
        subtitle: "Urheberrecht (Copyright)",
        text: "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.",
      },
    ],
  },
];

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* ── Hero ── */}
      <div
        className="w-full border-b border-[#0B1D3A] relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at top right, #1e4080 0%, #0B1D3A 55%, #060f22 100%)",
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 pt-12 pb-12 sm:pt-16 sm:pb-16 relative">
          <div className="flex items-center gap-2 text-white/40 text-xs mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ArrowRight className="h-3 w-3" />
            <span>Legal</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-white/70 font-medium">Impressum</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-white/50 text-sm font-medium tracking-wide uppercase">
              Legal Disclosure
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
            Impressum (Legal Notice)
          </h1>
          <p className="text-white/55 text-sm sm:text-base max-w-xl leading-relaxed mb-6">
            Angaben gemäß § 5 DDG (ehemals TMG) / Legal provider identification according to German Telemedia and Digital Services laws.
          </p>

          <div className="flex flex-wrap gap-4 text-xs text-white/40">
            <span>
              Company: <span className="text-white/70 font-medium">AMD Mobility Solutions UG</span>
            </span>
            <span>·</span>
            <span>
              Register: <span className="text-white/70 font-medium">HRB 144523</span>
            </span>
            <span>·</span>
            <span>
              USt-IdNr.: <span className="text-white/70 font-medium">DE4651 13492</span>
            </span>
            <span>·</span>
            <span>
              Jurisdiction: <span className="text-white/70 font-medium">Frankfurt am Main, Germany</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ── Sticky Table of Contents ── */}
          <aside className="hidden lg:block lg:col-span-1">
            <div
              className="sticky top-24 bg-white rounded-2xl border border-slate-200 p-4"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Contents
              </p>
              <nav className="space-y-0.5">
                {SECTIONS.map((s, i) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors group"
                  >
                    <span className="text-[10px] font-bold text-slate-300 group-hover:text-primary/50 w-4 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="line-clamp-1">{s.title.split("/")[0]}</span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── Sections ── */}
          <div className="lg:col-span-3 space-y-4">
            {/* Quick Summary Card */}
            <div
              className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex gap-3.5"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              <FileText className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-emerald-900 leading-relaxed space-y-1">
                <p className="font-semibold text-emerald-950">
                  Offizielle Unternehmensangaben (Official Corporate Details):
                </p>
                <p>
                  <strong>Firma:</strong> AMD Mobility Solutions UG (haftungsbeschränkt)
                </p>
                <p>
                  <strong>Handelsregister:</strong> Amtsgericht Frankfurt am Main, HRB 144523
                </p>
                <p>
                  <strong>USt-IdNr.:</strong> DE4651 13492
                </p>
                <p>
                  <strong>IATA-Akkreditierung:</strong> Offiziell lizensierte IATA-Agentur (Accredited Agent)
                </p>
                <p>
                  <strong>Sitz der Gesellschaft:</strong> Kaiserstraße 61, 60329 Frankfurt am Main, Deutschland
                </p>
              </div>
            </div>

            {SECTIONS.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 scroll-mt-24"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${section.iconBg}`}
                  >
                    {section.icon}
                  </div>
                  <h2 className="text-base font-bold text-slate-800">{section.title}</h2>
                </div>

                <div className="space-y-4">
                  {section.content.map((block) => (
                    <div key={block.subtitle} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        {block.subtitle}
                      </h3>
                      <p className="text-sm font-medium text-slate-800 leading-relaxed select-all">
                        {block.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Footer note & Cross links */}
            <div
              className="bg-white rounded-2xl border border-slate-200 p-5 text-center"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <p className="text-xs text-slate-400 leading-relaxed">
                Diese Angaben gelten für sämtliche unter der Domain{" "}
                <span className="font-semibold text-slate-600">amdglobal.de</span> betriebenen Telemedien-Dienste sowie damit verbundene Social-Media-Kanäle.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
                <Link href="/contact" className="text-primary font-semibold hover:underline">
                  Contact Us
                </Link>
                <span className="text-slate-200">|</span>
                <Link href="/legal/privacy" className="text-primary font-semibold hover:underline">
                  Privacy Policy (Datenschutz)
                </Link>
                <span className="text-slate-200">|</span>
                <Link href="/legal/terms" className="text-primary font-semibold hover:underline">
                  Terms of Service (AGB)
                </Link>
                <span className="text-slate-200">|</span>
                <Link href="/legal/refunds" className="text-primary font-semibold hover:underline">
                  Refund Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
