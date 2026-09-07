import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const avatarColors = [
  "bg-brand-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-green-600",
  "bg-yellow-600",
  "bg-cyan-600",
];

function getInitials(name: string) {
  const words = name.trim().split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export async function GET() {
  try {
    let dbUsers: any[] = [];
    try {
      dbUsers = await prisma.user.findMany({
        include: {
          bookings: {
            take: 5,
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.warn("[Travelers API] Prisma query skipped or table empty:", e);
    }

    const mappedDbTravelers = dbUsers.map((u, idx) => {
      const totalSpentNum = u.bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || "+92 300 0000000",
        passportNumber: "PK-" + (10000000 + idx * 8371),
        nationality: "Pakistani",
        initials: getInitials(u.name),
        avatarColor: avatarColors[idx % avatarColors.length],
        totalBookings: u.bookings.length,
        totalSpent: `$${totalSpentNum.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        joinedDate: new Date(u.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        recentBookings: u.bookings.map((b: any) => ({
          id: b.pnr || b.id.slice(0, 8),
          route: `${b.origin} ➔ ${b.destination}`,
          flightNo: b.flightNumber || b.airline || "FL-101",
          date: new Date(b.departureDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          status: b.status === "CONFIRMED" ? "Confirmed" : b.status === "COMPLETED" ? "Completed" : "Confirmed",
          amount: `$${b.totalAmount}`,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      count: mappedDbTravelers.length,
      travelers: mappedDbTravelers,
    });
  } catch (error: any) {
    console.error("[Travelers API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch travelers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, passportNumber, nationality, totalBookings, totalSpent } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    let createdUser = null;
    try {
      createdUser = await prisma.user.upsert({
        where: { email: email.trim() },
        update: {
          name: name.trim(),
          phone: phone ? phone.trim() : undefined,
        },
        create: {
          name: name.trim(),
          email: email.trim(),
          phone: phone ? phone.trim() : null,
          role: "CUSTOMER",
        },
      });
    } catch (e) {
      console.warn("[Travelers API] Could not persist to DB, returning formatted memory traveler:", e);
    }

    const initials = getInitials(name);
    const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const newTraveler = {
      id: createdUser?.id || Date.now(),
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : "+92 300 0000000",
      passportNumber: passportNumber || "PK-" + Math.floor(10000000 + Math.random() * 90000000),
      nationality: nationality || "Pakistani",
      initials,
      avatarColor: color,
      totalBookings: Number(totalBookings) || 0,
      totalSpent: totalSpent && totalSpent.startsWith("$") ? totalSpent : `$${totalSpent || "0.00"}`,
      joinedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      recentBookings: [],
    };

    return NextResponse.json({
      success: true,
      traveler: newTraveler,
    });
  } catch (error: any) {
    console.error("[Travelers Create API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create traveler" },
      { status: 500 }
    );
  }
}
