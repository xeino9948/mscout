import {
  AbstractMusicPlatformAdapter,
  type SearchQuery,
  type SongInfo,
  type PlatformAdapterConfig,
} from "./types.js";

export class QQMusicAdapter extends AbstractMusicPlatformAdapter {
  constructor(config?: Partial<PlatformAdapterConfig>) {
    super({
      id: "qq",
      name: "QQ音乐",
      enabled: true,
      timeout: 5000,
      ...config,
    });
  }

  protected buildSearchRequest(query: SearchQuery): [string, RequestInit] {
    const keyword = `${query.song} ${query.artist}`.trim();
    const params = new URLSearchParams({
      w: keyword,
      p: "1",
      n: "10",
      format: "json",
      inCharset: "utf8",
      outCharset: "utf-8",
    });

    const url = `https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp?${params}`;

    return [
      url,
      {
        method: "GET",
        headers: {
          Referer: "https://y.qq.com",
          "User-Agent": this.userAgent,
        },
      },
    ];
  }

  protected parseSearchResponse(data: unknown): SongInfo[] {
    const raw = data as QQRawResponse;
    const list = raw?.data?.song?.list;
    if (!Array.isArray(list)) return [];

    return list.map((item) => ({
      id: item.songid,
      name: item.songname,
      artists: item.singer?.map((s: { name: string }) => s.name) ?? [],
      album: item.albumname ?? "",
      duration: item.interval ?? 0,
      quality: {
        standard: (item.size128 ?? 0) > 0,
        high: (item.size320 ?? 0) > 0,
        lossless: (item.sizeflac ?? 0) > 0,
      },
      extra: {
        songmid: item.songmid,
        pay: item.pay,
      },
    }));
  }
}

// QQ 音乐原始响应类型
interface QQRawResponse {
  data?: {
    song?: {
      list?: Array<{
        songid: number;
        songmid: string;
        songname: string;
        singer: Array<{ name: string }>;
        albumname: string;
        interval: number;
        size128: number;
        size320: number;
        sizeflac: number;
        pay: {
          payplay: number;
        };
      }>;
    };
  };
}
