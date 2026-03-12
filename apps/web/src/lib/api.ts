import { hc } from "hono/client";
import type { AppType } from "@mscout/server";
import type {
  AggregatedSearchResponse,
  PlatformInfoResponse,
} from "@mscout/shared";

/**
 * 类型安全的 API 客户端（基于 Hono RPC）
 *
 * hc 会自动从后端路由推断请求/响应类型，无需手动维护
 * 开发环境通过 Vite proxy 走 "/"，生产环境使用 VITE_API_URL 环境变量
 */
const API_BASE = import.meta.env.VITE_API_URL || "/";
const client = hc<AppType>(API_BASE);

/** 搜索歌曲 — POST /api/search */
export async function searchSongs(
  song: string,
  artist: string,
  signal?: AbortSignal
): Promise<AggregatedSearchResponse> {
  const res = await client.api.search.$post(
    {
      json: { song, artist },
    },
    { init: { signal } }
  );

  if (!res.ok) {
    throw new Error(`搜索失败: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<AggregatedSearchResponse>;
}

/** 获取平台列表 — GET /api/platforms */
export async function getPlatforms(): Promise<PlatformInfoResponse> {
  const res = await client.api.platforms.$get();

  if (!res.ok) {
    throw new Error(
      `Failed to fetch platforms: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<PlatformInfoResponse>;
}
