import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedData, setCachedData } from "@/lib/api-cache";

export const dynamic = "force-dynamic";

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} d ago`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase() || "AM";
}

export async function GET() {
  try {
    const cached = getCachedData<any[]>("admin_notifications");
    if (cached) {
      return NextResponse.json({
        success: true,
        count: cached.length,
        data: cached,
      });
    }
    const notifications: any[] = [];

    // Parallel DB Queries for maximum speed
    const [visas, bookings, users] = await Promise.all([
      prisma.visaApplication.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          applicationNo: true,
          firstName: true,
          surname: true,
          country: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          pnr: true,
          origin: true,
          destination: true,
          totalAmount: true,
          currency: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    // 1. Process Visas
    visas.forEach((v) => {
      notifications.push({
        id: `visa-${v.id}`,
        title: `Visa Application Submitted`,
        message: `New visa request for ${v.country} by ${v.firstName} ${v.surname} (#${v.applicationNo})`,
        category: "VISA",
        initials: getInitials(`${v.firstName} ${v.surname}`),
        avatarBg: "bg-brand-500",
        badgeBg: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
        timeAgo: getTimeAgo(v.createdAt),
        createdAt: v.createdAt.toISOString(),
        link: "/admin/visa",
      });
    });

    // 2. Process Bookings
    bookings.forEach((b) => {
      notifications.push({
        id: `booking-${b.id}`,
        title: `Flight Booking Request`,
        message: `PNR #${b.pnr}: ${b.origin} ✈️ ${b.destination} (${b.currency} ${b.totalAmount})`,
        category: "FLIGHT",
        initials: getInitials(`${b.origin} ${b.destination}`),
        avatarBg: "bg-emerald-500",
        badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
        timeAgo: getTimeAgo(b.createdAt),
        createdAt: b.createdAt.toISOString(),
        link: "/admin/bookings",
      });
    });

    // 3. Process Users
    users.forEach((u) => {
      notifications.push({
        id: `user-${u.id}`,
        title: `New Registered Customer`,
        message: `${u.name} (${u.email}) joined AMD Global Travel`,
        category: "TRAVELER",
        initials: getInitials(u.name),
        avatarBg: "bg-purple-500",
        badgeBg: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300",
        timeAgo: getTimeAgo(u.createdAt),
        createdAt: u.createdAt.toISOString(),
        link: "/admin/profile",
      });
    });

    // Sort all combined by newest first
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setCachedData("admin_notifications", notifications, 15);

    return NextResponse.json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error: any) {
    console.error("Failed to fetch admin notifications:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
