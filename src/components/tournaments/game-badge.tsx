import { cn } from "@/lib/utils"

export type GameSlug = "free-fire-max" | "bgmi" | "valorant" | "cs2" | string

interface GameBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  slug: GameSlug
}

export function GameBadge({ name, slug, className, ...props }: GameBadgeProps) {
  const getColorClasses = (slug: GameSlug) => {
    switch (slug) {
      case "free-fire-max":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "bgmi":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "valorant":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "cs2":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
    }
  }

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border",
        getColorClasses(slug),
        className
      )}
      {...props}
    >
      <span className="truncate">{name}</span>
    </div>
  )
}
