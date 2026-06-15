'use client'

import { useSupabase } from '@/components/providers/supabase-provider'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import {
  Trophy,
  ShieldCheck,
  MapPin,
  Award,
  User,
  Settings,
  Sparkles,
  PlusCircle,
} from 'lucide-react'
import UserNav from '@/components/layout/user-nav'

export default function DashboardPage() {
  const { profile, loading } = useSupabase()
  const t = useTranslations('dashboard')
  const navT = useTranslations('nav')

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070A] text-[#f8fafc] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0ea5e9]/30 border-t-[#0ea5e9] rounded-full animate-spin mb-4" />
        <p className="text-[#94a3b8] text-sm">Loading dashboard lobby...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#07070A] text-[#f8fafc] flex flex-col items-center justify-center px-4">
        <p className="text-red-400 mb-4 font-semibold">
          Could not load profile. Please try logging in again.
        </p>
        <Link href="/login">
          <Button className="bg-[#0ea5e9] text-white">Back to Login</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07070A] text-[#f8fafc] font-sans flex flex-col selection:bg-[#ff6b00] selection:text-white">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-[#07070A]/85 backdrop-blur-md border-b border-[#1e1e2f] px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-heading font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-orange-500 to-amber-400">
              FFARENA
              <span className="text-white text-xs font-sans font-bold bg-[#ff6b00] px-1.5 py-0.5 rounded ml-1">
                LIVE
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-[#f8fafc] hover:text-[#0ea5e9] transition-colors"
              >
                {navT('dashboard')}
              </Link>
              <Link
                href="#tournaments"
                className="text-sm font-semibold text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
              >
                {navT('tournaments')}
              </Link>
              <Link
                href="#leaderboards"
                className="text-sm font-semibold text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
              >
                {navT('leaderboard')}
              </Link>
            </nav>
            <UserNav />
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0d0d1f] to-[#121226] border border-[#1e1e2f] rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-sky-500/10 text-[#0ea5e9] px-2.5 py-1 rounded-full border border-sky-500/25">
                {profile.role} LOBBY
              </span>
              <span className="flex items-center gap-1 text-xs font-bold uppercase text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/25">
                <MapPin className="w-3.5 h-3.5" />
                {profile.city}, {profile.state}
              </span>
            </div>
            <h1 className="text-3xl font-heading font-black tracking-tight">
              {t('welcome')},{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-orange-400">
                {profile.display_name}
              </span>
            </h1>
            <p className="text-[#94a3b8] text-sm">
              Manage your matches, register for tournaments, and build your regional gaming
              reputation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/profile/edit">
              <Button
                variant="outline"
                className="border-[#1e1e2f] hover:bg-[#151522] text-[#f8fafc] font-bold gap-2"
              >
                <Settings className="w-4 h-4" />
                Edit Profile
              </Button>
            </Link>
            {profile.role === 'ORGANIZER' && (
              <Button className="bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold gap-2">
                <PlusCircle className="w-4 h-4" />
                Create Tournament
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid Custom to Role */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profile.role === 'PLAYER' && (
            <>
              <Card className="bg-[#0D0D14] border-[#1e1e2f] shadow-lg relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-0.5">
                    <CardTitle className="text-xs font-bold uppercase tracking-wide text-[#94a3b8]">
                      ELO Rating
                    </CardTitle>
                    <CardDescription className="text-2xl font-black font-heading text-sky-400">
                      1,000
                    </CardDescription>
                  </div>
                  <Trophy className="w-8 h-8 text-sky-500 bg-sky-500/10 p-1.5 rounded-xl border border-sky-500/25" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#94a3b8]">
                    Base rating. Participate in tournaments to rise in ranks.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#0D0D14] border-[#1e1e2f] shadow-lg relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-0.5">
                    <CardTitle className="text-xs font-bold uppercase tracking-wide text-[#94a3b8]">
                      Tournaments
                    </CardTitle>
                    <CardDescription className="text-2xl font-black font-heading text-orange-500">
                      0
                    </CardDescription>
                  </div>
                  <Award className="w-8 h-8 text-orange-500 bg-orange-500/10 p-1.5 rounded-xl border border-orange-500/25" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#94a3b8]">
                    Tournaments played this season. Ready for clash.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#0D0D14] border-[#1e1e2f] shadow-lg relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-0.5">
                    <CardTitle className="text-xs font-bold uppercase tracking-wide text-[#94a3b8]">
                      Total Earnings
                    </CardTitle>
                    <CardDescription className="text-2xl font-black font-heading text-emerald-400">
                      ₹0
                    </CardDescription>
                  </div>
                  <Sparkles className="w-8 h-8 text-emerald-400 bg-emerald-500/10 p-1.5 rounded-xl border border-emerald-500/25" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#94a3b8]">
                    Winnings disbursed directly via UPI instant transfers.
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {profile.role === 'ORGANIZER' && (
            <>
              <Card className="bg-[#0D0D14] border-[#1e1e2f] shadow-lg relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-0.5">
                    <CardTitle className="text-xs font-bold uppercase tracking-wide text-[#94a3b8]">
                      Hosted Events
                    </CardTitle>
                    <CardDescription className="text-2xl font-black font-heading text-sky-400 font-sans">
                      0
                    </CardDescription>
                  </div>
                  <Trophy className="w-8 h-8 text-sky-500 bg-sky-500/10 p-1.5 rounded-xl border border-sky-500/25" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#94a3b8]">
                    Total matches hosted in your cities and colleges.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#0D0D14] border-[#1e1e2f] shadow-lg relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-0.5">
                    <CardTitle className="text-xs font-bold uppercase tracking-wide text-[#94a3b8]">
                      Prize Pools Distributed
                    </CardTitle>
                    <CardDescription className="text-2xl font-black font-heading text-orange-500">
                      ₹0
                    </CardDescription>
                  </div>
                  <Award className="w-8 h-8 text-orange-500 bg-orange-500/10 p-1.5 rounded-xl border border-orange-500/25" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#94a3b8]">
                    Total payouts successfully completed to players.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#0D0D14] border-[#1e1e2f] shadow-lg relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-0.5">
                    <CardTitle className="text-xs font-bold uppercase tracking-wide text-[#94a3b8]">
                      Organizer Revenue
                    </CardTitle>
                    <CardDescription className="text-2xl font-black font-heading text-emerald-400">
                      ₹0
                    </CardDescription>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-emerald-400 bg-emerald-500/10 p-1.5 rounded-xl border border-emerald-500/25" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#94a3b8]">
                    Revenue earned from tickets and brand ads.
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {profile.role === 'SPONSOR' && (
            <>
              <Card className="bg-[#0D0D14] border-[#1e1e2f] shadow-lg relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-0.5">
                    <CardTitle className="text-xs font-bold uppercase tracking-wide text-[#94a3b8]">
                      {t('active_ads')}
                    </CardTitle>
                    <CardDescription className="text-2xl font-black font-heading text-sky-400">
                      0
                    </CardDescription>
                  </div>
                  <Trophy className="w-8 h-8 text-sky-500 bg-sky-500/10 p-1.5 rounded-xl border border-sky-500/25" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#94a3b8]">Active sponsorship placement campaigns.</p>
                </CardContent>
              </Card>

              <Card className="bg-[#0D0D14] border-[#1e1e2f] shadow-lg relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-0.5">
                    <CardTitle className="text-xs font-bold uppercase tracking-wide text-[#94a3b8]">
                      {t('total_budget')}
                    </CardTitle>
                    <CardDescription className="text-2xl font-black font-heading text-orange-500">
                      ₹0
                    </CardDescription>
                  </div>
                  <Award className="w-8 h-8 text-orange-500 bg-orange-500/10 p-1.5 rounded-xl border border-orange-500/25" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#94a3b8]">
                    Total investment in local esports grassroot clubs.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#0D0D14] border-[#1e1e2f] shadow-lg relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-0.5">
                    <CardTitle className="text-xs font-bold uppercase tracking-wide text-[#94a3b8]">
                      Ad Impressions / CTR
                    </CardTitle>
                    <CardDescription className="text-2xl font-black font-heading text-emerald-400">
                      0 / 0%
                    </CardDescription>
                  </div>
                  <Sparkles className="w-8 h-8 text-emerald-400 bg-emerald-500/10 p-1.5 rounded-xl border border-emerald-500/25" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#94a3b8]">
                    Metrics from bracket injections and live overlays.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </section>

        {/* Detailed Info Card */}
        <Card className="bg-[#0D0D14] border-[#1e1e2f]">
          <CardHeader>
            <CardTitle className="text-xl font-heading font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-[#ff6b00]" />
              {t('account_details')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-[#94a3b8]">
            <div className="space-y-1">
              <span className="block font-bold text-white text-xs uppercase tracking-wide">
                Username
              </span>
              <span>@{profile.username}</span>
            </div>
            <div className="space-y-1">
              <span className="block font-bold text-white text-xs uppercase tracking-wide">
                Mobile Phone
              </span>
              <span>{profile.phone || 'Not linked'}</span>
            </div>
            <div className="space-y-1">
              <span className="block font-bold text-white text-xs uppercase tracking-wide">
                Preferred UI Language
              </span>
              <span className="uppercase">{profile.preferred_language}</span>
            </div>
            <div className="space-y-1">
              <span className="block font-bold text-white text-xs uppercase tracking-wide">
                Voice winner announcements
              </span>
              <span>{profile.voice_announcements_enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="space-y-1">
              <span className="block font-bold text-white text-xs uppercase tracking-wide">
                Free Fire UID
              </span>
              <span className="font-mono">{profile.ff_uid || 'None linked'}</span>
            </div>
            <div className="space-y-1">
              <span className="block font-bold text-white text-xs uppercase tracking-wide">
                BGMI UID
              </span>
              <span className="font-mono">{profile.bgmi_uid || 'None linked'}</span>
            </div>
            <div className="space-y-1">
              <span className="block font-bold text-white text-xs uppercase tracking-wide">
                Valorant Riot ID
              </span>
              <span className="font-mono">{profile.valorant_id || 'None linked'}</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
export const runtime = 'edge';
