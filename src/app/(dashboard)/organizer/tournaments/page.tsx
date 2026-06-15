import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Trophy, Plus, Settings } from "lucide-react"
import { StatusPill, TournamentStatus } from "@/components/tournaments/status-pill"

export default async function OrganizerDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: tournaments, error } = await supabase
    .from("tournaments")
    .select("id, title, slug, status, registered_count, max_teams, created_at")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-black text-white">My Tournaments</h1>
          <p className="text-zinc-400">Manage your active and past tournaments.</p>
        </div>
        <Link 
          href="/organizer/tournaments/create"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New
        </Link>
      </div>

      {!tournaments || tournaments.length === 0 ? (
        <div className="text-center py-24 bg-zinc-900/50 rounded-2xl border border-zinc-800">
          <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2 text-white">No Tournaments Yet</h3>
          <p className="text-zinc-400 mb-6">Create your first tournament to start managing.</p>
          <Link href="/organizer/tournaments/create" className="px-6 py-3 bg-zinc-100 text-zinc-900 font-semibold rounded-md hover:bg-white transition-colors">
            Create Tournament
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-950 text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tournament</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Registrations</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {tournaments.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-100">{t.title}</div>
                      <div className="text-zinc-500 text-xs">Created {new Date(t.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={t.status as TournamentStatus} />
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-mono">
                      {t.registered_count} / {t.max_teams}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/tournaments/${t.slug}`}
                        className="inline-flex items-center justify-center p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                        title="View Public Page"
                      >
                        <Settings className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
export const runtime = 'edge';
