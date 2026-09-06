import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "權限不足" }, { status: 403 });
    }

    const { id } = await params;
    const targetUserId = parseInt(id, 10);
    const { name, role, department, phone, password } = await request.json();

    const data: any = {
      name: name ? name.trim() : undefined,
      role: role ? (role === "ADMIN" ? "ADMIN" : "USER") : undefined,
      department: department !== undefined ? (department ? department.trim() : null) : undefined,
      phone: phone !== undefined ? (phone ? phone.trim() : null) : undefined,
    };

    if (password && password.trim() !== "") {
      data.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        department: true,
        phone: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: unknown) {
    console.error("更新使用者失敗:", error);
    return NextResponse.json({ error: "更新使用者失敗" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "權限不足" }, { status: 403 });
    }

    const { id } = await params;
    const targetUserId = parseInt(id, 10);

    if (currentUser.userId === targetUserId) {
      return NextResponse.json({ error: "管理員不得刪除自身帳號" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    return NextResponse.json({ success: true, message: "使用者已成功刪除" });
  } catch (error: unknown) {
    console.error("刪除使用者失敗:", error);
    return NextResponse.json({ error: "刪除使用者失敗" }, { status: 500 });
  }
}
