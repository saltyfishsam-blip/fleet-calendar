import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        department: true,
        phone: true,
        createdAt: true,
        _count: { select: { bookings: true, mileageLogs: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ users });
  } catch (error: unknown) {
    console.error("取得使用者列表失敗:", error);
    return NextResponse.json({ error: "取得使用者列表失敗" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "權限不足" }, { status: 403 });
    }

    const { username, password, name, role, department, phone } = await request.json();
    if (!username || !password || !name) {
      return NextResponse.json({ error: "請填妥帳號、密碼與姓名" }, { status: 400 });
    }

    const cleanUsername = username.trim();
    const existing = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });
    if (existing) {
      return NextResponse.json({ error: "此帳號已被註冊" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        passwordHash,
        name: name.trim(),
        role: role === "ADMIN" ? "ADMIN" : "USER",
        department: department ? department.trim() : null,
        phone: phone ? phone.trim() : null,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        department: true,
        phone: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: unknown) {
    console.error("新增使用者失敗:", error);
    return NextResponse.json({ error: "新增使用者失敗" }, { status: 500 });
  }
}
