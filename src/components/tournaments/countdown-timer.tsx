"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface CountdownTimerProps extends React.HTMLAttributes<HTMLDivElement> {
  targetDate: string | Date
  label?: string
  onExpire?: () => void
}

export function CountdownTimer({ targetDate, label = "Ends in", onExpire, className, ...props }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    isExpired: boolean
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false })

  useEffect(() => {
    const target = new Date(targetDate).getTime()

    const updateTimer = () => {
      const now = new Date().getTime()
      const difference = target - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true })
        onExpire?.()
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isExpired: false
      })
    }

    // Initial call
    updateTimer()

    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [targetDate, onExpire])

  if (timeLeft.isExpired) {
    return (
      <div className={cn("text-sm font-medium text-red-400", className)} {...props}>
        Expired
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {label && <span className="text-sm text-zinc-400">{label}</span>}
      <div className="flex items-center gap-1 text-sm font-mono font-semibold tracking-wider text-zinc-100">
        {timeLeft.days > 0 && (
          <>
            <span>{timeLeft.days.toString().padStart(2, "0")}d</span>
            <span className="text-zinc-500">:</span>
          </>
        )}
        <span>{timeLeft.hours.toString().padStart(2, "0")}h</span>
        <span className="text-zinc-500">:</span>
        <span>{timeLeft.minutes.toString().padStart(2, "0")}m</span>
        <span className="text-zinc-500">:</span>
        <span className="text-primary">{timeLeft.seconds.toString().padStart(2, "0")}s</span>
      </div>
    </div>
  )
}
