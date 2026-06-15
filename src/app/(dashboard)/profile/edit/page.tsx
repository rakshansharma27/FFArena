'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/components/providers/supabase-provider'
import { updateProfileAction, uploadAvatarAction } from '@/app/auth/actions'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ShieldAlert, CheckCircle2, ArrowLeft, Camera, Settings2 } from 'lucide-react'
import { INDIA_STATES, getCitiesByState } from '@/lib/india-regions'

export default function EditProfilePage() {
  const { profile, refreshProfile, loading: profileLoading } = useSupabase()
  const router = useRouter()

  // Form states
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)

  const citySuggestions = state
    ? getCitiesByState(state).filter((c) => c.toLowerCase().includes(city.toLowerCase()))
    : []
  const [ffUid, setFfUid] = useState('')
  const [bgmiUid, setBgmiUid] = useState('')
  const [valorantId, setValorantId] = useState('')
  const [prefLang, setPrefLang] = useState('en')
  const [voiceEnabled, setVoiceEnabled] = useState(true)

  // System states
  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Sync profile details into states
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      setBio(profile.bio || '')
      setPhone(profile.phone || '')
      setState(profile.state || '')
      setCity(profile.city || '')
      setFfUid(profile.ff_uid || '')
      setBgmiUid(profile.bgmi_uid || '')
      setValorantId(profile.valorant_id || '')
      setPrefLang(profile.preferred_language || 'en')
      setVoiceEnabled(profile.voice_announcements_enabled ?? true)
    }
  }, [profile])

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#07070A] text-[#f8fafc] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff6b00]/30 border-t-[#ff6b00] rounded-full animate-spin mb-4" />
        <p className="text-[#94a3b8] text-sm">Loading lobby settings...</p>
      </div>
    )
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 2 MB
    if (file.size > 2 * 1024 * 1024) {
      setError('Avatar image size must be under 2 MB')
      return
    }

    setAvatarUploading(true)
    setError(null)
    setSuccess(null)

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1]
        const res = await uploadAvatarAction(base64String, file.type)
        if (res?.error) {
          setError(res.error)
        } else {
          setSuccess('Avatar updated successfully!')
          await refreshProfile()
        }
      } catch {
        setError('Failed to upload avatar image.')
      } finally {
        setAvatarUploading(false)
      }
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!displayName.trim()) {
      setError('Display Name is required.')
      setLoading(false)
      return
    }

    // Phone format verification if filled
    if (phone.trim() && !/^\+91[0-9]{10}$/.test(phone.trim())) {
      setError('Phone number must follow +91XXXXXXXXXX format')
      setLoading(false)
      return
    }

    try {
      const res = await updateProfileAction({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        state: state.trim(),
        city: city.trim(),
        ff_uid: ffUid.trim() || null,
        bgmi_uid: bgmiUid.trim() || null,
        valorant_id: valorantId.trim() || null,
        preferred_language: prefLang,
        voice_announcements_enabled: voiceEnabled,
      })

      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess('Profile updated successfully!')
        // Update localization cookie for next-intl
        document.cookie = `NEXT_LOCALE=${prefLang}; path=/; max-age=31536000; SameSite=Lax`
        await refreshProfile()
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1000)
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07070A] text-[#f8fafc] font-sans py-12 px-4 relative overflow-hidden selection:bg-[#ff6b00] selection:text-white">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#0ea5e9]/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-[#94a3b8] hover:text-[#f8fafc] font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider bg-[#0d0d14] px-3 py-1.5 rounded-full border border-[#1e1e2f]">
            @{profile?.username}
          </span>
        </div>

        <Card className="bg-[#0D0D14] border-[#1e1e2f] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-orange-500 to-amber-500" />

          <CardHeader className="border-b border-[#1e1e2f]/50 pb-6">
            <div className="flex items-center gap-3">
              <Settings2 className="w-6 h-6 text-[#ff6b00]" />
              <div>
                <CardTitle className="text-2xl font-heading font-black">
                  Lobby Profile Settings
                </CardTitle>
                <CardDescription className="text-[#94a3b8]">
                  Customize your details, preferred language, and links to game profiles
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-950/50 border border-red-500/30 text-red-400 px-3 py-2.5 rounded-lg text-xs font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 px-3 py-2.5 rounded-lg text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Avatar Upload Frame */}
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#09090E] p-4 rounded-xl border border-[#1e1e2f]/55">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-[#151522] border-2 border-[#1e1e2f] flex items-center justify-center shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-heading font-black text-sky-400">
                    {profile?.display_name?.charAt(0).toUpperCase()}
                  </span>
                )}
                {avatarUploading && (
                  <div className="absolute inset-0 bg-[#07070A]/70 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[#0ea5e9]/30 border-t-[#0ea5e9] rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-sm font-bold text-[#f8fafc]">Avatar Picture</h3>
                <p className="text-xs text-[#94a3b8]">Supports PNG, JPG, or WEBP. Max size 2 MB.</p>
                <div className="relative inline-block">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={avatarUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#1e1e2f] hover:bg-[#151522] text-[#f8fafc] text-xs font-bold gap-1.5 h-9"
                    disabled={avatarUploading}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Upload Image
                  </Button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="displayName" className="text-xs font-bold text-[#94a3b8]">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-[#151522] border-[#1e1e2f] focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] text-[#f8fafc] h-10"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold text-[#94a3b8]">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="text"
                    placeholder="+919876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-[#151522] border-[#1e1e2f] focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] text-[#f8fafc] h-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-bold text-[#94a3b8]">
                    State / UT
                  </Label>
                  <Select
                    value={state}
                    onValueChange={(val: any) => {
                      setState(val || '')
                      setCity('') // Reset city when state changes
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full bg-[#151522] border-[#1e1e2f] text-[#f8fafc] h-10 focus:ring-1 focus:ring-[#ff6b00]">
                      <SelectValue placeholder="Select State / UT" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D0D14] border-[#1e1e2f] text-[#f8fafc] max-h-60 overflow-y-auto">
                      {INDIA_STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 relative">
                  <Label htmlFor="city" className="text-xs font-bold text-[#94a3b8]">
                    City
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder={state ? 'Start typing city...' : 'Select a state first'}
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value)
                      setShowCitySuggestions(true)
                    }}
                    onFocus={() => setShowCitySuggestions(true)}
                    onBlur={() => {
                      // Slight delay to allow clicks on suggestions to register before hiding
                      setTimeout(() => setShowCitySuggestions(false), 200)
                    }}
                    className="bg-[#151522] border-[#1e1e2f] focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] text-[#f8fafc] h-10"
                    disabled={loading || !state}
                  />
                  {showCitySuggestions && state && citySuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-[#0D0D14] border border-[#1e1e2f] rounded-md shadow-xl custom-scrollbar">
                      {citySuggestions.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onMouseDown={() => {
                            setCity(c)
                            setShowCitySuggestions(false)
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-[#f8fafc] hover:bg-[#ff6b00] hover:text-white transition-colors"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-xs font-bold text-[#94a3b8]">
                  Short Bio (Max 200 characters)
                </Label>
                <textarea
                  id="bio"
                  maxLength={200}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell local players about yourself..."
                  className="w-full bg-[#151522] border-[#1e1e2f] rounded-lg p-3 text-sm focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] text-[#f8fafc] h-20 outline-none resize-none transition-all"
                  disabled={loading}
                />
              </div>

              {/* Game Profile Connections */}
              <div className="border-t border-[#1e1e2f]/50 pt-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Game UID Connections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ffUid" className="text-xs font-bold text-[#94a3b8]">
                      Free Fire Max UID
                    </Label>
                    <Input
                      id="ffUid"
                      type="text"
                      placeholder="e.g. 19284058"
                      value={ffUid}
                      onChange={(e) => setFfUid(e.target.value)}
                      className="bg-[#151522] border-[#1e1e2f] focus:border-[#ff6b00] text-[#f8fafc] h-10 font-mono"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bgmiUid" className="text-xs font-bold text-[#94a3b8]">
                      BGMI UID
                    </Label>
                    <Input
                      id="bgmiUid"
                      type="text"
                      placeholder="e.g. 51840294"
                      value={bgmiUid}
                      onChange={(e) => setBgmiUid(e.target.value)}
                      className="bg-[#151522] border-[#1e1e2f] focus:border-[#ff6b00] text-[#f8fafc] h-10 font-mono"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="valorantId" className="text-xs font-bold text-[#94a3b8]">
                      Valorant Riot ID
                    </Label>
                    <Input
                      id="valorantId"
                      type="text"
                      placeholder="e.g. TenZ#NA1"
                      value={valorantId}
                      onChange={(e) => setValorantId(e.target.value)}
                      className="bg-[#151522] border-[#1e1e2f] focus:border-[#ff6b00] text-[#f8fafc] h-10 font-mono"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Preferences i18n */}
              <div className="border-t border-[#1e1e2f]/50 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="prefLang" className="text-xs font-bold text-[#94a3b8]">
                    Interface Language
                  </Label>
                  <Select
                    value={prefLang}
                    onValueChange={(val) => setPrefLang(val ?? 'en')}
                    disabled={loading}
                  >
                    <SelectTrigger className="bg-[#151522] border-[#1e1e2f] text-[#f8fafc] h-10">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D0D14] border-[#1e1e2f] text-[#f8fafc]">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                      <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                      <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                      <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="voiceEnabled"
                    checked={voiceEnabled}
                    onChange={(e) => setVoiceEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-[#1e1e2f] bg-[#151522] text-[#ff6b00] focus:ring-sky-500 focus:ring-offset-[#07070A]"
                    disabled={loading}
                  />
                  <Label
                    htmlFor="voiceEnabled"
                    className="text-xs font-bold text-[#f8fafc] cursor-pointer"
                  >
                    Enable browser voice announcements
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#1e1e2f]/50 pt-6">
                <Link href="/dashboard">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#1e1e2f] hover:bg-[#151522] text-[#f8fafc] font-bold"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold px-6 shadow-lg shadow-orange-500/10 transition-all flex items-center gap-2"
                  disabled={loading}
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export const runtime = 'edge';
