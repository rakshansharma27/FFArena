"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { generateSingleElimination, generateRoundRobin, MatchInput, BracketInput } from "@/lib/bracket/generate"

export async function generateBracketAction(tournamentSlug: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // 1. Fetch tournament
  const { data: tournament, error: tError } = await supabase
    .from("tournaments")
    .select("id, format, starts_at, organizer_id, status")
    .eq("slug", tournamentSlug)
    .single()

  if (tError || !tournament) return { error: "Tournament not found" }
  if (tournament.organizer_id !== user.id) return { error: "Only the organizer can generate the bracket" }
  if (tournament.status !== "REGISTRATION_OPEN") return { error: "Bracket can only be generated when registration is open" }

  // 2. Fetch confirmed teams
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id")
    .eq("tournament_id", tournament.id)
    .eq("registration_status", "CONFIRMED")

  if (teamsError) return { error: "Failed to fetch teams" }
  if (!teams || teams.length < 2) return { error: "Not enough teams to generate a bracket (minimum 2 required)." }

  const teamIds = teams.map(t => t.id)
  const format = tournament.format || "SINGLE_ELIMINATION"
  
  let matchData: MatchInput[] = []
  let bracketData: BracketInput[] = []

  // 3. Generate matches
  try {
    if (format === "ROUND_ROBIN") {
      const result = generateRoundRobin(tournament.id, teamIds, tournament.starts_at)
      matchData = result.matches
      bracketData = result.brackets
    } else {
      const result = generateSingleElimination(tournament.id, teamIds, tournament.starts_at)
      matchData = result.matches
      bracketData = result.brackets
    }
  } catch (err: any) {
    return { error: err.message || "Failed to generate bracket" }
  }

  // 4. Insert Matches
  if (matchData.length > 0) {
    const { error: matchError } = await supabase.from("matches").insert(matchData)
    if (matchError) {
      console.error("Match Insert Error:", matchError)
      return { error: "Failed to insert matches to database" }
    }
  }

  // 5. Insert Brackets (if applicable)
  if (bracketData.length > 0) {
    const { error: bracketError } = await supabase.from("brackets").insert(bracketData)
    if (bracketError) {
      console.error("Bracket Insert Error:", bracketError)
      return { error: "Failed to insert bracket linkages" }
    }
  }

  // 6. Update Tournament Status
  const { error: updateError } = await supabase
    .from("tournaments")
    .update({ status: "ONGOING" })
    .eq("id", tournament.id)

  if (updateError) return { error: "Failed to update tournament status" }

  revalidatePath(`/tournaments/${tournamentSlug}`)
  revalidatePath(`/tournaments/${tournamentSlug}/bracket`)
  revalidatePath(`/organizer/tournaments/${tournamentSlug}/bracket/manage`)
  
  return { success: true }
}

