import type {
  MusicPlatformAdapter,
  PlatformId,
  SearchQuery,
  PlatformSearchResult,
} from "./types.js";

// 导入所有平台适配器
import { QQMusicAdapter } from "./qq.js";
import { KugouAdapter } from "./kugou.js";
import { MiguAdapter } from "./migu.js";
import { ITunesAdapter } from "./itunes.js";
import { NeteaseAdapter } from "./netease.js";
import { GdstudioAdapter } from "./gdstudio.js";
import { JooxAdapter } from "./joox.js";

/**
 * 平台注册中心
 *
 * 负责：
 * 1. 集中管理所有平台适配器实例
 * 2. 支持动态注册/注销平台
 * 3. 提供并发搜索聚合能力
 * 4. 后续扩展新平台只需：创建适配器类 + 在此注册
 */
export class PlatformRegistry {
  private adapters: Map<PlatformId, MusicPlatformAdapter> = new Map();

  /** 注册一个平台适配器 */
  register(adapter: MusicPlatformAdapter): this {
    this.adapters.set(adapter.config.id, adapter);
    return this;
  }

  /** 注销一个平台 */
  unregister(platformId: PlatformId): boolean {
    return this.adapters.delete(platformId);
  }

  /** 获取指定平台适配器 */
  get(platformId: PlatformId): MusicPlatformAdapter | undefined {
    return this.adapters.get(platformId);
  }

  /** 获取所有已启用的平台 ID 列表 */
  getEnabledPlatformIds(): PlatformId[] {
    return Array.from(this.adapters.entries())
      .filter(([, adapter]) => adapter.config.enabled)
      .map(([id]) => id);
  }

  /** 获取所有已注册的平台信息 */
  getAllPlatformInfo(): Array<{
    id: PlatformId;
    name: string;
    enabled: boolean;
  }> {
    return Array.from(this.adapters.values()).map((adapter) => ({
      id: adapter.config.id,
      name: adapter.config.name,
      enabled: adapter.config.enabled,
    }));
  }

  /**
   * 并发搜索所有已启用平台
   *
   * 使用 Promise.allSettled 确保单个平台失败不影响整体结果
   */
  async searchAll(
    query: SearchQuery
  ): Promise<Record<PlatformId, PlatformSearchResult>> {
    const enabledAdapters = Array.from(this.adapters.values()).filter(
      (adapter) => adapter.config.enabled
    );

    const results = await Promise.allSettled(
      enabledAdapters.map((adapter) => this.searchSingle(adapter, query))
    );

    const resultMap: Record<PlatformId, PlatformSearchResult> = {};

    enabledAdapters.forEach((adapter, index) => {
      const result = results[index];

      if (result.status === "fulfilled") {
        resultMap[adapter.config.id] = result.value;
      } else {
        // Promise.allSettled rejected 的情况理论上不会发生
        // 因为 searchSingle 内部已经 catch 了所有错误
        resultMap[adapter.config.id] = {
          platform: adapter.config.id,
          status: "error",
          duration: 0,
          error: result.reason?.message ?? "Unknown error",
        };
      }
    });

    return resultMap;
  }

  /** 搜索单个平台（带计时和错误处理） */
  private async searchSingle(
    adapter: MusicPlatformAdapter,
    query: SearchQuery
  ): Promise<PlatformSearchResult> {
    const startTime = Date.now();

    try {
      const data = await adapter.search(query);
      const duration = Date.now() - startTime;

      return {
        platform: adapter.config.id,
        status: "success",
        duration,
        data,
      };
    } catch (err: unknown) {
      const duration = Date.now() - startTime;
      const isTimeout =
        err instanceof DOMException && err.name === "TimeoutError";

      return {
        platform: adapter.config.id,
        status: isTimeout ? "timeout" : "error",
        duration,
        error: isTimeout
          ? `请求超时 (${adapter.config.timeout ?? 5000}ms)`
          : err instanceof Error
            ? err.message
            : "Unknown error",
      };
    }
  }
}

/**
 * 创建默认的平台注册中心（预注册所有内置平台）
 */
export function createDefaultRegistry(): PlatformRegistry {
  const registry = new PlatformRegistry();

  registry
    .register(new QQMusicAdapter())
    .register(new KugouAdapter())
    .register(new MiguAdapter())
    .register(new ITunesAdapter())
    .register(new NeteaseAdapter())
    .register(new GdstudioAdapter())
    .register(new JooxAdapter());

  return registry;
}
