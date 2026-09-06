import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const personnel = await prisma.personnel.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ personnel });
  } catch (error: unknown) {
    console.error("取得人員名冊失敗:", error);
    return NextResponse.json({ error: "取得人員名冊失敗" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "權限不足" }, { status: 403 });
    }

    const { name, department, isActive } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "請輸入人員姓名" }, { status: 400 });
    }

    const cleanName = name.trim();
    const existing = await prisma.personnel.findUnique({
      where: { name: cleanName },
    });
    if (existing) {
      return NextResponse.json({ error: "此人員姓名已存在" }, { status: 400 });
    }

    const person = await prisma.personnel.create({
      data: {
        name: cleanName,
        department: department ? department.trim() : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, personnel: person }, { status: 201 });
  } catch (error: unknown) {
    console.error("新增人員失敗:", error);
    return NextResponse.json({ error: "新增人員失敗" }, { status: 500 });
  }
}
