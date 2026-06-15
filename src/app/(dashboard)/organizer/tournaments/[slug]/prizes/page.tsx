import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PrizeSplitForm } from "@/components/tournament/prize-split-form"
import Link from "next/link"
import { ArrowLeft, Trophy, Award, CreditCard } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function OrganizerPrizesPage({
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

  // Fetch existing prizes
  const { data: existingPrizes } = await supabase
    .from("prizes")
    .select("*")
    .eq("tournament_id", tournament.id)
    .order("position", { ascending: true })

  // Convert to type expected by PrizeSplitForm
  const prizes = (existingPrizes || []).map(p => ({
    id: p.id,
    position: p.position,
    amount_paise: p.amount_paise
  }))

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
        <h1 className="text-3xl font-heading font-black text-white">Prize Pool Distribution</h1>
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
          className="pb-4 text-[#ff6b00] border-b-2 border-[#ff6b00] font-semibold transition-colors"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Setup form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#ff6b00]" />
              Define Prize Splits
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Configure how the total prize pool of <strong className="text-zinc-200">₹{(Number(tournament.prize_pool_paise || 0) / 100).toLocaleString('en-IN')}</strong> will be distributed among different placing positions. Make sure the total sum does not exceed the total pool.
            </p>
            
            <PrizeSplitForm
              tournamentSlug={params.slug}
              prizePoolPaise={Number(tournament.prize_pool_paise || 0)}
              existingPrizes={prizes}
            />
          </div>
        </div>

        {/* Right column: Info/Help panel */}
        <div className="space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Prize Guidelines
            </h3>
            <ul className="space-y-3 text-xs text-zinc-400 list-disc list-inside">
              <li>Prizes are defined by placement positions (e.g., 1st, 2nd, 3rd).</li>
              <li>Each position can only have one configuration.</li>
              <li>The sum of all splits must be equal to or less than the tournament's total prize pool.</li>
              <li>Once the tournament is completed, you can distribute these configured amounts directly to the winning team captains.</li>
            </ul>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              Tax Compliance (TDS)
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              As per Indian tax laws, a <strong className="text-zinc-200">30% TDS</strong> deduction is applicable on individual user winnings exceeding <strong className="text-zinc-200">₹10,000</strong>.
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              FFArena automatically calculates and files TDS deduction on payouts matching these thresholds. The net amount will be proposed in the payouts tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export const runtime = 'edge';
