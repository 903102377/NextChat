import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

/**
 * GET /api/chats/[id]/messages
 * 获取聊天的所有消息
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = req.headers.get("X-User-ID") || "default-user";

    const chat = await prisma.chat.findFirst({
      where: {
        id: params.id,
        userId,
      },
      select: { id: true },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { chatId: params.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[API] Failed to fetch messages:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch messages",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/chats/[id]/messages
 * 创建新消息
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const {
      role,
      content,
      model,
      streaming = false,
      isError = false,
      date,
    } = body;

    // 验证必填字段
    if (!role || !content) {
      return NextResponse.json(
        { error: "Missing required fields: role, content" },
        { status: 400 },
      );
    }

    const userId = req.headers.get("X-User-ID") || "default-user";

    // 检查聊天是否存在且属于当前用户
    const chat = await prisma.chat.findFirst({
      where: {
        id: params.id,
        userId,
      },
      select: { id: true },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        chatId: params.id,
        role,
        content,
        model: model || null,
        streaming,
        isError,
        date: date || new Date().toLocaleString(),
      },
    });

    // 更新聊天的更新时间
    await prisma.chat.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("[API] Failed to create message:", error);
    return NextResponse.json(
      {
        error: "Failed to create message",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
