import app from "./app.js";

// 导出 app（Cloudflare Workers / 边缘运行时使用）
export default app;

// 同时导出 AppType（供前端 RPC client 使用）
export type { AppType } from "./app.js";

// Node.js 本地开发时启动 HTTP 服务
// 边缘运行时（如 Cloudflare Workers）会忽略下面的代码，因为没有 @hono/node-server
async function startDevServer() {
  try {
    const { serve } = await import("@hono/node-server");
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
  ╚══════════════════════════════════════════════════╝
        `);
      }
    );
  } catch {
    // @hono/node-server 不存在时（边缘环境），静默跳过
  }
}

// 仅在 Node.js 环境下启动
if (typeof process !== "undefined" && process.versions?.node) {
  startDevServer();
}
