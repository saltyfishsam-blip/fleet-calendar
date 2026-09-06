import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "權限不足" }, { status: 403 });
    }

    const { id } = await params;
    const vehicleId = parseInt(id, 10);
    const { plateNumber, model, capacity, isActive } = await request.json();

    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        plateNumber: plateNumber ? plateNumber.trim().toUpperCase() : undefined,
        model: model ? model.trim() : undefined,
        capacity: capacity ? parseInt(capacity, 10) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, vehicle });
  } catch (error: unknown) {
    console.error("更新車輛失敗:", error);
    return NextResponse.json({ error: "更新車輛失敗" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "權限不足" }, { status: 403 });
    }

    const { id } = await params;
    const vehicleId = parseInt(id, 10);

    // 檢查是否有關聯預約
    const count = await prisma.booking.count({
      where: { vehicleId },
    });

    if (count > 0) {
      // 若有歷史紀錄，建議改為停用而非實體刪除
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: "該車輛已有歷史預約紀錄，已自動切換為『停用』狀態",
      });
    }

    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    return NextResponse.json({ success: true, message: "車輛已成功刪除" });
  } catch (error: unknown) {
    console.error("刪除車輛失敗:", error);
    return NextResponse.json({ error: "刪除車輛失敗" }, { status: 500 });
  }
}
