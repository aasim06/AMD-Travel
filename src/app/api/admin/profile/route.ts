import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedData, setCachedData, invalidateCache } from "@/lib/api-cache";

const DEFAULT_PROFILE = {
  name: "Musharaf Chowdhury",
  email: "admin@amdglobaltravel.com",
  phone: "+92 300 1234567",
  role: "Super Admin",
  avatar: "/images/user/owner.jpg",
};

// GET /api/admin/profile
export async function GET() {
  try {
    const cached = getCachedData<typeof DEFAULT_PROFILE>("admin_profile");
    if (cached) {
      return NextResponse.json({ success: true, profile: cached });
    }

    const setting = await prisma.systemSetting.findUnique({
      where: { key: "admin_profile" },
    });

    if (setting && setting.value) {
      const parsed = JSON.parse(setting.value);
      setCachedData("admin_profile", parsed, 60);
      return NextResponse.json({ success: true, profile: parsed });
    }

    setCachedData("admin_profile", DEFAULT_PROFILE, 60);
    return NextResponse.json({ success: true, profile: DEFAULT_PROFILE });
  } catch (error) {
    console.error("GET /api/admin/profile error:", error);
    return NextResponse.json({ success: true, profile: DEFAULT_PROFILE });
  }
}

// POST /api/admin/profile
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updatedProfile = {
      name: body.name !== undefined ? body.name : DEFAULT_PROFILE.name,
      email: body.email !== undefined ? body.email : DEFAULT_PROFILE.email,
      phone: body.phone !== undefined ? body.phone : DEFAULT_PROFILE.phone,
      role: body.role !== undefined ? body.role : DEFAULT_PROFILE.role,
      avatar: body.avatar !== undefined ? body.avatar : DEFAULT_PROFILE.avatar,
    };

    const valueString = JSON.stringify(updatedProfile);

    // Explicit unique ID "admin_profile" to prevent PostgreSQL primary key collision on SystemSetting table
    await prisma.systemSetting.upsert({
      where: { key: "admin_profile" },
      update: { value: valueString },
      create: { id: "admin_profile", key: "admin_profile", value: valueString },
    });

    invalidateCache("admin_profile");
    setCachedData("admin_profile", updatedProfile, 60);

    const response = NextResponse.json({
      success: true,
      message: "Admin profile saved permanently!",
      profile: updatedProfile,
    });

    try {
      const smallCookieMeta = JSON.stringify({
        name: updatedProfile.name,
        email: updatedProfile.email,
        role: updatedProfile.role,
      });

      response.cookies.set("admin_profile_data", encodeURIComponent(smallCookieMeta), {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    } catch (cookieErr) {
      console.warn("Cookie set warning:", cookieErr);
    }

    return response;
  } catch (error) {
    console.error("POST /api/admin/profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save profile", details: String(error) },
      { status: 500 }
    );
  }
}
