import { Hono } from "hono";
import type { PlatformRegistry } from "../platforms/registry.js";
import type { AggregatedSearchResponse } from "../platforms/types.js";

/**
 * 创建搜索路由
 *
 * API 端点：
 * - POST /search   搜索歌曲（歌曲名 + 歌手）
 * - GET  /platforms 获取所有平台信息
 */
export function createSearchRoutes(registry: PlatformRegistry) {
  const app = new Hono();

  /**
   * POST /search
   *
   * 请求体: { "song": "晴天", "artist": "周杰伦" }
   * 响应: AggregatedSearchResponse
   */
  app.post("/search", async (c) => {
    const body = await c.req.json<{ song?: string; artist?: string }>();

    const song = body.song?.trim();
    const artist = body.artist?.trim();

    if (!song) {
      return c.json({ error: "缺少必填参数: song (歌曲名)" }, 400);
    }

    const query = { song, artist: artist ?? "" };

    console.log(
      `[Search] 开始搜索: "${query.song}" - "${query.artist}"`
    );
    const startTime = Date.now();

    const results = await registry.searchAll(query);

    const totalDuration = Date.now() - startTime;
    const platformCount = Object.keys(results).length;
    const successCount = Object.values(results).filter(
      (r) => r.status === "success"
    ).length;

    console.log(
      `[Search] 搜索完成: ${successCount}/${platformCount} 平台成功, 总耗时 ${totalDuration}ms`
    );

    const response: AggregatedSearchResponse = {
      query,
      timestamp: Date.now(),
      results,
    };

    return c.json(response);
  });

  /**
   * GET /platforms
   *
   * 返回所有已注册平台的信息
   */
  app.get("/platforms", (c) => {
    const platforms = registry.getAllPlatformInfo();
    return c.json({ platforms });
  });

  return app;
}
