/**
 * API 类型定义 — 从 @mscout/shared 统一引用
 *
 * 保留此文件是为了兼容现有组件中的 import 路径
 * 所有类型均来自 monorepo 共享包，前后端自动同步
 */
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