export async function updateMatchResultAction(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const matchId = formData.get("matchId") as string
  const tournamentSlug = formData.get("tournamentSlug") as string
  const team1Score = parseInt(formData.get("team1Score") as string, 10) || 0
  const team2Score = parseInt(formData.get("team2Score") as string, 10) || 0
  const winnerId = formData.get("winnerId") as string // "TEAM1", "TEAM2", or "DRAW"
  
  // Verify organizer
  const { data: match, error: matchFetchError } = await supabase
    .from("matches")
    .select("*, tournaments!inner(organizer_id, slug)")
    .eq("id", matchId)
    .single()
    
  if (matchFetchError || !match) return { error: "Match not found" }
  // Supabase returns nested foreign keys as arrays or objects depending on typing. Casting for safety.
  const orgId = Array.isArray(match.tournaments) ? match.tournaments[0].organizer_id : (match.tournaments as any).organizer_id
  
  if (orgId !== user.id) return { error: "Only the organizer can update match results" }

  const actualWinnerId = winnerId === "TEAM1" ? match.team1_id : winnerId === "TEAM2" ? match.team2_id : null
  const status = "COMPLETED"

  // Update Match
  const { error: updateError } = await supabase
    .from("matches")
    .update({
      team1_score: team1Score,
      team2_score: team2Score,
      winner_id: actualWinnerId,
      status,
      resolved_at: new Date().toISOString(),
      resolved_by: user.id
    })
    .eq("id", matchId)

  if (updateError) return { error: updateError.message }

  // Auto-advance for Single Elimination
  if (actualWinnerId) {
    const { data: bracket } = await supabase
      .from("brackets")
      .select("next_match_id, is_left_child_of_next")
      .eq("match_id", matchId)
      .single()

    if (bracket && bracket.next_match_id) {
      const updatePayload = bracket.is_left_child_of_next 
        ? { team1_id: actualWinnerId }
        : { team2_id: actualWinnerId }

      await supabase.from("matches").update(updatePayload).eq("id", bracket.next_match_id)
    }
  }

  revalidatePath(`/tournaments/${tournamentSlug}/bracket`)
  revalidatePath(`/organizer/tournaments/${tournamentSlug}/bracket/manage`)

  return { success: true }
}

export async function savePrizeSplitsAction(
  tournamentSlug: string,
  splits: { position: number; amountPaise: number }[]
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // 1. Fetch tournament
  const { data: tournament, error: tError } = await supabase
    .from("tournaments")
    .select("id, organizer_id, prize_pool_paise")
    .eq("slug", tournamentSlug)
    .single()

  if (tError || !tournament) return { error: "Tournament not found" }
  if (tournament.organizer_id !== user.id) return { error: "Only the organizer can configure prizes" }

  // 2. Validate splits
  const totalSplitPaise = splits.reduce((sum, s) => sum + s.amountPaise, 0)
  if (totalSplitPaise > tournament.prize_pool_paise) {
    return { error: "Total prize split exceeds the tournament prize pool." }
  }

  // 3. Delete existing splits
  const { error: deleteError } = await supabase
    .from("prizes")
    .delete()
    .eq("tournament_id", tournament.id)

  if (deleteError) return { error: "Failed to clear existing prize configurations" }

  // 4. Insert new splits
  if (splits.length > 0) {
    const payload = splits.map((s) => ({
      tournament_id: tournament.id,
      position: s.position,
      amount_paise: s.amountPaise,
      status: "PENDING",
    }))

    const { error: insertError } = await supabase.from("prizes").insert(payload)
    if (insertError) return { error: "Failed to save prize splits" }
  }

  revalidatePath(`/organizer/tournaments/${tournamentSlug}/prizes`)
  revalidatePath(`/organizer/tournaments/${tournamentSlug}/payouts`)
  revalidatePath(`/tournaments/${tournamentSlug}`)

  return { success: true }
}

export async function recordPayoutAction(
  tournamentSlug: string,
  prizeId: string,
  winnerTeamId: string,
  captainId: string,
  upiId: string,
  amountPaise: number,
  tdsPaise: number,
  netPayoutPaise: number
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // 1. Fetch tournament to check ownership
  const { data: tournament, error: tError } = await supabase
    .from("tournaments")
    .select("id, organizer_id")
    .eq("slug", tournamentSlug)
    .single()

  if (tError || !tournament) return { error: "Tournament not found" }
  if (tournament.organizer_id !== user.id) return { error: "Only the organizer can record payouts" }

  // 2. Insert transaction
  const { error: txnError } = await supabase
    .from("prize_transactions")
    .insert({
      prize_id: prizeId,
      player_id: captainId,
      upi_id: upiId,
      amount_paise: amountPaise,
      tds_deducted_paise: tdsPaise,
      net_payout_paise: netPayoutPaise,
      status: "PAID",
      processed_at: new Date().toISOString(),
    })

  if (txnError) {
    console.error("Payout Transaction Error:", txnError)
    return { error: "Failed to record transaction history." }
  }

  // 3. Update prize status
  const { error: prizeError } = await supabase
    .from("prizes")
    .update({
      winner_team_id: winnerTeamId,
      status: "PAID",
    })
    .eq("id", prizeId)

  if (prizeError) {
    console.error("Failed to update prize status:", prizeError)
  }

  revalidatePath(`/organizer/tournaments/${tournamentSlug}/payouts`)
  revalidatePath(`/tournaments/${tournamentSlug}`)

  return { success: true }
}

