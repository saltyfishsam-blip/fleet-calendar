import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "請先登入系統" }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = parseInt(id, 10);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "查無此預約紀錄" }, { status: 404 });
    }

    // 權限檢查：僅本人或管理員可刪除
    if (booking.userId !== user.userId && user.role !== "ADMIN") {
      return NextResponse.json({ error: "您無權刪除此筆預約" }, { status: 403 });
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    });

    return NextResponse.json({ success: true, message: "預約已成功刪除" });
  } catch (error: unknown) {
    console.error("刪除預約失敗:", error);
    return NextResponse.json({ error: "刪除預約失敗" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "請先登入系統" }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = parseInt(id, 10);

    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "查無此預約紀錄" }, { status: 404 });
    }

    if (existingBooking.userId !== user.userId && user.role !== "ADMIN") {
      return NextResponse.json({ error: "您無權修改此筆預約" }, { status: 403 });
    }

    const body = await request.json();
    const { reason, date, timeSlot, vehicleId, projectId, companionIds } = body;

    const parsedVehicleId = vehicleId ? parseInt(vehicleId, 10) : existingBooking.vehicleId;
    const parsedProjectId = projectId !== undefined ? (projectId ? parseInt(projectId, 10) : null) : existingBooking.projectId;

    let startDate = existingBooking.startDate;
    let endDate = existingBooking.endDate;
    const targetTimeSlot = timeSlot || existingBooking.timeSlot;

    if (date || timeSlot) {
      const targetDate = date ? new Date(date) : existingBooking.startDate;
      const y = targetDate.getFullYear();
      const m = targetDate.getMonth();
      const d = targetDate.getDate();

      if (targetTimeSlot === "MORNING") {
        startDate = new Date(Date.UTC(y, m, d, 8, 0, 0));
        endDate = new Date(Date.UTC(y, m, d, 12, 0, 0));
      } else if (targetTimeSlot === "AFTERNOON") {
        startDate = new Date(Date.UTC(y, m, d, 13, 0, 0));
        endDate = new Date(Date.UTC(y, m, d, 17, 30, 0));
      } else {
        startDate = new Date(Date.UTC(y, m, d, 8, 0, 0));
        endDate = new Date(Date.UTC(y, m, d, 18, 0, 0));
      }

      // 檢查時段衝突（排除自身）
      const dayStart = new Date(Date.UTC(y, m, d, 0, 0, 0));
      const dayEnd = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));

      const otherBookings = await prisma.booking.findMany({
        where: {
          id: { not: bookingId },
          vehicleId: parsedVehicleId,
          startDate: { gte: dayStart, lte: dayEnd },
          status: { not: "CANCELLED" },
        },
        include: { user: { select: { name: true } } },
      });

      const isConflict = otherBookings.some((b) => {
        if (b.timeSlot === "ALL_DAY" || targetTimeSlot === "ALL_DAY") return true;
        if (b.timeSlot === targetTimeSlot) return true;
        return false;
      });

      if (isConflict) {
        return NextResponse.json(
          { error: "修改失敗：該車輛此日期與時段已被其他人員預約" },
          { status: 409 }
        );
      }
    }

    // 更新同行人員
    if (companionIds !== undefined && Array.isArray(companionIds)) {
      await prisma.bookingCompanion.deleteMany({
        where: { bookingId },
      });
      if (companionIds.length > 0) {
        await prisma.bookingCompanion.createMany({
          data: companionIds.map((pid: any) => ({
            bookingId,
            personnelId: parseInt(pid, 10),
          })),
        });
      }
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        reason: reason !== undefined ? reason.trim() : existingBooking.reason,
        startDate,
        endDate,
        timeSlot: targetTimeSlot,
        vehicleId: parsedVehicleId,
        projectId: parsedProjectId,
      },
      include: {
        vehicle: true,
        project: true,
        user: { select: { id: true, name: true, username: true } },
        companions: { include: { personnel: true } },
      },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: unknown) {
    console.error("更新預約失敗:", error);
    return NextResponse.json({ error: "更新預約失敗" }, { status: 500 });
  }
}
