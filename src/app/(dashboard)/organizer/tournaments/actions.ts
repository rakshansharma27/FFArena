"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createTournamentAction(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "You must be logged in as an Organizer to create a tournament." }
  }

  const title = formData.get("title") as string
  const game_id = formData.get("game_id") as string
  const description = formData.get("description") as string
  const rules_markdown = formData.get("rules_markdown") as string
  const max_teams = parseInt(formData.get("max_teams") as string, 10)
  const entry_fee_paise = parseInt(formData.get("entry_fee") as string, 10) * 100 // Convert INR to Paise
  const prize_pool_paise = parseInt(formData.get("prize_pool") as string, 10) * 100
  const city = formData.get("city") as string
  const state = formData.get("state") as string
  const college = formData.get("college") as string
  const status = formData.get("status") as string || "DRAFT"

  const registration_opens_at = formData.get("registration_opens_at") as string
  const registration_closes_at = formData.get("registration_closes_at") as string
  const starts_at = formData.get("starts_at") as string
  const ends_at = formData.get("ends_at") as string

  // Auto-generate slug
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`

  // Handle Banner Upload
  const bannerFile = formData.get("banner") as File
  let banner_url = null
  
  if (bannerFile && bannerFile.size > 0) {
    const fileExt = bannerFile.name.split('.').pop()
    const fileName = `${slug}-${Date.now()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tournament-banners')
      .upload(fileName, bannerFile, {
        cacheControl: '3600',
        upsert: false
      })
      
    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { error: "Failed to upload banner image." }
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('tournament-banners')
      .getPublicUrl(fileName)
      
    banner_url = publicUrlData.publicUrl
  }

  // Insert into DB
  const { data: tournament, error: insertError } = await supabase
    .from("tournaments")
    .insert({
      title,
      slug,
      game_id,
      organizer_id: user.id,
      banner_url,
      description,
      rules_markdown,
      max_teams,
      entry_fee_paise,
      prize_pool_paise,
      city: city || null,
      state: state || null,
      college: college || null,
      status,
      registration_opens_at,
      registration_closes_at,
      starts_at,
      ends_at
    })
    .select("id")
    .single()

  if (insertError) {
    console.error("Insert error:", insertError)
    return { error: insertError.message }
  }

  revalidatePath('/tournaments')
  revalidatePath('/organizer/tournaments')
  
  redirect('/organizer/tournaments')
}