export async function approveSponsorshipDealAction(
  tournamentSlug: string,
  dealId: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // Fetch deal and verify organizer
  const { data: deal, error: dealError } = await supabase
    .from("sponsorship_deals")
    .select("*, tournaments!inner(organizer_id, slug)")
    .eq("id", dealId)
    .single()

  if (dealError || !deal) return { error: "Deal not found" }
  
  const orgId = Array.isArray(deal.tournaments) ? deal.tournaments[0].organizer_id : (deal.tournaments as any).organizer_id
  if (orgId !== user.id) return { error: "Only the organizer can manage sponsorships." }

  // Update deal status to ACTIVE
  const { error: updateError } = await supabase
    .from("sponsorship_deals")
    .update({ status: "ACTIVE" })
    .eq("id", dealId)

  if (updateError) {
    console.error("Approve Deal Error:", updateError)
    return { error: "Failed to approve deal." }
  }

  revalidatePath(`/organizer/tournaments/${tournamentSlug}/sponsorships`)
  revalidatePath(`/tournaments/${tournamentSlug}`)

  return { success: true }
}

export async function rejectSponsorshipDealAction(
  tournamentSlug: string,
  dealId: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // Fetch deal and verify organizer
  const { data: deal, error: dealError } = await supabase
    .from("sponsorship_deals")
    .select("*, tournaments!inner(organizer_id, slug)")
    .eq("id", dealId)
    .single()

  if (dealError || !deal) return { error: "Deal not found" }
  
  const orgId = Array.isArray(deal.tournaments) ? deal.tournaments[0].organizer_id : (deal.tournaments as any).organizer_id
  if (orgId !== user.id) return { error: "Only the organizer can manage sponsorships." }

  // Update deal status to REJECTED
  const { error: updateError } = await supabase
    .from("sponsorship_deals")
    .update({ status: "REJECTED" })
    .eq("id", dealId)

  if (updateError) {
    console.error("Reject Deal Error:", updateError)
    return { error: "Failed to reject deal." }
  }

  revalidatePath(`/organizer/tournaments/${tournamentSlug}/sponsorships`)
  revalidatePath(`/tournaments/${tournamentSlug}`)

  return { success: true }
}

export async function updateTournamentStreamAction(
  tournamentSlug: string,
  rtmpUrl: string | null,
  streamKey: string | null,
  overlayLogoUrl: string | null = null,
  overlayTheme: any = null
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // 1. Fetch tournament
  const { data: tournament, error: tError } = await supabase
    .from("tournaments")
    .select("id, organizer_id")
    .eq("slug", tournamentSlug)
    .single()

  if (tError || !tournament) return { error: "Tournament not found" }
  if (tournament.organizer_id !== user.id) return { error: "Only the organizer can configure stream settings" }

  // 2. Update stream details
  const { error: updateError } = await supabase
    .from("tournaments")
    .update({
      rtmp_url: rtmpUrl,
      stream_key: streamKey,
      overlay_logo_url: overlayLogoUrl,
      overlay_theme: overlayTheme
    })
    .eq("id", tournament.id)

  if (updateError) {
    console.error("Stream update error:", updateError)
    return { error: "Failed to update stream configuration" }
  }

  revalidatePath(`/organizer/tournaments/${tournamentSlug}/stream`)
  revalidatePath(`/tournaments/${tournamentSlug}/overlay`)
  revalidatePath(`/tournaments/${tournamentSlug}`)

  return { success: true }
}


