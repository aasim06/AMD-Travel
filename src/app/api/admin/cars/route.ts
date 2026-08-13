import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cars = await prisma.carListing.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: cars });
  } catch (error: any) {
    console.error("Failed to fetch admin car listings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      category = "SUV",
      subtitle = "SUV",
      location = "Frankfurt Airport",
      pricePerDay,
      originalPrice,
      seats = 5,
      transmission = "Automatic",
      fuelType = "Petrol",
      badge = "Top Rated",
      badgeColor = "bg-indigo-500 text-white",
      includes = "Free Cancellation, Insurance Included, Unlimited KM",
      image,
    } = body;

    if (!name || !pricePerDay) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (name, pricePerDay)" },
        { status: 400 }
      );
    }

    const newCar = await prisma.carListing.create({
      data: {
        name,
        category,
        subtitle,
        location,
        pricePerDay: parseFloat(String(pricePerDay)),
        originalPrice: originalPrice ? parseFloat(String(originalPrice)) : Math.round(parseFloat(String(pricePerDay)) * 1.3),
        seats: parseInt(String(seats)),
        transmission,
        fuelType,
        badge,
        badgeColor,
        includes: Array.isArray(includes) ? includes.join(", ") : includes,
        image: image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Car listing created successfully in Supabase PostgreSQL!",
      data: newCar,
    });
  } catch (error: any) {
    console.error("Failed to create car listing:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Car ID required" }, { status: 400 });
    }

    await prisma.carListing.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Car listing deleted successfully from Supabase PostgreSQL!",
    });
  } catch (error: any) {
    console.error("Failed to delete car listing:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
