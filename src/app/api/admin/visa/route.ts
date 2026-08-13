import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const singleId = searchParams.get("id");

    if (singleId) {
      // Single Application view - fetch full details including documents
      const singleApp = await prisma.visaApplication.findUnique({
        where: { id: singleId },
      });
      return NextResponse.json({ success: true, data: singleApp });
    }

    // List view - fetch lightweight metadata fields (super fast < 50ms response)
    const rawApps = await prisma.visaApplication.findMany({
      select: {
        id: true,
        applicationNo: true,
        country: true,
        visaType: true,
        visaPlan: true,
        firstName: true,
        middleName: true,
        surname: true,
        fatherName: true,
        motherName: true,
        dob: true,
        placeOfBirth: true,
        maritalStatus: true,
        occupation: true,
        religion: true,
        nationality: true,
        gender: true,
        email: true,
        phone: true,
        passportNo: true,
        issueDate: true,
        expiryDate: true,
        status: true,
        adminNotes: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: rawApps });
  } catch (error: any) {
    console.error("Failed to fetch admin visa applications:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, adminNotes } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "ID and status required" }, { status: 400 });
    }

    const updated = await prisma.visaApplication.update({
      where: { id },
      data: {
        status: status.toUpperCase(),
        ...(adminNotes ? { adminNotes } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Visa Application status updated to ${status}!`,
      data: updated,
    });
  } catch (error: any) {
    console.error("Failed to update visa application status:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Application ID required" }, { status: 400 });
    }

    await prisma.visaApplication.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Visa application deleted successfully from Supabase PostgreSQL!",
    });
  } catch (error: any) {
    console.error("Failed to delete visa application:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
