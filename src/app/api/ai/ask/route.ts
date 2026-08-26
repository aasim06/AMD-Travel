import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = (body.message || "").trim();
    const history = body.history || [];

    if (!userMessage) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // 1. Gather Live Database Context
    let umrahPackages: any[] = [];
    let carListings: any[] = [];
    let flightRoutes: any[] = [];

    try {
      [umrahPackages, carListings, flightRoutes] = await Promise.all([
        prisma.cMSPackage.findMany({
          where: { isActive: true },
          take: 6,
          orderBy: { createdAt: "desc" },
        }),
        prisma.carListing.findMany({
          where: { isActive: true },
          take: 6,
          orderBy: { createdAt: "desc" },
        }),
        prisma.flightRoute.findMany({
          where: { isActive: true },
          take: 6,
        }),
      ]);
    } catch (e) {
      console.warn("DB Context Fetching Notice:", e);
    }

    // 2. Build Rich System Prompt
    const systemPrompt = `
You are "AMD Global Travel AI Assistant", an expert, friendly, and highly intelligent travel consultant for AMD Global Travel agency.
You speak fluent **Roman Urdu** (e.g. "Aap ka khushamdeed! Main aap ki travel booking me madad kar sakta hoon"), English, and Urdu.

WEBSITE CATALOG & LIVE DATA CONTEXT:

--- UMRAH PACKAGES AVAILABLE ---
${
  umrahPackages.length > 0
    ? umrahPackages
        .map(
          (p) =>
            `- ${p.title} (${p.category}): Price $${p.price}, Duration: ${p.durationDays}, Makkah: ${p.makkahHotel} (${p.makkahNights}N), Madinah: ${p.madinahHotel} (${p.madinahNights}N), Includes: ${p.includes}`
        )
        .join("\n")
    : "- Economy Umrah Package ($1,299), Deluxe Umrah Package ($1,899), Executive 5-Star Umrah Package ($2,499)"
}

--- CAR RENTALS AVAILABLE ---
${
  carListings.length > 0
    ? carListings
        .map(
          (c) =>
            `- ${c.name} (${c.category}): Price $${c.pricePerDay}/day, Location: ${c.location}, Seats: ${c.seats}, Transmission: ${c.transmission}, Fuel: ${c.fuelType}`
        )
        .join("\n")
    : "- Toyota Fortuner SUV ($89/day), Hyundai Elantra ($45/day), Mercedes E-Class Luxury ($140/day)"
}

--- POPULAR FLIGHT ROUTES ---
${
  flightRoutes.length > 0
    ? flightRoutes
        .map(
          (r) =>
            `- ${r.origin} to ${r.destination} via ${r.airline}: Starting from $${r.basePrice}`
        )
        .join("\n")
    : "- Lahore (LHE) to Jeddah (JED), Karachi (KHI) to Dubai (DXB), Islamabad (ISB) to Riyadh (RUH), Frankfurt (FRA) to Lahore (LHE)"
}

--- VISA SERVICES ---
- Saudi Arabia Tourist & Umrah Visa
- UAE / Dubai Tourist Visa (30 Days / 60 Days)
- Schengen / European Tourist Visa Guidance
- UK & USA Visit Visa Assistance

INSTRUCTIONS FOR YOUR RESPONSE:
1. Always respond politely and concisely in **Roman Urdu** (or the user's language if they ask in English).
2. Answer the user's specific travel query accurately using the database context above.
3. Keep the tone enthusiastic, helpful, and professional.
4. Output your response as a valid JSON object matching EXACTLY this structure:
{
  "reply": "Your conversational text response here in Roman Urdu or English...",
  "suggestedCards": [
    {
      "title": "Title of relevant deal or package",
      "type": "umrah" | "car" | "flight" | "visa",
      "price": "$1,299" or "$45/day",
      "details": "Short highlight description",
      "actionUrl": "/search?from=LHE&to=JED" or "/umrah-packages" or "/cars" or "/visa"
    }
  ]
}

Only return the JSON object, with no markdown codeblock wrapper or extra text outside JSON.
`;

    // 3. If Gemini API Key is missing, generate smart fallback response
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        data: generateSmartFallback(userMessage, umrahPackages, carListings),
      });
    }

    // 4. Call Google Gemini API
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\nUser Question: "${userMessage}"` }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.warn("Gemini API HTTP Error:", geminiRes.status, errText);
      return NextResponse.json({
        success: true,
        data: generateSmartFallback(userMessage, umrahPackages, carListings),
      });
    }

    const geminiData = await geminiRes.json();
    const candidateText =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    try {
      const parsed = JSON.parse(candidateText);
      return NextResponse.json({
        success: true,
        data: parsed,
      });
    } catch {
      return NextResponse.json({
        success: true,
        data: {
          reply: candidateText || "Aap ka buhut shukriya! Main AMD Global Travel se aap ki booking me madad ke liye tayyar hoon.",
          suggestedCards: [],
        },
      });
    }
  } catch (error: any) {
    console.error("AI Assistant API Error:", error);
    return NextResponse.json({
      success: true,
      data: {
        reply: "Khushamdeed! Main AMD Global Travel AI Assistant hoon. Aap Flights, Umrah Packages, ya Rent a Car ke baaray me pooch saktay hain.",
        suggestedCards: [],
      },
    });
  }
}

function generateSmartFallback(msg: string, umrahs: any[], cars: any[]) {
  const query = msg.toLowerCase();

  if (query.includes("umrah") || query.includes("ziyarat") || query.includes("makkah")) {
    const pkg = umrahs[0] || { title: "Executive Umrah Package", price: 1499 };
    return {
      reply: `Aap ke liye hamara sab se best **${pkg.title || "Economy Umrah Package"}** available hai! Price $${pkg.price || 1299} se start hoti hai. Return flights, Makkah & Madinah 5-Star hotels aur Visa included hain.`,
      suggestedCards: [
        {
          title: pkg.title || "Umrah Packages Deals",
          type: "umrah",
          price: `$${pkg.price || 1299}`,
          details: "Makkah & Madinah Luxury Hotels + Return Flights",
          actionUrl: "/umrah-packages",
        },
      ],
    };
  }

  if (query.includes("car") || query.includes("gadi") || query.includes("rent")) {
    const car = cars[0] || { name: "Toyota Fortuner SUV", pricePerDay: 75 };
    return {
      reply: `Hamare paas Premium Rent a Car fleet active hai! Top choice: **${car.name}** starting from $${car.pricePerDay || 75}/day with free cancellation and full insurance.`,
      suggestedCards: [
        {
          title: car.name || "Rent a Car Fleet",
          type: "car",
          price: `$${car.pricePerDay || 75}/day`,
          details: "Automatic SUV - Unlimited Kilometers & Insurance",
          actionUrl: "/cars",
        },
      ],
    };
  }

  if (query.includes("visa") || query.includes("dubai") || query.includes("saudi")) {
    return {
      reply: "Hum Saudi Arabia Tourist/Umrah Visas aur UAE Dubai 30-Day/60-Day Visas Fast Track processing me offer kartay hain. Easy document upload system available hai!",
      suggestedCards: [
        {
          title: "Online Visa Application",
          type: "visa",
          price: "Fast Track",
          details: "Saudi & UAE Visa Express Approval",
          actionUrl: "/visa",
        },
      ],
    };
  }

  return {
    reply: "Aap ka shukriya! Main AMD Global Travel AI Assistant hoon. Aap mugh se Flights, Umrah Packages, Rent a Car, ya Visit Visa ke baaray me Roman Urdu me kuch bhi pooch saktay hain!",
    suggestedCards: [
      {
        title: "Flight Search & Booking",
        type: "flight",
        price: "Best Deals",
        details: "Instant PNR Generation & Amadeus Search",
        actionUrl: "/search?from=LHE&to=JED",
      },
      {
        title: "Umrah Special Packages",
        type: "umrah",
        price: "$1,299+",
        details: "All-Inclusive Packages with Hotel & Transport",
        actionUrl: "/umrah-packages",
      },
    ],
  };
}
