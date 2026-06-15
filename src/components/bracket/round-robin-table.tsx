"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function RoundRobinTable({ matches, teams }: { matches: any[], teams: any[] }) {
  const [liveMatches, setLiveMatches] = useState(matches)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel('public:matches')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, (payload) => {
        setLiveMatches(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  // Calculate standings
  const standings = teams.map(team => {
    const teamMatches = liveMatches.filter(m => m.team1_id === team.id || m.team2_id === team.id)
    const completedMatches = teamMatches.filter(m => m.status === 'COMPLETED')
    
    let w = 0, d = 0, l = 0
    
    completedMatches.forEach(m => {
      if (m.winner_id === team.id) {
        w++
      } else if (m.winner_id === 'DRAW') {
        d++
      } else {
        l++
      }
    })

    return {
      ...team,
      played: completedMatches.length,
      w, d, l,
      pts: (w * 3) + (d * 1)
    }
  }).sort((a, b) => b.pts - a.pts || b.w - a.w)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950 text-zinc-400">
            <tr>
              <th className="px-6 py-4 font-semibold">Rank</th>
              <th className="px-6 py-4 font-semibold">Team</th>
              <th className="px-6 py-4 font-semibold text-center">P</th>
              <th className="px-6 py-4 font-semibold text-center">W</th>
              <th className="px-6 py-4 font-semibold text-center">D</th>
              <th className="px-6 py-4 font-semibold text-center">L</th>
              <th className="px-6 py-4 font-semibold text-right text-primary">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {standings.map((team, index) => (
              <tr key={team.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 font-mono text-zinc-500">{index + 1}</td>
                <td className="px-6 py-4 font-bold text-zinc-100">{team.name}</td>
                <td className="px-6 py-4 text-center text-zinc-300">{team.played}</td>
                <td className="px-6 py-4 text-center text-green-400">{team.w}</td>
                <td className="px-6 py-4 text-center text-zinc-500">{team.d}</td>
                <td className="px-6 py-4 text-center text-red-400">{team.l}</td>
                <td className="px-6 py-4 text-right font-bold text-primary text-lg">{team.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
