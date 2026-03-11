/**
 * 音乐平台适配器类型定义
 *
 * 适配器模式设计要点：
 * 1. 所有平台实现统一的 MusicPlatformAdapter 接口
 * 2. 通过 AbstractMusicPlatformAdapter 基类提供公共逻辑（超时、错误处理、请求封装）
 * 3. 各平台只需关注：构造请求 URL/Header + 解析响应数据
 * 4. 支持认证扩展：适配器可选实现 authenticate() 方法
 */

// ============================================================
// 搜索查询与结果类型
// ============================================================

/** 搜索查询参数 */
export interface SearchQuery {
  song: string;
  artist: string;
}

/** 标准化的歌曲信息 */
export interface SongInfo {
  /** 歌曲在原平台的 ID */
  id: string | number;
  /** 歌曲名 */
  name: string;
  /** 歌手列表 */
  artists: string[];
  /** 专辑名 */
  album: string;
  /** 时长（秒） */
  duration: number;
  /** 封面图 URL */
  cover?: string;
  /** 试听/播放 URL */
  previewUrl?: string;
  /** 音质信息 */
  quality?: QualityInfo;
  /** 平台原始数据（用于前端展示平台特有字段） */
  extra?: Record<string, unknown>;
}

/** 音质信息 */
export interface QualityInfo {
  /** 是否有标准品质 (128kbps) */
  standard?: boolean;
  /** 是否有高品质 (320kbps) */
  high?: boolean;
  /** 是否有无损品质 (FLAC) */
  lossless?: boolean;
  /** 是否有超高品质 (Hi-Res) */
  hires?: boolean;
}

// ============================================================
// 平台适配器接口
// ============================================================

/** 支持的平台 ID（可用 string literal union 限定，也可动态注册） */
export type PlatformId = string;

/** 单个平台的搜索结果 */
export interface PlatformSearchResult {
  platform: PlatformId;
  status: "success" | "error" | "timeout";
  /** 请求耗时（ms） */
  duration: number;
  /** 成功时的歌曲列表 */
  data?: SongInfo[];
  /** 失败时的错误信息 */
  error?: string;
}

/** 聚合搜索响应 */
export interface AggregatedSearchResponse {
  query: SearchQuery;
  timestamp: number;
  results: Record<PlatformId, PlatformSearchResult>;
}

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
