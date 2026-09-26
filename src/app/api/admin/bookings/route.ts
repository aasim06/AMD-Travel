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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Fallback delete support for clients or proxies that block HTTP DELETE
    if (body.action === "delete") {
      const id = body.id || body.pnr;
      if (!id) {
        return NextResponse.json(
          { success: false, error: "Booking ID or PNR required" },
          { status: 400 }
        );
      }

      const booking = await prisma.booking.findFirst({
        where: {
          OR: [{ id: String(id) }, { pnr: String(id) }],
        },
      });

      if (!booking) {
        return NextResponse.json(
          { success: false, error: "Booking not found" },
          { status: 404 }
        );
      }

      await prisma.passenger.deleteMany({ where: { bookingId: booking.id } });
      await prisma.payment.deleteMany({ where: { bookingId: booking.id } });
      await prisma.booking.delete({ where: { id: booking.id } });

      return NextResponse.json({
        success: true,
        message: "Booking deleted successfully!",
        deletedId: booking.id,
        deletedPnr: booking.pnr,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Failed to process booking action:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
    let id = searchParams.get("id") || searchParams.get("pnr");

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id || body?.pnr;
      } catch {
        // body wasn't JSON or was empty
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Booking ID or PNR required" },
        { status: 400 }
      );
    }

    // Lookup booking by either ID or PNR
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id: String(id) },
          { pnr: String(id) },
        ],
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Explicitly delete relations first to guarantee cascading delete without DB FK constraint issues
    await prisma.passenger.deleteMany({ where: { bookingId: booking.id } });
    await prisma.payment.deleteMany({ where: { bookingId: booking.id } });
    await prisma.booking.delete({ where: { id: booking.id } });

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully!",
      deletedId: booking.id,
      deletedPnr: booking.pnr,
    });
  } catch (error: any) {
    console.error("Failed to delete booking:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
