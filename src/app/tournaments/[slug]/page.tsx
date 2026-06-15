import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Trophy, Users, ShieldAlert, IndianRupee } from "lucide-react"
import { StatusPill, TournamentStatus } from "@/components/tournaments/status-pill"
import { GameBadge, GameSlug } from "@/components/tournaments/game-badge"
import { CountdownTimer } from "@/components/tournaments/countdown-timer"
import { RealtimeRegistrationCount } from "@/components/tournaments/realtime-registration-count"
import { MarkdownRenderer } from "@/components/tournaments/markdown-renderer"
import { SponsorBanner } from "@/components/sponsor/sponsor-banner"

export const dynamic = "force-dynamic"

export default async function TournamentDetailPage({
  params
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()

  // Fetch tournament details
  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select(`
      *,
      games(name, slug),
      profiles!organizer_id(username, display_name, avatar_url)
    `)
    .eq("slug", params.slug)
    .single()

  if (error || !tournament) {
    notFound()
  }

  // Fetch active sponsorships
  const { data: sponsorDeals } = await supabase
    .from("sponsorship_deals")
    .select(`
      id,
      sponsor:sponsors(company_name, logo_url, website_url)
    `)
    .eq("tournament_id", tournament.id)
    .eq("status", "ACTIVE")

  // Safely cast nested array or single objects
  const deals = (sponsorDeals || []).map(d => ({
    id: d.id,
    sponsor: Array.isArray(d.sponsor) ? d.sponsor[0] : d.sponsor
  }))

  // Log impressions (async, but awaited for reliability in serverless)
  if (deals.length > 0) {
    const dealIds = deals.map(d => d.id)
    await supabase.rpc("increment_deal_impressions", { deal_ids: dealIds })
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if current user is the organizer
  const isOrganizer = user?.id === tournament.organizer_id
  
  // Check if registrations are open
  const now = new Date()
  const opensAt = new Date(tournament.registration_opens_at)
  const closesAt = new Date(tournament.registration_closes_at)
  
  const isRegistrationUpcoming = now < opensAt
  const isRegistrationOpen = now >= opensAt && now <= closesAt && tournament.registered_count < tournament.max_teams && tournament.status === 'REGISTRATION_OPEN'
  const isFull = tournament.registered_count >= tournament.max_teams

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      {/* Hero Banner */}
      <div className="relative w-full h-[30vh] md:h-[45vh] bg-zinc-900 border-b border-zinc-800">
        {tournament.banner_url ? (
          <Image
            src={tournament.banner_url}
            alt={tournament.title}
            fill
            className="object-cover opacity-60"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
            <Trophy className="w-24 h-24 text-zinc-800" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <GameBadge name={(tournament.games as any).name} slug={(tournament.games as any).slug} />
                  <StatusPill status={tournament.status as TournamentStatus} />
                </div>
                <h1 className="text-3xl md:text-5xl font-heading font-black text-white tracking-tight">
                  {tournament.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span>Starts {new Date(tournament.starts_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                  {tournament.city && tournament.state && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-zinc-400" />
                      <span>{tournament.city}, {tournament.state}</span>
                    </div>
                  )}
                  {tournament.college && (
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-zinc-400" />
                      <span>{tournament.college}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Area */}
              <div className="flex flex-col items-start md:items-end gap-4 bg-zinc-900/80 backdrop-blur-md p-5 rounded-2xl border border-zinc-800/80 w-full md:w-auto">
                {isOrganizer ? (
                  <Link 
                    href={`/organizer/tournaments/${tournament.slug}/bracket/manage`}
                    className="w-full md:w-auto px-8 py-3 bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold rounded-lg transition-colors text-center shadow-lg shadow-orange-500/10"
                  >
                    Manage Tournament
                  </Link>
                ) : (
                  <>
                    {isRegistrationUpcoming && (
                      <div className="text-center w-full">
                        <CountdownTimer targetDate={tournament.registration_opens_at} label="Registration Opens In" className="justify-center md:justify-end" />
                        <button disabled className="w-full mt-3 px-8 py-3 bg-zinc-800 text-zinc-500 font-bold rounded-lg cursor-not-allowed">
                          Registration Not Open
                        </button>
                      </div>
                    )}

                    {isRegistrationOpen && !isFull && (
                      <div className="text-center w-full">
                        <CountdownTimer targetDate={tournament.registration_closes_at} label="Registration Closes In" className="justify-center md:justify-end mb-3 text-yellow-500" />
                        <Link 
                          href={`/tournaments/${tournament.slug}/register`}
                          className="block w-full px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                        >
                          Register Now
                        </Link>
                      </div>
                    )}

                    {isFull && tournament.status === 'REGISTRATION_OPEN' && (
                      <div className="text-center w-full">
                        <button disabled className="w-full px-8 py-3 bg-yellow-500/20 text-yellow-500 font-bold rounded-lg border border-yellow-500/30 cursor-not-allowed">
                          Tournament Full
                        </button>
                      </div>
                    )}

                    {tournament.status !== 'REGISTRATION_OPEN' && tournament.status !== 'DRAFT' && !isRegistrationUpcoming && (
                      <div className="text-center w-full flex flex-col gap-3">
                        <button disabled className="w-full px-8 py-3 bg-zinc-800 text-zinc-500 font-bold rounded-lg cursor-not-allowed">
                          Registration Closed
                        </button>
                        <Link 
                          href={`/tournaments/${tournament.slug}/bracket`}
                          className="block w-full px-8 py-3 bg-zinc-800 text-white font-bold rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors"
                        >
                          View Bracket & Standings
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Left 2/3) */}
          <div className="lg:col-span-2 space-y-12">
            {deals.length > 0 && (
              <SponsorBanner deals={deals} />
            )}
            <section>
              <h2 className="text-2xl font-bold text-zinc-100 mb-4">About Tournament</h2>
              <p className="text-zinc-400 whitespace-pre-wrap leading-relaxed">
                {tournament.description || "No description provided."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-zinc-100 mb-4">Rules & Format</h2>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <MarkdownRenderer content={tournament.rules_markdown} />
              </div>
            </section>
          </div>

          {/* Sidebar (Right 1/3) */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-6">
              <h3 className="font-semibold text-zinc-100">Tournament Details</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider block mb-1">Registrations</span>
                  <RealtimeRegistrationCount 
                    tournamentId={tournament.id} 
                    initialCount={tournament.registered_count} 
                    maxTeams={tournament.max_teams} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">
                    <span className="text-xs font-medium text-zinc-500 block mb-1">Entry Fee</span>
                    <div className="flex items-center text-zinc-200 font-semibold">
                      {tournament.entry_fee_paise === 0 ? (
                        <span className="text-green-400 uppercase tracking-wide">Free</span>
                      ) : (
                        <>
                          <IndianRupee className="w-4 h-4 mr-0.5" />
                          {(tournament.entry_fee_paise / 100).toLocaleString("en-IN")}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">
                    <span className="text-xs font-medium text-zinc-500 block mb-1">Prize Pool</span>
                    <div className="flex items-center text-primary font-bold">
                      <IndianRupee className="w-4 h-4 mr-0.5" />
                      {(tournament.prize_pool_paise / 100).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold text-zinc-100 mb-4">Organizer</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
                  {(tournament.profiles as any).avatar_url ? (
                    <Image src={(tournament.profiles as any).avatar_url} alt={(tournament.profiles as any).display_name} width={40} height={40} className="object-cover" />
                  ) : (
                    <span className="text-zinc-500 font-bold">{(tournament.profiles as any).display_name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-zinc-200">{(tournament.profiles as any).display_name}</div>
                  <div className="text-xs text-zinc-500">@{(tournament.profiles as any).username}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
export const runtime = 'edge';
