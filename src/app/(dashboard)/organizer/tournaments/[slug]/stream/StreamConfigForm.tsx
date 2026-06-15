"use client"

import { useState, useEffect } from "react"
import { updateTournamentStreamAction } from "../actions"
import { Copy, Check, Eye, EyeOff, Save, ExternalLink, Video, Settings, Palette, Info } from "lucide-react"

interface StreamConfigFormProps {
  tournamentSlug: string
  initialRtmpUrl: string
  initialStreamKey: string
  initialOverlayLogoUrl: string
  initialOverlayTheme: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    textColor: string
    layout: string
    refreshInterval: number
    showSponsors: boolean
    showRecentMatches: boolean
  }
}

export function StreamConfigForm({
  tournamentSlug,
  initialRtmpUrl,
  initialStreamKey,
  initialOverlayLogoUrl,
  initialOverlayTheme
}: StreamConfigFormProps) {
  const [rtmpUrl, setRtmpUrl] = useState(initialRtmpUrl)
  const [streamKey, setStreamKey] = useState(initialStreamKey)
  const [overlayLogoUrl, setOverlayLogoUrl] = useState(initialOverlayLogoUrl)
  
  // Theme settings states
  const [primaryColor, setPrimaryColor] = useState(initialOverlayTheme.primaryColor)
  const [secondaryColor, setSecondaryColor] = useState(initialOverlayTheme.secondaryColor)
  const [backgroundColor, setBackgroundColor] = useState(initialOverlayTheme.backgroundColor)
  const [textColor, setTextColor] = useState(initialOverlayTheme.textColor)
  const [layout, setLayout] = useState(initialOverlayTheme.layout)
  const [refreshInterval, setRefreshInterval] = useState(initialOverlayTheme.refreshInterval)
  const [showSponsors, setShowSponsors] = useState(initialOverlayTheme.showSponsors)
  const [showRecentMatches, setShowRecentMatches] = useState(initialOverlayTheme.showRecentMatches)

  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedPreview, setCopiedPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [overlayUrl, setOverlayUrl] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOverlayUrl(`${window.location.origin}/tournaments/${tournamentSlug}/overlay`)
    }
  }, [tournamentSlug])

  const copyToClipboard = async (text: string, isPreview: boolean = false) => {
    try {
      await navigator.clipboard.writeText(text)
      if (isPreview) {
        setCopiedPreview(true)
        setTimeout(() => setCopiedPreview(false), 2000)
      } else {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    const themePayload = {
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      layout,
      refreshInterval,
      showSponsors,
      showRecentMatches
    }

    const result = await updateTournamentStreamAction(
      tournamentSlug,
      rtmpUrl || null,
      streamKey || null,
      overlayLogoUrl || null,
      themePayload
    )

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Stream and overlay configuration updated successfully!")
    }
    setIsSaving(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* OBS Overlay URL Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <ExternalLink className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white mb-1">OBS Studio Overlay URL</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Add this URL as a <strong className="text-zinc-300">Browser Source</strong> in OBS Studio. Recommended width: <strong className="text-zinc-300">1920px</strong>, height: <strong className="text-zinc-300">1080px</strong>.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={overlayUrl}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm font-mono text-zinc-300 select-all focus:outline-none focus:border-zinc-700"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(overlayUrl)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 border border-zinc-700"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <a
                href={overlayUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 border border-zinc-700"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Test Overlay</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: RTMP Config & Overlay Customizer */}
        <div className="space-y-8">
          {/* RTMP Settings */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Video className="w-5 h-5 text-[#ff6b00]" />
              RTMP Stream Ingestion
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">
                  RTMP Ingest Server URL
                </label>
                <input
                  type="url"
                  value={rtmpUrl}
                  onChange={(e) => setRtmpUrl(e.target.value)}
                  placeholder="rtmp://live.ffarena.live/live"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff6b00] transition-colors"
                />
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  The primary stream server location where you point OBS.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">
                  Stream Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={streamKey}
                    onChange={(e) => setStreamKey(e.target.value)}
                    placeholder="live_xxxxxxxxx"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-4 pr-12 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#ff6b00] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  Keep this private. Do not share your tournament stream key.
                </p>
              </div>
            </div>
          </div>

          {/* Overlay Customizer */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Palette className="w-5 h-5 text-[#ff6b00]" />
              Overlay Theme & Branding
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">
                  Overlay Logo URL (Sponsor / League Brand)
                </label>
                <input
                  type="url"
                  value={overlayLogoUrl}
                  onChange={(e) => setOverlayLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff6b00] transition-colors"
                />
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  URL to a custom transparent PNG logo to render in the overlay header.
                </p>
              </div>

              {/* Color Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">
                    Primary Theme Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg bg-transparent border border-zinc-800 cursor-pointer overflow-hidden"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">
                    Secondary Accent Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg bg-transparent border border-zinc-800 cursor-pointer overflow-hidden"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">
                    Overlay Background
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-10 h-10 rounded-lg bg-transparent border border-zinc-800 cursor-pointer overflow-hidden"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">
                    Overlay Text Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-10 h-10 rounded-lg bg-transparent border border-zinc-800 cursor-pointer overflow-hidden"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Layout Config */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">
                    Layout Style
                  </label>
                  <select
                    value={layout}
                    onChange={(e) => setLayout(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff6b00]"
                  >
                    <option value="classic">Classic Bottom Banner</option>
                    <option value="compact">Compact Top Bar</option>
                    <option value="minimal">Minimalist Corner Badge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-2">
                    Refresh Interval (Sec)
                  </label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff6b00]"
                  >
                    <option value={5}>5 seconds</option>
                    <option value={10}>10 seconds</option>
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                  </select>
                </div>
              </div>

              {/* Content Toggles */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSponsors}
                    onChange={(e) => setShowSponsors(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-[#ff6b00] focus:ring-[#ff6b00] cursor-pointer"
                  />
                  <span className="text-sm text-zinc-300">Enable Rotating Sponsor Logos</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRecentMatches}
                    onChange={(e) => setShowRecentMatches(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-[#ff6b00] focus:ring-[#ff6b00] cursor-pointer"
                  />
                  <span className="text-sm text-zinc-300">Show Realtime Match & Bracket Ticker</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Preview Panel */}
        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-4 shrink-0">
              <Settings className="w-5 h-5 text-[#ff6b00]" />
              Live Overlay Preview
            </h2>

            {/* Mockup Canvas */}
            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between aspect-video relative overflow-hidden shadow-inner">
              {/* Background simulator grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

              {/* Stream Overlay Simulation */}
              {layout === "compact" ? (
                /* Compact Layout simulation */
                <div 
                  style={{ backgroundColor: backgroundColor, borderColor: primaryColor }}
                  className="w-full p-3 border-b-2 flex items-center justify-between rounded-lg relative z-10 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    {overlayLogoUrl ? (
                      <img src={overlayLogoUrl} alt="Logo" className="h-6 w-auto object-contain" />
                    ) : (
                      <div style={{ backgroundColor: primaryColor }} className="h-5 w-5 rounded shrink-0" />
                    )}
                    <span style={{ color: textColor }} className="text-xs font-bold uppercase tracking-wider font-sans">
                      FFArena Live
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded uppercase animate-pulse">
                      Live
                    </span>
                    <span style={{ color: textColor }} className="text-xs font-mono font-semibold">
                      ROUND 2: Team India (2) vs (1) Team Elite
                    </span>
                  </div>

                  {showSponsors && (
                    <div style={{ borderColor: primaryColor }} className="px-2 py-0.5 border border-dashed rounded text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                      SPONSOR LOGO
                    </div>
                  )}
                </div>
              ) : layout === "minimal" ? (
                /* Minimal Layout simulation */
                <div className="w-full h-full flex justify-end items-start relative z-10">
                  <div 
                    style={{ backgroundColor: backgroundColor, borderColor: primaryColor }}
                    className="p-3 border-l-4 rounded-lg flex items-center gap-3 shadow-lg max-w-[200px]"
                  >
                    {overlayLogoUrl ? (
                      <img src={overlayLogoUrl} alt="Logo" className="h-6 w-auto object-contain" />
                    ) : (
                      <div style={{ backgroundColor: primaryColor }} className="h-5 w-5 rounded-full shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span style={{ color: textColor }} className="text-[10px] font-bold block truncate">
                        FREE FIRE LEAGUE
                      </span>
                      <span className="text-[9px] text-zinc-400 block font-mono truncate">
                        Winner: TBD
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Classic Bottom Layout simulation (Default) */
                <>
                  <div className="flex justify-between items-start w-full relative z-10">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      [1920 x 1080 OBS Stream Feed]
                    </span>
                    <div className="h-4 w-4 rounded-full bg-red-600 animate-ping" />
                  </div>

                  <div 
                    style={{ backgroundColor: backgroundColor, borderColor: primaryColor }}
                    className="w-full border-t-4 p-4 flex flex-col sm:flex-row items-center justify-between rounded-t-xl relative z-10 shadow-2xl transition-all duration-300 mt-auto"
                  >
                    <div className="flex items-center gap-3">
                      {overlayLogoUrl ? (
                        <img src={overlayLogoUrl} alt="Logo" className="h-8 w-auto object-contain" />
                      ) : (
                        <div style={{ backgroundColor: primaryColor }} className="h-8 w-8 rounded flex items-center justify-center text-white font-black text-sm shrink-0">
                          FF
                        </div>
                      )}
                      <div>
                        <span style={{ color: textColor }} className="text-sm font-black tracking-tight block font-sans">
                          FFArena Grassroots Finals
                        </span>
                        <span style={{ color: secondaryColor }} className="text-xs font-bold uppercase tracking-wider block">
                          Tournament Live Ticker
                        </span>
                      </div>
                    </div>

                    <div className="my-2 sm:my-0 text-center sm:text-left">
                      <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        Current Match Score
                      </div>
                      <div style={{ color: textColor }} className="text-sm font-mono font-extrabold flex items-center gap-2">
                        <span>Delhi Dragons</span>
                        <span style={{ backgroundColor: primaryColor }} className="px-2 py-0.5 rounded text-white text-xs">
                          3
                        </span>
                        <span>-</span>
                        <span style={{ backgroundColor: primaryColor }} className="px-2 py-0.5 rounded text-white text-xs">
                          2
                        </span>
                        <span>Mumbai Tigers</span>
                      </div>
                    </div>

                    {showSponsors && (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">
                          Sponsor Partner
                        </span>
                        <div className="h-7 w-20 bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-400 font-bold font-mono">
                          INTEL CPU
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 p-4 bg-zinc-950 rounded-lg border border-zinc-800 flex items-start gap-3 text-xs text-zinc-400">
              <Info className="w-4 h-4 text-[#ff6b00] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-zinc-300 mb-0.5">Realtime Rendering Information</p>
                <p>Colors, layout structure, logo, and active sponsorship details sync instantly into the active OBS Browser Source without needing a stream restart.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Action Footer */}
      <div className="border-t border-zinc-800 pt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 bg-[#ff6b00] hover:bg-[#ff6b00]/90 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,107,0,0.2)]"
        >
          <Save className="w-5 h-5" />
          <span>{isSaving ? "Saving Config..." : "Save Stream Settings"}</span>
        </button>
      </div>
    </form>
  )
}
