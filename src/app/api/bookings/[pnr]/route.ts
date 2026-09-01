import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pnr: string }> }
) {
  try {
    const { pnr } = await params;

    if (!pnr) {
      return NextResponse.json(
        { success: false, error: "PNR is required" },
        { status: 400 }
      );
    }

    const cleanPnr = decodeURIComponent(pnr).trim().toUpperCase();

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
        { success: false, error: `Booking with PNR '${cleanPnr}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    console.error("[Booking PNR Query Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve booking" },
      { status: 500 }
    );
  }
}
