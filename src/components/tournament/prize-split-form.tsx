"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, IndianRupee, Save, Loader2 } from "lucide-react"
import { savePrizeSplitsAction } from "@/app/(dashboard)/organizer/tournaments/[slug]/actions"

interface Prize {
  id?: string
  position: number
  amount_paise: number
}

interface PrizeSplitFormProps {
  tournamentSlug: string
  prizePoolPaise: number
  existingPrizes: Prize[]
}

export function PrizeSplitForm({
  tournamentSlug,
  prizePoolPaise,
  existingPrizes
}: PrizeSplitFormProps) {
  const router = useRouter()
  const [splits, setSplits] = useState<{ position: number; amountINR: number }[]>(
    existingPrizes.length > 0
      ? existingPrizes.map((p) => ({ position: p.position, amountINR: p.amount_paise / 100 }))
      : [{ position: 1, amountINR: 0 }]
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const totalPoolINR = prizePoolPaise / 100
  const currentTotalINR = splits.reduce((sum, s) => sum + s.amountINR, 0)
  const remainingINR = totalPoolINR - currentTotalINR

  const handleAddSplit = () => {
    const nextPos = Math.max(...splits.map(s => s.position), 0) + 1
    setSplits([...splits, { position: nextPos, amountINR: 0 }])
  }

  const handleRemoveSplit = (index: number) => {
    const updated = splits.filter((_, i) => i !== index)
    setSplits(updated)
  }

  const handleSplitChange = (index: number, key: "position" | "amountINR", value: number) => {
    const updated = [...splits]
    updated[index] = { ...updated[index], [key]: value }
    setSplits(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    // Validation
    if (splits.some((s) => s.amountINR <= 0)) {
      setError("Every position must have a prize amount greater than 0.")
      setIsSubmitting(false)
      return
    }

    if (currentTotalINR > totalPoolINR) {
      setError("Total split amount cannot exceed the tournament prize pool.")
      setIsSubmitting(false)
      return
    }

    // Convert INR to Paise
    const payload = splits.map((s) => ({
      position: s.position,
      amountPaise: Math.round(s.amountINR * 100)
    }))

    const res = await savePrizeSplitsAction(tournamentSlug, payload)
    setIsSubmitting(false)

    if (res.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-semibold">
          Prize splits saved successfully!
        </div>
      )}

      {/* Prize Pool Summary */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-center text-sm font-semibold">
        <div>
          <div className="text-zinc-500 text-xs uppercase mb-1">Total Prize Pool</div>
          <div className="text-white font-mono text-lg flex items-center justify-center">
            <IndianRupee className="w-4 h-4 mr-0.5" />
            {totalPoolINR.toLocaleString("en-IN")}
          </div>
        </div>
        <div>
          <div className="text-zinc-500 text-xs uppercase mb-1">Configured Split</div>
          <div className="text-[#ff6b00] font-mono text-lg flex items-center justify-center">
            <IndianRupee className="w-4 h-4 mr-0.5" />
            {currentTotalINR.toLocaleString("en-IN")}
          </div>
        </div>
        <div>
          <div className="text-zinc-500 text-xs uppercase mb-1">Remaining</div>
          <div className={`font-mono text-lg flex items-center justify-center ${remainingINR < 0 ? "text-red-400" : "text-emerald-400"}`}>
            <IndianRupee className="w-4 h-4 mr-0.5" />
            {remainingINR.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-bold text-zinc-300">Prize splits by position:</div>
        
        {splits.map((split, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-zinc-950/40 p-4 border border-zinc-850 rounded-lg">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase">Position</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={split.position}
                  onChange={(e) => handleSplitChange(idx, "position", parseInt(e.target.value, 10) || 1)}
                  disabled={isSubmitting}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#ff6b00]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase">Prize Amount (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={split.amountINR || ""}
                    onChange={(e) => handleSplitChange(idx, "amountINR", parseFloat(e.target.value) || 0)}
                    disabled={isSubmitting}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-7 pr-3 py-2 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#ff6b00] font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {splits.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveSplit(idx)}
                disabled={isSubmitting}
                className="p-2 bg-red-950/25 border border-red-900/30 hover:bg-red-950/50 text-red-400 rounded-lg transition-colors self-end h-10 w-10 flex items-center justify-center shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleAddSplit}
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Position
        </button>

        <button
          type="submit"
          disabled={isSubmitting || remainingINR < 0}
          className="flex-1 px-5 py-2.5 bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-orange-500/10 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving splits...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Prize Configuration</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
