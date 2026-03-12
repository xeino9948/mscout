# 音乐平台搜索 API 参考文档

> 最后验证时间：2026-03-11
> 以下接口均经过实际测试验证可用，无需认证/API Key

---

## 1. QQ音乐

### 基本信息
- **接口地址**: `https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp`
- **请求方式**: GET
- **必须 Header**: `Referer: https://y.qq.com`、`User-Agent: Mozilla/5.0`

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| w | string | 是 | 搜索关键词（URL编码） |
| p | int | 是 | 页码，从1开始 |
| n | int | 是 | 每页数量 |
| format | string | 是 | 固定填 `json` |
| inCharset | string | 是 | 固定填 `utf8` |
| outCharset | string | 是 | 固定填 `utf-8` |

### 调用示例

```bash
curl -s "https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp?w=%E5%91%A8%E6%9D%B0%E4%BC%A6+%E6%99%B4%E5%A4%A9&p=1&n=5&format=json&inCharset=utf8&outCharset=utf-8" \
  -H "Referer: https://y.qq.com" \
  -H "User-Agent: Mozilla/5.0"
```

### 响应结构

```json
{
  "code": 0,
  "data": {
    "keyword": "周杰伦 晴天",
    "song": {
      "curnum": 1,
      "curpage": 1,
      "totalnum": 600,
      "list": [
        {
          "songid": 97773,
          "songmid": "0039MnYb0qxYhV",
          "songname": "晴天",
          "albumid": 8220,
          "albummid": "000MkMni19ClKG",
          "albumname": "叶惠美",
          "interval": 269,
          "pubtime": 1059580800,
          "singer": [{ "id": 4558, "mid": "0025NhlN2yWrP4", "name": "周杰伦" }],
          "pay": { "payplay": 1, "paydownload": 1 },
          "size128": 4317292,
          "size320": 10792943,
          "sizeflac": 55397039
        }
      ]
    }
  }
}
```

### 关键字段说明
- `songid` / `songmid`: 歌曲数字ID / 字符串MID
- `interval`: 时长（秒）
- `pubtime`: 发布时间戳（秒级）
- `pay.payplay`: 1=需付费播放, 0=免费
- `size128` / `size320` / `sizeflac`: 各音质文件大小（字节）

---

## 2. 酷狗音乐

### 基本信息
- **接口地址**: `https://songsearch.kugou.com/song_search_v2`
- **请求方式**: GET
- **必须 Header**: `User-Agent: Mozilla/5.0`（不带此头会被拒绝）
- **风控提示**: 部分IP/地区可能被风控返回 `error_code: 152`，换IP或加代理可解决

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 搜索关键词（URL编码） |
| page | int | 是 | 页码，从1开始 |
| pagesize | int | 是 | 每页数量 |

### 调用示例

```bash
curl -s "https://songsearch.kugou.com/song_search_v2?keyword=%E5%91%A8%E6%9D%B0%E4%BC%A6+%E6%99%B4%E5%A4%A9&page=1&pagesize=5" \
  -H "User-Agent: Mozilla/5.0"
```

### 响应结构

```json
{
  "status": 1,
  "error_code": 0,
  "data": {
    "total": 379,
    "page": 1,
    "pagesize": 5,
    "lists": [
      {
        "SongName": "晴天",
        "SingerId": 3520,
        "SingerName": "周杰伦",
        "AlbumID": "960291",
        "AlbumName": "叶惠美",
        "FileHash": "...",
        "HQFileHash": "...",
        "SQFileHash": "...",
        "Duration": 269,
        "Bitrate": 128
      }
    ]
  }
}
```

### 关键字段说明
- `SongName` / `SingerName` / `AlbumName`: 歌名/歌手/专辑
- `FileHash` / `HQFileHash` / `SQFileHash`: 标准/高品质/无损文件哈希
- `Duration`: 时长（秒）

---

## 3. 咪咕音乐

### 基本信息
- **接口地址**: `https://pd.musicapp.migu.cn/MIGUM3.0/v1.0/content/search_all.do`
- **请求方式**: GET（必须是 GET，POST 会返回"请求method不支持"）
- **必须 Header**: `Referer: https://music.migu.cn`、`User-Agent: Mozilla/5.0`

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| text | string | 是 | 搜索关键词（URL编码） |
| pageNo | int | 是 | 页码，从1开始 |
| pageSize | int | 是 | 每页数量 |
| searchSwitch | string | 是 | 搜索类型开关，JSON格式 `{"song":1}` 表示搜歌曲 |

### 调用示例

```bash
curl -s "https://pd.musicapp.migu.cn/MIGUM3.0/v1.0/content/search_all.do?text=%E5%91%A8%E6%9D%B0%E4%BC%A6+%E6%99%B4%E5%A4%A9&pageNo=1&pageSize=5&searchSwitch=%7B%22song%22%3A1%7D" \
  -H "Referer: https://music.migu.cn" \
  -H "User-Agent: Mozilla/5.0"
```

### 响应结构

