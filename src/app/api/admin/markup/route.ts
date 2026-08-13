import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const typeSetting = await prisma.systemSetting.findUnique({
      where: { key: "markup_type" },
    });
    const valueSetting = await prisma.systemSetting.findUnique({
      where: { key: "markup_value" },
    });

    const routeMarkups = await prisma.flightRoute.findMany({
      where: { isActive: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        markupType: typeSetting?.value || "PERCENTAGE", // "PERCENTAGE" | "FLAT"
        markupValue: parseFloat(valueSetting?.value || "5"), // Default 5%
        routeMarkups,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch markup settings:", error);
    return NextResponse.json(
      {
        success: true,
        data: {
          markupType: "PERCENTAGE",
          markupValue: 5,
          routeMarkups: [],
        },
      },
      { status: 200 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { markupType = "PERCENTAGE", markupValue = 5 } = body;

    await prisma.systemSetting.upsert({
      where: { key: "markup_type" },
      update: { value: markupType },
      create: { id: "markup_type", key: "markup_type", value: markupType },
    });

    await prisma.systemSetting.upsert({
      where: { key: "markup_value" },
      update: { value: String(markupValue) },
      create: { id: "markup_value", key: "markup_value", value: String(markupValue) },
    });

    return NextResponse.json({
      success: true,
      message: "Admin Markup & Profit Settings updated successfully in Supabase PostgreSQL!",
      data: { markupType, markupValue: parseFloat(String(markupValue)) },
    });
  } catch (error: any) {
    console.error("Failed to save markup settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
