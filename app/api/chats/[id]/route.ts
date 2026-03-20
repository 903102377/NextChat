import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

/**
 * GET /api/chats/[id]
 * 获取单个聊天详情（包含消息）
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
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("[API] Failed to fetch chat:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch chat",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/chats/[id]
 * 删除聊天及其所有消息
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = req.headers.get("X-User-ID") || "default-user";

    const result = await prisma.chat.deleteMany({
      where: {
        id: params.id,
        userId,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("[API] Failed to delete chat:", error);
    return NextResponse.json(
      {
        error: "Failed to delete chat",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";
