"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function registerFreeTournamentAction(tournamentId: string, teamName: string) {
  const supabase = await createClient()

  // 1. Verify Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "You must be logged in to register." }
  }

  // 2. Fetch Tournament and Validate
  const { data: tournament, error: fetchError } = await supabase
    .from("tournaments")
    .select("id, status, max_teams, registered_count, registration_opens_at, registration_closes_at, entry_fee_paise, slug")
    .eq("id", tournamentId)
    .single()

  if (fetchError || !tournament) {
    return { error: "Tournament not found." }
  }

  if (tournament.entry_fee_paise > 0) {
    return { error: "This tournament requires payment. Please use the paid registration flow." }
  }

  const now = new Date()
  const opensAt = new Date(tournament.registration_opens_at)
  const closesAt = new Date(tournament.registration_closes_at)

  if (now < opensAt) return { error: "Registration has not opened yet." }
  if (now > closesAt) return { error: "Registration has closed." }
  if (tournament.status !== "REGISTRATION_OPEN") return { error: "Registration is not currently open." }
  if (tournament.registered_count >= tournament.max_teams) return { error: "Tournament is full." }

  // 3. Create Team
  const { data: team, error: insertError } = await supabase
    .from("teams")
    .insert({
      tournament_id: tournamentId,
      name: teamName,
      captain_id: user.id,
      registration_status: "CONFIRMED"
    })
    .select("id")
    .single()

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "A team with this name already exists in the tournament." }
    }
    return { error: "Failed to register team. Please try again." }
  }

  // 4. Add captain as member
  await supabase.from("team_members").insert({
    team_id: team.id,
    player_id: user.id,
    role: "CAPTAIN"
  })

  revalidatePath(`/tournaments/${tournament.slug}`)
  revalidatePath(`/tournaments`)

  return { success: true, slug: tournament.slug }
}

export async function registerForTournament(formData: FormData) {
  const supabase = await createClient()
  
  const tournamentId = formData.get("tournamentId") as string
  const teamName = formData.get("teamName") as string
  const slug = formData.get("slug") as string

  if (!tournamentId || !teamName || !slug) {
    return { error: "Missing required fields" }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in to register." }

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("entry_fee_paise")
    .eq("id", tournamentId)
    .single()

  if (!tournament) return { error: "Tournament not found." }

  // If tournament has entry fee, redirect to registration client flow
  const { data: team, error: insertError } = await supabase
    .from("teams")
    .insert({
      tournament_id: tournamentId,
      name: teamName,
      captain_id: user.id,
      registration_status: tournament.entry_fee_paise > 0 ? "PENDING" : "CONFIRMED"
    })
    .select("id")
    .single()

  if (insertError) {
    if (insertError.code === "23505") return { error: "Team name already exists" }
    return { error: "Failed to register" }
  }

  await supabase.from("team_members").insert({
    team_id: team.id,
    player_id: user.id,
    role: "CAPTAIN"
  })

  revalidatePath(`/tournaments/${slug}`)
  revalidatePath(`/tournaments`)
  
  return { success: true }
}
