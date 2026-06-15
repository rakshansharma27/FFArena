"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveSponsorProfileAction(
  companyName: string,
  websiteUrl: string,
  logoUrl: string
) {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // 2. Verify role in profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "SPONSOR") {
    return { error: "Only accounts registered as SPONSOR can configure brand details." }
  }

  // 3. Upsert sponsor details
  const { error: upsertError } = await supabase
    .from("sponsors")
    .upsert({
      id: user.id,
      company_name: companyName,
      website_url: websiteUrl,
      logo_url: logoUrl,
      updated_at: new Date().toISOString()
    })

  if (upsertError) {
    console.error("Sponsor Profile Upsert Error:", upsertError)
    return { error: "Failed to save brand profile. Please check inputs." }
  }

  revalidatePath("/dashboard")
  revalidatePath("/sponsor/profile")

  return { success: true }
}

export async function proposeSponsorshipAction(
  tournamentId: string,
  amountINR: number,
  deliverablesMarkdown: string
) {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // 2. Verify sponsor profile exists
  const { data: sponsor } = await supabase
    .from("sponsors")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!sponsor) {
    return { error: "Please configure your brand profile before proposing deals." }
  }

  // 3. Validate amount (minimum ₹2,000 / 200,000 paise)
  const amountPaise = Math.round(amountINR * 100)
  if (amountPaise < 200000) {
    return { error: "Minimum sponsorship deal bid must be ₹2,000." }
  }

  if (!deliverablesMarkdown.trim()) {
    return { error: "Please outline your requested deliverables." }
  }

  // 4. Propose deal
  const { error: insertError } = await supabase
    .from("sponsorship_deals")
    .insert({
      tournament_id: tournamentId,
      sponsor_id: user.id,
      amount_paise: amountPaise,
      deliverables_markdown: deliverablesMarkdown,
      status: "PROPOSED"
    })

  if (insertError) {
    console.error("Propose Sponsorship Error:", insertError)
    return { error: "Failed to submit proposed deal. Please try again." }
  }

  revalidatePath("/sponsor/deals")
  revalidatePath("/sponsor/tournaments")

  return { success: true }
}
