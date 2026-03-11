import {
  AbstractMusicPlatformAdapter,
  type SearchQuery,
  type SongInfo,
  type PlatformAdapterConfig,
} from "./types.js";

export class ITunesAdapter extends AbstractMusicPlatformAdapter {
  constructor(config?: Partial<PlatformAdapterConfig>) {
    super({
      id: "itunes",
      name: "Apple Music",
      enabled: true,
      timeout: 5000,
      ...config,
    });
  }

  protected buildSearchRequest(query: SearchQuery): [string, RequestInit] {
    const term = `${query.song} ${query.artist}`.trim();
    const params = new URLSearchParams({
      term,
      media: "music",
      limit: "10",
      country: "cn",
      lang: "zh_cn",
    });

    const url = `https://itunes.apple.com/search?${params}`;

    return [
      url,
      {
        method: "GET",
        // iTunes API 不需要额外 Header
      },
    ];
  }

  protected parseSearchResponse(data: unknown): SongInfo[] {
    const raw = data as ITunesRawResponse;
    const results = raw?.results;
    if (!Array.isArray(results)) return [];

    return results.map((item) => ({
      id: item.trackId,
      name: item.trackName,
      artists: [item.artistName],
      album: item.collectionName ?? "",
      duration: Math.round((item.trackTimeMillis ?? 0) / 1000),
      cover: item.artworkUrl100?.replace("100x100", "300x300"),
      previewUrl: item.previewUrl,
      quality: {
        // iTunes 只提供 AAC 256kbps 试听
        standard: true,
        high: item.isStreamable ?? false,
      },
      extra: {
        trackId: item.trackId,
        collectionId: item.collectionId,
        isStreamable: item.isStreamable,
        trackViewUrl: item.trackViewUrl,
        releaseDate: item.releaseDate,
        primaryGenreName: item.primaryGenreName,
      },
    }));
  }
}

// iTunes 原始响应类型
interface ITunesRawResponse {
  resultCount?: number;
  results?: Array<{
    trackId: number;
    trackName: string;
    artistName: string;
    collectionName: string;
    trackTimeMillis: number;
    previewUrl: string;
    artworkUrl100: string;
    isStreamable: boolean;
    trackViewUrl: string;
    collectionId: number;
    releaseDate: string;
    primaryGenreName: string;
  }>;
}
