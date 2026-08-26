import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get("type");

    const whereCondition: any = {};
    if (typeParam) {
      whereCondition.type = typeParam.toLowerCase();
    }

    const dbBookings = await prisma.booking.findMany({
      where: whereCondition,
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

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Booking ID and status required" },
        { status: 400 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: status.toUpperCase(),
      },
      include: {
        passengers: true,
        payment: true,
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status}!`,
      data: updated,
    });
  } catch (error: any) {
    console.error("Failed to update booking status:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Booking ID required" },
        { status: 400 }
      );
    }

    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully!",
    });
  } catch (error: any) {
    console.error("Failed to delete booking:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

