import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// PostgreSQL 连接池配置
const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({
  connectionString,
});

// 创建 Prisma PostgreSQL 适配器
const adapter = new PrismaPg(pool);

// TypeScript 全局类型扩展，避免开发环境下热重载创建多个连接实例
declare global {
  var prisma: PrismaClient | undefined;
}

// 创建或复用 Prisma 客户端实例（使用 adapter）
export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// 开发环境下保存全局实例，避免重复连接
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

/**
 * 检查数据库连接状态
 */
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("[Database] Connected successfully");
    return true;
  } catch (error) {
    console.error("[Database] Connection failed:", error);
    return false;
  }
}

/**
 * 断开数据库连接（用于优雅关闭）
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
  await pool.end();
}

export default prisma;
