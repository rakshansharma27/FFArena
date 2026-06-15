import Link from "next/link"
import Image from "next/image"
import { Users, Trophy, IndianRupee, MapPin } from "lucide-react"
import { StatusPill, TournamentStatus } from "./status-pill"
import { GameBadge, GameSlug } from "./game-badge"
import { cn } from "@/lib/utils"

interface TournamentCardProps {
  id: string
  title: string
  slug: string
  bannerUrl: string | null
  status: TournamentStatus
  game: {
    name: string
    slug: string
  }
  registeredCount: number
  maxTeams: number
  prizePoolPaise: number
  entryFeePaise: number
  city: string | null
  state: string | null
  className?: string
}

export function TournamentCard({
  title,
  slug,
  bannerUrl,
  status,
  game,
  registeredCount,
  maxTeams,
  prizePoolPaise,
  entryFeePaise,
  city,
  state,
  className
}: TournamentCardProps) {
  const progressPercent = Math.min(Math.round((registeredCount / maxTeams) * 100), 100)
  const isFull = registeredCount >= maxTeams
  const prizePool = prizePoolPaise / 100
  const entryFee = entryFeePaise / 100

  return (
    <Link 
      href={`/tournaments/${slug}`}
      className={cn(
        "group flex flex-col bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className
      )}
    >
      {/* Banner */}
      <div className="relative aspect-video w-full bg-zinc-800 overflow-hidden">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800/80">
            <Trophy className="w-12 h-12 text-zinc-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <GameBadge name={game.name} slug={game.slug} />
        </div>
        <div className="absolute top-3 right-3">
          <StatusPill status={status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-heading text-lg font-bold text-zinc-100 line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        {city && state && (
          <div className="flex items-center text-zinc-400 text-xs mb-4">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            <span className="truncate">{city}, {state}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-auto mb-5">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 font-medium">Prize Pool</span>
            <div className="flex items-center text-primary font-bold">
              <IndianRupee className="w-4 h-4 mr-0.5" />
              {prizePool.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-500 font-medium">Entry Fee</span>
            <div className="flex items-center text-zinc-200 font-medium">
              {entryFee === 0 ? (
                <span className="text-green-400 font-bold uppercase text-sm tracking-wide">Free</span>
              ) : (
                <>
                  <IndianRupee className="w-4 h-4 mr-0.5" />
                  {entryFee.toLocaleString("en-IN")}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center justify-between text-xs font-medium">
            <div className="flex items-center text-zinc-400">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              <span>Teams</span>
            </div>
            <span className={cn(
              "font-mono", 
              isFull ? "text-yellow-500" : "text-zinc-300"
            )}>
              {registeredCount} / {maxTeams}
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isFull ? "bg-yellow-500" : "bg-primary"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
