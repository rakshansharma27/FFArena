"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveSponsorProfileAction } from "@/app/(dashboard)/sponsor/actions"
import { Building2, Globe, Image, Save, Loader2 } from "lucide-react"

interface SponsorProfile {
  company_name: string
  website_url: string | null
  logo_url: string | null
}

interface SponsorProfileFormProps {
  initialProfile: SponsorProfile | null
}

export function SponsorProfileForm({ initialProfile }: SponsorProfileFormProps) {
  const router = useRouter()
  const [companyName, setCompanyName] = useState(initialProfile?.company_name || "")
  const [websiteUrl, setWebsiteUrl] = useState(initialProfile?.website_url || "")
  const [logoUrl, setLogoUrl] = useState(initialProfile?.logo_url || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    if (!companyName.trim()) {
      setError("Company name is required.")
      setIsSubmitting(false)
      return
    }

    try {
      const res = await saveSponsorProfileAction(companyName, websiteUrl, logoUrl)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile.")
    } finally {
      setIsSubmitting(false)
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
          Brand profile updated successfully!
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-zinc-500" />
            Company / Brand Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="companyName"
            required
            placeholder="e.g. Red Bull India"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#ff6b00] text-sm"
          />
        </div>

        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-2">
            <Globe className="w-4 h-4 text-zinc-500" />
            Website URL
          </label>
          <input
            type="url"
            id="websiteUrl"
            placeholder="e.g. https://www.redbull.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#ff6b00] text-sm"
          />
        </div>

        <div>
          <label htmlFor="logoUrl" className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-2">
            <Image className="w-4 h-4 text-zinc-500" />
            Logo Image URL
          </label>
          <input
            type="url"
            id="logoUrl"
            placeholder="e.g. https://domain.com/logo.png"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#ff6b00] text-sm"
          />
          {logoUrl && (
            <div className="mt-4 flex items-center gap-4 p-3 bg-zinc-950 rounded-lg border border-zinc-850">
              <span className="text-xs text-zinc-500">Logo Preview:</span>
              <img
                src={logoUrl}
                alt="Brand logo preview"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = "none"
                }}
                className="h-10 max-w-[120px] object-contain rounded bg-zinc-900 p-1"
              />
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-5 py-3 bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-orange-500/10 disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving brand profile...</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </>
        )}
      </button>
    </form>
  )
}
