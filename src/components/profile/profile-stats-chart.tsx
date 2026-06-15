"use client"

interface GameStat {
  game_id: string
  kills: number
  wins: number
  tournaments_played: number
  elo_rating: number
  game: {
    name: string
    slug: string
  }
}

interface ProfileStatsChartProps {
  stats: GameStat[]
}

export function ProfileStatsChart({ stats }: ProfileStatsChartProps) {
  // We want to chart ELO for the 4 core games: free-fire-max, bgmi, valorant, cs2
  const targetGames = [
    { name: "Free Fire", slug: "free-fire-max", color: "#ff6b00" },
    { name: "BGMI", slug: "bgmi", color: "#10b981" },
    { name: "Valorant", slug: "valorant", color: "#ef4444" },
    { name: "CS2", slug: "cs2", color: "#eab308" }
  ]

  const chartData = targetGames.map((tg, index) => {
    const gameStat = stats.find(s => s.game.slug === tg.slug)
    const elo = gameStat?.elo_rating || 1000
    // Normalize ELO: 1000 is min (0%), 2000 is max (100%)
    const score = Math.max(0.1, Math.min(1.0, (elo - 1000) / 1000 || 0.1))
    
    // Angles for a 4-point diamond/radar
    // 0: North, 90: East, 180: South, 270: West
    const angle = (index * 90 * Math.PI) / 180
    const x = Math.sin(angle) * score * 100
    const y = -Math.cos(angle) * score * 100

    return {
      ...tg,
      elo,
      x,
      y,
      score
    }
  })

  // Generate SVG polygon points
  const points = chartData.map(d => `${d.x},${d.y}`).join(" ")

  return (
    <div className="bg-[#0D0D14] border border-[#1e1e2f] rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8 justify-around shadow-2xl relative overflow-hidden">
      {/* Background neon grid lines */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl" />

      {/* Radar SVG */}
      <div className="w-56 h-56 flex items-center justify-center bg-[#151522]/30 rounded-full border border-[#1e1e2f] p-4 shrink-0">
        <svg viewBox="-120 -120 240 240" className="w-full h-full overflow-visible">
          {/* Radial grid circles */}
          <circle cx="0" cy="0" r="100" fill="none" stroke="#1e1e2f" strokeWidth="1" />
          <circle cx="0" cy="0" r="75" fill="none" stroke="#1e1e2f" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="0" cy="0" r="50" fill="none" stroke="#1e1e2f" strokeWidth="1" />
          <circle cx="0" cy="0" r="25" fill="none" stroke="#1e1e2f" strokeWidth="1" strokeDasharray="4 4" />

          {/* Grid axes */}
          <line x1="0" y1="-100" x2="0" y2="100" stroke="#1e1e2f" strokeWidth="1" />
          <line x1="-100" y1="0" x2="100" y2="0" stroke="#1e1e2f" strokeWidth="1" />

          {/* Axis Labels */}
          {chartData.map((d, index) => {
            const angle = (index * 90 * Math.PI) / 180
            const lx = Math.sin(angle) * 115
            const ly = -Math.cos(angle) * 115
            
            // Adjust label alignments
            let textAnchor: "middle" | "start" | "end" = "middle"
            if (index === 1) textAnchor = "start"
            if (index === 3) textAnchor = "end"

            return (
              <text
                key={d.slug}
                x={lx}
                y={ly + 4}
                fill="#94a3b8"
                fontSize="9"
                fontWeight="black"
                textAnchor={textAnchor}
                className="uppercase tracking-widest font-heading"
              >
                {d.name}
              </text>
            )
          })}

          {/* Value Polygon */}
          {stats.length > 0 ? (
            <>
              <polygon
                points={points}
                fill="url(#radarGradient)"
                stroke="#ff6b00"
                strokeWidth="2.5"
                className="drop-shadow-[0_0_15px_rgba(255,107,0,0.4)]"
              />
              {/* Radar Dots */}
              {chartData.map((d) => (
                <circle
                  key={d.slug}
                  cx={d.x}
                  cy={d.y}
                  r="4"
                  fill={d.color}
                  stroke="#07070A"
                  strokeWidth="1.5"
                />
              ))}
            </>
          ) : (
            <text x="0" y="5" fill="#52525b" fontSize="10" fontWeight="bold" textAnchor="middle">
              NO STATS YET
            </text>
          )}

          {/* Gradients */}
          <defs>
            <radialGradient id="radarGradient" cx="0%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.4" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Stats Breakdown details */}
      <div className="flex-1 space-y-4 w-full">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] border-b border-[#1e1e2f] pb-2">
          Game ELO Breakdown
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {chartData.map((d) => {
            const hasPlayed = stats.some(s => s.game.slug === d.slug)
            return (
              <div
                key={d.slug}
                className="bg-[#151522]/50 border border-[#1e1e2f] p-3 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </div>
                  <div className="text-lg font-heading font-black text-[#f8fafc] mt-0.5">
                    {d.elo.toLocaleString()}
                  </div>
                </div>
                {!hasPlayed && (
                  <span className="text-[8px] bg-zinc-800 text-zinc-500 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
                    Inactive
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