```json
{
  "code": "000000",
  "info": "成功",
  "songResultData": {
    "totalCount": "208",
    "result": [
      {
        "id": "3790007",
        "contentId": "600902000006889366",
        "copyrightId": "60054701923",
        "name": "晴天",
        "singers": [{ "id": "112", "name": "周杰伦" }],
        "albums": [{ "id": "8592", "name": "叶惠美", "type": "1" }],
        "tags": ["流行", "爱情", "原创", "国语"],
        "lyricUrl": "https://d.musicapp.migu.cn/...",
        "imgItems": [
          { "imgSizeType": "03", "img": "https://d.musicapp.migu.cn/...webp" }
        ],
        "rateFormats": [
          { "formatType": "PQ", "size": "4317311", "fileType": "mp3" },
          { "formatType": "HQ", "size": "10792962", "fileType": "mp3" },
          { "formatType": "SQ", "size": "31529675", "androidFileType": "flac" },
          { "formatType": "ZQ24", "androidBit": 24 }
        ],
        "mvList": [
          { "id": "600906000000388230", "playNum": "143851963" }
        ]
      }
    ]
  }
}
```

### 关键字段说明
- `code`: "000000" 表示成功
- `contentId` / `copyrightId`: 内容ID和版权ID
- `rateFormats`: 可用音质列表（PQ=标准, HQ=高品, SQ=无损, ZQ24=Hi-Res）
- `imgItems`: 封面图片（多尺寸）
- `lyricUrl`: 歌词文件直链
- `mvList`: 关联MV列表
- `tags`: 风格标签数组
- 返回信息极其丰富，是所有接口中字段最全的

---

## 4. Apple Music (iTunes Search API)

### 基本信息
- **接口地址**: `https://itunes.apple.com/search`
- **请求方式**: GET
- **无需额外 Header**（Apple 官方公开API，最稳定）

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| term | string | 是 | 搜索关键词（URL编码） |
| media | string | 是 | 媒体类型，填 `music` |
| limit | int | 否 | 返回数量上限，默认50，最大200 |
| country | string | 否 | 国家/地区代码：`cn`(中国)、`hk`(香港)、`us`(美国)等 |
| lang | string | 否 | 语言，如 `zh_cn` |

### 调用示例

```bash
# 搜索"周杰伦 晴天"（中国区）
curl -s "https://itunes.apple.com/search?term=%E5%91%A8%E6%9D%B0%E4%BC%A6+%E6%99%B4%E5%A4%A9&media=music&limit=5&country=cn"

# 搜索"Beyond 长城"（香港区 - 粤语歌推荐用hk）
curl -s "https://itunes.apple.com/search?term=Beyond+%E9%95%BF%E5%9F%8E&media=music&limit=5&country=hk"
```

### 响应结构

```json
{
  "resultCount": 1,
  "results": [
    {
      "wrapperType": "track",
      "kind": "song",
      "trackId": 535824738,
      "trackName": "晴天",
      "artistId": 300117743,
      "artistName": "周杰伦",
      "collectionId": 535824731,
      "collectionName": "叶惠美",
      "trackViewUrl": "https://music.apple.com/cn/album/...",
      "previewUrl": "https://audio-ssl.itunes.apple.com/...",
      "artworkUrl100": "https://is1-ssl.mzstatic.com/.../100x100bb.jpg",
      "releaseDate": "2003-07-31T12:00:00Z",
      "trackTimeMillis": 269747,
      "primaryGenreName": "国语流行",
      "isStreamable": true,
      "country": "CHN",
      "currency": "CNY"
    }
  ]
}
```

### 关键字段说明
- `trackId` / `artistId` / `collectionId`: 曲目/歌手/专辑ID
- `trackViewUrl`: Apple Music 页面链接
- `previewUrl`: 30秒试听 M4A 直链
- `artworkUrl100`: 封面图，`100x100` 可替换为 `600x600` 等任意尺寸
- `trackTimeMillis`: 时长（毫秒）
- `isStreamable`: 是否可流式播放
- `country` 参数影响搜索结果：中文歌用 `cn`/`hk`，欧美歌用 `us`

---

## 5. 网易云音乐（第三方 Vercel 实例）

### 基本信息
- **接口地址**: `https://netease-cloud-music-api-five-mu.vercel.app`
- **请求方式**: GET
- **性质**: 基于 [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) 的第三方部署
- **稳定性**: 第三方实例，可能随时下线；建议自行 fork 部署

### 搜索歌曲

**端点**: `/search`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keywords | string | 是 | 搜索关键词 |
| limit | int | 否 | 返回数量，默认30 |
| type | int | 否 | 1=歌曲, 10=专辑, 100=歌手, 1000=歌单 |
| offset | int | 否 | 偏移量（分页用） |

### 调用示例

```bash
curl -s "https://netease-cloud-music-api-five-mu.vercel.app/search?keywords=%E5%91%A8%E6%9D%B0%E4%BC%A6+%E6%99%B4%E5%A4%A9&limit=5&type=1"
```

### 响应结构

