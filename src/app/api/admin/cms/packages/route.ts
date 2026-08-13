import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const packages = await prisma.cMSPackage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: packages });
  } catch (error: any) {
    console.error("Failed to fetch admin CMS packages:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      type = "UMRAH",
      category = "Economy",
      destination,
      price,
      originalPrice,
      durationDays,
      groupSize = "Up to 25 People",
      departureCity = "Frankfurt / Islamabad",
      makkahNights = 5,
      madinahNights = 4,
      makkahHotel = "Al Safwah Royale Orchid ★★★",
      madinahHotel = "Dallah Taibah ★★★",
      badge = "Live Package",
      badgeColor = "bg-emerald-500 text-white",
      includes = "Return Flights, Hotel, Transfers, Visa",
      description,
      image,
    } = body;

    if (!title || !price) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (title, price)" },
        { status: 400 }
      );
    }

    const newPackage = await prisma.cMSPackage.create({
      data: {
        title,
        type: type.toUpperCase(),
        category,
        destination: destination || "Makkah & Madinah, Saudi Arabia",
        price: parseFloat(String(price)),
        originalPrice: originalPrice ? parseFloat(String(originalPrice)) : Math.round(parseFloat(String(price)) * 1.3),
        durationDays: durationDays || `${Number(makkahNights) + Number(madinahNights)} Days / ${Number(makkahNights) + Number(madinahNights) - 1} Nights`,
        groupSize,
        departureCity,
        makkahNights: parseInt(String(makkahNights)),
        madinahNights: parseInt(String(madinahNights)),
        makkahHotel,
        madinahHotel,
        badge,
        badgeColor,
        includes: Array.isArray(includes) ? includes.join(", ") : includes,
        description: description || "Exclusive luxury Umrah & travel package with 5-star services.",
        image: image || "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=800&q=80",
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Package created successfully in Supabase PostgreSQL!",
      data: newPackage,
    });
  } catch (error: any) {
    console.error("Failed to create CMS package:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Package ID required" }, { status: 400 });
    }

    await prisma.cMSPackage.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Package deleted successfully from Supabase PostgreSQL!",
    });
  } catch (error: any) {
    console.error("Failed to delete CMS package:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
