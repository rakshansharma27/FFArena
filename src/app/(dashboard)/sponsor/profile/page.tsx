import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SponsorProfileForm } from "@/components/sponsor/profile-form"
import Link from "next/link"
import { ArrowLeft, Megaphone } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SponsorProfilePage() {
  const supabase = await createClient()

  // 1. Authenticate
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

  // 3. Fetch initial sponsor profile
  const { data: sponsor } = await supabase
    .from("sponsors")
    .select("company_name, website_url, logo_url")
    .eq("id", user.id)
    .single()

  return (
    <div className="max-w-xl mx-auto py-12 px-4 sm:px-6">
      {/* Back button */}
      <Link 
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[#ff6b00] hover:text-[#ff6b00]/80 transition-colors mb-8 font-semibold text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-heading font-black text-white flex items-center gap-2">
          <Megaphone className="w-8 h-8 text-[#ff6b00]" />
          Brand Profile Settings
        </h1>
        <p className="text-zinc-400 mt-2">
          Configure your brand's display details to propose sponsorships on active tournaments.
        </p>
      </div>

      <SponsorProfileForm initialProfile={sponsor} />
    </div>
  )
}
export const runtime = 'edge';
