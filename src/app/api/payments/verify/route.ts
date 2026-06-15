import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Use Web Crypto API (works on Cloudflare Workers + Edge runtime)
async function verifyHmacSha256(secret: string, message: string, signature: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(message))
  const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return generatedSignature === signature
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, teamId } = await req.json()
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !teamId) {
      return NextResponse.json({ error: "Missing verification fields" }, { status: 400 })
    }

    // 1. Verify Payment Signature using Web Crypto
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return NextResponse.json({ error: "Payment verification configuration missing" }, { status: 500 })
    }

    const isValid = await verifyHmacSha256(
      keySecret,
      `${razorpay_order_id}|${razorpay_payment_id}`,
      razorpay_signature
    )

    if (!isValid) {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 400 })
    }

    // 2. Update registration status in DB
    const { data: team, error: updateError } = await supabase
      .from("teams")
      .update({
        registration_status: "CONFIRMED",
        razorpay_payment_id,
      })
      .eq("id", teamId)
      .select("*, tournaments(slug)")
      .single()

    if (updateError || !team) {
      console.error("Failed to update team registration:", updateError)
      return NextResponse.json({ error: "Failed to confirm registration in database" }, { status: 500 })
    }

    // 3. Revalidate paths
    const tournamentSlug = (team.tournaments as any).slug
    revalidatePath(`/tournaments/${tournamentSlug}`)
    revalidatePath(`/tournaments`)

    return NextResponse.json({ success: true, slug: tournamentSlug })
  } catch (err: any) {
    console.error("Payment Verification Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const runtime = "edge"

