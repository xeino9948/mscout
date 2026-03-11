import { useCallback, useRef, useState, useEffect, useMemo } from "react"
import { SearchIcon, Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

// ─── 预置歌曲数据 ─────────────────────────────────────────
const PRESET_SONGS = [
  { song: "bent", artist: "joey pecoraro" },
  { song: "blue bird", artist: "lana del rey" },
  { song: "没有寄的信", artist: "安溥 anpu" },
  { song: "See Me Now", artist: "Ryan Keen" },
  { song: "Norwegian Wood", artist: "The Beatles" },
  { song: "Empty", artist: "Ray LaMontagne" },
  { song: "How to Say Goodbye", artist: "Paul Tiernan" },
  { song: "Perfectly Wrong", artist: "Shawn Mendes" },
] as const

// ─── 打字机 Hook ──────────────────────────────────────────
// 商业级：逐字打出 → 停顿展示 → 逐字擦除 → 切换下一条
function useTypewriter(
  texts: readonly string[],
  {
    typeSpeed = 60,
    deleteSpeed = 35,
    pauseDuration = 2800,
    deletePauseDuration = 600,
  } = {}
) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [phase, setPhase] = useState<"typing" | "paused" | "deleting" | "waiting">("typing")

  useEffect(() => {
    const fullText = texts[currentIndex]
    let timer: ReturnType<typeof setTimeout>

    switch (phase) {
      case "typing":
        if (displayText.length < fullText.length) {
          timer = setTimeout(() => {
            setDisplayText(fullText.slice(0, displayText.length + 1))
          }, typeSpeed + Math.random() * 40) // 微抖动模拟人类打字
        } else {
          timer = setTimeout(() => setPhase("paused"), 100)
        }
        break

      case "paused":
        timer = setTimeout(() => setPhase("deleting"), pauseDuration)
        break

      case "deleting":
        if (displayText.length > 0) {
          timer = setTimeout(() => {
            setDisplayText(displayText.slice(0, -1))
          }, deleteSpeed)
        } else {
          timer = setTimeout(() => setPhase("waiting"), deletePauseDuration)
        }
        break

      case "waiting":
        setCurrentIndex((prev) => (prev + 1) % texts.length)
        setPhase("typing")
        break
    }

    return () => clearTimeout(timer)
  }, [displayText, phase, currentIndex, texts, typeSpeed, deleteSpeed, pauseDuration, deletePauseDuration])

  return { displayText, currentIndex, phase }
}

// ─── 类型定义 ─────────────────────────────────────────────
interface SearchFormProps {
  onSearch: (song: string, artist: string) => void
  isLoading: boolean
}

// ─── 光标组件 ─────────────────────────────────────────────
function TypewriterCursor({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <motion.span
      className="inline-block h-[1.1em] w-[1.5px] translate-y-[1px] bg-foreground/50"
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{
        duration: 1,
        repeat: Infinity,
        times: [0, 0.49, 0.5, 1],
        ease: "linear",
      }}
      aria-hidden="true"
    />
  )
}

