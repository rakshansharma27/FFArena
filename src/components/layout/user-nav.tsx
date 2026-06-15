'use client'

import { useSupabase } from '@/components/providers/supabase-provider'
import { signOutAction } from '@/app/auth/actions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { LogOut, User, LayoutDashboard, Settings } from 'lucide-react'
import { useState } from 'react'

export default function UserNav() {
  const { session, profile, loading } = useSupabase()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setLoggingOut(true)
    try {
      await signOutAction()
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="w-5 h-5 border-2 border-[#ff6b00]/30 border-t-[#ff6b00] rounded-full animate-spin" />
    )
  }

  if (!session || !profile) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login">
          <Button
            variant="ghost"
            className="text-xs font-bold text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#151522]"
          >
            Login
          </Button>
        </Link>
        <Link href="/signup">
          <Button className="text-xs font-bold bg-[#ff6b00] hover:bg-[#e05e00] text-white shadow-lg shadow-orange-500/10">
            Register
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative w-8 h-8 rounded-full overflow-hidden bg-[#151522] border border-[#1e1e2f] hover:border-[#ff6b00] transition-colors focus:outline-none shrink-0 flex items-center justify-center cursor-pointer">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-heading font-black text-sky-400">
            {profile.display_name?.charAt(0).toUpperCase()}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="bg-[#0D0D14] border-[#1e1e2f] text-[#f8fafc] w-56 mt-2"
        align="end"
      >
        <DropdownMenuLabel className="font-normal flex flex-col gap-0.5 p-3">
          <span className="text-sm font-heading font-bold text-white">{profile.display_name}</span>
          <span className="text-xs text-[#94a3b8]">@{profile.username}</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-[#1e1e2f]" />

        <DropdownMenuItem className="hover:bg-[#151522] cursor-pointer text-xs font-semibold py-2">
          <Link href="/dashboard" className="flex items-center gap-2 w-full">
            <LayoutDashboard className="w-4 h-4 text-sky-400" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem className="hover:bg-[#151522] cursor-pointer text-xs font-semibold py-2">
          <Link href={`/profile/${profile.username}`} className="flex items-center gap-2 w-full">
            <User className="w-4 h-4 text-orange-400" />
            <span>Public Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem className="hover:bg-[#151522] cursor-pointer text-xs font-semibold py-2">
          <Link href="/profile/edit" className="flex items-center gap-2 w-full">
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Profile Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#1e1e2f]" />

        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={loggingOut}
          className="hover:bg-red-950/20 text-red-400 hover:text-red-300 cursor-pointer text-xs font-semibold py-2"
        >
          <div className="flex items-center gap-2 w-full">
            <LogOut className="w-4 h-4" />
            <span>{loggingOut ? 'Signing Out...' : 'Sign Out'}</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
