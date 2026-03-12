/**
 * 音乐平台适配器类型定义
 *
 * 共享类型（SearchQuery, SongInfo, QualityInfo 等）从 @mscout/shared 引用
 * 适配器专有类型（Config, Auth, Interface, Abstract Class）在此定义
 */

// 从 shared 包重导出共享类型，保持后端其他文件的 import 路径不变
export type {
  SearchQuery,
  SongInfo,
  QualityInfo,
  PlatformId,
  PlatformSearchResult,
  AggregatedSearchResponse,
  PlatformInfo,
  PlatformInfoResponse,
} from "@mscout/shared";

import type { SearchQuery, SongInfo, PlatformId } from "@mscout/shared";

// ============================================================
// 适配器配置
// ============================================================

/** 平台适配器配置 */
export interface PlatformAdapterConfig {
  /** 平台唯一标识 */
  id: PlatformId;
  /** 平台显示名称 */
  name: string;
  /** 是否启用此平台 */
  enabled: boolean;
  /** 单次请求超时（ms），默认 5000 */
  timeout?: number;
  /** 认证信息（可选，用于需要认证的平台） */
  auth?: AuthConfig;
}

/** 认证配置（为将来需要认证的平台预留） */
export interface AuthConfig {
  type: "bearer" | "cookie" | "apikey" | "custom";
  /** token / apikey / cookie 值 */
  credentials: string;
  /** 自定义认证 header 名称（type=custom 时使用） */
  headerName?: string;
}

// ============================================================
// 适配器接口与抽象基类
// ============================================================

/** 音乐平台适配器接口 */
export interface MusicPlatformAdapter {
  /** 平台配置 */
  readonly config: PlatformAdapterConfig;

  /**
   * 搜索歌曲
   * @param query 搜索参数（歌曲名 + 歌手）
   * @returns 标准化的歌曲信息列表
   */
  search(query: SearchQuery): Promise<SongInfo[]>;

  /**
   * 可选：认证/刷新凭证
   * 用于需要定期更新 token 的平台
   */
  authenticate?(): Promise<void>;
}

/**
 * 抽象基类 - 提供公共逻辑
 *
 * 子类只需实现：
 * - buildSearchRequest(query): 构造 fetch 请求参数
 * - parseSearchResponse(data): 将原始响应解析为 SongInfo[]
 */
export abstract class AbstractMusicPlatformAdapter
  implements MusicPlatformAdapter
{
  readonly config: PlatformAdapterConfig;

  constructor(config: PlatformAdapterConfig) {
    this.config = config;
  }

  /** 获取超时时间 */
  protected get timeout(): number {
    return this.config.timeout ?? 5000;
  }

  /** 公共 User-Agent */
  protected get userAgent(): string {
    return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
  }

  /**
   * 子类实现：构造搜索请求
   * @returns [url, requestInit]
   */
  protected abstract buildSearchRequest(
    query: SearchQuery
  ): [string, RequestInit];

  /**
   * 子类实现：解析搜索响应
   * @param data fetch 返回的 JSON 数据
   */
  protected abstract parseSearchResponse(data: unknown): SongInfo[];

  /**
   * 搜索歌曲（公共逻辑：超时控制 + 错误处理 + 认证 Header 注入）
   */
  async search(query: SearchQuery): Promise<SongInfo[]> {
    const [url, init] = this.buildSearchRequest(query);

    // 注入认证 header（如果配置了）
    const headers = new Headers(init.headers);
    if (this.config.auth) {
      this.injectAuthHeader(headers);
    }

    const response = await fetch(url, {
      ...init,
      headers,
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      throw new Error(
        `${this.config.name} API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return this.parseSearchResponse(data);
  }

  /** 注入认证 Header */
  private injectAuthHeader(headers: Headers): void {
    const auth = this.config.auth;
    if (!auth) return;

    switch (auth.type) {
      case "bearer":
        headers.set("Authorization", `Bearer ${auth.credentials}`);
        break;
      case "cookie":
        headers.set("Cookie", auth.credentials);
        break;
      case "apikey":
        headers.set("X-API-Key", auth.credentials);
        break;
      case "custom":
        if (auth.headerName) {
          headers.set(auth.headerName, auth.credentials);
        }
        break;
    }
  }
}
