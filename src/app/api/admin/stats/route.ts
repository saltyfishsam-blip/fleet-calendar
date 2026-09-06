import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "權限不足" }, { status: 403 });
    }

    const today = new Date();
    const startOfToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0));
    const endOfToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999));

    const [
      totalVehicles,
      activeVehicles,
      totalUsers,
      todayBookings,
      totalBookings,
      pendingMileageCount,
      recentBookings,
      recentMileageLogs,
    ] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.booking.count({
        where: {
          startDate: { gte: startOfToday, lte: endOfToday },
          status: { not: "CANCELLED" },
        },
      }),
      prisma.booking.count(),
      prisma.booking.count({
        where: {
          status: "CONFIRMED",
          startDate: { lte: endOfToday },
          OR: [{ mileageLog: null }, { mileageLog: { endMileage: null } }],
        },
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          vehicle: true,
          user: { select: { name: true } },
          project: true,
        },
      }),
      prisma.mileageLog.findMany({
        take: 5,
        orderBy: { loggedAt: "desc" },
        include: {
          vehicle: true,
          user: { select: { name: true } },
          booking: { select: { reason: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalVehicles,
        activeVehicles,
        totalUsers,
        todayBookings,
        totalBookings,
        pendingMileageCount,
      },
      recentBookings,
      recentMileageLogs,
    });
  } catch (error: unknown) {
    console.error("取得後台統計失敗:", error);
    return NextResponse.json({ error: "取得統計資料失敗" }, { status: 500 });
  }
}
