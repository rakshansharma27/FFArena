"use client"

import { useState } from "react"
import { generateBracketAction, updateMatchResultAction } from "@/app/(dashboard)/organizer/tournaments/[slug]/actions"
import { Trophy, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { useSupabase } from "@/components/providers/supabase-provider"
import { announceMatchWinner } from "@/lib/utils/announcer"

export function MatchManagerClient({ tournament, matches, teamCount }: { tournament: any, matches: any[], teamCount: number }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleGenerate = async () => {
    if (!confirm("Are you sure? This will lock registrations and create the bracket.")) return
    
    setIsGenerating(true)
    setError(null)
    const result = await generateBracketAction(tournament.slug)
    if (result.error) setError(result.error)
    setIsGenerating(false)
  }

  if (tournament.status === "REGISTRATION_OPEN" && matches.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Bracket Not Generated</h2>
        <p className="text-zinc-400 mb-6">
          Currently there are {teamCount} registered teams. You need at least 2 teams to generate a bracket.
          Once generated, registrations will be closed permanently.
        </p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <button 
          onClick={handleGenerate}
          disabled={isGenerating || teamCount < 2}
          className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(14,165,233,0.3)]"
        >
          {isGenerating ? "Generating..." : "Generate Bracket & Lock Registrations"}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {matches.length === 0 && (
        <div className="text-zinc-500 text-center py-12">No matches found.</div>
      )}
      
      {/* Group matches by Round */}
      {Array.from(new Set(matches.map(m => m.round))).map(round => (
        <div key={round} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-800 font-bold text-white">
            Round {round}
          </div>
          <div className="divide-y divide-zinc-800">
            {matches.filter(m => m.round === round).map(match => (
              <MatchRow key={match.id} match={match} tournamentSlug={tournament.slug} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function MatchRow({ match, tournamentSlug }: { match: any, tournamentSlug: string }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [t1Score, setT1Score] = useState(match.team1_score)
  const [t2Score, setT2Score] = useState(match.team2_score)
  const { profile } = useSupabase()

  const isCompleted = match.status === "COMPLETED"
  const team1Name = match.team1?.name || "TBD / BYE"
  const team2Name = match.team2?.name || "TBD / BYE"
  
  // A match cannot be reported if teams are not decided yet
  const canReport = !isCompleted && match.team1_id && match.team2_id

  const handleSubmit = async (e: React.FormEvent, winner: string) => {
    e.preventDefault()
    if (!confirm(`Declare ${winner === 'TEAM1' ? team1Name : team2Name} as the winner?`)) return
    
    setIsUpdating(true)
    const formData = new FormData()
    formData.append("matchId", match.id)
    formData.append("tournamentSlug", tournamentSlug)
    formData.append("team1Score", t1Score.toString())
    formData.append("team2Score", t2Score.toString())
    formData.append("winnerId", winner)
    
    const res = await updateMatchResultAction(formData)
    
    if (res && !res.error) {
      if (profile?.voice_announcements_enabled !== false) {
        const wName = winner === 'TEAM1' ? team1Name : team2Name
        const lName = winner === 'TEAM1' ? team2Name : team1Name
        const wScore = winner === 'TEAM1' ? t1Score : t2Score
        const lScore = winner === 'TEAM1' ? t2Score : t1Score
        const lang = profile?.preferred_language || "en"
        announceMatchWinner(wName, lName, Number(wScore), Number(lScore), lang)
      }
    }
    
    setIsUpdating(false)
  }

  return (
    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-800/20 transition-colors">
      <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className={`text-right font-bold ${match.winner_id === match.team1_id ? 'text-green-400' : 'text-zinc-200'}`}>
          {team1Name}
        </div>
        <div className="px-4 py-1 bg-zinc-950 rounded-full text-zinc-500 font-mono text-sm border border-zinc-800">VS</div>
        <div className={`font-bold ${match.winner_id === match.team2_id ? 'text-green-400' : 'text-zinc-200'}`}>
          {team2Name}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-zinc-800 md:border-t-0 pt-4 md:pt-0">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold">{match.team1_score} - {match.team2_score}</span>
          </div>
        ) : !canReport ? (
          <div className="flex items-center gap-2 text-zinc-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Waiting for teams</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              value={t1Score} 
              onChange={e => setT1Score(e.target.value)}
              className="w-16 bg-zinc-950 border border-zinc-700 rounded text-center py-1 text-white" 
              min="0"
            />
            <span className="text-zinc-500">-</span>
            <input 
              type="number" 
              value={t2Score} 
              onChange={e => setT2Score(e.target.value)}
              className="w-16 bg-zinc-950 border border-zinc-700 rounded text-center py-1 text-white" 
              min="0"
            />
            <button 
              onClick={(e) => handleSubmit(e, "TEAM1")}
              disabled={isUpdating}
              className="ml-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm transition-colors"
            >
              T1 Wins
            </button>
            <button 
              onClick={(e) => handleSubmit(e, "TEAM2")}
              disabled={isUpdating}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-sm transition-colors"
            >
              T2 Wins
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
