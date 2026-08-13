import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dbBookings = await prisma.booking.findMany({
      include: {
        passengers: true,
        payment: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: dbBookings,
    });
  } catch (error: any) {
    console.error("Failed to fetch admin bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings from database" },
      { status: 500 }
    );
  }
}
