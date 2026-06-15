import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Razorpay from "razorpay"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Verify Authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { tournamentId, teamName, upiId } = await req.json()
    if (!tournamentId || !teamName || !upiId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // 2. Fetch Tournament
    const { data: tournament, error: tError } = await supabase
      .from("tournaments")
      .select("id, entry_fee_paise, status, max_teams, registered_count")
      .eq("id", tournamentId)
      .single()

    if (tError || !tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 })
    }

    // Guards
    if (tournament.status !== "REGISTRATION_OPEN") {
      return NextResponse.json({ error: "Registrations are not open" }, { status: 400 })
    }
    if (tournament.registered_count >= tournament.max_teams) {
      return NextResponse.json({ error: "Tournament is full" }, { status: 400 })
    }
    if (tournament.entry_fee_paise <= 0) {
      return NextResponse.json({ error: "Cannot collect entry fee for free tournament" }, { status: 400 })
    }

    // 3. Initialize Razorpay and Create Order
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      console.error("Razorpay keys missing from environment variables")
      return NextResponse.json({ error: "Payment configuration error" }, { status: 500 })
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const order = await razorpay.orders.create({
      amount: Number(tournament.entry_fee_paise),
      currency: "INR",
      receipt: `receipt_team_${user.id.slice(0, 8)}_${Date.now()}`,
    })

    // 4. Insert Team in PENDING state
    const { data: team, error: insertError } = await supabase
      .from("teams")
      .insert({
        tournament_id: tournamentId,
        name: teamName,
        captain_id: user.id,
        registration_status: "PENDING",
        razorpay_order_id: order.id,
        upi_id: upiId,
      })
      .select("id")
      .single()

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ error: "A team with this name already exists in this tournament." }, { status: 400 })
      }
      return NextResponse.json({ error: "Failed to initialize registration." }, { status: 500 })
    }

    // 5. Add captain to team members
    await supabase.from("team_members").insert({
      team_id: team.id,
      player_id: user.id,
      role: "CAPTAIN",
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      teamId: team.id,
    })
  } catch (err: any) {
    console.error("Payment Order Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
export const runtime = 'edge';
