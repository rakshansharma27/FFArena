import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Briefcase, Eye, MousePointer, Percent, IndianRupee } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SponsorDealsPage() {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // 2. Verify role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "SPONSOR") {
    redirect("/dashboard")
  }

  // 3. Fetch sponsorship deals with tournament details
  const { data: dealsData } = await supabase
    .from("sponsorship_deals")
    .select(`
      *,
      tournament:tournaments(title, slug, status)
    `)
    .eq("sponsor_id", user.id)
    .order("created_at", { ascending: false })

  const deals = (dealsData || []).map(d => ({
    id: d.id,
    amount_paise: Number(d.amount_paise || 0),
    deliverables_markdown: d.deliverables_markdown,
    status: d.status,
    clicks_count: Number(d.clicks_count || 0),
    impressions_count: Number(d.impressions_count || 0),
    created_at: d.created_at,
    tournament: d.tournament
  }))

  // Summaries
  const totalSpendINR = deals
    .filter(d => d.status === "ACTIVE" || d.status === "COMPLETED")
    .reduce((sum, d) => sum + (d.amount_paise / 100), 0)

  const totalImpressions = deals.reduce((sum, d) => sum + d.impressions_count, 0)
  const totalClicks = deals.reduce((sum, d) => sum + d.clicks_count, 0)
  
  // Aggregate CTR
  const aggregateCTR = totalImpressions > 0 
    ? (totalClicks / totalImpressions) * 100 
    : 0

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
      {/* Back button */}
      <Link 
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[#ff6b00] hover:text-[#ff6b00]/80 transition-colors mb-8 font-semibold text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-heading font-black text-white flex items-center gap-2">
          <Briefcase className="w-8 h-8 text-[#ff6b00]" />
          My Sponsorship Deals
        </h1>
        <p className="text-zinc-400 mt-2">
          Track campaign approvals, budget logs, and impressions across active tournaments.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-zinc-800 mb-8 gap-6 text-sm">
        <Link 
          href="/sponsor/tournaments"
          className="pb-4 text-zinc-400 hover:text-white transition-colors"
        >
          Discover Tournaments
        </Link>
        <Link 
          href="/sponsor/deals"
          className="pb-4 text-[#ff6b00] border-b-2 border-[#ff6b00] font-semibold transition-colors"
        >
          My Sponsorship Deals
        </Link>
        <Link 
          href="/sponsor/profile"
          className="pb-4 text-zinc-400 hover:text-white transition-colors"
        >
          Brand Profile Settings
        </Link>
      </div>

      {/* Aggregated Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5 text-[#ff6b00]" />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block uppercase font-bold">Total Budget Spent</span>
            <span className="font-mono text-lg font-bold text-white">
              ₹{totalSpendINR.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block uppercase font-bold">Total Impressions</span>
            <span className="font-mono text-lg font-bold text-white">
              {totalImpressions.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <MousePointer className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block uppercase font-bold">Ad Clicks</span>
            <span className="font-mono text-lg font-bold text-white">
              {totalClicks.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <span className="text-xs text-zinc-500 block uppercase font-bold">Avg CTR %</span>
            <span className="font-mono text-lg font-bold text-purple-400">
              {aggregateCTR.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Active Campaigns List */}
      {deals.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <Briefcase className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2 text-white">No Campaigns Placed Yet</h3>
          <p className="text-zinc-400 mb-6 text-sm">Propose sponsorship bids to local events and track statistics here.</p>
          <Link href="/sponsor/tournaments" className="px-6 py-3 bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold rounded-lg transition-colors">
            Discover Tournaments
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950 text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tournament</th>
                  <th className="px-6 py-4 font-semibold">Deal Status</th>
                  <th className="px-6 py-4 font-semibold">Proposed Bid</th>
                  <th className="px-6 py-4 font-semibold text-center">Impressions</th>
                  <th className="px-6 py-4 font-semibold text-center">Clicks</th>
                  <th className="px-6 py-4 font-semibold text-right">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {deals.map((deal) => {
                  const ctr = deal.impressions_count > 0 
                    ? (deal.clicks_count / deal.impressions_count) * 100 
                    : 0

                  return (
                    <tr key={deal.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        {deal.tournament ? (
                          <Link 
                            href={`/tournaments/${deal.tournament.slug}`} 
                            className="font-bold text-zinc-100 hover:text-[#ff6b00] transition-colors"
                          >
                            {deal.tournament.title}
                          </Link>
                        ) : (
                          <span className="font-bold text-zinc-500">Deleted Tournament</span>
                        )}
                        <div className="text-zinc-500 text-xs mt-0.5">
                          Submitted {new Date(deal.created_at).toLocaleDateString("en-IN")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {deal.status === "ACTIVE" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            Active
                          </span>
                        )}
                        {deal.status === "PROPOSED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/10 border border-yellow-500/30 text-yellow-500">
                            Pending Review
                          </span>
                        )}
                        {deal.status === "REJECTED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 border border-red-500/30 text-red-400">
                            Rejected
                          </span>
                        )}
                        {deal.status === "COMPLETED" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-800 border border-zinc-700 text-zinc-400">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-200">
                        ₹{(deal.amount_paise / 100).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-zinc-300">
                        {deal.impressions_count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-zinc-300">
                        {deal.clicks_count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-purple-400">
                        {ctr.toFixed(2)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
export const runtime = 'edge';
