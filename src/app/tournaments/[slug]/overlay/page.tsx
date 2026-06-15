import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { OBSOverlayClient } from "./OBSOverlayClient"

export default async function OBSOverlayPage({
  params
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()

  // 1. Fetch tournament
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id, title, overlay_logo_url, overlay_theme")
    .eq("slug", params.slug)
    .single()

  if (!tournament) {
    notFound()
  }

  // 2. Fetch active sponsorship deals
  const { data: deals } = await supabase
    .from("sponsorship_deals")
    .select(`
      id,
      sponsor_id,
      sponsors (
        company_name,
        logo_url,
        website_url
      )
    `)
    .eq("tournament_id", tournament.id)
    .eq("status", "ACTIVE")

  // 3. Fetch matches with team names
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      id,
      round,
      match_order,
      team1_id,
      team2_id,
      team1_score,
      team2_score,
      winner_id,
      status,
      team1:teams!matches_team1_id_fkey(name),
      team2:teams!matches_team2_id_fkey(name)
    `)
    .eq("tournament_id", tournament.id)
    .order("round", { ascending: true })
    .order("match_order", { ascending: true })

  // Extract sponsors list
  const sponsorsList = (deals || [])
    .map(d => d.sponsors)
    .filter(Boolean) as any[]

  const defaultTheme = {
    primaryColor: "#ff6b00",
    secondaryColor: "#0EA5E9",
    backgroundColor: "#0A0A0F",
    textColor: "#ffffff",
    layout: "classic",
    refreshInterval: 10,
    showSponsors: true,
    showRecentMatches: true
  }

  const theme = tournament.overlay_theme 
    ? { ...defaultTheme, ...Object(tournament.overlay_theme) }
    : defaultTheme

  // Format matches to resolve team1/team2 objects if they are returned as arrays
  const formattedMatches = (matches || []).map((m: any) => {
    const getTeam = (teamVal: any) => {
      if (!teamVal) return null
      if (Array.isArray(teamVal)) {
        return teamVal[0] || null
      }
      return teamVal
    }
    return {
      id: m.id,
      round: m.round,
      match_order: m.match_order,
      team1_id: m.team1_id,
      team2_id: m.team2_id,
      team1_score: m.team1_score,
      team2_score: m.team2_score,
      winner_id: m.winner_id,
      status: m.status,
      team1: getTeam(m.team1),
      team2: getTeam(m.team2)
    }
  })

  return (
    <OBSOverlayClient 
      tournamentId={tournament.id}
      tournamentTitle={tournament.title}
      overlayLogoUrl={tournament.overlay_logo_url || ""}
      theme={theme}
      sponsors={sponsorsList}
      initialMatches={formattedMatches}
    />
  )
}
export const runtime = 'edge';
