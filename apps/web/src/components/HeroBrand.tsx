import { useEffect, useState, useRef, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { LogoIcon } from "@/components/BrandLogo"

// ─── 品牌名逐字符数据 ─────────────────────────────────────────
const BRAND_NAME = "Mscout"
const BRAND_CHARS = BRAND_NAME.split("")

// ─── 副标题关键词轮播 ─────────────────────────────────────────
const ROTATING_WORDS = ["Scout", "Discover", "Track", "Verify", "Monitor"]

// ─── 音频频谱条数 ─────────────────────────────────────────────
const SPECTRUM_BARS = 48
const SPECTRUM_BAR_DATA = Array.from({ length: SPECTRUM_BARS }, (_, i) => ({
  id: i,
  phase: (i * 137.508) % 360,
  amplitude: 0.3 + Math.sin(i * 0.5) * 0.4 + Math.random() * 0.3,
  speed: 1.5 + Math.random() * 2,
}))

// ─── M 字符的音符小粒子（装饰） ─────────────────────────────
function MusicParticles() {
  const particles = [
    { x: -6, y: -20, delay: 2.0, dur: 2.8 },
    { x: 14, y: -28, delay: 2.6, dur: 3.2 },
    { x: -2, y: -34, delay: 3.4, dur: 2.5 },
  ]

  return (
    <>
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-[0.18em] text-foreground/20"
          style={{ left: `calc(50% + ${p.x}px)`, top: `${p.y}px` }}
          initial={{ opacity: 0, y: 0 }}
          animate={{
            opacity: [0, 0.5, 0],
            y: [0, -18, -30],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
          aria-hidden="true"
        >
          &#9835;
        </motion.span>
      ))}
    </>
  )
}

// ─── 逐字符揭示的品牌名（带独立 hover 交互）──────────────────
function BrandTitle() {
  const [hoveredChar, setHoveredChar] = useState<number | null>(null)

  return (
    <div className="flex items-baseline gap-[2px]">
      {BRAND_CHARS.map((char, i) => {
        const isM = i === 0
        const isHovered = hoveredChar === i

        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 40, rotateX: -90, filter: "blur(8px)" }}
            animate={{
              opacity: 1,
              y: isHovered ? -8 : 0,
              rotateX: 0,
              filter: "blur(0px)",
              scale: isHovered ? 1.1 : 1,
              rotateZ: isHovered ? (i % 2 === 0 ? -3 : 3) : 0,
            }}
            transition={
              isHovered
                ? { type: "spring", stiffness: 400, damping: 15 }
                : {
                    duration: isM ? 0.8 : 0.6,
                    delay: 0.3 + i * 0.08,
                    ease: [0.215, 0.61, 0.355, 1],
                  }
            }
            onMouseEnter={() => setHoveredChar(i)}
            onMouseLeave={() => setHoveredChar(null)}
            className={`inline-block cursor-default select-none text-[clamp(4rem,12vw,9rem)] leading-none font-bold tracking-tighter transition-colors duration-200 ${
              isM ? "relative" : ""
            } ${isHovered ? "text-foreground" : ""}`}
            style={{ transformOrigin: "bottom center" }}
          >
            {isM ? (
              <>
                {/* M 字符 — 特殊待遇：底部装饰线 + 微妙持续动效 + 音符粒子 */}
                <motion.span
                  className="relative inline-block"
                  animate={{ y: isHovered ? 0 : [0, -3, 0] }}
                  transition={
                    isHovered
                      ? { type: "spring", stiffness: 400, damping: 15 }
                      : {
                          duration: 3,
                          delay: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                  }
                >
                  {char}
                  {/* 底部品牌标识线 */}
                  <motion.span
                    className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-foreground"
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: 1,
                      backgroundColor: isHovered
                        ? "var(--foreground)"
                        : "var(--foreground)",
                    }}
                    transition={{
                      duration: 0.4,
                      delay: 0.3 + BRAND_CHARS.length * 0.08 + 0.3,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    style={{ transformOrigin: "left center" }}
                  />
                </motion.span>
                <MusicParticles />
              </>
            ) : (
              char
            )}
          </motion.span>
        )
      })}

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

// ─── 音频频谱可视化（始终显示，hover 增强）─────────────────────────
function AudioSpectrum() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="flex h-16 cursor-pointer items-end justify-center gap-[2px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {SPECTRUM_BAR_DATA.map((bar) => (
        <motion.div
          key={bar.id}
          className="w-[3px] rounded-full transition-colors duration-300"
          style={{
            backgroundColor: isHovered
              ? `oklch(0.6 0.18 ${(bar.phase + 200) % 360} / 0.4)`
              : `oklch(0.6 0.15 ${(bar.phase + 200) % 360} / 0.25)`,
          }}
          initial={{ height: 4 }}
          animate={{
            height: isHovered
              ? [
                  bar.amplitude * 64 + 12,
                  bar.amplitude * 32 + 6,
                  bar.amplitude * 56 + 16,
                  bar.amplitude * 64 + 12,
                ]
              : [
                  bar.amplitude * 48 + 8,
                  bar.amplitude * 24 + 6,
                  bar.amplitude * 56 + 12,
                  bar.amplitude * 48 + 8,
                ],
          }}
          transition={{
            duration: isHovered ? bar.speed * 0.5 : bar.speed * 0.7,
            delay: (bar.phase / 360) * 0.5,
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
    <span className="relative inline-flex h-[1.4em] w-[8ch] items-center justify-start overflow-hidden">
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

// ─── Logo 入场动画 + 磁力鼠标追踪 ────────────────────────────
function AnimatedLogo() {
  const containerRef = useRef<HTMLDivElement>(null)

  // 鼠标位置 motion values
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // 弹性跟随 — 有质量感
  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  // 微弱旋转跟随鼠标
  const rotateX = useTransform(y, [-30, 30], [8, -8])
  const rotateY = useTransform(x, [-30, 30], [-8, 8])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      // 限制偏移范围
      const dx = Math.max(-30, Math.min(30, (e.clientX - centerX) * 0.15))
      const dy = Math.max(-30, Math.min(30, (e.clientY - centerY) * 0.15))
      mouseX.set(dx)
      mouseY.set(dy)
    },
    [mouseX, mouseY]
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
  }, [mouseX, mouseY])

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        duration: 0.8,
        delay: 0.1,
        ease: [0.175, 0.885, 0.32, 1.1],
      }}
      className="relative cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y, rotateX, rotateY, perspective: 800 }}
      whileHover={{ scale: 1.08 }}
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

// ─── 装饰性标签（hover 交互）────────────────────────────────
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
          whileHover={{
            scale: 1.08,
            y: -2,
            backgroundColor: "var(--secondary)",
          }}
          className="cursor-default rounded-full border border-border/50 px-2.5 py-0.5 text-[10px] tracking-widest text-muted-foreground/60 uppercase transition-colors duration-200 hover:border-border hover:text-muted-foreground"
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

// ─── 副标题（hover 高亮交互）──────────────────────────────────
function Subtitle() {
  return (
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.0 }}
      className="group max-w-sm cursor-default text-center text-sm leading-relaxed text-muted-foreground sm:text-base"
    >
      <RotatingKeyword />{" "}
      <span className="transition-colors duration-300 group-hover:text-foreground/80">
        music availability
      </span>
      <br />
      <span className="transition-colors duration-300 group-hover:text-foreground/60">
        across every major platform.
      </span>
    </motion.p>
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
      <Subtitle />

      {/* 装饰标签 */}
      <DecorativeLabels />
    </div>
  )
}
