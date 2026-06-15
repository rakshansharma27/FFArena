"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MapPin, Calendar, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { INDIA_STATES } from "@/lib/india-regions"

interface Game {
  id: string
  name: string
  slug: string
}

interface Season {
  id: string
  name: string
}

interface LeaderboardFiltersProps {
  games: Game[]
  seasons: Season[]
  currentGameSlug: string
  currentScope: string
  currentState: string
  currentSeasonId: string
  currentSearch: string
}

export function LeaderboardFilters({
  games,
  seasons,
  currentGameSlug,
  currentScope,
  currentState,
  currentSeasonId,
  currentSearch,
}: LeaderboardFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch)

  const updateFilters = (updates: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    startTransition(() => {
      router.push(`/leaderboard?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search })
  }

  return (
    <div className="space-y-6">
      {/* Game Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#1e1e2f] pb-4">
        {games.map((game) => {
          const isActive = currentGameSlug === game.slug
          return (
            <button
              key={game.id}
              onClick={() => updateFilters({ game: game.slug })}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                isActive
                  ? "bg-[#ff6b00] text-white shadow-lg shadow-orange-500/20"
                  : "bg-[#0D0D14] text-[#94a3b8] hover:text-[#f8fafc] border border-[#1e1e2f]"
              }`}
            >
              {game.name}
            </button>
          )
        })}
      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="space-y-1.5 md:col-span-1">
          <label className="text-xs font-bold text-[#94a3b8] flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Search Player
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Type username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0D0D14] border-[#1e1e2f] text-[#f8fafc] focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] h-10 pr-10"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  updateFilters({ search: "" })
                }}
                className="absolute right-3 top-2.5 text-xs text-[#94a3b8] hover:text-[#f8fafc] font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Scope Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#94a3b8] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 font-bold" /> Scope
          </label>
          <Select
            value={currentScope}
            onValueChange={(val) => updateFilters({ scope: val })}
          >
            <SelectTrigger className="bg-[#0D0D14] border-[#1e1e2f] text-[#f8fafc] h-10">
              <SelectValue placeholder="Select Scope" />
            </SelectTrigger>
            <SelectContent className="bg-[#0D0D14] border-[#1e1e2f] text-[#f8fafc]">
              <SelectItem value="NATIONAL">National</SelectItem>
              <SelectItem value="CITY">City-Level</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* State Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#94a3b8] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-orange-400" /> State
          </label>
          <Select
            value={currentState}
            onValueChange={(val) => updateFilters({ state: val === "ALL" ? "" : val })}
          >
            <SelectTrigger className="bg-[#0D0D14] border-[#1e1e2f] text-[#f8fafc] h-10">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent className="bg-[#0D0D14] border-[#1e1e2f] text-[#f8fafc] max-h-60 overflow-y-auto">
              <SelectItem value="ALL">All States</SelectItem>
              {INDIA_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Season Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#94a3b8] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-400" /> Season
          </label>
          <Select
            value={currentSeasonId || "ALL"}
            onValueChange={(val) => updateFilters({ season: val === "ALL" ? "" : val })}
          >
            <SelectTrigger className="bg-[#0D0D14] border-[#1e1e2f] text-[#f8fafc] h-10">
              <SelectValue placeholder="All Seasons" />
            </SelectTrigger>
            <SelectContent className="bg-[#0D0D14] border-[#1e1e2f] text-[#f8fafc]">
              <SelectItem value="ALL">All Seasons</SelectItem>
              {seasons.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
