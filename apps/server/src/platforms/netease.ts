import {
  AbstractMusicPlatformAdapter,
  type SearchQuery,
  type SongInfo,
  type PlatformAdapterConfig,
} from "./types.js";

export class NeteaseAdapter extends AbstractMusicPlatformAdapter {
  constructor(config?: Partial<PlatformAdapterConfig>) {
    super({
      id: "netease",
      name: "网易云音乐",
      enabled: true,
      timeout: 5000,
      ...config,
    });
  }

  protected buildSearchRequest(query: SearchQuery): [string, RequestInit] {
    const keywords = `${query.song} ${query.artist}`.trim();
    const params = new URLSearchParams({
      keywords,
      limit: "10",
      type: "1", // 1 = 歌曲
      offset: "0",
    });

    const url = `https://netease-cloud-music-api-five-mu.vercel.app/search?${params}`;

    return [
      url,
      {
        method: "GET",
        // 无需特殊 Header
      },
    ];
  }

  protected parseSearchResponse(data: unknown): SongInfo[] {
    const raw = data as NeteaseRawResponse;
    const songs = raw?.result?.songs;
    if (!Array.isArray(songs)) return [];

    return songs.map((item) => ({
      id: item.id,
      name: item.name,
      artists: item.artists?.map((a: { name: string }) => a.name) ?? [],
      album: item.album?.name ?? "",
      duration: Math.round((item.duration ?? 0) / 1000),
      cover: item.album?.picUrl,
      quality: this.parseFeeToQuality(item.fee),
      extra: {
        neteaseId: item.id,
        fee: item.fee,
        feeDescription: this.getFeeDescription(item.fee),
        mvid: item.mvid,
      },
    }));
  }

  /** 根据 fee 字段推断音质可用性 */
  private parseFeeToQuality(
    fee: number | undefined
  ): SongInfo["quality"] {
    // fee: 0=免费, 1=VIP, 4=付费购买, 8=低品免费
    switch (fee) {
      case 0:
        return { standard: true, high: true, lossless: true };
      case 1:
        return { standard: true, high: true, lossless: true }; // VIP 有全品质
      case 8:
        return { standard: true, high: false, lossless: false };
      default:
        return { standard: true };
    }
  }

  private getFeeDescription(fee: number | undefined): string {
    switch (fee) {
      case 0:
        return "免费";
      case 1:
        return "VIP";
      case 4:
        return "付费购买";
      case 8:
        return "低品免费";
      default:
        return "未知";
    }
  }
}

// 网易云原始响应类型
interface NeteaseRawResponse {
  result?: {
    songs?: Array<{
      id: number;
      name: string;
      artists: Array<{ name: string }>;
      album: {
        name: string;
        picUrl?: string;
      };
      duration: number;
      fee: number;
      mvid: number;
    }>;
  };
}
