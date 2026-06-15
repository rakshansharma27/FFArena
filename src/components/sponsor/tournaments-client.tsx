"use client"

import { useState } from "react"
import { proposeSponsorshipAction } from "@/app/(dashboard)/sponsor/actions"
import { Trophy, Calendar, MapPin, Search, Gamepad2, ArrowRight, X, Loader2, IndianRupee } from "lucide-react"

interface Tournament {
  id: string
  title: string
  slug: string
  starts_at: string
  city: string | null
  state: string | null
  college: string | null
  prize_pool_paise: number
  status: string
  games: {
    name: string
  } | null
}

interface SponsorTournamentsClientProps {
  tournaments: Tournament[]
  hasProfile: boolean
}

export function SponsorTournamentsClient({ tournaments, hasProfile }: SponsorTournamentsClientProps) {
  const [search, setSearch] = useState("")
  const [selectedGame, setSelectedGame] = useState("ALL")
  
  // Modal states
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null)
  const [amountINR, setAmountINR] = useState<number>(2000)
  const [deliverables, setDeliverables] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Get unique games list for filter
  const games = ["ALL", ...Array.from(new Set(tournaments.map(t => t.games?.name).filter(Boolean))) as string[]]

  const filtered = tournaments.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchesGame = selectedGame === "ALL" || t.games?.name === selectedGame
    return matchesSearch && matchesGame
  })

  const handleOpenPropose = (t: Tournament) => {
    setActiveTournament(t)
    setAmountINR(2000)
    setDeliverables("Inject logo banners on bracket pages, display logo overlay on stream.")
    setError(null)
    setSuccess(false)
  }

  const handleClosePropose = () => {
    setActiveTournament(null)
    setSuccess(false)
  }

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTournament) return

    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    if (amountINR < 2000) {
      setError("Minimum sponsorship funding must be ₹2,000.")
      setIsSubmitting(false)
      return
    }

    if (!deliverables.trim()) {
      setError("Deliverables description is required.")
      setIsSubmitting(false)
      return
    }

    try {
      const res = await proposeSponsorshipAction(activeTournament.id, amountINR, deliverables)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          handleClosePropose()
        }, 1500)
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit deal.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-zinc-900 p-4 border border-zinc-800 rounded-xl">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search tournaments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#ff6b00] text-sm"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#ff6b00] text-sm"
          >
            {games.map(g => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!hasProfile && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-xs font-semibold flex flex-col gap-2">
          <span>⚠️ Please complete your brand profile details before submitting sponsorship offers.</span>
          <a href="/sponsor/profile" className="underline hover:text-white font-bold">Configure Brand Profile →</a>
        </div>
      )}

      {/* Tournament Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/40 border border-zinc-800 rounded-xl">
          <Gamepad2 className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <h3 className="font-bold text-white text-base">No Tournaments Found</h3>
          <p className="text-zinc-500 text-xs">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((t) => (
            <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-zinc-750 transition-all">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold rounded">
                    {t.games?.name}
                  </span>
                  <span className="font-mono text-xs font-black text-emerald-400 flex items-center">
                    <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                    {(t.prize_pool_paise / 100).toLocaleString("en-IN")} Pool
                  </span>
                </div>

                <h3 className="font-heading font-black text-white text-lg tracking-tight line-clamp-1">{t.title}</h3>
                
                <div className="space-y-1.5 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{new Date(t.starts_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  {t.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{t.city}, {t.state} {t.college ? `• ${t.college}` : ""}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleOpenPropose(t)}
                disabled={!hasProfile}
                className="mt-6 w-full py-2 bg-[#ff6b00] hover:bg-[#e05e00] disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-xs"
              >
                <span>Propose Sponsorship</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Propose Sponsorship Modal */}
      {activeTournament && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <button
              onClick={handleClosePropose}
              className="absolute right-4 top-4 p-1 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={handlePropose} className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-heading font-black text-white">Propose Deal</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Sponsoring tournament: <span className="text-zinc-200 font-semibold">{activeTournament.title}</span>
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-semibold">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-semibold">
                  Sponsorship proposed successfully!
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">
                    Funding Amount (INR) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">₹</span>
                    <input
                      type="number"
                      id="amount"
                      required
                      min="2000"
                      value={amountINR || ""}
                      onChange={(e) => setAmountINR(parseInt(e.target.value, 10) || 0)}
                      disabled={isSubmitting || success}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-3 py-2 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#ff6b00] text-sm font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">Minimum sponsorship starts at ₹2,000</span>
                </div>

                <div>
                  <label htmlFor="deliverables" className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">
                    Proposed Deliverables <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="deliverables"
                    required
                    rows={4}
                    value={deliverables}
                    onChange={(e) => setDeliverables(e.target.value)}
                    placeholder="e.g. Logo display on stream overlays and tournament detail page banner. Mention brand name in posts."
                    disabled={isSubmitting || success}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#ff6b00] text-sm leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleClosePropose}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-lg text-sm transition-colors border border-zinc-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || success}
                  className="flex-1 py-2 bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-orange-500/10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting proposal...</span>
                    </>
                  ) : (
                    <span>Submit Proposal</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
