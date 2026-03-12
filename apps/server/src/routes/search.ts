import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { PlatformRegistry } from "../platforms/registry.js";
import type { AggregatedSearchResponse } from "@mscout/shared";

/** 搜索请求体的 zod schema */
const searchSchema = z.object({
  song: z.string().min(1, "缺少必填参数: song (歌曲名)"),
  artist: z.string().optional().default(""),
});

/**
 * 创建搜索路由（链式写法，支持 Hono RPC 类型推导）
 *
 * API 端点：
 * - POST /search   搜索歌曲（歌曲名 + 歌手）
 * - GET  /platforms 获取所有平台信息
 */
export function createSearchRoutes(registry: PlatformRegistry) {
  return new Hono()
    .post("/search", zValidator("json", searchSchema), async (c) => {
      const { song, artist } = c.req.valid("json");

      const query = { song: song.trim(), artist: artist.trim() };

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
    })
    .get("/platforms", (c) => {
      const platforms = registry.getAllPlatformInfo();
      return c.json({ platforms });
    });
}
