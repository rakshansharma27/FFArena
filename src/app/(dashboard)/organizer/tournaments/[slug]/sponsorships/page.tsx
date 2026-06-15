import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SponsorshipsReviewClient } from "@/components/sponsor/sponsorships-review-client"
import Link from "next/link"
import { ArrowLeft, Landmark, Megaphone } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function OrganizerSponsorshipsPage({
  params
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // 2. Fetch tournament details
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*, games(name)")
    .eq("slug", params.slug)
    .single()

  if (!tournament || tournament.organizer_id !== user.id) {
    redirect("/organizer/tournaments")
  }

  // 3. Fetch sponsorship deals with sponsor details
  const { data: dealsData } = await supabase
    .from("sponsorship_deals")
    .select(`
      *,
      sponsor:sponsors(company_name, website_url, logo_url)
    `)
    .eq("tournament_id", tournament.id)
    .order("created_at", { ascending: false })

  const deals = (dealsData || []).map(d => ({
    id: d.id,
    amount_paise: Number(d.amount_paise || 0),
    deliverables_markdown: d.deliverables_markdown,
    status: d.status,
    sponsor: Array.isArray(d.sponsor) ? d.sponsor[0] : d.sponsor,
    created_at: d.created_at
  }))

  // Summary budget metrics
  const totalFundingINR = deals
    .filter(d => d.status === "ACTIVE" || d.status === "COMPLETED")
    .reduce((sum, d) => sum + (d.amount_paise / 100), 0)

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
        <h1 className="text-3xl font-heading font-black text-white">Sponsorship Bids</h1>
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
          className="pb-4 text-zinc-400 hover:text-white transition-colors"
        >
          Distribute Payouts
        </Link>
        <Link 
          href={`/organizer/tournaments/${params.slug}/sponsorships`}
          className="pb-4 text-[#ff6b00] border-b-2 border-[#ff6b00] font-semibold transition-colors"
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

      {/* Funding Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5 text-[#ff6b00]" />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block uppercase font-bold">Total Sponsors Active</span>
            <span className="font-mono text-xl font-bold text-white">
              {deals.filter(d => d.status === "ACTIVE").length}
            </span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block uppercase font-bold">Total Funding Raised</span>
            <span className="font-mono text-xl font-bold text-emerald-400">
              ₹{totalFundingINR.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Review Client List */}
      <SponsorshipsReviewClient tournamentSlug={params.slug} deals={deals} />
    </div>
  )
}
export const runtime = 'edge';
