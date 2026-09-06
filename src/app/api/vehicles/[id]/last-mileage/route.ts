import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicleId = parseInt(id, 10);

    // 尋找該車輛最近一筆有紀錄里程的資料
    const latestLog = await prisma.mileageLog.findFirst({
      where: { vehicleId },
      orderBy: { loggedAt: "desc" },
    });

    let lastMileage = 0;
    if (latestLog) {
      lastMileage = latestLog.endMileage ?? latestLog.startMileage;
    }

    return NextResponse.json({ lastMileage });
  } catch (error: unknown) {
    console.error("取得前次里程失敗:", error);
    return NextResponse.json({ error: "取得前次里程失敗" }, { status: 500 });
  }
}
