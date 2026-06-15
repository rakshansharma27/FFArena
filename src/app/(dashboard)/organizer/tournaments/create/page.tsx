import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { createTournamentAction } from "../actions"
import { Trophy, Calendar as CalendarIcon, MapPin, IndianRupee, Image as ImageIcon, Users } from "lucide-react"

export default async function CreateTournamentPage() {
  const supabase = await createClient()
  
  // Verify user is an organizer or admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
    
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
    
  if (!profile || (profile.role !== "ORGANIZER" && profile.role !== "ADMIN")) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-24 bg-zinc-900 rounded-xl border border-red-500/50 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-zinc-400">You must be an Organizer to access this page.</p>
      </div>
    )
  }

  // Fetch games
  const { data: games } = await supabase.from("games").select("id, name, slug").eq("is_active", true)

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-black text-white">Create Tournament</h1>
        <p className="text-zinc-400 mt-2">Fill in the details to publish a new tournament to the platform.</p>
      </div>

      <form action={createTournamentAction as any} className="space-y-10">
        {/* Step 1: Basic Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-white">1. Basic Info</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tournament Title *</label>
              <input type="text" name="title" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100" placeholder="e.g. Mumbai Free Fire Championship 2026" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Game *</label>
              <select name="game_id" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100">
                <option value="">Select a game</option>
                {games?.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Max Teams *</label>
              <select name="max_teams" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100">
                {[4, 8, 16, 32, 64, 128, 256].map(num => (
                  <option key={num} value={num}>{num} Teams</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description *</label>
              <textarea name="description" required rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100" placeholder="Brief overview of the tournament..."></textarea>
            </div>
          </div>
        </div>

        {/* Step 2: Location & Finances */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <IndianRupee className="w-4 h-4 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-white">2. Region & Prizes</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">State</label>
              <input type="text" name="state" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100" placeholder="e.g. Maharashtra" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">City</label>
              <input type="text" name="city" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100" placeholder="e.g. Mumbai" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Entry Fee (INR) *</label>
              <input type="number" name="entry_fee" required min="0" defaultValue="0" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100" />
              <p className="text-xs text-zinc-500 mt-1">Set 0 for free entry</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Prize Pool (INR) *</label>
              <input type="number" name="prize_pool" required min="0" defaultValue="0" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100" />
            </div>
          </div>
        </div>

        {/* Step 3: Schedule */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-yellow-500" />
            </div>
            <h2 className="text-xl font-bold text-white">3. Schedule</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Registration Opens *</label>
              <input type="datetime-local" name="registration_opens_at" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 [color-scheme:dark]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Registration Closes *</label>
              <input type="datetime-local" name="registration_closes_at" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 [color-scheme:dark]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tournament Starts *</label>
              <input type="datetime-local" name="starts_at" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 [color-scheme:dark]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tournament Ends *</label>
              <input type="datetime-local" name="ends_at" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100 [color-scheme:dark]" />
            </div>
          </div>
        </div>

        {/* Step 4: Banner & Rules */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-indigo-500" />
            </div>
            <h2 className="text-xl font-bold text-white">4. Banner & Rules</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tournament Banner (Optional)</label>
              <input type="file" name="banner" accept="image/jpeg, image/png, image/webp" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
              <p className="text-xs text-zinc-500 mt-2">Recommended: 1920x1080 (16:9). Max 5MB.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Rules & Format (Markdown) *</label>
              <textarea name="rules_markdown" required rows={8} className="w-full font-mono text-sm bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-300" placeholder="# Rule 1..."></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Initial Status</label>
              <select name="status" required className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-100">
                <option value="DRAFT">Save as Draft</option>
                <option value="REGISTRATION_OPEN">Publish & Open Registrations</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-zinc-800 pt-6">
          <button type="submit" className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            Create Tournament
          </button>
        </div>
      </form>
    </div>
  )
}
export const runtime = 'edge';
