"use client"

import Link from "next/link"
import { Trophy, Medal, Search, MapPin } from "lucide-react"

interface LeaderboardEntry {
  id: string
  scope: string
  scope_value: string
  points: number
  current_rank: number
  profile: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
    state: string
    city: string
  }
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string | null
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-amber-400" />
      case 2:
        return <Medal className="w-5 h-5 text-zinc-300" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-700" />
      default:
        return <span className="font-mono font-bold text-zinc-500 w-5 text-center">{rank}</span>
    }
  }

  if (entries.length === 0) {
    return (
      <div className="bg-[#0D0D14] border border-[#1e1e2f] rounded-2xl p-12 text-center">
        <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-zinc-300">No Standings Yet</h3>
        <p className="text-[#94a3b8] text-sm mt-1">
          No matches resolved or registrations finalized for this selection yet.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#0D0D14] border border-[#1e1e2f] rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#151522] border-b border-[#1e1e2f] text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4 w-20 text-center">Rank</th>
              <th className="px-6 py-4">Player</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4 text-right text-[#0ea5e9]">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e2f]">
            {entries.map((entry) => {
              const isCurrentUser = currentUserId === entry.profile.id
              return (
                <tr
                  key={entry.id}
                  className={`transition-colors hover:bg-[#151522]/50 ${
                    isCurrentUser ? "bg-orange-500/5 border-l-2 border-l-orange-500" : ""
                  }`}
                >
                  <td className="px-6 py-5 flex items-center justify-center">
                    {getRankBadge(entry.current_rank)}
                  </td>
                  <td className="px-6 py-5">
                    <Link
                      href={`/profile/${entry.profile.username}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-[#151522] border border-[#1e1e2f] flex items-center justify-center shrink-0">
                        {entry.profile.avatar_url ? (
                          <img
                            src={entry.profile.avatar_url}
                            alt={entry.profile.display_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-black text-sky-400">
                            {entry.profile.display_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[#f8fafc] group-hover:text-[#ff6b00] transition-colors flex items-center gap-1.5">
                          {entry.profile.display_name}
                          {isCurrentUser && (
                            <span className="text-[9px] bg-orange-500/10 text-orange-500 border border-orange-500/25 px-1.5 py-0.5 rounded font-black uppercase">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#94a3b8]">@{entry.profile.username}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-5 text-zinc-300">
                    <span className="flex items-center gap-1 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {entry.profile.city}, {entry.profile.state}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-mono font-bold text-lg text-sky-400">
                    {entry.points.toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
