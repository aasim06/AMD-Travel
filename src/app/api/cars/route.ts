import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const whereClause: any = { isActive: true };
    if (category && category !== "All") {
      whereClause.category = category;
    }

    const cars = await prisma.carListing.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { success: true, data: cars },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error("Failed to fetch public car listings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
