import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

import { createDefaultRegistry } from "./platforms/registry.js";
import { createSearchRoutes } from "./routes/search.js";

// ============================================================
// 初始化
// ============================================================

const app = new Hono();
const registry = createDefaultRegistry();

// ============================================================
// 全局中间件
// ============================================================

// 请求日志
app.use("*", logger());

// JSON 美化（开发环境友好）
app.use("*", prettyJSON());

// CORS 配置
app.use(
  "/api/*",
  cors({
    // 开发环境允许所有来源，生产环境应限制为具体域名
    origin: (origin) => origin,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    maxAge: 86400, // 预检请求缓存 24 小时
  })
);

// ============================================================
// 路由
// ============================================================

// 健康检查
app.get("/", (c) => {
  return c.json({
    name: "Music Online Status Checker API",
    version: "0.0.1",
    status: "running",
    platforms: registry.getEnabledPlatformIds(),
  });
});

// 搜索 API 路由
app.route("/api", createSearchRoutes(registry));

// ============================================================
// 启动服务
// ============================================================

const port = Number(process.env.PORT) || 3000;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`
  ╔══════════════════════════════════════════════════╗
  ║  Music Online Status Checker API                ║
  ║  Server running at http://localhost:${info.port}       ║
  ║  Platforms: ${registry.getEnabledPlatformIds().join(", ")}
  ╚══════════════════════════════════════════════════╝
    `);
  }
);

export default app;