// ─── 轮动 Placeholder 叠加层 ──────────────────────────────
function RotatingPlaceholder({
  songText,
  artistText,
  songPhase,
  artistPhase,
  currentIndex,
  onClickSong,
  onClickArtist,
  songFocused,
  artistFocused,
  songHasValue,
  artistHasValue,
}: {
  songText: string
  artistText: string
  songPhase: string
  artistPhase: string
  currentIndex: number
  onClickSong: () => void
  onClickArtist: () => void
  songFocused: boolean
  artistFocused: boolean
  songHasValue: boolean
  artistHasValue: boolean
}) {
  // 当前歌曲的完整信息用于标签显示
  const currentPreset = PRESET_SONGS[currentIndex]

  return (
    <>
      {/* 歌曲名 Placeholder */}
      {!songHasValue && (
        <div
          className="pointer-events-auto absolute inset-0 z-10 flex cursor-text items-center pl-10"
          onClick={onClickSong}
        >
          <span className="flex items-center text-sm text-muted-foreground/50">
            {songText}
            <TypewriterCursor visible={!songFocused && (songPhase === "typing" || songPhase === "deleting")} />
          </span>
        </div>
      )}

      {/* 艺术家 Placeholder */}
      {!artistHasValue && (
        <div
          className="pointer-events-auto absolute inset-0 z-10 flex cursor-text items-center pl-4"
          onClick={onClickArtist}
        >
          <span className="flex items-center text-sm text-muted-foreground/50">
            {artistText}
            <TypewriterCursor visible={!artistFocused && (artistPhase === "typing" || artistPhase === "deleting")} />
          </span>
        </div>
      )}

      {/* 底部预览标签 — 当前轮播条目提示 */}
      <AnimatePresence mode="wait">
        {!songHasValue && !artistHasValue && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute -bottom-6 left-0 flex items-center gap-1.5"
          >
            <span className="text-[10px] tracking-wider text-muted-foreground/30 uppercase">
              Try
            </span>
            <span className="text-[10px] font-medium text-muted-foreground/40">
              {currentPreset.song}
            </span>
            <span className="text-[10px] text-muted-foreground/25">—</span>
            <span className="text-[10px] text-muted-foreground/35">
              {currentPreset.artist}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── 进度指示器 ────────────────────────────────────────────
function CarouselDots({
  total,
  current,
  onSelect,
}: {
  total: number
  current: number
  onSelect: (index: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          className="group relative flex h-4 items-center justify-center"
          aria-label={`Select ${PRESET_SONGS[i].song} by ${PRESET_SONGS[i].artist}`}
        >
          <motion.span
            className="block rounded-full bg-foreground/20 transition-colors group-hover:bg-foreground/40"
            animate={{
              width: i === current ? 16 : 4,
              height: 4,
              opacity: i === current ? 1 : 0.4,
            }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </button>
      ))}
    </div>
  )
}

// ─── 主组件 ─────────────────────────────────────────────────
export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const songRef = useRef<HTMLInputElement>(null)
  const artistRef = useRef<HTMLInputElement>(null)

  const [songValue, setSongValue] = useState("")
  const [artistValue, setArtistValue] = useState("")
  const [songFocused, setSongFocused] = useState(false)
  const [artistFocused, setArtistFocused] = useState(false)

  // 提取歌曲名和艺术家名为两个独立数组
  const songTexts = useMemo(() => PRESET_SONGS.map((p) => p.song), [])
  const artistTexts = useMemo(() => PRESET_SONGS.map((p) => p.artist), [])

  // 两个打字机同步：共用同一个 index
  const songTypewriter = useTypewriter(songTexts, {
    typeSpeed: 55,
    deleteSpeed: 30,
    pauseDuration: 2600,
    deletePauseDuration: 400,
  })

  // 艺术家用从属打字机 — 与歌曲名同步切换
  const [artistDisplay, setArtistDisplay] = useState("")
  const [artistPhase, setArtistPhase] = useState<"typing" | "paused" | "deleting" | "waiting">("typing")

  useEffect(() => {
    const targetArtist = artistTexts[songTypewriter.currentIndex]
    let timer: ReturnType<typeof setTimeout>

    // 跟随歌曲打字机的阶段
    if (songTypewriter.phase === "typing") {
      // 歌曲在打字 → 艺术家也在打字，但稍有延迟
      if (artistDisplay.length < targetArtist.length) {
        timer = setTimeout(() => {
          setArtistDisplay(targetArtist.slice(0, artistDisplay.length + 1))
          setArtistPhase("typing")
        }, 70 + Math.random() * 35)
      } else {
        setArtistPhase("paused")
      }
    } else if (songTypewriter.phase === "paused") {
      setArtistPhase("paused")
    } else if (songTypewriter.phase === "deleting") {
      // 歌曲在删除 → 艺术家也在删除
      if (artistDisplay.length > 0) {
        timer = setTimeout(() => {
          setArtistDisplay(artistDisplay.slice(0, -1))
          setArtistPhase("deleting")
        }, 25)
      } else {
        setArtistPhase("waiting")
      }
    } else if (songTypewriter.phase === "waiting") {
      setArtistDisplay("")
      setArtistPhase("waiting")
    }

    return () => clearTimeout(timer!)
  }, [songTypewriter.phase, songTypewriter.currentIndex, artistDisplay, artistTexts])

  // 点击预设条目 → 自动填充并触发搜索
  const fillPreset = useCallback(
    (index: number) => {
      const preset = PRESET_SONGS[index]
      setSongValue(preset.song)
      setArtistValue(preset.artist)
      if (songRef.current) songRef.current.value = preset.song
      if (artistRef.current) artistRef.current.value = preset.artist
      // 自动搜索
      onSearch(preset.song, preset.artist)
    },
    [onSearch]
  )

  // 点击 placeholder 区域 → 自动填充当前轮播的歌曲
  const handlePlaceholderClickSong = useCallback(() => {
    fillPreset(songTypewriter.currentIndex)
  }, [fillPreset, songTypewriter.currentIndex])

  const handlePlaceholderClickArtist = useCallback(() => {
    fillPreset(songTypewriter.currentIndex)
  }, [fillPreset, songTypewriter.currentIndex])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const song = songRef.current?.value.trim() ?? ""
      const artist = artistRef.current?.value.trim() ?? ""
      if (!song) {
        // 如果没输入，自动填充当前轮播的歌曲
        fillPreset(songTypewriter.currentIndex)
        return
      }
      onSearch(song, artist)
    },
    [onSearch, fillPreset, songTypewriter.currentIndex]
  )

  const songHasValue = songValue.length > 0
  const artistHasValue = artistValue.length > 0

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row"
      >
        {/* 歌曲名输入 */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-3 top-1/2 z-20 -translate-y-1/2">
            <SearchIcon className="size-4 text-muted-foreground/40" />
          </div>
          <input
            ref={songRef}
            type="text"
            value={songValue}
            onChange={(e) => setSongValue(e.target.value)}
            onFocus={() => setSongFocused(true)}
            onBlur={() => setSongFocused(false)}
            disabled={isLoading}
            className="h-11 w-full rounded-md border border-input bg-secondary/50 pl-10 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-transparent focus:bg-secondary/80 focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
            autoComplete="off"
            aria-label="Song title"
          />
          {/* 轮动 Placeholder — 歌曲名 */}
          {!songHasValue && !songFocused && (
            <RotatingPlaceholder
              songText={songTypewriter.displayText}
              artistText=""
              songPhase={songTypewriter.phase}
              artistPhase="paused"
              currentIndex={songTypewriter.currentIndex}
              onClickSong={handlePlaceholderClickSong}
              onClickArtist={() => {}}
              songFocused={songFocused}
              artistFocused={artistFocused}
              songHasValue={songHasValue}
              artistHasValue={true}
            />
          )}
          {songFocused && !songHasValue && (
            <span className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/30">
              Song title
            </span>
          )}
        </div>

        {/* 艺术家输入 */}
        <div className="relative flex-1">
          <input
            ref={artistRef}
            type="text"
            value={artistValue}
            onChange={(e) => setArtistValue(e.target.value)}
            onFocus={() => setArtistFocused(true)}
            onBlur={() => setArtistFocused(false)}
            disabled={isLoading}
            className="h-11 w-full rounded-md border border-input bg-secondary/50 pl-4 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-transparent focus:bg-secondary/80 focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
            autoComplete="off"
            aria-label="Artist"
          />
          {/* 轮动 Placeholder — 艺术家 */}
          {!artistHasValue && !artistFocused && (
            <div
              className="pointer-events-auto absolute inset-0 z-10 flex cursor-text items-center pl-4"
              onClick={handlePlaceholderClickArtist}
            >
              <span className="flex items-center text-sm text-muted-foreground/50">
                {artistDisplay}
                <TypewriterCursor
                  visible={artistPhase === "typing" || artistPhase === "deleting"}
                />
              </span>
            </div>
          )}
          {artistFocused && !artistHasValue && (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/30">
              Artist
            </span>
          )}
        </div>

        {/* 搜索按钮 */}
        <Button
          type="submit"
          disabled={isLoading}
          size="lg"
          className="h-11 min-w-[100px] cursor-pointer gap-2 px-6 text-sm font-medium transition-all duration-200"
        >
          {isLoading ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              <span>Searching</span>
            </>
          ) : (
            <>
              <SearchIcon className="size-4" />
              <span>Scout</span>
            </>
          )}
        </Button>
      </form>

      {/* 底部：轮播指示器 + 提示 */}
      {!songHasValue && !artistHasValue && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-4 flex items-center justify-between px-1"
        >
          <CarouselDots
            total={PRESET_SONGS.length}
            current={songTypewriter.currentIndex}
            onSelect={fillPreset}
          />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-[10px] tracking-wider text-muted-foreground/30 uppercase"
          >
            Click to try
          </motion.span>
        </motion.div>
      )}
    </div>
  )
}
