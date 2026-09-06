import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ projects });
  } catch (error: unknown) {
    console.error("取得專案代碼失敗:", error);
    return NextResponse.json({ error: "取得專案列表失敗" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "權限不足" }, { status: 403 });
    }

    const { name, code, isActive } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "請輸入專案名稱" }, { status: 400 });
    }

    const cleanName = name.trim();
    const existing = await prisma.project.findUnique({
      where: { name: cleanName },
    });
    if (existing) {
      return NextResponse.json({ error: "此專案名稱已存在" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name: cleanName,
        code: code ? code.trim() : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error: unknown) {
    console.error("新增專案失敗:", error);
    return NextResponse.json({ error: "新增專案失敗" }, { status: 500 });
  }
}
