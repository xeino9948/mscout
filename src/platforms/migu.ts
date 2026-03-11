import {
  AbstractMusicPlatformAdapter,
  type SearchQuery,
  type SongInfo,
  type PlatformAdapterConfig,
} from "./types.js";

export class MiguAdapter extends AbstractMusicPlatformAdapter {
  constructor(config?: Partial<PlatformAdapterConfig>) {
    super({
      id: "migu",
      name: "咪咕音乐",
      enabled: true,
      timeout: 5000,
      ...config,
    });
  }

  protected buildSearchRequest(query: SearchQuery): [string, RequestInit] {
    const keyword = `${query.song} ${query.artist}`.trim();
    const params = new URLSearchParams({
      text: keyword,
      pageNo: "1",
      pageSize: "10",
      searchSwitch: JSON.stringify({ song: 1 }),
    });

    const url = `https://pd.musicapp.migu.cn/MIGUM3.0/v1.0/content/search_all.do?${params}`;

    return [
      url,
      {
        method: "GET",
        headers: {
          Referer: "https://music.migu.cn",
          "User-Agent": this.userAgent,
        },
      },
    ];
  }

  protected parseSearchResponse(data: unknown): SongInfo[] {
    const raw = data as MiguRawResponse;
    const list = raw?.songResultData?.result;
    if (!Array.isArray(list)) return [];

    return list.map((item) => {
      // 解析音质信息
      const formats = item.rateFormats ?? [];
      const formatTypes = formats.map(
        (f: { formatType: string }) => f.formatType
      );

      // 解析封面图
      const cover =
        item.imgItems?.find(
          (img: { imgSizeType: string }) => img.imgSizeType === "03"
        )?.img ??
        item.imgItems?.[0]?.img;

      return {
        id: item.id ?? item.copyrightId ?? "",
        name: item.name,
        artists:
          item.singers?.map((s: { name: string }) => s.name) ?? [],
        album: item.albums?.[0]?.name ?? "",
        duration: 0, // 咪咕搜索结果不直接返回时长
        cover,
        quality: {
          standard: formatTypes.includes("PQ"),
          high: formatTypes.includes("HQ"),
          lossless: formatTypes.includes("SQ"),
          hires: formatTypes.includes("ZQ24"),
        },
        extra: {
          lyricUrl: item.lyricUrl,
          mvId: item.mvId,
          tags: item.tags,
          copyrightId: item.copyrightId,
        },
      };
    });
  }
}

// 咪咕原始响应类型
interface MiguRawResponse {
  songResultData?: {
    result?: Array<{
      id: string;
      copyrightId: string;
      name: string;
      singers: Array<{ name: string }>;
      albums: Array<{ name: string }>;
      rateFormats: Array<{ formatType: string }>;
      imgItems: Array<{ imgSizeType: string; img: string }>;
      lyricUrl: string;
      mvId: string;
      tags: string[];
    }>;
  };
}
