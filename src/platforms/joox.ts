import {
  AbstractMusicPlatformAdapter,
  type SearchQuery,
  type SongInfo,
  type PlatformAdapterConfig,
} from "./types.js";

export class JooxAdapter extends AbstractMusicPlatformAdapter {
  constructor(config?: Partial<PlatformAdapterConfig>) {
    super({
      id: "joox",
      name: "JOOX",
      enabled: true,
      timeout: 5000,
      ...config,
    });
  }

  protected buildSearchRequest(query: SearchQuery): [string, RequestInit] {
    const keyword = `${query.song} ${query.artist}`.trim();
    const params = new URLSearchParams({
      types: "search",
      source: "joox",
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
    // JOOX 通过 gdstudio 接口返回数组
    const list = Array.isArray(data) ? (data as JooxRawItem[]) : [];
    if (list.length === 0) return [];

    return list.map((item) => ({
      id: item.id ?? "",
      name: item.name ?? "",
      artists: Array.isArray(item.artist) ? item.artist : [item.artist ?? ""],
      album: item.album ?? "",
      duration: 0, // JOOX 搜索不返回时长
      cover: item.pic_id ?? undefined,
      extra: {
        source: "joox",
        picId: item.pic_id,
      },
    }));
  }
}

// JOOX 原始响应类型
interface JooxRawItem {
  id: string | number;
  name: string;
  artist: string | string[];
  album: string;
  pic_id: string;
}
