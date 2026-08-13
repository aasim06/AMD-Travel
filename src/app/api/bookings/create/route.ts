import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPNRNotification } from "@/lib/emailService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      pnr,
      type = "flight",
      origin,
      destination,
      airline,
      flightNumber,
      departureDate,
      returnDate,
      totalAmount,
      currency = "USD",
      passengers = [],
      customerName,
      customerEmail,
    } = body;

    if (!origin || !destination || !totalAmount) {
      return NextResponse.json(
        { success: false, error: "Missing required booking details" },
        { status: 400 }
      );
    }

    const generatedPnr = pnr || `AMD-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Ensure or find User in Supabase
    let user;
    if (customerEmail) {
      user = await prisma.user.upsert({
        where: { email: customerEmail },
        update: { name: customerName || "Passenger" },
        create: {
          email: customerEmail,
          name: customerName || "Passenger",
          role: "CUSTOMER",
        },
      });
    }

    // 2. Create Booking in Supabase PostgreSQL
    const newBooking = await prisma.booking.create({
      data: {
        pnr: generatedPnr,
        userId: user?.id,
        type,
        origin,
        destination,
        airline: airline || "Emirates",
        flightNumber: flightNumber || "EK-204",
        departureDate: new Date(departureDate || Date.now()),
        returnDate: returnDate ? new Date(returnDate) : null,
        totalAmount: parseFloat(totalAmount),
        currency,
        status: "CONFIRMED",
        passengers: {
          create: passengers.map((p: any) => ({
            firstName: p.firstName || "John",
            lastName: p.lastName || "Doe",
            email: p.email || customerEmail,
            passportNo: p.passportNo || `P${Math.floor(1000000 + Math.random() * 9000000)}`,
            type: p.type || "ADULT",
          })),
        },
        payment: {
          create: {
            amount: parseFloat(totalAmount),
            currency,
            gateway: "Stripe",
            transactionId: `TXN-${Date.now()}`,
            status: "PAID",
          },
        },
      },
      include: {
        passengers: true,
        payment: true,
      },
    });

    // Send PNR email notification asynchronously without blocking
    sendPNRNotification({
      pnrNumber: generatedPnr,
      passengerName: customerName || (passengers[0] ? `${passengers[0].firstName} ${passengers[0].lastName}` : "Passenger"),
      passengerEmail: customerEmail,
      flightDetails: {
        airline: airline || "Emirates",
        flightNumber: flightNumber || "EK-204",
        origin,
        destination,
        departureDate: new Date(departureDate || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        returnDate: returnDate ? new Date(returnDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : undefined,
        totalAmount: `${currency} ${totalAmount}`,
      },
      status: "CONFIRMED",
    }).catch((emailErr) => console.error("[Booking PNR Email Async Error]:", emailErr));

    return NextResponse.json({
      success: true,
      message: "Booking created successfully in Supabase PostgreSQL!",
      booking: newBooking,
    });
  } catch (error: any) {
    console.error("Failed to create booking:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save booking to database" },
      { status: 500 }
    );
  }
}
