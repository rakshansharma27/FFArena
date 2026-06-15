"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function SingleEliminationBracket({ matches, brackets }: { matches: any[], brackets: any[] }) {
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

  // Group by round
  const rounds = Array.from(new Set(liveMatches.map(m => m.round))).sort((a, b) => a - b)

  return (
    <div className="flex gap-12 overflow-x-auto pb-8 pt-4 px-4 min-h-[600px] items-center">
      {rounds.map(round => {
        const roundMatches = liveMatches.filter(m => m.round === round).sort((a, b) => a.match_order - b.match_order)
        
        return (
          <div key={round} className="flex flex-col gap-8 justify-around min-w-[250px] relative">
            <h3 className="absolute -top-12 left-0 right-0 text-center text-zinc-500 font-bold tracking-widest text-sm uppercase">
              Round {round}
            </h3>
            
            {roundMatches.map(match => (
              <div key={match.id} className="bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden shadow-xl shadow-black/50 relative z-10">
                <div className="flex justify-between items-center px-4 py-3 bg-zinc-950 border-b border-zinc-800">
                  <span className={`font-bold ${match.winner_id === match.team1_id ? 'text-primary' : 'text-zinc-300'}`}>
                    {match.team1?.name || "TBD / BYE"}
                  </span>
                  <span className="font-mono font-bold text-zinc-100">{match.team1_score}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3">
                  <span className={`font-bold ${match.winner_id === match.team2_id ? 'text-primary' : 'text-zinc-300'}`}>
                    {match.team2?.name || "TBD / BYE"}
                  </span>
                  <span className="font-mono font-bold text-zinc-100">{match.team2_score}</span>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
