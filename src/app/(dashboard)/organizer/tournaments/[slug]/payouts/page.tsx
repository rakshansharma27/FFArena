import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PayoutsClient } from "@/components/tournament/payouts-client"
import Link from "next/link"
import { ArrowLeft, Landmark, Coins } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function OrganizerPayoutsPage({
  params
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fetch tournament
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*, games(name)")
    .eq("slug", params.slug)
    .single()

  if (!tournament || tournament.organizer_id !== user.id) {
    redirect("/organizer/tournaments")
  }

  // Fetch prizes & their payout transactions
  const { data: prizesData } = await supabase
    .from("prizes")
    .select(`
      *,
      prize_transactions (
        id,
        upi_id,
        amount_paise,
        tds_deducted_paise,
        net_payout_paise,
        processed_at,
        status
      )
    `)
    .eq("tournament_id", tournament.id)
    .order("position", { ascending: true })

  // Fetch matches
  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournament.id)

  // Fetch confirmed teams and their captains' profiles
  const { data: teamsData } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      upi_id,
      captain_id,
      profiles!captain_id (
        id,
        username,
        display_name
      )
    `)
    .eq("tournament_id", tournament.id)
    .eq("registration_status", "CONFIRMED")

  const teams = (teamsData || []).map(t => ({
    id: t.id,
    name: t.name,
    upi_id: t.upi_id,
    captain_id: t.captain_id,
    profiles: Array.isArray(t.profiles) ? t.profiles[0] : t.profiles
  }))

  const prizes = (prizesData || []).map(p => ({
    id: p.id,
    position: p.position,
    amount_paise: p.amount_paise,
    winner_team_id: p.winner_team_id,
    status: p.status,
    prize_transactions: p.prize_transactions || []
  }))

  // Proposed winners list (position -> teamId)
  const proposedWinners: Record<number, string> = {}

  if (tournament.format === "ROUND_ROBIN") {
    const completedMatches = (matches || []).filter(m => m.status === 'COMPLETED')
    const standings = (teams || []).map(team => {
      const teamMatches = completedMatches.filter(m => m.team1_id === team.id || m.team2_id === team.id)
      let w = 0, d = 0, l = 0
      teamMatches.forEach(m => {
        if (m.winner_id === team.id) {
          w++
        } else if (!m.winner_id) {
          d++
        } else {
          l++
        }
      })
      return {
        teamId: team.id,
        points: (w * 3) + (d * 1),
        wins: w
      }
    }).sort((a, b) => b.points - a.points || b.wins - a.wins)

    standings.forEach((s, idx) => {
      proposedWinners[idx + 1] = s.teamId
    })
  } else {
    // Single Elimination
    const rounds = Array.from(new Set((matches || []).map(m => m.round))).sort((a, b) => b - a)
    if (rounds.length > 0) {
      const maxRound = rounds[0]
      const finalMatch = (matches || []).find(m => m.round === maxRound)
      if (finalMatch && finalMatch.status === 'COMPLETED') {
        const winnerId = finalMatch.winner_id
        const loserId = finalMatch.team1_id === winnerId ? finalMatch.team2_id : finalMatch.team1_id
        
        if (winnerId) proposedWinners[1] = winnerId
        if (loserId) proposedWinners[2] = loserId

        // Semi-finals (second highest round)
        if (rounds.length > 1) {
          const semiRound = rounds[1]
          const semiMatches = (matches || []).filter(m => m.round === semiRound && m.status === 'COMPLETED')
          const semiLosers = semiMatches.map(m => m.winner_id === m.team1_id ? m.team2_id : m.team1_id).filter(Boolean) as string[]
          
          if (semiLosers[0]) proposedWinners[3] = semiLosers[0]
          if (semiLosers[1]) proposedWinners[4] = semiLosers[1]
        }
      }
    }
  }

  // Calculate platform financial summaries
  const totalPrizePoolINR = Number(tournament.prize_pool_paise || 0) / 100
  const totalPaidINR = prizes
    .filter(p => p.status === "PAID")
    .reduce((sum, p) => sum + (p.amount_paise / 100), 0)
  const remainingPayoutINR = totalPrizePoolINR - totalPaidINR

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
      {/* Back button */}
      <Link 
        href={`/tournaments/${params.slug}`}
        className="inline-flex items-center gap-2 text-[#ff6b00] hover:text-[#ff6b00]/80 transition-colors mb-8 font-semibold text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tournament Details
      </Link>

      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-heading font-black text-white">Prize Payouts Dashboard</h1>
        <p className="text-zinc-400 mt-2">
          {tournament.title} • {(tournament.games as any).name}
        </p>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex flex-wrap border-b border-zinc-800 mb-8 gap-6 text-sm">
        <Link 
          href={`/organizer/tournaments/${params.slug}/bracket/manage`}
          className="pb-4 text-zinc-400 hover:text-white transition-colors"
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
          className="pb-4 text-[#ff6b00] border-b-2 border-[#ff6b00] font-semibold transition-colors"
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

      {/* Financial Summary Ledger */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-[#ff6b00]" />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block uppercase font-bold">Total Prize Pool</span>
            <span className="font-mono text-xl font-bold text-white">
              ₹{totalPrizePoolINR.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block uppercase font-bold">Total Paid Out</span>
            <span className="font-mono text-xl font-bold text-emerald-400">
              ₹{totalPaidINR.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-zinc-800/50 border border-zinc-700 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block uppercase font-bold">Remaining Balance</span>
            <span className="font-mono text-xl font-bold text-zinc-300">
              ₹{remainingPayoutINR.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Main Payouts Client */}
      <PayoutsClient
        tournamentSlug={params.slug}
        tournamentTitle={tournament.title}
        prizes={prizes}
        teams={teams}
        proposedWinners={proposedWinners}
      />
    </div>
  )
}
export const runtime = 'edge';
