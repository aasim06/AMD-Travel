import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Accept valid admin credentials
    const isValidAdmin =
      (email.toLowerCase() === "admin@amdglobaltravel.com" ||
        email.toLowerCase() === "rahmat@store.com" ||
        email.toLowerCase() === "admin@gmail.com") &&
      (password === "admin123" || password === "Amd@123.com" || password === "admin");

    if (isValidAdmin) {
      // Fetch persisted admin profile from DB if present
      let userProfile = { name: "Musharaf Chowdhury", email, role: "Super Admin", avatar: "/images/user/owner.jpg" };
      try {
        const savedSetting = await prisma.systemSetting.findUnique({
          where: { key: "admin_profile" },
        });
        if (savedSetting && savedSetting.value) {
          userProfile = JSON.parse(savedSetting.value);
        }
      } catch (e) {
        console.error("Failed to read admin_profile on login", e);
      }

      const response = NextResponse.json({
        success: true,
        message: "Sign in successful!",
        user: userProfile,
      });

      // Set admin session cookie
      response.cookies.set("admin_session", "true", {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: "Invalid email or password!" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { success: false, message: "Server error during login" },
      { status: 500 }
    );
  }
}
