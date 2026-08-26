import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCarBookingNotification } from "@/lib/emailService";
import { sendCarBookingWhatsApp } from "@/lib/whatsappService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      carId,
      carName,
      carCategory,
      carImage,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      dropoffDate,
      totalDays,
      totalAmount,
      currency = "EUR",
      customerName,
      customerEmail,
      customerPhone,
      driverLicense,
      notes,
    } = body;

    const cleanCustomerName = (customerName || "").trim();
    const cleanCustomerPhone = (customerPhone || "").trim();
    const cleanCarName = (carName || "").trim();
    const cleanPickupLocation = (pickupLocation || "Frankfurt Airport").trim();

    if (!cleanCarName || !cleanCustomerName || !cleanCustomerPhone || !pickupDate || !dropoffDate) {
      return NextResponse.json(
        { success: false, error: "Missing required booking information" },
        { status: 400 }
      );
    }

    // Generate unique car booking PNR code
    const generatedPnr = `AMD-CAR-${Math.floor(10000 + Math.random() * 90000)}`;

    // ⚡ INSTANT DISPATCH (0ms Delay): Fire WhatsApp notification IMMEDIATELY before DB roundtrips!
    sendCarBookingWhatsApp({
      pnr: generatedPnr,
      driverName: customerName,
      carName,
      carCategory: carCategory || "Rental Vehicle",
      carImage: carImage || undefined,
      pickupLocation: pickupLocation || "Airport Pickup",
      pickupDate: new Date(pickupDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      returnDate: new Date(dropoffDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      totalDays: totalDays || 1,
      totalAmount,
      currency,
      driverLicense: driverLicense || undefined,
      phone: customerPhone,
    }).catch((waErr) => console.error("[Car WhatsApp Async Error]:", waErr));

    // Send Car Reservation email notification asynchronously
    sendCarBookingNotification({
      pnrNumber: generatedPnr,
      customerName,
      customerEmail,
      customerPhone,
      carName,
      carCategory: carCategory || "Standard",
      pickupLocation: pickupLocation || "Airport Pickup",
      dropoffLocation,
      pickupDate: new Date(pickupDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      dropoffDate: new Date(dropoffDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      totalDays,
      totalAmount,
      currency,
      status: "CONFIRMED",
    }).catch((emailErr) => console.error("[Car Email Async Error]:", emailErr));

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

    // 2. Create Car Booking record in Database
    const newBooking = await prisma.booking.create({
      data: {
        pnr: generatedPnr,
        userId: user?.id,
        type: "car",
        origin: pickupLocation || "Airport Pickup",
        destination: carName,
        airline: "AMD Global Car Rental",
        flightNumber: `${carCategory || "SUV"} (${totalDays} Days)`,
        departureDate: new Date(pickupDate),
        returnDate: new Date(dropoffDate),
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
              passportNo: driverLicense || null,
              type: "PRIMARY_DRIVER",
            },
          ],
        },
        payment: {
          create: {
            amount: parseFloat(totalAmount),
            currency: currency || "EUR",
            gateway: "Pay on Arrival / WhatsApp",
            transactionId: `CAR-RESERVATION-${Date.now()}`,
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
      message: "Car booking reservation saved successfully!",
      pnr: generatedPnr,
      booking: newBooking,
    });
  } catch (error: any) {
    console.error("POST /api/bookings/car error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create car booking" },
      { status: 500 }
    );
  }
}