```json
{
  "code": 200,
  "result": {
    "songCount": 228,
    "hasMore": true,
    "songs": [
      {
        "id": 3339230677,
        "name": "晴天",
        "duration": 182890,
        "fee": 8,
        "mvid": 0,
        "artists": [{ "id": 0, "name": "周杰伦-" }],
        "album": {
          "id": 358214126,
          "name": "不散",
          "publishTime": 1768320000000,
          "picId": 109951172445882510
        }
      }
    ]
  }
}
```

### 关键字段说明
- `id`: 网易云歌曲ID（可用于 gdstudio URL 检测获取播放链接）
- `fee`: 0=免费, 1=VIP, 8=付费
- `duration`: 时长（毫秒）
- 搜索排序非严格相关度排序，建议返回多条后客户端侧二次筛选

---

## 6. 网易云 URL 检测（gdstudio）

### 基本信息
- **接口地址**: `https://music-api.gdstudio.xyz/api.php`
- **请求方式**: GET
- **用途**: 根据网易云歌曲ID获取实际播放链接（可获得 FLAC 无损直链）

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| types | string | 是 | 固定填 `url` |
| source | string | 是 | 固定填 `netease` |
| id | int | 是 | 网易云歌曲ID（从搜索接口获取） |

### 调用示例

```bash
# 先通过搜索接口拿到歌曲 id，如 347274
curl -s "https://music-api.gdstudio.xyz/api.php?types=url&source=netease&id=347274"
```

### 响应结构

```json
{
  "url": "https://m8.music.126.net/20260311/...72d35dc889089ec2f2140c4c5fd8c830.flac",
  "br": 1521,
  "size": 61020551,
  "from": "music.gdstudio.xyz"
}
```

### 关键字段说明
- `url`: 实际音频文件直链（可能是 FLAC/MP3）
- `br`: 比特率（kbps）
- `size`: 文件大小（字节）
- **典型使用流程**: 网易云搜索 → 拿到 `id` → 调用本接口获取播放URL

---

## 7. JOOX（gdstudio）

### 基本信息
- **接口地址**: `https://music-api.gdstudio.xyz/api.php`
- **请求方式**: GET
- **覆盖区域**: 主要覆盖港台/东南亚，繁体中文歌曲资源丰富

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| types | string | 是 | 固定填 `search` |
| source | string | 是 | 固定填 `joox` |
| name | string | 是 | 搜索关键词（URL编码） |
| page | int | 是 | 页码，从1开始 |
| count | int | 是 | 每页数量 |

### 调用示例

```bash
curl -s "https://music-api.gdstudio.xyz/api.php?types=search&source=joox&name=Beyond+%E9%95%BF%E5%9F%8E&page=1&count=5"
```

### 响应结构

```json
[
  {
    "id": "bLnv0PqDX_qAlIqapc+Okw==",
    "name": "晴天",
    "artist": ["周杰倫"],
    "album": "葉惠美",
    "pic_id": "6ceeacac2d30aa13",
    "url_id": "bLnv0PqDX_qAlIqapc+Okw==",
    "lyric_id": "bLnv0PqDX_qAlIqapc+Okw==",
    "source": "joox",
    "from": "music.gdstudio.xyz"
  }
]
```

### 关键字段说明
- 响应是**数组**而非对象
- `id` / `url_id` / `lyric_id`: 歌曲标识（Base64编码）
- `artist`: 歌手数组（繁体中文）
- `pic_id`: 封面图标识
- 搜索"Beyond 长城"直接命中"長城 (Single Version)" by Beyond

---

## 不可用接口记录（2026-03-11）

| 平台 | 原接口 | 失败原因 |
|------|--------|---------|
| B站 | `music-api.gdstudio.xyz/api.php` (source=bilibili) | 搜索返回空，source 当日失效 |
| 酷我音乐 | `www.kuwo.cn/api/www/search/...` | WAF 拦截，csrf token 无法获取 |

---

## 各接口组合使用建议

### 典型工作流："判断某首歌在哪些平台可听"

```
1. 用 Apple Music (iTunes) 查 → 最稳定，确认歌曲是否存在
2. 用 QQ音乐 查 → 中文歌最全，看 pay 字段判断是否免费
3. 用咪咕查 → 返回最详细，含多种音质和封面
4. 用网易云搜索 → 拿到 id
5. 用 gdstudio URL 检测 → 拿到实际播放链接
6. 用 JOOX 查 → 补充港台/东南亚版本
7. 用酷狗查 → 额外覆盖（注意 IP 风控）
```

### 快速选型

| 需求 | 首选接口 | 理由 |
|------|---------|------|
| 稳定性最高 | Apple Music (iTunes) | 官方公开API，无需任何认证 |
| 中文歌详情 | QQ音乐 | 曲库最全，字段丰富（音质/文件大小/付费状态） |
| 信息最丰富 | 咪咕音乐 | 返回标签、歌词URL、多尺寸封面、MV、多音质格式 |
| 获取播放链接 | 网易云搜索 + gdstudio URL | 可拿到 FLAC 无损直链 |
| 30秒试听 | Apple Music (iTunes) | `previewUrl` 直接可用 |
| 封面图片 | Apple Music / 咪咕 | 直链可用，支持多尺寸 |
| 港台歌曲 | JOOX | 繁体中文资源丰富 |
