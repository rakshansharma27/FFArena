import { createClient } from "@/lib/supabase/server"
import { LeaderboardFilters } from "@/components/leaderboard/leaderboard-filters"
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table"
import { Trophy, ArrowUpRight } from "lucide-react"

interface LeaderboardPageProps {
  searchParams: Promise<{
    game?: string
    scope?: string
    state?: string
    season?: string
    search?: string
  }>
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  // 1. Fetch active games
  const { data: gamesData } = await supabase
    .from("games")
    .select("id, name, slug")
    .eq("is_active", true)

  const games = gamesData || []
  const defaultGame = games[0]
  const gameSlug = params.game || defaultGame?.slug || ""
  const selectedGame = games.find((g) => g.slug === gameSlug) || defaultGame

  // 2. Fetch seasons for the selected game
  const { data: seasonsData } = await supabase
    .from("seasons")
    .select("id, name")
    .eq("game_id", selectedGame?.id || "")
    .eq("is_active", true)

  const seasons = seasonsData || []

  const scope = params.scope || "NATIONAL"
  const state = params.state || ""
  const seasonId = params.season || ""
  const search = params.search || ""

  // 3. Query Leaderboard Entries with profile join
  let query = supabase
    .from("leaderboard_entries")
    .select(`
      id,
      scope,
      scope_value,
      points,
      current_rank,
      profile:profiles!inner(
        id,
        username,
        display_name,
        avatar_url,
        state,
        city
      )
    `)
    .eq("game_id", selectedGame?.id || "")
    .eq("scope", scope)

  if (state) {
    query = query.eq("profiles.state", state)
  }

  if (seasonId) {
    query = query.eq("season_id", seasonId)
  }

  if (search) {
    // Look up by username or display_name
    query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`, { foreignTable: "profiles" })
  }

  // Order by rank/points
  const { data: entries = [], error: entriesError } = await query
    .order("points", { ascending: false })
    .range(0, 49) // Top 50

  if (entriesError) {
    console.error("Error fetching leaderboard entries:", entriesError)
  }

  // 4. Fetch currently authenticated user (if any)
  const { data: { user } } = await supabase.auth.getUser()
  const currentUserId = user?.id || null

  return (
    <div className="min-h-screen bg-[#07070A] text-[#f8fafc] py-12 px-4 sm:px-6 relative overflow-hidden selection:bg-[#ff6b00] selection:text-white">
      {/* Visual background accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#0ea5e9]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#ff6b00]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1e1e2f] pb-8">
          <div>
            <div className="flex items-center gap-2 text-[#ff6b00] font-bold text-xs uppercase tracking-widest mb-1.5">
              <Trophy className="w-4 h-4 animate-pulse" /> Live Standings
            </div>
            <h1 className="text-4xl font-heading font-black tracking-tight text-white flex items-center gap-2">
              Hall of Fame
            </h1>
            <p className="text-[#94a3b8] text-sm mt-1 max-w-lg">
              Compete, earn points, and climb the local, state, and national leaderboards of India's top esports matches.
            </p>
          </div>

          <div className="bg-[#0D0D14] border border-[#1e1e2f] p-4 rounded-xl flex items-center gap-4">
            <div className="bg-[#151522] w-10 h-10 rounded-lg flex items-center justify-center text-[#ff6b00] border border-[#1e1e2f] shrink-0 font-bold">
              +25
            </div>
            <div className="text-xs">
              <div className="font-bold text-[#f8fafc] flex items-center gap-1">
                Win Rating <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[#94a3b8] mt-0.5">ELO boosts automatically on match wins</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <LeaderboardFilters
          games={games as any[]}
          seasons={seasons as any[]}
          currentGameSlug={gameSlug}
          currentScope={scope}
          currentState={state}
          currentSeasonId={seasonId}
          currentSearch={search}
        />

        {/* Standings Table */}
        <LeaderboardTable entries={entries as any[]} currentUserId={currentUserId} />
      </div>
    </div>
  )
}
export const runtime = 'edge';
