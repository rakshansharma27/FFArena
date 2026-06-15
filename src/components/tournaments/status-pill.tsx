import { cn } from "@/lib/utils"

export type TournamentStatus = 
  | "DRAFT" 
  | "REGISTRATION_OPEN" 
  | "REGISTRATION_CLOSED" 
  | "ONGOING" 
  | "COMPLETED" 
  | "CANCELLED"

interface StatusPillProps extends React.HTMLAttributes<HTMLDivElement> {
  status: TournamentStatus
}

export function StatusPill({ status, className, ...props }: StatusPillProps) {
  const config: Record<TournamentStatus, { label: string; classes: string }> = {
    DRAFT: { label: "Draft", classes: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    REGISTRATION_OPEN: { label: "Registrations Open", classes: "bg-green-500/20 text-green-400 border-green-500/30" },
    REGISTRATION_CLOSED: { label: "Registrations Closed", classes: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    ONGOING: { label: "Ongoing", classes: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    COMPLETED: { label: "Completed", classes: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
    CANCELLED: { label: "Cancelled", classes: "bg-red-500/20 text-red-400 border-red-500/30" },
  }

  const { label, classes } = config[status]

  return (
    <div 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        classes,
        className
      )}
      {...props}
    >
      {label}
    </div>
  )
}
