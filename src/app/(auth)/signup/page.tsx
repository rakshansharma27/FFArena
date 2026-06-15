'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUpAction, checkUsernameAction } from '@/app/auth/actions'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ShieldAlert, CheckCircle2 } from 'lucide-react'
import { INDIA_STATES, getCitiesByState } from '@/lib/india-regions'

export default function SignupPage() {
  const router = useRouter()

  // Form states
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'PLAYER' | 'ORGANIZER' | 'SPONSOR'>('PLAYER')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)

  const citySuggestions = state
    ? getCitiesByState(state).filter((c) => c.toLowerCase().includes(city.toLowerCase()))
    : []

  // Validation / Loading states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>(
    'idle'
  )

  const handleCheckUsername = async (val: string) => {
    const trimmed = val.trim().toLowerCase()
    setUsername(trimmed)

    if (trimmed.length < 3) {
      setUsernameStatus('idle')
      return
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
    if (!usernameRegex.test(trimmed)) {
      setUsernameStatus('taken') // invalid format treated as unavailable
      return
    }

    setUsernameStatus('checking')
    try {
      const res = await checkUsernameAction(trimmed)
      if (res.isAvailable) {
        setUsernameStatus('available')
      } else {
        setUsernameStatus('taken')
      }
    } catch {
      setUsernameStatus('idle')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!username || !displayName || !email || !password || !role || !state || !city) {
      setError('Please fill in all fields.')
      setLoading(false)
      return
    }

    if (usernameStatus === 'taken') {
      setError('Username is not available.')
      setLoading(false)
      return
    }

    try {
      const res = await signUpAction({
        username,
        display_name: displayName,
        email,
        password,
        role,
        state,
        city,
      })

      if (res?.error) {
        setError(res.error)
      } else if (res?.emailConfirmationRequired) {
        setSuccess(
          'Account created! Please check your email for a confirmation link to activate your profile.'
        )
      } else {
        setSuccess('Registration successful! Logging in...')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1500)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07070A] text-[#f8fafc] flex items-center justify-center py-12 px-4 relative overflow-hidden font-sans selection:bg-[#ff6b00] selection:text-white">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#ff6b00]/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#0ea5e9]/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-lg">
        {/* Logo Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl font-heading font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-orange-500 to-amber-400">
              FFARENA
              <span className="text-white text-xs font-sans font-bold bg-[#ff6b00] px-1.5 py-0.5 rounded ml-1">
                LIVE
              </span>
            </span>
          </Link>
          <p className="text-[#94a3b8] text-sm font-semibold">Play Local. Rise National.</p>
        </div>

        {/* Card Panel */}
        <Card className="bg-[#0D0D14] border-[#1e1e2f] shadow-2xl relative overflow-hidden">
          {/* Card Accent Border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-sky-500" />

          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-heading font-bold text-center">Register</CardTitle>
            <CardDescription className="text-center text-[#94a3b8]">
              Create your profile to join the esports arena
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-950/50 border border-red-500/30 text-red-400 px-3 py-2.5 rounded-lg text-xs font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 px-3 py-2.5 rounded-lg text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 animate-bounce" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Account Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-bold text-[#94a3b8]">
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="e.g. dynamic_gamer"
                      value={username}
                      onChange={(e) => handleCheckUsername(e.target.value)}
                      className={`bg-[#151522] border-[#1e1e2f] focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] text-[#f8fafc] h-10 pr-20`}
                      disabled={loading}
                    />
                    <div className="absolute right-3 top-2.5 text-[10px] font-bold">
                      {usernameStatus === 'checking' && (
                        <span className="text-[#94a3b8]">Checking...</span>
                      )}
                      {usernameStatus === 'available' && (
                        <span className="text-emerald-400">Available</span>
                      )}
                      {usernameStatus === 'taken' && username.length >= 3 && (
                        <span className="text-red-400">Unavailable</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="displayName" className="text-xs font-bold text-[#94a3b8]">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="e.g. Dynamic Gamer"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-[#151522] border-[#1e1e2f] focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] text-[#f8fafc] h-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Login Credentials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-[#94a3b8]">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#151522] border-[#1e1e2f] focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] text-[#f8fafc] h-10"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password font-bold">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#151522] border-[#1e1e2f] focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] text-[#f8fafc] h-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Role Select */}
              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-bold text-[#94a3b8]">
                  Account Type (Role)
                </Label>
                <Select value={role} onValueChange={(val: any) => setRole(val)} disabled={loading}>
                  <SelectTrigger className="bg-[#151522] border-[#1e1e2f] text-[#f8fafc] h-10 focus:ring-1 focus:ring-[#ff6b00]">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0D0D14] border-[#1e1e2f] text-[#f8fafc]">
                    <SelectItem value="PLAYER">
                      Player (Join matches, earn ELO, win prizes)
                    </SelectItem>
                    <SelectItem value="ORGANIZER">
                      Organizer (Host tournaments, distribute prize pools)
                    </SelectItem>
                    <SelectItem value="SPONSOR">
                      Sponsor (Bid on tournaments, display brand logos)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Inputs */}
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
                      // Slight timeout to allow clicks on suggestions to register before hiding
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

              <Button
                type="submit"
                className="w-full bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold h-10 shadow-lg shadow-orange-500/10 transition-all flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Lobby...</span>
                  </>
                ) : (
                  <span>Claim Profile & Register</span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center border-t border-[#1e1e2f]/50 pt-4 pb-6">
            <p className="text-sm text-[#94a3b8]">
              Already registered?{' '}
              <Link
                href="/login"
                className="text-[#0ea5e9] hover:text-[#0284c7] font-bold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
export const runtime = 'edge';
