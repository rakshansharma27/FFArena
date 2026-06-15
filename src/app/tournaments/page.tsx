import { createClient } from "@/lib/supabase/server"
import { TournamentCard } from "@/components/tournaments/tournament-card"
import { TournamentStatus } from "@/components/tournaments/status-pill"
import { GameSlug } from "@/components/tournaments/game-badge"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: { game?: string; status?: string; page?: string }
}) {
  const supabase = await createClient()

  const gameFilter = searchParams.game
  const statusFilter = searchParams.status as TournamentStatus | undefined
  
  const page = parseInt(searchParams.page || "1", 10)
  const pageSize = 12
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("tournaments")
    .select(`
      id,
      title,
      slug,
      banner_url,
      status,
      max_teams,
      registered_count,
      entry_fee_paise,
      prize_pool_paise,
      city,
      state,
      games!inner(name, slug)
    `, { count: 'exact' })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (gameFilter) {
    query = query.eq("games.slug", gameFilter)
  }
  
  if (statusFilter) {
    query = query.eq("status", statusFilter)
  }

  const { data: tournaments, count, error } = await query

  const totalPages = count ? Math.ceil(count / pageSize) : 0

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 pt-24 pb-12">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-heading font-black tracking-tight mb-2">
              Discover <span className="text-primary">Tournaments</span>
            </h1>
            <p className="text-zinc-400 max-w-2xl">
              Find and register for the latest grassroots esports tournaments in your area. Play local, rise national.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              href="/tournaments"
              className={`px-4 py-2 text-sm rounded-md border ${!gameFilter ? 'bg-primary text-white border-primary' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'}`}
            >
              All
            </Link>
            <Link 
              href="/tournaments?game=free-fire-max"
              className={`px-4 py-2 text-sm rounded-md border ${gameFilter === 'free-fire-max' ? 'bg-orange-500 text-white border-orange-500' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'}`}
            >
              Free Fire
            </Link>
            <Link 
              href="/tournaments?game=bgmi"
              className={`px-4 py-2 text-sm rounded-md border ${gameFilter === 'bgmi' ? 'bg-green-500 text-white border-green-500' : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'}`}
            >
              BGMI
            </Link>
          </div>
        </div>

        {error ? (
          <div className="p-4 border border-red-500/50 bg-red-500/10 text-red-400 rounded-lg">
            Failed to load tournaments. Please try again later.
          </div>
        ) : !tournaments || tournaments.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <h3 className="text-xl font-bold mb-2">No tournaments found</h3>
            <p className="text-zinc-400 mb-6">There are no tournaments matching your current filters.</p>
            <Link href="/tournaments" className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors">
              Clear Filters
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  id={tournament.id}
                  title={tournament.title}
                  slug={tournament.slug}
                  bannerUrl={tournament.banner_url}
                  status={tournament.status as TournamentStatus}
                  game={{
                    name: (tournament.games as any).name,
                    slug: (tournament.games as any).slug,
                  }}
                  registeredCount={tournament.registered_count}
                  maxTeams={tournament.max_teams}
                  prizePoolPaise={tournament.prize_pool_paise}
                  entryFeePaise={tournament.entry_fee_paise}
                  city={tournament.city}
                  state={tournament.state}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                {page > 1 && (
                  <Link 
                    href={`/tournaments?page=${page - 1}${gameFilter ? `&game=${gameFilter}` : ''}`}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm hover:bg-zinc-800 transition-colors"
                  >
                    Previous
                  </Link>
                )}
                <span className="text-sm text-zinc-400 px-4">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link 
                    href={`/tournaments?page=${page + 1}${gameFilter ? `&game=${gameFilter}` : ''}`}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm hover:bg-zinc-800 transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
export const runtime = 'edge';
