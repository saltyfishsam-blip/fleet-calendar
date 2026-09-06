import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month"); // 1-12
    const vehicleId = searchParams.get("vehicleId");
    const dateStr = searchParams.get("date"); // YYYY-MM-DD

    const where: any = {
      status: { not: "CANCELLED" },
    };

    if (vehicleId && vehicleId !== "all") {
      where.vehicleId = parseInt(vehicleId, 10);
    }

    if (dateStr) {
      const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
      where.startDate = { gte: startOfDay, lte: endOfDay };
    } else if (year && month) {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10) - 1;
      const startOfMonth = new Date(Date.UTC(y, m, 1, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
      where.startDate = { gte: startOfMonth, lte: endOfMonth };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        vehicle: true,
        project: true,
        user: {
          select: { id: true, name: true, username: true, department: true, phone: true },
        },
        companions: {
          include: {
            personnel: true,
          },
        },
        mileageLog: true,
      },
      orderBy: { startDate: "asc" },
    });

    // 格式化回傳結構
    const formatted = bookings.map((b) => ({
      id: b.id,
      reason: b.reason,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      timeSlot: b.timeSlot,
      status: b.status,
      vehicleId: b.vehicleId,
      vehicle: b.vehicle,
      projectId: b.projectId,
      project: b.project,
      userId: b.userId,
      user: b.user,
      companions: b.companions.map((c) => c.personnel),
      mileageLog: b.mileageLog,
    }));

    return NextResponse.json({ bookings: formatted });
  } catch (error: unknown) {
    console.error("取得預約清單失敗:", error);
    return NextResponse.json({ error: "取得預約資料失敗" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "請先登入系統" }, { status: 401 });
    }

    const body = await request.json();
    const { reason, date, timeSlot, vehicleId, projectId, companionIds } = body;

    if (!reason || !date || !timeSlot || !vehicleId) {
      return NextResponse.json(
        { error: "請填妥借用事由、日期、時段與借用車輛" },
        { status: 400 }
      );
    }

    const parsedVehicleId = parseInt(vehicleId, 10);
    const parsedProjectId = projectId ? parseInt(projectId, 10) : null;
    const companionIdList: number[] = Array.isArray(companionIds)
      ? companionIds.map((id: any) => parseInt(id, 10))
      : [];

    // 計算起訖時間
    const dateObj = new Date(date);
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth();
    const d = dateObj.getDate();

    let startDate: Date;
    let endDate: Date;

    if (timeSlot === "MORNING") {
      startDate = new Date(Date.UTC(y, m, d, 8, 0, 0));
      endDate = new Date(Date.UTC(y, m, d, 12, 0, 0));
    } else if (timeSlot === "AFTERNOON") {
      startDate = new Date(Date.UTC(y, m, d, 13, 0, 0));
      endDate = new Date(Date.UTC(y, m, d, 17, 30, 0));
    } else {
      // ALL_DAY 或 CUSTOM
      startDate = new Date(Date.UTC(y, m, d, 8, 0, 0));
      endDate = new Date(Date.UTC(y, m, d, 18, 0, 0));
    }

    // 衝突檢測：同一車輛、同一天、時段衝突判定
    const dayStart = new Date(Date.UTC(y, m, d, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));

    const existingBookings = await prisma.booking.findMany({
      where: {
        vehicleId: parsedVehicleId,
        startDate: { gte: dayStart, lte: dayEnd },
        status: { not: "CANCELLED" },
      },
      include: {
        user: { select: { name: true } },
      },
    });

    const isConflict = existingBookings.some((b) => {
      if (b.timeSlot === "ALL_DAY" || timeSlot === "ALL_DAY") return true;
      if (b.timeSlot === timeSlot) return true;
      return false;
    });

    if (isConflict) {
      const conflictDetail = existingBookings.map(
        (b) => `${b.timeSlot === "MORNING" ? "上午" : b.timeSlot === "AFTERNOON" ? "下午" : "全天"}（預約人：${b.user.name}）`
      ).join("、");
      return NextResponse.json(
        {
          error: `預約衝突：該車輛此日期已有其他預約【${conflictDetail}】`,
        },
        { status: 409 }
      );
    }

    // 建立預約
    const newBooking = await prisma.booking.create({
      data: {
        reason: reason.trim(),
        startDate,
        endDate,
        timeSlot,
        status: "CONFIRMED",
        vehicleId: parsedVehicleId,
        projectId: parsedProjectId,
        userId: user.userId,
        companions: {
          create: companionIdList.map((pid) => ({ personnelId: pid })),
        },
      },
      include: {
        vehicle: true,
        project: true,
        user: { select: { id: true, name: true, username: true } },
        companions: { include: { personnel: true } },
      },
    });

    return NextResponse.json({ success: true, booking: newBooking }, { status: 201 });
  } catch (error: unknown) {
    console.error("建立預約失敗:", error);
    return NextResponse.json({ error: "建立預約失敗，請稍後再試" }, { status: 500 });
  }
}
