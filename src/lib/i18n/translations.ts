export type Language = "en" | "de";

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header & Navigation
    "nav.flights": "Flights",
    "nav.hotels": "Hotels & Stays",
    "nav.cars": "Rent a Car",
    "nav.tours": "Tour Packages",
    "nav.umrah": "Umrah",
    "nav.visa": "Visa",
    "nav.explore": "Explore Destinations",
    "nav.myBookings": "My Bookings",
    "nav.contact": "Contact Us",
    "nav.signIn": "Sign In",

    // Hero Section Headlines & Tabs
    "hero.flightsTitle": "Compare Flights From",
    "hero.visaTitle": "Fast & Hassle-Free Visa Services",
    "hero.umrahTitle": "Your Sacred Journey Starts Here",
    "hero.carsTitle": "Rent a Car Anywhere, Anytime",
    "hero.searchFlights": "Search Flights",
    "hero.roundTrip": "Round-trip",
    "hero.oneWay": "One-way",
    "hero.multiCity": "Multi-city",
    "hero.passengers": "1 Adult, Economy",
    "hero.noBags": "No bags",
    "hero.whereFrom": "Where from?",
    "hero.whereTo": "Where to?",
    "hero.departureReturn": "Departure — Return",

    // Popular Flights Section
    "popular.title": "Popular Flights",
    "popular.subtitle": "Check these popular routes — great prices, updated daily.",
    "popular.viewAll": "View all routes",
    "popular.bookNow": "Book Now",

    // Why Choose Us
    "why.title": "Travel With Confidence",
    "why.subtitle": "Experience seamless booking, transparent pricing, and 24/7 dedicated support.",
    "why.card1Title": "Best Price Guarantee",
    "why.card1Desc": "Real-time fare comparisons with complete price transparency and zero hidden booking fees.",
    "why.card2Title": "24/7 Dedicated Support",
    "why.card2Desc": "Our travel specialists are always available via WhatsApp and hotline to assist with any itinerary changes.",
    "why.card3Title": "Instant E-Ticket Confirmation",
    "why.card3Desc": "Receive fully validated PNR and digital e-tickets directly to your inbox in seconds.",
    "why.card4Title": "Flexible Bookings",
    "why.card4Desc": "Enjoy stress-free trip modifications and hassle-free refund processing for eligible flights.",

    // Special Services
    "services.title": "Tailored Travel Solutions",
    "services.subtitle": "From sacred pilgrimages to global visa assistance, explore our specialized travel offerings.",
    "services.umrahTitle": "Spiritual Journeys Tailored For You",
    "services.umrahSubtitle": "Experience a seamless and serene pilgrimage with fully customized Umrah services.",
    "services.visaTitle": "Hassle-Free Visa Processing",
    "services.visaSubtitle": "Fast-track your global travels with expert visa guidance and reliable support.",
    "services.exploreUmrah": "Explore Umrah Packages",
    "services.applyVisa": "Apply For Visa",

    // Custom Quote Banner & Contact
    "quote.title": "Get a Custom Flight & Travel Quote",
    "quote.subtitle": "Tell us your preferred dates, destinations, and budget — we'll arrange the best flight deals for your journey.",
    "quote.getQuote": "Get Free Quote",
    "quote.needHelp": "Need Help?",

    // Footer
    "footer.rights": "All rights reserved.",
    "footer.quickLinks": "Quick Links",
    "footer.company": "Company",
    "footer.legal": "Legal & Privacy",
  },
  de: {
    // Header & Navigation
    "nav.flights": "Flüge",
    "nav.hotels": "Hotels & Unterkünfte",
    "nav.cars": "Mietwagen",
    "nav.tours": "Reisepakete",
    "nav.umrah": "Umrah-Pakete",
    "nav.visa": "Visum",
    "nav.explore": "Reiseziele Entdecken",
    "nav.myBookings": "Meine Buchungen",
    "nav.contact": "Kontakt aufnehmen",
    "nav.signIn": "Anmelden",

    // Hero Section Headlines & Tabs
    "hero.flightsTitle": "Flüge Vergleichen Von",
    "hero.visaTitle": "Schneller & Einfacher Visa-Service",
    "hero.umrahTitle": "Ihre Heilige Reise Beginnt Hier",
    "hero.carsTitle": "Mietwagen Überall & Jederzeit",
    "hero.searchFlights": "Flüge Suchen",
    "hero.roundTrip": "Hin- und Rückflug",
    "hero.oneWay": "Nur Hinflug",
    "hero.multiCity": "Multistopp",
    "hero.passengers": "1 Erwachsener, Economy",
    "hero.noBags": "Kein Gepäck",
    "hero.whereFrom": "Abflugort?",
    "hero.whereTo": "Zielort?",
    "hero.departureReturn": "Hinflug — Rückflug",

    // Popular Flights Section
    "popular.title": "Beliebte Flugverbindungen",
    "popular.subtitle": "Beliebte Flugrouten zu besten Preisen — täglich aktualisiert.",
    "popular.viewAll": "Alle Routen anzeigen",
    "popular.bookNow": "Jetzt Buchen",

    // Why Choose Us
    "why.title": "Mit Vertrauen Reisen",
    "why.subtitle": "Erleben Sie nahtlose Buchung, transparente Preise und 24/7 Support.",
    "why.card1Title": "Bestpreis-Garantie",
    "why.card1Desc": "Echtzeit-Tarifvergleiche mit vollständiger Preistransparenz ohne versteckte Gebühren.",
    "why.card2Title": "24/7 Kundenservice",
    "why.card2Desc": "Unsere Reisespezialisten stehen Ihnen rund um die Uhr per WhatsApp & Hotline zur Verfügung.",
    "why.card3Title": "Sofortige E-Ticket Bestätigung",
    "why.card3Desc": "Erhalten Sie Ihre bestätigten PNR- und E-Tickets direkt per E-Mail in wenigen Sekunden.",
    "why.card4Title": "Flexible Buchungsoptionen",
    "why.card4Desc": "Genießen Sie stressfreie Umbuchungen und unkomplizierte Rückerstattungen für Ihre Flüge.",

    // Special Services
    "services.title": "Maßgeschneiderte Reiseangebote",
    "services.subtitle": "Von heiligen Pilgerreisen bis zur Visabearbeitung – entdecken Sie unsere maßgeschneiderten Angebote.",
    "services.umrahTitle": "Maßgeschneiderte Umrah-Pilgerreisen",
    "services.umrahSubtitle": "Erleben Sie eine reibungslose und entspannte Pilgerreise mit individuellen Paketen.",
    "services.visaTitle": "Visabearbeitung Ohne Stress",
    "services.visaSubtitle": "Reisen Sie weltweit schneller mit unserer professionellen Visa-Beratung.",
    "services.exploreUmrah": "Umrah-Pakete Entdecken",
    "services.applyVisa": "Visum Beantragen",

    // Custom Quote Banner & Contact
    "quote.title": "Individuelles Reiseangebot Anfordern",
    "quote.subtitle": "Nennen Sie uns Ihr Reiseziel, Wunschdatum und Budget – wir finden die besten Flugangebote für Sie.",
    "quote.getQuote": "Kostenloses Angebot",
    "quote.needHelp": "Brauchen Sie Hilfe?",

    // Footer
    "footer.rights": "Alle Rechte vorbehalten.",
    "footer.quickLinks": "Schnellzugriff",
    "footer.company": "Unternehmen",
    "footer.legal": "Rechtliches & Datenschutz",
  },
};

export function getTranslation(lang: Language, key: string, fallback?: string): string {
  if (translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  if (translations.en[key]) {
    return translations.en[key];
  }
  return fallback || key;
}
