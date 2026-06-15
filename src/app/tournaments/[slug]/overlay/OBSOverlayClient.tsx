"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"

interface Sponsor {
  company_name: string
  logo_url: string
  website_url?: string
}

interface Match {
  id: string
  round: number
  match_order: number
  team1_id: string
  team2_id: string
  team1_score: number
  team2_score: number
  winner_id: string | null
  status: string
  team1?: { name: string } | null
  team2?: { name: string } | null
}

interface OverlayTheme {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  layout: string
  refreshInterval: number
  showSponsors: boolean
  showRecentMatches: boolean
}

interface OBSOverlayClientProps {
  tournamentId: string
  tournamentTitle: string
  overlayLogoUrl: string
  theme: OverlayTheme
  sponsors: Sponsor[]
  initialMatches: Match[]
}

export function OBSOverlayClient({
  tournamentId,
  tournamentTitle,
  overlayLogoUrl,
  theme,
  sponsors,
  initialMatches
}: OBSOverlayClientProps) {
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [liveTheme, setLiveTheme] = useState<OverlayTheme>(theme)
  const [liveLogoUrl, setLiveLogoUrl] = useState<string>(overlayLogoUrl)
  
  const [sponsorIndex, setSponsorIndex] = useState(0)
  const [matchIndex, setMatchIndex] = useState(0)

  const supabase = createClient()

  // 1. Live Refetch Matches Function
  const refetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          id,
          round,
          match_order,
          team1_id,
          team2_id,
          team1_score,
          team2_score,
          winner_id,
          status,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `)
        .eq("tournament_id", tournamentId)
        .order("round", { ascending: true })
        .order("match_order", { ascending: true })

      if (!error && data) {
        setMatches(data as any[])
      }
    } catch (err) {
      console.error("Failed to refetch matches:", err)
    }
  }

  // 2. Realtime Listener for Matches
  useEffect(() => {
    const channel = supabase
      .channel(`overlay-matches-${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          refetchMatches()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tournamentId])

  // 3. Realtime Listener for Tournament Settings & Theme
  useEffect(() => {
    const channel = supabase
      .channel(`overlay-tournament-${tournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tournaments",
          filter: `id=eq.${tournamentId}`,
        },
        (payload) => {
          if (payload.new) {
            const newT = payload.new as any
            if (newT.overlay_theme) {
              setLiveTheme((prev) => ({ ...prev, ...newT.overlay_theme }))
            }
            if (newT.overlay_logo_url !== undefined) {
              setLiveLogoUrl(newT.overlay_logo_url || "")
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tournamentId])

  // 4. Timer to rotate Sponsor Logos
  useEffect(() => {
    if (sponsors.length <= 1) return

    const interval = setInterval(() => {
      setSponsorIndex((prev) => (prev + 1) % sponsors.length)
    }, liveTheme.refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [sponsors.length, liveTheme.refreshInterval])

  // 5. Filter matches that are playable / displayable
  const displayableMatches = useMemo(() => {
    return matches.filter((m) => m.team1?.name && m.team2?.name)
  }, [matches])

  // 6. Timer to rotate Matches ticker
  useEffect(() => {
    if (displayableMatches.length <= 1) return

    const interval = setInterval(() => {
      setMatchIndex((prev) => (prev + 1) % displayableMatches.length)
    }, liveTheme.refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [displayableMatches.length, liveTheme.refreshInterval])

  const activeSponsor = sponsors[sponsorIndex]
  const activeMatch = displayableMatches[matchIndex]

  // Convert hex color to rgba for transparency
  const getRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace("#", "")
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const bgStyle = useMemo(() => {
    return {
      backgroundColor: getRgba(liveTheme.backgroundColor, 0.92),
      borderColor: liveTheme.primaryColor,
      color: liveTheme.textColor
    }
  }, [liveTheme.backgroundColor, liveTheme.primaryColor, liveTheme.textColor])

  // If there are no sponsors or matches, return fallback styles or placeholders
  const layout = liveTheme.layout

  return (
    <div className="fixed inset-0 w-screen h-screen bg-transparent pointer-events-none select-none font-sans overflow-hidden">
      
      {/* 1. CLASSIC LAYOUT (Bottom Ticker) */}
      {layout === "classic" && (
        <div 
          style={bgStyle}
          className="absolute bottom-0 left-0 w-full border-t-4 py-4 px-8 flex items-center justify-between shadow-2xl transition-all duration-500 animate-slide-up"
        >
          {/* Tournament Branding */}
          <div className="flex items-center gap-4 border-r border-zinc-800 pr-6 shrink-0">
            {liveLogoUrl ? (
              <img src={liveLogoUrl} alt="Logo" className="h-10 w-auto object-contain animate-pulse" />
            ) : (
              <div 
                style={{ backgroundColor: liveTheme.primaryColor }}
                className="h-9 w-9 rounded flex items-center justify-center text-white font-black text-sm"
              >
                FFA
              </div>
            )}
            <div>
              <h2 style={{ color: liveTheme.textColor }} className="font-extrabold text-sm uppercase tracking-wider">
                {tournamentTitle}
              </h2>
              <span style={{ color: liveTheme.secondaryColor }} className="text-xs font-bold uppercase tracking-widest block">
                Live Broadcast Ticker
              </span>
            </div>
          </div>

          {/* Matches & Score Ticker */}
          {liveTheme.showRecentMatches && activeMatch ? (
            <div className="flex-1 px-8 flex flex-col items-center">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-0.5">
                Round {activeMatch.round} • Match Update
              </span>
              <div className="flex items-center gap-4 font-mono text-sm font-black">
                <span className={activeMatch.winner_id === activeMatch.team1_id ? "text-green-400" : "text-white"}>
                  {activeMatch.team1?.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <span 
                    style={{ backgroundColor: liveTheme.primaryColor }} 
                    className="px-2 py-0.5 rounded text-white text-xs font-bold"
                  >
                    {activeMatch.team1_score}
                  </span>
                  <span className="text-zinc-500">-</span>
                  <span 
                    style={{ backgroundColor: liveTheme.primaryColor }} 
                    className="px-2 py-0.5 rounded text-white text-xs font-bold"
                  >
                    {activeMatch.team2_score}
                  </span>
                </div>
                <span className={activeMatch.winner_id === activeMatch.team2_id ? "text-green-400" : "text-white"}>
                  {activeMatch.team2?.name}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ml-2 ${
                  activeMatch.status === "COMPLETED" 
                    ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                    : "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                }`}>
                  {activeMatch.status === "COMPLETED" ? "FT" : "Live"}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">
              Waiting for match outcomes
            </div>
          )}

          {/* Rotating Sponsor Logo */}
          {liveTheme.showSponsors && activeSponsor && (
            <div className="flex items-center gap-3 border-l border-zinc-800 pl-6 shrink-0 transition-opacity duration-300">
              <div className="text-right">
                <span className="text-[9px] text-zinc-400 uppercase font-bold block tracking-widest">
                  Sponsored By
                </span>
                <span style={{ color: liveTheme.textColor }} className="text-xs font-black">
                  {activeSponsor.company_name}
                </span>
              </div>
              {activeSponsor.logo_url && (
                <img 
                  src={activeSponsor.logo_url} 
                  alt={activeSponsor.company_name} 
                  className="h-10 w-24 object-contain rounded bg-zinc-950 p-1 border border-zinc-800"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. COMPACT LAYOUT (Top Bar Ticker) */}
      {layout === "compact" && (
        <div 
          style={bgStyle}
          className="absolute top-0 left-0 w-full border-b-4 py-3 px-6 flex items-center justify-between shadow-lg transition-all duration-500 animate-slide-down"
        >
          <div className="flex items-center gap-4">
            {liveLogoUrl ? (
              <img src={liveLogoUrl} alt="Logo" className="h-7 w-auto object-contain" />
            ) : (
              <div 
                style={{ backgroundColor: liveTheme.primaryColor }}
                className="h-6 w-6 rounded flex items-center justify-center text-white font-black text-xs"
              >
                F
              </div>
            )}
            <span style={{ color: liveTheme.textColor }} className="font-extrabold text-xs uppercase tracking-wider">
              {tournamentTitle}
            </span>
            <span className="h-4 w-[1px] bg-zinc-800" />
            
            {liveTheme.showRecentMatches && activeMatch && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-zinc-500 font-bold uppercase tracking-widest text-[9px]">
                  R{activeMatch.round} UPDATE
                </span>
                <div className="font-mono flex items-center gap-2 font-bold">
                  <span>{activeMatch.team1?.name}</span>
                  <span className="text-zinc-400 font-black">
                    {activeMatch.team1_score} - {activeMatch.team2_score}
                  </span>
                  <span>{activeMatch.team2?.name}</span>
                </div>
                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                  activeMatch.status === "COMPLETED" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400 animate-pulse"
                }`}>
                  {activeMatch.status === "COMPLETED" ? "FT" : "Live"}
                </span>
              </div>
            )}
          </div>

          {liveTheme.showSponsors && activeSponsor && (
            <div className="flex items-center gap-2 transition-all duration-300">
              <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">
                Partner:
              </span>
              {activeSponsor.logo_url ? (
                <img 
                  src={activeSponsor.logo_url} 
                  alt={activeSponsor.company_name} 
                  className="h-6 w-16 object-contain rounded bg-zinc-950 px-1 py-0.5 border border-zinc-800"
                />
              ) : (
                <span style={{ color: liveTheme.secondaryColor }} className="text-xs font-bold">
                  {activeSponsor.company_name}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. MINIMAL LAYOUT (Floating Corner Badge) */}
      {layout === "minimal" && (
        <div className="absolute top-6 right-6 w-80 space-y-4">
          <div 
            style={bgStyle}
            className="border-l-4 rounded-xl p-4 shadow-2xl flex flex-col gap-3 transition-all duration-500 animate-slide-in-right"
          >
            {/* Branding Header */}
            <div className="flex items-center gap-3 border-b border-zinc-800/60 pb-2.5">
              {liveLogoUrl ? (
                <img src={liveLogoUrl} alt="Logo" className="h-6 w-auto object-contain" />
              ) : (
                <div 
                  style={{ backgroundColor: liveTheme.primaryColor }}
                  className="h-5 w-5 rounded-full"
                />
              )}
              <div className="min-w-0">
                <h2 style={{ color: liveTheme.textColor }} className="font-extrabold text-[10px] uppercase tracking-wider truncate">
                  {tournamentTitle}
                </h2>
                <span style={{ color: liveTheme.secondaryColor }} className="text-[9px] font-bold uppercase tracking-widest block">
                  Broadcast Widget
                </span>
              </div>
            </div>

            {/* Match Info */}
            {liveTheme.showRecentMatches && activeMatch ? (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                  <span>Round {activeMatch.round} Match</span>
                  <span className={activeMatch.status === "COMPLETED" ? "text-green-500" : "text-red-500 animate-pulse font-extrabold"}>
                    {activeMatch.status === "COMPLETED" ? "COMPLETED" : "LIVE"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className={activeMatch.winner_id === activeMatch.team1_id ? "text-green-400" : "text-white"}>
                      {activeMatch.team1?.name}
                    </span>
                    <span className="font-mono text-zinc-300 font-black">{activeMatch.team1_score}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className={activeMatch.winner_id === activeMatch.team2_id ? "text-green-400" : "text-white"}>
                      {activeMatch.team2?.name}
                    </span>
                    <span className="font-mono text-zinc-300 font-black">{activeMatch.team2_score}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                Setup Live Matches
              </div>
            )}

            {/* Sponsor block */}
            {liveTheme.showSponsors && activeSponsor && (
              <div className="border-t border-zinc-800/60 pt-2.5 flex items-center justify-between transition-all duration-300">
                <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">
                  Sponsored
                </span>
                {activeSponsor.logo_url ? (
                  <img 
                    src={activeSponsor.logo_url} 
                    alt={activeSponsor.company_name} 
                    className="h-6 w-16 object-contain rounded bg-zinc-950 px-1 py-0.5 border border-zinc-800"
                  />
                ) : (
                  <span style={{ color: liveTheme.textColor }} className="text-[10px] font-black">
                    {activeSponsor.company_name}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Custom keyframe styles inside the page context */}
      <style jsx global>{`
        @keyframes slide-up {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-down {
          0% { transform: translateY(-100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-in-right {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-down {
          animation: slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  )
}
