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
    const projectId = parseInt(id, 10);
    const { name, code, isActive } = await request.json();

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: name ? name.trim() : undefined,
        code: code !== undefined ? (code ? code.trim() : null) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error: unknown) {
    console.error("更新專案失敗:", error);
    return NextResponse.json({ error: "更新專案失敗" }, { status: 500 });
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
    const projectId = parseInt(id, 10);

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true, message: "專案代碼已成功刪除" });
  } catch (error: unknown) {
    console.error("刪除專案失敗:", error);
    return NextResponse.json({ error: "刪除專案失敗" }, { status: 500 });
  }
}
