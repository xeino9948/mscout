import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

import { createDefaultRegistry } from "./platforms/registry.js";
import { createSearchRoutes } from "./routes/search.js";

// ============================================================
// 初始化
// ============================================================

const registry = createDefaultRegistry();

// ============================================================
// 构建 App（链式写法，确保类型可被 RPC 推导）
// ============================================================

const app = new Hono()
  // 请求日志
  .use("*", logger())
  // JSON 美化（开发环境友好）
  .use("*", prettyJSON())
  // CORS 配置
  .use(
    "/api/*",
    cors({
      origin: (origin) => origin,
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
      maxAge: 86400,
    })
  )
  // 健康检查
  .get("/", (c) => {
    return c.json({
      name: "Music Online Status Checker API",
      version: "0.0.1",
      status: "running",
      platforms: registry.getEnabledPlatformIds(),
    });
  })
  // 搜索 API 路由
  .route("/api", createSearchRoutes(registry));

// 导出 app 实例和类型（供 Hono RPC 使用）
export type AppType = typeof app;
export default app;
