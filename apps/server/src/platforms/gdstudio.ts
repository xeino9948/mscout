import {
  AbstractMusicPlatformAdapter,
  type SearchQuery,
  type SongInfo,
  type PlatformAdapterConfig,
} from "./types.js";

/**
 * gdstudio 平台适配器
 *
 * 注意：这个平台的搜索逻辑比较特殊：
 * - 它本身不是搜索平台，而是提供音频 URL 检测
 * - 需要先从网易云获取歌曲 ID，再调用此接口检测播放 URL
 * - 这里实现为：先通过 source=netease 的搜索方式获取结果
 *
 * 但根据 API 文档，gdstudio 的主要功能是 URL 检测（types=url）
 * 搜索功能可能不稳定，此适配器作为扩展预留
 */
export class GdstudioAdapter extends AbstractMusicPlatformAdapter {
  constructor(config?: Partial<PlatformAdapterConfig>) {
    super({
      id: "gdstudio",
      name: "gdstudio",
      enabled: true,
      timeout: 5000,
      ...config,
    });
  }

  protected buildSearchRequest(query: SearchQuery): [string, RequestInit] {
    const keyword = `${query.song} ${query.artist}`.trim();
    const params = new URLSearchParams({
      types: "search",
      source: "netease",
      name: keyword,
      page: "1",
      count: "10",
    });

    const url = `https://music-api.gdstudio.xyz/api.php?${params}`;

    return [
      url,
      {
        method: "GET",
        // 无需特殊 Header
      },
    ];
  }

  protected parseSearchResponse(data: unknown): SongInfo[] {
    // gdstudio 搜索返回可能是数组或对象
    const list = Array.isArray(data)
      ? (data as GdstudioRawItem[])
      : [];
    if (list.length === 0) return [];

    return list.map((item) => ({
      id: item.id ?? "",
      name: item.name ?? "",
      artists: Array.isArray(item.artist) ? item.artist : [item.artist ?? ""],
      album: item.album ?? "",
      duration: 0, // gdstudio 搜索不返回时长
      cover: item.pic_id ?? undefined,
      extra: {
        source: "gdstudio-netease",
        picId: item.pic_id,
      },
    }));
  }

  /**
   * 检测网易云歌曲的播放 URL
   * 这是 gdstudio 的核心功能，可在搜索之外单独调用
   */
  async checkUrl(
    neteaseId: string | number
  ): Promise<GdstudioUrlResult | null> {
    const params = new URLSearchParams({
      types: "url",
      source: "netease",
      id: String(neteaseId),
    });

    const url = `https://music-api.gdstudio.xyz/api.php?${params}`;

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) return null;

      const data = (await response.json()) as GdstudioUrlResult;
      return data;
    } catch {
      return null;
    }
  }
}

// gdstudio 原始响应类型
interface GdstudioRawItem {
  id: string | number;
  name: string;
  artist: string | string[];
  album: string;
  pic_id: string;
}

/** gdstudio URL 检测结果 */
export interface GdstudioUrlResult {
  url: string;
  br: number; // 比特率 kbps
  size: number; // 文件大小 bytes
}
