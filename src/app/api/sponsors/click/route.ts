import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dealId = searchParams.get("dealId")
  const dest = searchParams.get("dest")

  if (!dealId || !dest) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    // Call the security definer function to bypass RLS and increment count
    await supabase.rpc("increment_deal_click", { deal_uuid: dealId })
  } catch (err) {
    console.error("Failed to log sponsor click:", err)
  }

  // Safely parse destination and redirect
  let redirectUrl: URL
  try {
    redirectUrl = new URL(dest)
  } catch {
    redirectUrl = new URL("/", req.url)
  }

  return NextResponse.redirect(redirectUrl)
}
export const runtime = 'edge';
