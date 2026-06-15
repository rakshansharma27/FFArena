"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IndianRupee, Loader2, Award, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { recordPayoutAction } from "@/app/(dashboard)/organizer/tournaments/[slug]/actions"

interface Team {
  id: string
  name: string
  upi_id: string | null
  captain_id: string
  profiles: {
    id: string
    username: string
    display_name: string
  } | null
}

interface Prize {
  id: string
  position: number
  amount_paise: number
  winner_team_id: string | null
  status: string
  prize_transactions?: {
    id: string
    upi_id: string
    amount_paise: number
    tds_deducted_paise: number
    net_payout_paise: number
    processed_at: string | null
    status: string
  }[]
}

interface PayoutsClientProps {
  tournamentSlug: string
  tournamentTitle: string
  prizes: Prize[]
  teams: Team[]
  proposedWinners: Record<number, string>
}

export function PayoutsClient({
  tournamentSlug,
  tournamentTitle,
  prizes,
  teams,
  proposedWinners
}: PayoutsClientProps) {
  const router = useRouter()
  
  // Track inputs and loading states per prize ID
  const [selectedTeams, setSelectedTeams] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    prizes.forEach(p => {
      // Prioritize saved winner_team_id, fallback to proposed winner, fallback to empty
      initial[p.id] = p.winner_team_id || proposedWinners[p.position] || ""
    })
    return initial
  })

  const [upiInputs, setUpiInputs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    prizes.forEach(p => {
      const selectedTeamId = p.winner_team_id || proposedWinners[p.position] || ""
      const team = teams.find(t => t.id === selectedTeamId)
      initial[p.id] = team?.upi_id || ""
    })
    return initial
  })

  const [submittingIds, setSubmittingIds] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successes, setSuccesses] = useState<Record<string, boolean>>({})

  const handleTeamChange = (prizeId: string, teamId: string) => {
    setSelectedTeams(prev => ({ ...prev, [prizeId]: teamId }))
    const team = teams.find(t => t.id === teamId)
    setUpiInputs(prev => ({ ...prev, [prizeId]: team?.upi_id || "" }))
    setErrors(prev => ({ ...prev, [prizeId]: "" }))
  }

  const handleUpiChange = (prizeId: string, value: string) => {
    setUpiInputs(prev => ({ ...prev, [prizeId]: value }))
  }

  const handleRecordPayout = async (prize: Prize) => {
    const prizeId = prize.id
    setErrors(prev => ({ ...prev, [prizeId]: "" }))
    setSuccesses(prev => ({ ...prev, [prizeId]: false }))
    
    const teamId = selectedTeams[prizeId]
    if (!teamId) {
      setErrors(prev => ({ ...prev, [prizeId]: "Please select a winning team." }))
      return
    }

    const upiId = upiInputs[prizeId]?.trim()
    if (!upiId) {
      setErrors(prev => ({ ...prev, [prizeId]: "UPI ID is required." }))
      return
    }

    // Verify UPI ID format
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/
    if (!upiRegex.test(upiId)) {
      setErrors(prev => ({ ...prev, [prizeId]: "Please enter a valid UPI ID (e.g. username@bank)." }))
      return
    }

    const team = teams.find(t => t.id === teamId)
    if (!team) {
      setErrors(prev => ({ ...prev, [prizeId]: "Selected team not found." }))
      return
    }

    setSubmittingIds(prev => ({ ...prev, [prizeId]: true }))

    // TDS Calculation
    const amountINR = prize.amount_paise / 100
    const needsTDS = amountINR > 10000
    const tdsPaise = needsTDS ? Math.round(prize.amount_paise * 0.3) : 0
    const netPayoutPaise = prize.amount_paise - tdsPaise

    try {
      const res = await recordPayoutAction(
        tournamentSlug,
        prizeId,
        teamId,
        team.captain_id,
        upiId,
        prize.amount_paise,
        tdsPaise,
        netPayoutPaise
      )

      if (res.error) {
        setErrors(prev => ({ ...prev, [prizeId]: res.error || "Failed to record payout." }))
      } else {
        setSuccesses(prev => ({ ...prev, [prizeId]: true }))
        router.refresh()
      }
    } catch (err: any) {
      setErrors(prev => ({ ...prev, [prizeId]: err.message || "An unexpected error occurred." }))
    } finally {
      setSubmittingIds(prev => ({ ...prev, [prizeId]: false }))
    }
  }

  return (
    <div className="space-y-8">
      {prizes.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border border-zinc-800">
          <Award className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No Prize Splits Configured</h3>
          <p className="text-zinc-400 text-sm mb-6">You must configure your prize splits before recording payouts.</p>
          <a
            href={`/organizer/tournaments/${tournamentSlug}/prizes`}
            className="px-5 py-2.5 bg-[#ff6b00] hover:bg-[#e05e00] text-white font-semibold rounded-lg transition-colors text-sm"
          >
            Configure Prizes
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {prizes.map((prize) => {
            const isPaid = prize.status === "PAID"
            const transaction = prize.prize_transactions?.[0]
            const selectedTeamId = selectedTeams[prize.id]
            const selectedTeam = teams.find(t => t.id === selectedTeamId)
            
            // TDS & Payout breakdown
            const amountINR = prize.amount_paise / 100
            const tdsINR = amountINR > 10000 ? amountINR * 0.3 : 0
            const netINR = amountINR - tdsINR

            const isProposed = proposedWinners[prize.position] && proposedWinners[prize.position] === selectedTeamId

            return (
              <div
                key={prize.id}
                className={`bg-zinc-900 border rounded-xl overflow-hidden transition-all ${
                  isPaid ? "border-zinc-800 bg-zinc-900/30" : "border-zinc-800"
                }`}
              >
                {/* Header Banner */}
                <div className="px-6 py-4 bg-zinc-950/80 border-b border-zinc-800 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-[#ff6b00]">
                      #{prize.position}
                    </span>
                    <div>
                      <h3 className="font-bold text-white">Position {prize.position} Prize</h3>
                      <p className="text-xs text-zinc-500">
                        {isPaid ? "Payout recorded successfully" : "Awaiting prize distribution"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-zinc-500 block">Total Reward</span>
                      <span className="font-mono font-bold text-white flex items-center text-sm md:text-base">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                        {amountINR.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" /> PAID
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-bold rounded-full">
                        <Clock className="w-3.5 h-3.5 animate-pulse" /> PENDING
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Form / Info */}
                  <div className="space-y-4">
                    {errors[prize.id] && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium">
                        {errors[prize.id]}
                      </div>
                    )}
                    
                    {successes[prize.id] && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-medium">
                        Payout registered successfully!
                      </div>
                    )}

                    {isPaid && transaction ? (
                      // Display Details for Paid Payouts
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-xs text-zinc-500 uppercase block font-semibold">Winner Team</span>
                          <span className="text-zinc-200 font-bold">
                            {teams.find(t => t.id === prize.winner_team_id)?.name || "Unknown Team"}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-zinc-500 uppercase block font-semibold">UPI ID Transferred</span>
                          <span className="font-mono text-zinc-300">{transaction.upi_id}</span>
                        </div>
                        <div>
                          <span className="text-xs text-zinc-500 uppercase block font-semibold">Processed Date</span>
                          <span className="text-zinc-400 text-xs">
                            {transaction.processed_at ? new Date(transaction.processed_at).toLocaleString("en-IN") : "Recorded"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      // Inputs for Pending Payouts
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1.5">
                            Winner Team
                          </label>
                          <select
                            disabled={submittingIds[prize.id]}
                            value={selectedTeamId}
                            onChange={(e) => handleTeamChange(prize.id, e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#ff6b00] text-sm"
                          >
                            <option value="">-- Select Winner --</option>
                            {teams.map(t => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                          
                          {isProposed && (
                            <span className="mt-1 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                              ✓ Auto-calculated based on match scores
                            </span>
                          )}
                        </div>

                        {selectedTeam && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-xs text-zinc-500 uppercase block font-semibold">Captain Name</span>
                                <span className="text-zinc-300 text-sm font-bold">
                                  {selectedTeam.profiles?.display_name || `@${selectedTeam.profiles?.username || 'unknown'}`}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-semibold text-zinc-500 uppercase mb-1.5">
                                Recipient UPI ID
                              </label>
                              <input
                                type="text"
                                placeholder="name@okbank"
                                value={upiInputs[prize.id] || ""}
                                onChange={(e) => handleUpiChange(prize.id, e.target.value)}
                                disabled={submittingIds[prize.id]}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#ff6b00] text-sm font-mono"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Calculations & Submit */}
                  <div className="flex flex-col justify-between bg-zinc-950/40 p-4 border border-zinc-850 rounded-lg">
                    <div className="space-y-3 text-sm">
                      <span className="text-xs text-zinc-500 uppercase block font-bold tracking-wider mb-1">
                        Payout Calculation Breakdown
                      </span>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Configured Prize Amount:</span>
                        <span className="font-mono text-zinc-300">₹{amountINR.toLocaleString("en-IN")}</span>
                      </div>

                      {amountINR > 10000 ? (
                        <>
                          <div className="flex justify-between items-center text-xs text-red-400">
                            <span>TDS Deduction (30% on &gt;₹10k):</span>
                            <span className="font-mono font-bold">-₹{tdsINR.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-[10px] text-red-400 flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>
                              Under Section 194BA of the IT Act, winning amounts exceeding ₹10,000 are subject to a 30% flat tax deduction. FFArena handles this transfer split.
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-center text-xs text-emerald-400">
                          <span>TDS Status:</span>
                          <span>Exempt (Winnings ≤ ₹10,000)</span>
                        </div>
                      )}

                      <hr className="border-zinc-800 my-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-zinc-400">Net Payout Amount:</span>
                        <span className="font-mono font-black text-emerald-400 text-lg flex items-center">
                          <IndianRupee className="w-4 h-4 mr-0.5" />
                          {isPaid && transaction 
                            ? (transaction.net_payout_paise / 100).toLocaleString("en-IN")
                            : netINR.toLocaleString("en-IN")
                          }
                        </span>
                      </div>
                    </div>

                    {!isPaid && (
                      <button
                        onClick={() => handleRecordPayout(prize)}
                        disabled={submittingIds[prize.id] || !selectedTeamId}
                        className="mt-6 w-full py-2.5 bg-[#ff6b00] hover:bg-[#e05e00] disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-md shadow-orange-500/5"
                      >
                        {submittingIds[prize.id] ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Recording Payout...</span>
                          </>
                        ) : (
                          <span>Record & Confirm Payout</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
