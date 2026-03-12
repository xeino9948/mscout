/**
 * 前后端共享类型定义
 *
 * 搜索查询、歌曲信息、平台结果等业务模型类型
 * 前端和后端均通过 @mscout/shared 引用，保证类型一致
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
// 平台类型
// ============================================================

/** 支持的平台 ID */
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

/** 平台信息 */
export interface PlatformInfo {
  id: PlatformId;
  name: string;
  enabled: boolean;
}

/** 平台信息响应 */
export interface PlatformInfoResponse {
  platforms: PlatformInfo[];
}
