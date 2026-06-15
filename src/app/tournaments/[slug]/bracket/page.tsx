import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { RoundRobinTable } from "@/components/bracket/round-robin-table"
import { SingleEliminationBracket } from "@/components/bracket/single-elimination"
import { SponsorBanner } from "@/components/sponsor/sponsor-banner"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function TournamentBracketPage({
  params
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*, games(name)")
    .eq("slug", params.slug)
    .single()

  if (!tournament) notFound()

  // Fetch active sponsorships
  const { data: sponsorDeals } = await supabase
    .from("sponsorship_deals")
    .select(`
      id,
      sponsor:sponsors(company_name, logo_url, website_url)
    `)
    .eq("tournament_id", tournament.id)
    .eq("status", "ACTIVE")

  // Safely cast nested array or single objects
  const deals = (sponsorDeals || []).map(d => ({
    id: d.id,
    sponsor: Array.isArray(d.sponsor) ? d.sponsor[0] : d.sponsor
  }))

  // Log impressions
  if (deals.length > 0) {
    const dealIds = deals.map(d => d.id)
    await supabase.rpc("increment_deal_impressions", { deal_ids: dealIds })
  }

  const { data: matches } = await supabase
    .from("matches")
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(name),
      team2:teams!matches_team2_id_fkey(name)
    `)
    .eq("tournament_id", tournament.id)

  const { data: brackets } = await supabase
    .from("brackets")
    .select("*")
    .eq("tournament_id", tournament.id)

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .eq("tournament_id", tournament.id)
    .eq("registration_status", "CONFIRMED")

  const isRoundRobin = tournament.format === "ROUND_ROBIN"

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <Link 
          href={`/tournaments/${params.slug}`}
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tournament
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-heading font-black text-white tracking-tight">{tournament.title}</h1>
          <p className="text-zinc-400 mt-2 text-lg">
            {(tournament.games as any).name} • {isRoundRobin ? "Round Robin Standings" : "Bracket"}
          </p>
        </div>

        {deals.length > 0 && (
          <div className="mb-8">
            <SponsorBanner deals={deals} />
          </div>
        )}

        {!matches || matches.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Bracket Not Available</h2>
            <p className="text-zinc-400">The organizer has not generated the bracket yet.</p>
          </div>
        ) : isRoundRobin ? (
          <RoundRobinTable matches={matches} teams={teams || []} />
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 overflow-hidden">
            <SingleEliminationBracket matches={matches} brackets={brackets || []} />
          </div>
        )}
      </div>
    </div>
  )
}
export const runtime = 'edge';
