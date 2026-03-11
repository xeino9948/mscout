import { SearchForm } from "@/components/SearchForm"
import { ResultsGrid } from "@/components/ResultsGrid"
import { useSearch } from "@/hooks/useSearch"
import { BrandLogo } from "@/components/BrandLogo"
import { HeroBrand } from "@/components/HeroBrand"
import { PlatformMarquee } from "@/components/PlatformMarquee"
import { ActivityIcon } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

export function App() {
  const { data, isLoading, error, search } = useSearch()

  const hasResults = !!data || isLoading

  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <BrandLogo size="sm" showTagline />
          <div className="flex items-center gap-1.5 text-[10px] tracking-widest text-muted-foreground uppercase">
            <ActivityIcon className="size-3" />
            <span>7 Platforms</span>
          </div>
        </div>
      </header>

      {/* Hero / Search */}
      <section
        className={`flex flex-col items-center justify-center px-6 transition-all duration-500 ease-out ${
          hasResults ? "pt-10 pb-8" : "flex-1 py-12"
        }`}
      >
        <AnimatePresence mode="wait">
          {!hasResults && (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mb-10 flex flex-col items-center gap-8"
            >
              {/* 极致品牌展示 */}
              <HeroBrand />

              {/* 平台跑马灯 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                <PlatformMarquee />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-2xl">
          <SearchForm onSearch={search} isLoading={isLoading} />
        </div>
      </section>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden px-6"
          >
            <div className="mx-auto max-w-2xl rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {hasResults && (
        <section className="flex-1 px-6 pb-12">
          <div className="mx-auto max-w-6xl">
            <ResultsGrid data={data} isLoading={isLoading} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/30 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-center">
          <span className="text-[10px] tracking-widest text-muted-foreground/50 uppercase">
            Mscout — Music Scout
          </span>
        </div>
      </footer>
    </div>
  )
}

export default App
