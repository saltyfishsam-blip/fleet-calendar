import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { plateNumber: "asc" },
      include: {
        _count: { select: { bookings: true, mileageLogs: true } },
      },
    });
    return NextResponse.json({ vehicles });
  } catch (error: unknown) {
    console.error("取得車輛列表失敗:", error);
    return NextResponse.json({ error: "取得車輛列表失敗" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "權限不足，僅管理員可新增車輛" }, { status: 403 });
    }

    const { plateNumber, model, capacity, isActive } = await request.json();
    if (!plateNumber || !model) {
      return NextResponse.json({ error: "請填妥車牌號碼與車型" }, { status: 400 });
    }

    const cleanPlate = plateNumber.trim().toUpperCase();

    const existing = await prisma.vehicle.findUnique({
      where: { plateNumber: cleanPlate },
    });
    if (existing) {
      return NextResponse.json({ error: "此車牌號碼已存在" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plateNumber: cleanPlate,
        model: model.trim(),
        capacity: capacity ? parseInt(capacity, 10) : 5,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, vehicle }, { status: 201 });
  } catch (error: unknown) {
    console.error("新增車輛失敗:", error);
    return NextResponse.json({ error: "新增車輛失敗" }, { status: 500 });
  }
}
