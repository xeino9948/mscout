import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LogoIcon } from "@/components/BrandLogo"

// ─── 品牌名逐字符数据 ─────────────────────────────────────────
const BRAND_CHARS = "mscout".split("")

// ─── 副标题关键词轮播 ─────────────────────────────────────────
const ROTATING_WORDS = ["Scout", "Discover", "Track", "Verify", "Monitor"]

// ─── 音频频谱条数 ─────────────────────────────────────────────
const SPECTRUM_BARS = 48
const SPECTRUM_BAR_DATA = Array.from({ length: SPECTRUM_BARS }, (_, i) => ({
  id: i,
  // 生成伪随机的初始相位和振幅
  phase: (i * 137.508) % 360, // 黄金角分布，视觉均匀
  amplitude: 0.3 + Math.sin(i * 0.5) * 0.4 + Math.random() * 0.3,
  speed: 1.5 + Math.random() * 2,
}))

// ─── 逐字符揭示的品牌名 ──────────────────────────────────────
function BrandTitle() {
  return (
    <div className="flex items-baseline gap-[2px]">
      {BRAND_CHARS.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, rotateX: -90, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.6,
            delay: 0.3 + i * 0.08,
            ease: [0.215, 0.61, 0.355, 1],
          }}
          className="inline-block text-[clamp(4rem,12vw,9rem)] font-bold leading-none tracking-tighter"
          style={{ transformOrigin: "bottom center" }}
        >
          {char}
        </motion.span>
      ))}

      {/* 光标闪烁 */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 1,
          delay: 0.3 + BRAND_CHARS.length * 0.08 + 0.2,
          repeat: Infinity,
          repeatDelay: 0,
          times: [0, 0.1, 0.5, 0.6],
        }}
        className="ml-1 inline-block h-[clamp(3.5rem,10vw,7.5rem)] w-[3px] translate-y-[0.1em] bg-foreground"
      />
    </div>
  )
}

// ─── 音频频谱可视化（纯装饰性） ─────────────────────────────
function AudioSpectrum() {
  return (
    <div className="flex h-16 items-end justify-center gap-[2px]">
      {SPECTRUM_BAR_DATA.map((bar) => (
        <motion.div
          key={bar.id}
          className="w-[3px] rounded-full bg-foreground/[0.08]"
          initial={{ height: 4 }}
          animate={{
            height: [
              4,
              bar.amplitude * 56 + 8,
              bar.amplitude * 24 + 4,
              bar.amplitude * 48 + 12,
              4,
            ],
          }}
          transition={{
            duration: bar.speed,
            delay: (bar.phase / 360) * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// ─── 关键词旋转器 ──────────────────────────────────────────
function RotatingKeyword() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_WORDS.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <span className="relative inline-flex h-[1.4em] w-[5.5ch] items-center justify-start overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={ROTATING_WORDS[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute font-semibold text-foreground"
        >
          {ROTATING_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// ─── Logo 入场动画 ────────────────────────────────────────────
function AnimatedLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        duration: 0.8,
        delay: 0.1,
        ease: [0.175, 0.885, 0.32, 1.1],
      }}
      className="relative"
    >
      {/* 外圈呼吸环 */}
      <motion.div
        className="absolute -inset-3 rounded-full border border-foreground/[0.06]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.2, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -inset-6 rounded-full border border-foreground/[0.03]"
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{
          duration: 4,
          delay: 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <LogoIcon className="size-16 sm:size-20" />
    </motion.div>
  )
}

// ─── 装饰性标签 ────────────────────────────────────────────
function DecorativeLabels() {
  const labels = [
    { text: "v1.0", delay: 1.2 },
    { text: "7 sources", delay: 1.35 },
    { text: "real-time", delay: 1.5 },
  ]

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.1 }}
    >
      {labels.map((label, i) => (
        <motion.span
          key={label.text}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: label.delay }}
          className="rounded-full border border-border/50 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground/60"
        >
          {i > 0 && (
            <span className="mr-2 inline-block size-1 rounded-full bg-muted-foreground/20" />
          )}
          {label.text}
        </motion.span>
      ))}
    </motion.div>
  )
}

// ─── 主组件 ─────────────────────────────────────────────────
export function HeroBrand() {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Logo */}
      <AnimatedLogo />

      {/* 频谱 — logo 下方的装饰 */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0.6 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <AudioSpectrum />
      </motion.div>

      {/* 品牌名 — 核心视觉 */}
      <BrandTitle />

      {/* 副标题 */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground sm:text-base"
      >
        <RotatingKeyword /> music availability
        <br />
        across every major platform.
      </motion.p>

      {/* 装饰标签 */}
      <DecorativeLabels />
    </div>
  )
}
