import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MatchManagerClient } from "@/components/bracket/match-manager"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function OrganizerBracketManagePage({
  params
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*, games(name)")
    .eq("slug", params.slug)
    .single()

  if (!tournament || tournament.organizer_id !== user.id) {
    redirect("/organizer/tournaments")
  }

  // Fetch matches if they exist
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(name),
      team2:teams!matches_team2_id_fkey(name)
    `)
    .eq("tournament_id", tournament.id)
    .order("round", { ascending: true })
    .order("match_order", { ascending: true })

  // Count confirmed teams
  const { count: teamCount } = await supabase
    .from("teams")
    .select("id", { count: "exact" })
    .eq("tournament_id", tournament.id)
    .eq("registration_status", "CONFIRMED")

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
      <Link 
        href={`/tournaments/${params.slug}`}
        className="inline-flex items-center gap-2 text-[#ff6b00] hover:text-[#ff6b00]/80 transition-colors mb-8 font-semibold text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tournament Details
      </Link>

      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-heading font-black text-white">Manage Bracket</h1>
        <p className="text-zinc-400 mt-2">
          {tournament.title} • {(tournament.games as any).name} • {teamCount} Teams Registered
        </p>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap border-b border-zinc-800 mb-8 gap-6 text-sm">
        <Link 
          href={`/organizer/tournaments/${params.slug}/bracket/manage`}
          className="pb-4 text-[#ff6b00] border-b-2 border-[#ff6b00] font-semibold transition-colors"
        >
          Manage Bracket
        </Link>
        <Link 
          href={`/organizer/tournaments/${params.slug}/prizes`}
          className="pb-4 text-zinc-400 hover:text-white transition-colors"
        >
          Configure Prizes
        </Link>
        <Link 
          href={`/organizer/tournaments/${params.slug}/payouts`}
          className="pb-4 text-zinc-400 hover:text-white transition-colors"
        >
          Distribute Payouts
        </Link>
        <Link 
          href={`/organizer/tournaments/${params.slug}/sponsorships`}
          className="pb-4 text-zinc-400 hover:text-white transition-colors"
        >
          Sponsorships
        </Link>
        <Link 
          href={`/organizer/tournaments/${params.slug}/stream`}
          className="pb-4 text-zinc-400 hover:text-white transition-colors"
        >
          Stream & Overlay
        </Link>
      </div>

      <MatchManagerClient 
        tournament={tournament} 
        matches={matches || []} 
        teamCount={teamCount || 0} 
      />
    </div>
  )
}
export const runtime = 'edge';
