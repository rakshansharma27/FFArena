'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signInAction } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Trophy, ShieldAlert, CheckCircle2 } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(searchParams.get('error'))
  const [success, setSuccess] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!email || !password) {
      setError('Please fill in all fields.')
      setLoading(false)
      return
    }

    try {
      const res = await signInAction({ email, password })
      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess('Logged in successfully! Redirecting...')
        const nextPath = searchParams.get('next') ?? '/dashboard'
        setTimeout(() => {
          router.push(nextPath)
          router.refresh()
        }, 1000)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-[#0D0D14] border-[#1e1e2f] shadow-2xl relative overflow-hidden">
      {/* Card Accent Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-orange-500" />

      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-heading font-bold text-center">Sign In</CardTitle>
        <CardDescription className="text-center text-[#94a3b8]">
          Enter your credentials to enter the lobby
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-950/50 border border-red-500/30 text-red-400 px-3 py-2.5 rounded-lg text-xs font-semibold animate-pulse">
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

        <form onSubmit={handleLogin} className="space-y-4">
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
              className="bg-[#151522] border-[#1e1e2f] focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] text-[#f8fafc] h-10"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-xs font-bold text-[#94a3b8]">
                Password
              </Label>
              <Link href="/forgot-password" className="text-xs text-[#0ea5e9] hover:underline">
                Forgot Password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#151522] border-[#1e1e2f] focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] text-[#f8fafc] h-10"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold h-10 shadow-lg shadow-sky-500/10 transition-all flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Enter Lobby</span>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col items-center border-t border-[#1e1e2f]/50 pt-4 pb-6">
        <p className="text-sm text-[#94a3b8]">
          New player?{' '}
          <Link
            href="/signup"
            className="text-[#ff6b00] hover:text-[#e05e00] font-bold hover:underline"
          >
            Create Account
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#07070A] text-[#f8fafc] flex items-center justify-center px-4 relative overflow-hidden font-sans selection:bg-[#ff6b00] selection:text-white">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#0ea5e9]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#ff6b00]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md">
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

        <Suspense
          fallback={
            <Card className="bg-[#0D0D14] border-[#1e1e2f] shadow-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-8 h-8 border-2 border-[#0ea5e9]/30 border-t-[#0ea5e9] rounded-full animate-spin mb-4" />
              <p className="text-[#94a3b8] text-sm font-semibold">Loading Lobby Login...</p>
            </Card>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
export const runtime = 'edge';
