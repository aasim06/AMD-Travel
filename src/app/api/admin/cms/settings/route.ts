import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedData, setCachedData, invalidateCache } from "@/lib/api-cache";

const DEFAULT_CMS_SETTINGS = {
  // Global Theme Color
  themePrimaryColor: "24 100% 62%",

  // Hero Section
  heroTitle: "Compare Flights From",
  heroSubtitle: "Find affordable domestic & international flights with instant e-ticket issuance.",
  typewriterWords: "100s Of Airlines, Best Ticket Deals, Unbeatable Fares",

  // Popular Flights Section
  popularFlightsTitle: "Popular Flights",
  popularFlightsSubtitle: "Check these popular routes — great prices, updated daily.",

  // Why Choose Us Section
  whyChooseUsTitle: "Travel With Confidence",
  whyChooseUsSubtitle: "Experience seamless booking, transparent pricing, and 24/7 dedicated support.",
  card1Title: "Best Price Guarantee",
  card1Desc: "Real-time fare comparisons with complete price transparency and zero hidden booking fees.",
  card2Title: "24/7 Dedicated Support",
  card2Desc: "Our travel specialists are always available via WhatsApp and hotline to assist with any itinerary changes.",
  card3Title: "Instant E-Ticket Confirmation",
  card3Desc: "Receive fully validated PNR and digital e-tickets directly to your inbox in seconds.",
  card4Title: "Flexible Bookings",
  card4Desc: "Enjoy stress-free trip modifications and hassle-free refund processing for eligible flights.",

  // Special Services Section
  specialServicesTitle: "Tailored Travel Solutions",
  specialServicesSubtitle: "From sacred pilgrimages to global visa assistance, explore our specialized travel offerings.",
  umrahCardTitle: "Spiritual Journeys Tailored For You",
  umrahCardSubtitle: "Experience a seamless and serene pilgrimage with fully customized Umrah services.",
  visaCardTitle: "Hassle-Free Visa Processing",
  visaCardSubtitle: "Fast-track your global travels with expert visa guidance and reliable support.",

  // Custom Quote Banner
  quoteTitle: "Get a Custom Flight & Travel Quote",
  quoteSubtitle: "Tell us your preferred dates, destinations, and budget — we'll arrange the best flight deals for your journey.",
  whatsappNumber: "+4917972968560",
  contactEmail: "team@amdglobal.org",

  // Footer & Address
  officeAddress: "Charlottenstraße 17, 52070 Aachen, Germany",
  officePhone: "+49 179 72968560",
  officeEmail: "team@amdglobal.org",
  copyrightText: "© 2026 AMD Global Travel. All rights reserved.",
};

// GET /api/admin/cms/settings
export async function GET() {
  try {
    const cached = getCachedData<typeof DEFAULT_CMS_SETTINGS>("cms_settings");
    if (cached) {
      return NextResponse.json({ success: true, settings: cached });
    }

    const setting = await prisma.systemSetting.findUnique({
      where: { key: "public_website_cms" },
    });

    if (setting && setting.value) {
      const parsed = JSON.parse(setting.value);
      const merged = { ...DEFAULT_CMS_SETTINGS, ...parsed };
      setCachedData("cms_settings", merged, 60);
      return NextResponse.json({ success: true, settings: merged });
    }

    setCachedData("cms_settings", DEFAULT_CMS_SETTINGS, 60);
    return NextResponse.json({ success: true, settings: DEFAULT_CMS_SETTINGS });
  } catch (error) {
    console.error("GET /api/admin/cms/settings error:", error);
    return NextResponse.json({ success: true, settings: DEFAULT_CMS_SETTINGS });
  }
}

// POST /api/admin/cms/settings
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updatedSettings = { ...DEFAULT_CMS_SETTINGS, ...body };
    const valueString = JSON.stringify(updatedSettings);

    await prisma.systemSetting.upsert({
      where: { key: "public_website_cms" },
      update: { value: valueString },
      create: { id: "public_website_cms", key: "public_website_cms", value: valueString },
    });

    invalidateCache("cms_settings");
    setCachedData("cms_settings", updatedSettings, 60);

    return NextResponse.json({
      success: true,
      message: "Website CMS content & theme color saved to PostgreSQL Database!",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("POST /api/admin/cms/settings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save CMS settings" },
      { status: 500 }
    );
  }
}
