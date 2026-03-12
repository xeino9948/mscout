import {
  AbstractMusicPlatformAdapter,
  type SearchQuery,
  type SongInfo,
  type PlatformAdapterConfig,
} from "./types.js";

export class KugouAdapter extends AbstractMusicPlatformAdapter {
  constructor(config?: Partial<PlatformAdapterConfig>) {
    super({
      id: "kugou",
      name: "酷狗音乐",
      enabled: true,
      timeout: 5000,
      ...config,
    });
  }

  protected buildSearchRequest(query: SearchQuery): [string, RequestInit] {
    const keyword = `${query.song} ${query.artist}`.trim();
    const params = new URLSearchParams({
      keyword,
      page: "1",
      pagesize: "10",
    });

    const url = `https://songsearch.kugou.com/song_search_v2?${params}`;

    return [
      url,
      {
        method: "GET",
        headers: {
          "User-Agent": this.userAgent,
        },
      },
    ];
  }

  protected parseSearchResponse(data: unknown): SongInfo[] {
    const raw = data as KugouRawResponse;

    // 酷狗风控检测
    if (raw?.error_code === 152) {
      throw new Error("酷狗音乐风控拦截 (error_code: 152)");
    }

    const list = raw?.data?.lists;
    if (!Array.isArray(list)) return [];

    return list.map((item) => ({
      id: item.FileHash,
      name: item.SongName,
      artists: [item.SingerName],
      album: item.AlbumName ?? "",
      duration: item.Duration ?? 0,
      quality: {
        standard: !!item.FileHash,
        high: !!item.HQFileHash,
        lossless: !!item.SQFileHash,
      },
      extra: {
        fileHash: item.FileHash,
        hqFileHash: item.HQFileHash,
        sqFileHash: item.SQFileHash,
      },
    }));
  }
}

// 酷狗原始响应类型
interface KugouRawResponse {
  error_code?: number;
  data?: {
    lists?: Array<{
      SongName: string;
      SingerName: string;
      AlbumName: string;
      Duration: number;
      FileHash: string;
      HQFileHash: string;
      SQFileHash: string;
    }>;
  };
}
