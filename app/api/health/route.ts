import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/app/lib/db";

/**
 * GET /api/health
 * 检查数据库连接状态
 */
export async function GET() {
  const isConnected = await checkDatabaseConnection();

  return NextResponse.json(
    {
      status: isConnected ? "healthy" : "unhealthy",
      database: isConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    },
    {
      status: isConnected ? 200 : 503,
    },
  );
}

// Prisma 不支持 Edge Runtime，使用 Node.js 运行时
export const runtime = "nodejs";
