import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ShieldAlert, Users, IndianRupee } from "lucide-react"
import { RegisterFormClient } from "@/components/tournament/register-form-client"

export default async function TournamentRegistrationPage({
  params
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()

  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?next=/tournaments/${params.slug}/register`)
  }

  // 2. Fetch Tournament
  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select(`
      id, title, slug, max_teams, registered_count, status, entry_fee_paise,
      registration_opens_at, registration_closes_at,
      games(name, slug)
    `)
    .eq("slug", params.slug)
    .single()

  if (error || !tournament) {
    notFound()
  }

  // 3. Guards
  const now = new Date()
  const opensAt = new Date(tournament.registration_opens_at)
  const closesAt = new Date(tournament.registration_closes_at)
  
  if (now < opensAt || now > closesAt || tournament.status !== "REGISTRATION_OPEN" || tournament.registered_count >= tournament.max_teams) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-32 pb-24 px-4">
        <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <ShieldAlert className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Registration Unavailable</h1>
          <p className="text-zinc-400 mb-6">
            You cannot register for this tournament at this time. It may be full, closed, or not yet open.
          </p>
          <Link href={`/tournaments/${tournament.slug}`} className="px-6 py-3 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors inline-block font-semibold">
            Back to Tournament
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-24 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-heading font-black text-white mb-2">Register Team</h1>
        <p className="text-zinc-400 mb-8">You are registering for <span className="font-semibold text-zinc-200">{tournament.title}</span>.</p>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden mb-8">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-400">Entry Fee</span>
            <span className="font-bold text-white flex items-center">
              {tournament.entry_fee_paise === 0 ? (
                <span className="text-green-400">FREE</span>
              ) : (
                <><IndianRupee className="w-4 h-4 mr-1" />{(tournament.entry_fee_paise / 100).toLocaleString('en-IN')}</>
              )}
            </span>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-400">Available Slots</span>
            <span className="font-medium text-zinc-200 flex items-center">
              <Users className="w-4 h-4 mr-2 text-zinc-500" />
              {tournament.max_teams - tournament.registered_count} remaining
            </span>
          </div>
        </div>

        <RegisterFormClient
          tournamentId={tournament.id}
          tournamentTitle={tournament.title}
          entryFeePaise={Number(tournament.entry_fee_paise)}
          tournamentSlug={tournament.slug}
          userEmail={user.email}
        />
      </div>
    </div>
  )
}
export const runtime = 'edge';
