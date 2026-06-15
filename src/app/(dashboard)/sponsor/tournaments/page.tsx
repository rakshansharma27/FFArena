import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SponsorTournamentsClient } from "@/components/sponsor/tournaments-client"
import Link from "next/link"
import { ArrowLeft, Gamepad } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SponsorTournamentsPage() {
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

  // 3. Check if sponsor profile details are configured
  const { data: sponsor } = await supabase
    .from("sponsors")
    .select("id")
    .eq("id", user.id)
    .single()

  const hasProfile = !!sponsor

  // 4. Fetch active/upcoming tournaments
  const { data: tournamentsData } = await supabase
    .from("tournaments")
    .select("*, games(name)")
    .neq("status", "DRAFT")
    .neq("status", "COMPLETED")
    .order("starts_at", { ascending: true })

  const tournaments = (tournamentsData || []).map(t => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    starts_at: t.starts_at,
    city: t.city,
    state: t.state,
    college: t.college,
    prize_pool_paise: Number(t.prize_pool_paise || 0),
    status: t.status,
    games: t.games
  }))

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
          <Gamepad className="w-8 h-8 text-[#ff6b00]" />
          Sponsor Tournaments
        </h1>
        <p className="text-zinc-400 mt-2">
          Browse tournaments hosted by local colleges and clubs, bid on sponsorships, and place brand assets.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-zinc-800 mb-8 gap-6 text-sm">
        <Link 
          href="/sponsor/tournaments"
          className="pb-4 text-[#ff6b00] border-b-2 border-[#ff6b00] font-semibold transition-colors"
        >
          Discover Tournaments
        </Link>
        <Link 
          href="/sponsor/deals"
          className="pb-4 text-zinc-400 hover:text-white transition-colors"
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

      <SponsorTournamentsClient tournaments={tournaments} hasProfile={hasProfile} />
    </div>
  )
}
export const runtime = 'edge';
