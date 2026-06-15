'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updatePasswordAction } from '@/app/auth/actions'
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
import { ShieldAlert, CheckCircle2 } from 'lucide-react'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!password || !confirmPassword) {
      setError('Please fill in all fields.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    try {
      const res = await updatePasswordAction({ password })
      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess('Password updated successfully! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1500)
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07070A] text-[#f8fafc] flex items-center justify-center px-4 relative overflow-hidden font-sans selection:bg-[#ff6b00] selection:text-white">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#ff6b00]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl font-heading font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-orange-500 to-amber-400">
              FFARENA
            </span>
          </Link>
          <p className="text-[#94a3b8] text-sm font-semibold">Change Password</p>
        </div>

        <Card className="bg-[#0D0D14] border-[#1e1e2f] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-orange-500" />

          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-heading font-bold text-center">
              Create New Password
            </CardTitle>
            <CardDescription className="text-center text-[#94a3b8]">
              Set a strong, new password for your lobby access.
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-[#94a3b8]">
                  New Password
                </Label>
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

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-bold text-[#94a3b8]">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#151522] border-[#1e1e2f] focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] text-[#f8fafc] h-10"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold h-10 shadow-lg shadow-orange-500/10 transition-all flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export const runtime = 'edge';
