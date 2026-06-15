import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Trophy, MapPin, Sparkles, Calendar, ArrowLeft, ShieldCheck, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileStatsChart } from "@/components/profile/profile-stats-chart"

interface PublicProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()

  // 1. Fetch Profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle()

  if (error || !profile) {
    notFound()
  }

  // 2. Fetch Player Stats per game
  const { data: statsData } = await supabase
    .from("player_stats")
    .select(`
      kills,
      wins,
      tournaments_played,
      elo_rating,
      game:games(id, name, slug)
    `)
    .eq("player_id", profile.id)

  const stats = statsData || []

  // Calculate summary metrics
  const activeElo = stats.length > 0 ? Math.max(...stats.map(s => s.elo_rating)) : 1000
  const totalWins = stats.reduce((sum, s) => sum + s.wins, 0)
  const totalTournaments = stats.reduce((sum, s) => sum + s.tournaments_played, 0)
  const totalKills = stats.reduce((sum, s) => sum + s.kills, 0)

  // 3. Fetch Tournament History (memberships joined to tournament)
  const { data: membershipsData } = await supabase
    .from("team_members")
    .select(`
      role,
      team:teams!inner (
        id,
        name,
        registration_status,
        tournament:tournaments!inner (
          id,
          title,
          slug,
          status,
          starts_at,
          game:games (
            name,
            slug
          )
        )
      )
    `)
    .eq("player_id", profile.id)

  const memberships = membershipsData || []

  const joinedDate = new Date(profile.created_at).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="min-h-screen bg-[#07070A] text-[#f8fafc] font-sans py-12 px-4 relative overflow-hidden selection:bg-[#ff6b00] selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#ff6b00]/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#0ea5e9]/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#94a3b8] hover:text-[#f8fafc] font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Profile Card Header */}
        <Card className="bg-[#0D0D14] border-[#1e1e2f] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-orange-500 to-amber-500" />

          <CardContent className="pt-8 pb-8 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
            {/* Avatar Frame */}
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#151522] border-2 border-[#1e1e2f] flex items-center justify-center shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={`${profile.display_name}'s avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-heading font-black text-sky-400">
                  {profile.display_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* User Meta Details */}
            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-2">
                  <h1 className="text-3xl font-heading font-black tracking-tight">
                    {profile.display_name}
                  </h1>
                  <span className="inline-block self-center text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-[#0ea5e9] px-2.5 py-1 rounded-full border border-sky-500/25">
                    {profile.role}
                  </span>
                </div>
                <p className="text-[#ff6b00] font-semibold text-sm">@{profile.username}</p>
              </div>

              {profile.bio && <p className="text-[#94a3b8] text-sm max-w-xl">{profile.bio}</p>}

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-[#94a3b8] font-semibold pt-1">
                <span className="flex items-center gap-1.5 bg-[#151522] px-3 py-1.5 rounded-full border border-[#1e1e2f]">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  {profile.city}, {profile.state}
                </span>
                <span className="flex items-center gap-1.5 bg-[#151522] px-3 py-1.5 rounded-full border border-[#1e1e2f]">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  Joined {joinedDate}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Career Statistics (Player Only) */}
        {profile.role === "PLAYER" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#0D0D14] border-[#1e1e2f] text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                    Peak ELO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-heading font-black text-sky-400">
                    {activeElo.toLocaleString()}
                  </div>
                  <p className="text-[9px] text-[#94a3b8] mt-1.5">Highest rank rating</p>
                </CardContent>
              </Card>

              <Card className="bg-[#0D0D14] border-[#1e1e2f] text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                    Wins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-heading font-black text-orange-500">
                    {totalWins}
                  </div>
                  <p className="text-[9px] text-[#94a3b8] mt-1.5">Gold Medals Won</p>
                </CardContent>
              </Card>

              <Card className="bg-[#0D0D14] border-[#1e1e2f] text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                    Clashes Played
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-heading font-black text-emerald-400">
                    {totalTournaments}
                  </div>
                  <p className="text-[9px] text-[#94a3b8] mt-1.5">Total Tourneys Played</p>
                </CardContent>
              </Card>

              <Card className="bg-[#0D0D14] border-[#1e1e2f] text-center">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
                    Total Kills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-heading font-black text-rose-500">
                    {totalKills}
                  </div>
                  <p className="text-[9px] text-[#94a3b8] mt-1.5">Lifetime frags</p>
                </CardContent>
              </Card>
            </div>

            {/* Radar and Detailed Game Breakdown */}
            <ProfileStatsChart stats={stats as any[]} />

            {/* Tournament History */}
            <Card className="bg-[#0D0D14] border-[#1e1e2f]">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Tournament History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {memberships.length === 0 ? (
                  <p className="text-sm text-[#94a3b8] text-center py-6">
                    This player hasn't registered for any tournaments yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-[#94a3b8] text-xs font-bold border-b border-[#1e1e2f] pb-2">
                          <th className="py-2">Tournament</th>
                          <th className="py-2">Game</th>
                          <th className="py-2">As Team</th>
                          <th className="py-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e1e2f]">
                        {memberships.map((m: any, idx) => {
                          const t = m.team.tournament
                          return (
                            <tr key={idx} className="hover:bg-[#151522]/30 transition-colors">
                              <td className="py-3 font-semibold text-[#f8fafc]">
                                <Link
                                  href={`/tournaments/${t.slug}`}
                                  className="hover:underline hover:text-[#ff6b00]"
                                >
                                  {t.title}
                                </Link>
                              </td>
                              <td className="py-3 text-xs text-[#94a3b8]">{t.game.name}</td>
                              <td className="py-3 text-[#94a3b8]">{m.team.name}</td>
                              <td className="py-3 text-right">
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                    t.status === "COMPLETED"
                                      ? "bg-zinc-950 text-zinc-500 border-zinc-800"
                                      : t.status === "ONGOING"
                                      ? "bg-emerald-950/35 text-emerald-400 border-emerald-500/20"
                                      : "bg-sky-950/35 text-sky-400 border-sky-500/20"
                                  }`}
                                >
                                  {t.status}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Game ID Connections */}
        <Card className="bg-[#0D0D14] border-[#1e1e2f]">
          <CardHeader>
            <CardTitle className="text-lg font-heading font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff6b00]" />
              Esports Identifiers
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-semibold">
            <div className="bg-[#151522] border border-[#1e1e2f] p-3 rounded-lg flex flex-col gap-1">
              <span className="text-xs text-[#94a3b8]">Free Fire UID</span>
              <span className="font-mono text-white">{profile.ff_uid || "Not Linked"}</span>
            </div>
            <div className="bg-[#151522] border border-[#1e1e2f] p-3 rounded-lg flex flex-col gap-1">
              <span className="text-xs text-[#94a3b8]">BGMI UID</span>
              <span className="font-mono text-white">{profile.bgmi_uid || "Not Linked"}</span>
            </div>
            <div className="bg-[#151522] border border-[#1e1e2f] p-3 rounded-lg flex flex-col gap-1">
              <span className="text-xs text-[#94a3b8]">Valorant Riot ID</span>
              <span className="font-mono text-white">{profile.valorant_id || "Not Linked"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export const runtime = 'edge';
