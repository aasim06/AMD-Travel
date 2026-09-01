import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pnr, email, lastName } = body;

    if (!pnr) {
      return NextResponse.json(
        { success: false, error: "PNR / Reference Number is required" },
        { status: 400 }
      );
    }

    const cleanPnr = String(pnr).trim().toUpperCase();

    // Query booking with relations
    const booking = await prisma.booking.findFirst({
      where: {
        pnr: {
          equals: cleanPnr,
          mode: "insensitive",
        },
      },
      include: {
        passengers: true,
        payment: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "No booking found with this PNR number." },
        { status: 404 }
      );
    }

    // Optional verification if email or lastName is provided
    if (email) {
      const cleanEmail = String(email).trim().toLowerCase();
      const matchesUserEmail = booking.user?.email?.toLowerCase() === cleanEmail;
      const matchesPassengerEmail = booking.passengers.some(
        (p) => p.email?.toLowerCase() === cleanEmail
      );

      if (!matchesUserEmail && !matchesPassengerEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "Email address does not match this booking record.",
          },
          { status: 403 }
        );
      }
    }

    if (lastName) {
      const cleanLastName = String(lastName).trim().toLowerCase();
      const matchesPassengerName = booking.passengers.some((p) =>
        p.lastName.toLowerCase().includes(cleanLastName)
      );
      const matchesUserName = booking.user?.name
        .toLowerCase()
        .includes(cleanLastName);

      if (!matchesPassengerName && !matchesUserName) {
        return NextResponse.json(
          {
            success: false,
            error: "Last name does not match the traveler on this booking.",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error: any) {
    console.error("[Booking Lookup Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to lookup booking" },
      { status: 500 }
    );
  }
}
