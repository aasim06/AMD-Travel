export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "AMD Global Travel",
  shortName: "AMD Travel",
  tagline: "Fly Smarter, Travel Further",
  description:
    "AMD Global Travel is your premium flight aggregator — compare fares, book flights, and manage trips worldwide with confidence.",
  url: "https://www.amdglobaltravel.com",

  logo: {
    icon: "/brand/logo-icon.svg",
    full: "/brand/logo-full.svg",
    fullDark: "/brand/logo-full-dark.svg",
    favicon: "/favicon.ico",
    ogImage: "/brand/og-image.jpg",
  },

  contact: {
    email: "support@amdglobaltravel.com",
    phone: "+1 (800) 555-0192",
    whatsapp: "+18005550192", // digits only, for wa.me links
    address: {
      line1: "1 Aviation Plaza",
      city: "Dubai",
      country: "United Arab Emirates",
    },
  },

  social: {
    instagram: "https://instagram.com/amdglobaltravel",
    facebook: "https://facebook.com/amdglobaltravel",
    twitter: "https://x.com/amdglobaltravel",
    linkedin: "https://linkedin.com/company/amdglobaltravel",
  },

  locale: {
    defaultCurrency: "EUR",
    supportedCurrencies: ["EUR", "USD"],
    defaultLanguage: "en",
    supportedLanguages: ["en", "ar", "fr", "de"],
  },

  theme: {
    defaultMode: "light" as "light" | "dark" | "system",
    radius: "0.75rem",
    colors: {
      primary: "24 100% 62%", // #ff8a3d Warm Orange
      secondary: "38 92% 50%", // Warm Amber
    },
  },

  nav: {
    main: [
      { label: "Flights", href: "/flights" },
      { label: "Umrah Packages", href: "/umrah-packages" },
      { label: "Tour Deals", href: "/tour-deals" },
      { label: "Visa Services", href: "/visa-services" },
    ],
    footerQuickLinks: [
      { label: "Flights", href: "/" },
      { label: "Umrah Packages", href: "/umrah-packages" },
      { label: "Tour Deals", href: "/tour-deals" },
      { label: "Visa Services", href: "/visa" },
      { label: "My Bookings", href: "/bookings" },
    ],
    footerLegal: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Refund Policy", href: "/legal/refunds" },
      { label: "Cookie Policy", href: "/legal/cookies" },
    ],
  },

  payments: {
    accepted: ["Visa", "Mastercard", "American Express", "PayPal", "Apple Pay"],
  },
} as const;
