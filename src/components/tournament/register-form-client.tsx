"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { IndianRupee, HelpCircle, Loader2 } from "lucide-react"
import { registerFreeTournamentAction } from "@/app/tournaments/actions"

interface RegisterFormClientProps {
  tournamentId: string
  tournamentTitle: string
  entryFeePaise: number
  tournamentSlug: string
  userEmail?: string
}

export function RegisterFormClient({
  tournamentId,
  tournamentTitle,
  entryFeePaise,
  tournamentSlug,
  userEmail
}: RegisterFormClientProps) {
  const router = useRouter()
  const [teamName, setTeamName] = useState("")
  const [upiId, setUpiId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPaid = entryFeePaise > 0

  // Dynamically load Razorpay SDK
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!isPaid) {
        // Free tournament path
        const res = await registerFreeTournamentAction(tournamentId, teamName)
        if (res.error) {
          setError(res.error)
          setIsSubmitting(false)
        } else {
          router.push(`/tournaments/${res.slug}?success=registered`)
        }
      } else {
        // Paid tournament path: Razorpay flow
        
        // 1. Validate UPI ID
        const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/
        if (!upiRegex.test(upiId)) {
          setError("Please enter a valid UPI ID (e.g. name@upi)")
          setIsSubmitting(false)
          return
        }

        // 2. Load SDK
        const scriptLoaded = await loadRazorpayScript()
        if (!scriptLoaded) {
          setError("Failed to load payment gateway. Please check your internet connection.")
          setIsSubmitting(false)
          return
        }

        // 3. Create Order
        const orderRes = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tournamentId,
            teamName,
            upiId
          })
        })

        const orderData = await orderRes.json()
        if (orderRes.status !== 200 || orderData.error) {
          setError(orderData.error || "Failed to initialize order")
          setIsSubmitting(false)
          return
        }

        const { orderId, amount, currency, keyId, teamId } = orderData

        // 4. Open Razorpay checkout
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: "FFArena Live",
          description: `Entry fee for ${tournamentTitle}`,
          order_id: orderId,
          handler: async function (response: any) {
            setIsSubmitting(true)
            // Verify payment
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                teamId
              })
            })

            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              window.location.href = `/tournaments/${verifyData.slug}?success=registered`
            } else {
              setError(verifyData.error || "Payment verification failed. Please contact support.")
              setIsSubmitting(false)
            }
          },
          prefill: {
            email: userEmail || "",
          },
          theme: {
            color: "#ff6b00"
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false)
            }
          }
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }
    } catch (err: any) {
      console.error(err)
      setError("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium text-zinc-300 mb-1.5">
            Team Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="teamName"
            required
            placeholder="e.g. Total Gaming Esports"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#ff6b00] focus:border-transparent transition-all text-sm"
            minLength={3}
            maxLength={50}
          />
        </div>

        {isPaid && (
          <div>
            <label htmlFor="upiId" className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              Captain's UPI ID <span className="text-red-500">*</span>
              <span className="text-xs text-zinc-500 font-normal flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> For prize pool payouts
              </span>
            </label>
            <input
              type="text"
              id="upiId"
              required={isPaid}
              placeholder="e.g. name@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#ff6b00] focus:border-transparent transition-all text-sm font-mono"
            />
          </div>
        )}

        <div className="bg-[#ff6b00]/5 border border-[#ff6b00]/10 rounded-lg p-4 text-xs text-[#ff6b00]/80">
          By registering, you agree to the tournament rules and confirm that all team members meet the eligibility requirements.
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href={`/tournaments/${tournamentSlug}`}
          className="px-6 py-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-lg transition-colors text-sm flex items-center justify-center"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold rounded-lg transition-colors shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2 text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isPaid ? "Processing Payment..." : "Registering..."}</span>
            </>
          ) : (
            <span>{isPaid ? "Pay Entry Fee & Confirm" : "Confirm Registration"}</span>
          )}
        </button>
      </div>
    </form>
  )
}
