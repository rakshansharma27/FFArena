"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Users } from "lucide-react"

interface RealtimeRegistrationCountProps {
  tournamentId: string
  initialCount: number
  maxTeams: number
}

export function RealtimeRegistrationCount({ tournamentId, initialCount, maxTeams }: RealtimeRegistrationCountProps) {
  const [count, setCount] = useState(initialCount)
  const supabase = createClient()

  useEffect(() => {
    // Note: To be fully accurate we'd subscribe to tournaments changes directly,
    // or teams table and calculate. Subscribing to tournament updates is cleaner:
    const channel = supabase
      .channel(`tournament-${tournamentId}-updates`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tournaments",
          filter: `id=eq.${tournamentId}`,
        },
        (payload) => {
          if (payload.new && "registered_count" in payload.new) {
            setCount(payload.new.registered_count as number)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tournamentId, supabase])

  const isFull = count >= maxTeams

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
      <Users className="w-4 h-4 text-zinc-400" />
      <span className="text-sm font-medium">
        <span className={isFull ? "text-yellow-500" : "text-zinc-100"}>{count}</span>
        <span className="text-zinc-500 mx-1">/</span>
        <span className="text-zinc-400">{maxTeams}</span>
      </span>
    </div>
  )
}
