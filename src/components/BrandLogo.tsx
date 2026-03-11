import { cn } from "@/lib/utils"

interface BrandLogoProps {
  /** "sm" for header, "lg" for hero */
  size?: "sm" | "lg"
  className?: string
  /** 是否显示品牌副标题 */
  showTagline?: boolean
}

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M512 631.46m-333.3 0a333.3 333.3 0 1 0 666.6 0 333.3 333.3 0 1 0-666.6 0Z"
        fill="#1462ED"
      />
      <path
        d="M678.74 239.28v392.25c0 92-74.81 166.55-166.81 166.55s-166.56-74.56-166.56-166.55c0-92 74.56-166.81 166.56-166.81 28.05 0 54.59 7.08 77.85 19.46V247.37c-0.01 0 42.96 4.8 88.96-8.09z"
        fill="#39E2A0"
      />
      <path
        d="M678.65 342.94v288.52c0 91.99-74.66 166.65-166.65 166.65s-166.65-74.66-166.65-166.65c0-91.99 74.66-166.65 166.65-166.65 28.11 0 54.55 7 77.77 19.33V307.5c31.66 7.33 61.55 19.44 88.88 35.44z"
        fill="#0C2E97"
      />
      <path
        d="M512 631.46m-77.77 0a77.77 77.77 0 1 0 155.54 0 77.77 77.77 0 1 0-155.54 0Z"
        fill="#FFFFFF"
      />
      <path
        d="M647.65 101.54c-26.79 23.76-41.45 56.87-49.03 85.43-8.84 32.6-8.84 59.14-8.84 60.41 0 0 42.96 4.8 88.96-8.09 22.24-6.07 45.24-16.43 64.2-33.11 57.62-51.31 57.88-143.81 57.88-146.08-0.01-0.01-94.79-10.38-153.17 41.44z"
        fill="#1462ED"
      />
    </svg>
  )
}

export function BrandLogo({
  size = "sm",
  className,
  showTagline = false,
}: BrandLogoProps) {
  const isLarge = size === "lg"

  return (
    <div
      className={cn(
        "flex items-center",
        isLarge ? "gap-3.5" : "gap-2.5",
        className
      )}
    >
      <LogoIcon className={isLarge ? "size-10" : "size-7"} />
      <div className="flex flex-col">
        <span
          className={cn(
            "font-bold tracking-tight",
            isLarge ? "text-xl" : "text-sm"
          )}
        >
          Mscout
        </span>
        {showTagline && (
          <span
            className={cn(
              "uppercase tracking-widest text-muted-foreground",
              isLarge ? "text-[11px]" : "text-[10px]"
            )}
          >
            Music Scout
          </span>
        )}
      </div>
    </div>
  )
}

export { LogoIcon }
