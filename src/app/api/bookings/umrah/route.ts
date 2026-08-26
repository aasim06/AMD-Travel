import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendUmrahBookingNotification } from "@/lib/emailService";
import { sendUmrahBookingWhatsApp } from "@/lib/whatsappService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      packageId,
      packageTitle,
      packageCategory,
      packageImage,
      departureCity,
      departureDate,
      adults = 1,
      children = 0,
      infants = 0,
      totalPilgrims = 1,
      totalAmount,
      currency = "EUR",
      customerName,
      customerEmail,
      customerPhone,
      passportNo,
      notes,
    } = body;

    if (!packageTitle || !customerName || !customerPhone || !departureDate) {
      return NextResponse.json(
        { success: false, error: "Missing required Umrah booking information" },
        { status: 400 }
      );
    }

    // Generate unique Umrah PNR reference code
    const generatedPnr = `AMD-UMRAH-${Math.floor(10000 + Math.random() * 90000)}`;

    // ⚡ INSTANT DISPATCH (0ms Delay): Fire WhatsApp notification IMMEDIATELY before DB roundtrips!
    sendUmrahBookingWhatsApp({
      pnr: generatedPnr,
      pilgrimName: customerName,
      packageTitle,
      packagePhotoUrl: packageImage || body.packagePhotoUrl,
      departureCity: departureCity || "Frankfurt, Germany",
      departureDate: new Date(departureDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      totalAmount,
      currency,
      phone: customerPhone,
    }).catch((waErr) => console.error("[Umrah WhatsApp Async Error]:", waErr));

    // Send Umrah Reservation email notification asynchronously
    sendUmrahBookingNotification({
      pnrNumber: generatedPnr,
      customerName,
      customerEmail,
      customerPhone,
      packageTitle,
      packageCategory: packageCategory || "Standard",
      departureCity: departureCity || "Frankfurt, Germany",
      departureDate: new Date(departureDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      totalPilgrims,
      totalAmount,
      currency,
      status: "CONFIRMED",
    }).catch((emailErr) => console.error("[Umrah Email Async Error]:", emailErr));

    // 1. Ensure User exists or is created in PostgreSQL
    let user;
    if (customerEmail) {
      user = await prisma.user.upsert({
        where: { email: customerEmail },
        update: { name: customerName, phone: customerPhone },
        create: {
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
          role: "CUSTOMER",
        },
      });
    }

    // Extract first and last name from customerName
    const nameParts = customerName.trim().split(" ");
    const firstName = nameParts[0] || customerName;
    const lastName = nameParts.slice(1).join(" ") || "Customer";

    // 2. Create Umrah Booking record in Database
    const newBooking = await prisma.booking.create({
      data: {
        pnr: generatedPnr,
        userId: user?.id,
        type: "umrah",
        origin: departureCity || "Frankfurt, Germany",
        destination: packageTitle,
        airline: "AMD Global Umrah Services",
        flightNumber: `${packageCategory || "Umrah Package"} (${totalPilgrims} Pilgrims)`,
        departureDate: new Date(departureDate),
        totalAmount: parseFloat(totalAmount),
        currency: currency || "EUR",
        status: "CONFIRMED",
        passengers: {
          create: [
            {
              firstName,
              lastName,
              email: customerEmail || null,
              phone: customerPhone || null,
              passportNo: passportNo || null,
              type: "PRIMARY_PILGRIM",
            },
          ],
        },
        payment: {
          create: {
            amount: parseFloat(totalAmount),
            currency: currency || "EUR",
            gateway: "Pay on Arrival / WhatsApp",
            transactionId: `UMRAH-RESERVATION-${Date.now()}`,
            status: "PENDING",
          },
        },
      },
      include: {
        passengers: true,
        payment: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Umrah package reservation saved successfully!",
      pnr: generatedPnr,
      booking: newBooking,
    });
  } catch (error: any) {
    console.error("POST /api/bookings/umrah error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create Umrah booking" },
      { status: 500 }
    );
  }
}
