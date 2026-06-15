"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { approveSponsorshipDealAction, rejectSponsorshipDealAction } from "@/app/(dashboard)/organizer/tournaments/[slug]/actions"
import { ShieldCheck, ShieldAlert, Globe, IndianRupee, Loader2, Megaphone, FileText } from "lucide-react"

interface Sponsor {
  company_name: string
  website_url: string | null
  logo_url: string | null
}

interface Deal {
  id: string
  amount_paise: number
  deliverables_markdown: string
  status: string
  sponsor: Sponsor | null
  created_at: string
}

interface SponsorshipsReviewClientProps {
  tournamentSlug: string
  deals: Deal[]
}

export function SponsorshipsReviewClient({ tournamentSlug, deals }: SponsorshipsReviewClientProps) {
  const router = useRouter()
  const [loadingIds, setLoadingIds] = useState<Record<string, "APPROVING" | "REJECTING" | null>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAction = async (dealId: string, actionType: "APPROVE" | "REJECT") => {
    setLoadingIds(prev => ({ ...prev, [dealId]: actionType === "APPROVE" ? "APPROVING" : "REJECTING" }))
    setErrors(prev => ({ ...prev, [dealId]: "" }))

    try {
      const res = actionType === "APPROVE"
        ? await approveSponsorshipDealAction(tournamentSlug, dealId)
        : await rejectSponsorshipDealAction(tournamentSlug, dealId)

      if (res.error) {
        setErrors(prev => ({ ...prev, [dealId]: res.error || "Action failed." }))
      } else {
        router.refresh()
      }
    } catch (err: any) {
      setErrors(prev => ({ ...prev, [dealId]: err.message || "An unexpected error occurred." }))
    } finally {
      setLoadingIds(prev => ({ ...prev, [dealId]: null }))
    }
  }

  return (
    <div className="space-y-6">
      {deals.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800">
          <Megaphone className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No Sponsorship Offers</h3>
          <p className="text-zinc-400 text-sm">Brands have not proposed any sponsorship deals for this tournament yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {deals.map((deal) => {
            const isLoading = !!loadingIds[deal.id]
            const currentLoadingType = loadingIds[deal.id]
            const sponsor = deal.sponsor
            const amountINR = deal.amount_paise / 100

            return (
              <div key={deal.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                {/* Deal Header */}
                <div className="px-6 py-4 bg-zinc-950/80 border-b border-zinc-800 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    {sponsor?.logo_url ? (
                      <img
                        src={sponsor.logo_url}
                        alt={`${sponsor.company_name} logo`}
                        className="h-10 w-10 object-contain rounded bg-zinc-900 border border-zinc-800 p-1 shrink-0"
                        onError={(e) => {
                          ;(e.target as HTMLElement).style.display = "none"
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-[#ff6b00] font-heading font-black text-sm">
                        {sponsor?.company_name.slice(0, 2).toUpperCase() || "SP"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-white text-base flex items-center gap-2">
                        {sponsor?.company_name || "Unknown Sponsor"}
                        {sponsor?.website_url && (
                          <a
                            href={sponsor.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-zinc-500 hover:text-[#ff6b00] transition-colors"
                            title="Visit Website"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </h3>
                      <span className="text-[10px] text-zinc-500 font-mono uppercase">
                        Proposed on {new Date(deal.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-zinc-500 block">Proposed Bid</span>
                      <span className="font-mono font-black text-white flex items-center text-sm md:text-base">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                        {amountINR.toLocaleString("en-IN")}
                      </span>
                    </div>
                    
                    <div className="ml-2">
                      {deal.status === "ACTIVE" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5" /> ACTIVE
                        </span>
                      )}
                      {deal.status === "PROPOSED" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-bold rounded-full">
                          PROPOSED
                        </span>
                      )}
                      {deal.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-full">
                          <ShieldAlert className="w-3.5 h-3.5" /> REJECTED
                        </span>
                      )}
                      {deal.status === "COMPLETED" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-bold rounded-full">
                          COMPLETED
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Deal Body */}
                <div className="p-6 space-y-6">
                  {errors[deal.id] && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-semibold">
                      {errors[deal.id]}
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Requested Deliverables
                    </span>
                    <p className="text-sm text-zinc-300 bg-zinc-950 p-4 border border-zinc-850 rounded-lg leading-relaxed whitespace-pre-wrap">
                      {deal.deliverables_markdown}
                    </p>
                  </div>

                  {deal.status === "PROPOSED" && (
                    <div className="flex gap-4 border-t border-zinc-850 pt-4">
                      <button
                        onClick={() => handleAction(deal.id, "REJECT")}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-950/20 hover:bg-red-950/45 text-red-400 font-bold border border-red-900/35 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        {isLoading && currentLoadingType === "REJECTING" ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Rejecting...</span>
                          </>
                        ) : (
                          <span>Reject Deal</span>
                        )}
                      </button>

                      <button
                        onClick={() => handleAction(deal.id, "APPROVE")}
                        disabled={isLoading}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
                      >
                        {isLoading && currentLoadingType === "APPROVING" ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Approving...</span>
                          </>
                        ) : (
                          <span>Approve & Activate Deal</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
