import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "UMRAH" | "TOUR"

    const whereClause: any = { isActive: true };
    if (type) {
      whereClause.type = type.toUpperCase();
    }

    const packages = await prisma.cMSPackage.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        data: packages,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error("Failed to fetch CMS packages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load packages" },
      { status: 500 }
    );
  }
}
