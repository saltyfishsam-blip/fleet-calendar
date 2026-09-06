import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "請先登入系統" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");
    const mode = searchParams.get("mode"); // "my" | "all" | "pending"

    const where: any = {};

    if (mode === "my" || (user.role !== "ADMIN" && mode !== "all")) {
      where.userId = user.userId;
    }

    if (vehicleId && vehicleId !== "all") {
      where.vehicleId = parseInt(vehicleId, 10);
    }

    if (mode === "pending") {
      // 尋找尚未填妥結束里程之已確認預約
      where.status = { not: "CANCELLED" };
      where.OR = [
        { mileageLog: null },
        { mileageLog: { endMileage: null } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        vehicle: true,
        project: true,
        user: { select: { id: true, name: true, username: true, department: true } },
        companions: { include: { personnel: true } },
        mileageLog: true,
      },
      orderBy: { startDate: "desc" },
    });

    const formatted = bookings.map((b) => ({
      id: b.id,
      reason: b.reason,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      timeSlot: b.timeSlot,
      status: b.status,
      vehicle: b.vehicle,
      project: b.project,
      user: b.user,
      companions: b.companions.map((c) => c.personnel),
      mileageLog: b.mileageLog,
    }));

    return NextResponse.json({ records: formatted });
  } catch (error: unknown) {
    console.error("取得里程紀錄清單失敗:", error);
    return NextResponse.json({ error: "取得里程紀錄失敗" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "請先登入系統" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, startMileage, endMileage, note } = body;

    if (!bookingId || startMileage === undefined || startMileage === null) {
      return NextResponse.json(
        { error: "請提供預約編號與出發里程數" },
        { status: 400 }
      );
    }

    const parsedBookingId = parseInt(bookingId, 10);
    const parsedStartMileage = parseInt(startMileage, 10);
    const parsedEndMileage = endMileage !== undefined && endMileage !== null && endMileage !== "" ? parseInt(endMileage, 10) : null;

    if (isNaN(parsedStartMileage) || parsedStartMileage < 0) {
      return NextResponse.json({ error: "出發里程數格式不正確" }, { status: 400 });
    }

    let distance: number | null = null;
    if (parsedEndMileage !== null) {
      if (isNaN(parsedEndMileage) || parsedEndMileage < 0) {
        return NextResponse.json({ error: "結束里程數格式不正確" }, { status: 400 });
      }
      if (parsedEndMileage < parsedStartMileage) {
        return NextResponse.json(
          { error: "防呆阻擋：結束里程不得小於出發里程" },
          { status: 400 }
        );
      }
      distance = parsedEndMileage - parsedStartMileage;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parsedBookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "查無此預約紀錄" }, { status: 404 });
    }

    if (booking.userId !== user.userId && user.role !== "ADMIN") {
      return NextResponse.json({ error: "您無權回報此筆預約之里程" }, { status: 403 });
    }

    // 儲存或更新里程紀錄
    const existingLog = await prisma.mileageLog.findUnique({
      where: { bookingId: parsedBookingId },
    });

    let logResult;
    if (existingLog) {
      logResult = await prisma.mileageLog.update({
        where: { bookingId: parsedBookingId },
        data: {
          startMileage: parsedStartMileage,
          endMileage: parsedEndMileage,
          distance,
          note: note !== undefined ? note : existingLog.note,
        },
      });
    } else {
      logResult = await prisma.mileageLog.create({
        data: {
          bookingId: parsedBookingId,
          vehicleId: booking.vehicleId,
          userId: user.userId,
          startMileage: parsedStartMileage,
          endMileage: parsedEndMileage,
          distance,
          note,
        },
      });
    }

    // 若已填寫結束里程，更新預約狀態為已完成
    if (parsedEndMileage !== null) {
      await prisma.booking.update({
        where: { id: parsedBookingId },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json({ success: true, mileageLog: logResult });
  } catch (error: unknown) {
    console.error("回報里程失敗:", error);
    return NextResponse.json({ error: "回報里程失敗" }, { status: 500 });
  }
}
