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
    const personnelId = parseInt(id, 10);
    const { name, department, isActive } = await request.json();

    const person = await prisma.personnel.update({
      where: { id: personnelId },
      data: {
        name: name ? name.trim() : undefined,
        department: department !== undefined ? (department ? department.trim() : null) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, personnel: person });
  } catch (error: unknown) {
    console.error("更新人員失敗:", error);
    return NextResponse.json({ error: "更新人員失敗" }, { status: 500 });
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
    const personnelId = parseInt(id, 10);

    await prisma.personnel.delete({
      where: { id: personnelId },
    });

    return NextResponse.json({ success: true, message: "人員已成功刪除" });
  } catch (error: unknown) {
    console.error("刪除人員失敗:", error);
    return NextResponse.json({ error: "刪除人員失敗" }, { status: 500 });
  }
}
