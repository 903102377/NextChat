import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

/**
 * GET /api/chats
 * 获取当前用户的所有聊天列表
 */
export async function GET(req: NextRequest) {
  try {
    // 从请求头获取用户 ID（实际项目中应该从认证系统获取）
    const userId = req.headers.get("X-User-ID") || "default-user";

    const chats = await prisma.chat.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // 只取最新一条消息用于预览
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("[API] Failed to fetch chats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch chats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/chats
 * 创建新的聊天
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("X-User-ID") || "default-user";
    const body = await req.json();
    const { topic } = body;

    // 检查用户是否存在，不存在则创建
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@example.com`,
          name: userId,
        },
      });
    }

    const chat = await prisma.chat.create({
      data: {
        userId,
        topic: topic || "新聊天",
      },
    });

    return NextResponse.json(chat, { status: 201 });
  } catch (error) {
    console.error("[API] Failed to create chat:", error);
    return NextResponse.json(
      {
        error: "Failed to create chat",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
