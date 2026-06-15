import { Megaphone } from "lucide-react"

interface Sponsor {
  company_name: string
  logo_url: string | null
  website_url: string | null
}

interface SponsorDeal {
  id: string
  sponsor: Sponsor | null
}

interface SponsorBannerProps {
  deals: SponsorDeal[]
}

export function SponsorBanner({ deals }: SponsorBannerProps) {
  // Filter out deals without valid sponsors or logos
  const activeSponsors = deals.filter(d => d.sponsor && d.sponsor.logo_url)

  if (activeSponsors.length === 0) return null

  return (
    <div className="w-full bg-zinc-900/40 border border-zinc-850 rounded-xl p-4 md:p-6 text-center space-y-4">
      <div className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
        <Megaphone className="w-3.5 h-3.5 text-[#ff6b00]" />
        <span>Official Event Sponsors</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
        {activeSponsors.map((deal) => {
          const sponsor = deal.sponsor!
          const clickUrl = sponsor.website_url 
            ? `/api/sponsors/click?dealId=${deal.id}&dest=${encodeURIComponent(sponsor.website_url)}`
            : null

          const content = (
            <img
              src={sponsor.logo_url!}
              alt={`${sponsor.company_name} logo`}
              className="h-8 md:h-10 max-w-[140px] object-contain opacity-60 hover:opacity-100 transition-all duration-300 filter brightness-95 hover:brightness-100 p-1 bg-zinc-950/35 rounded border border-transparent hover:border-zinc-800"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = "none"
              }}
            />
          )

          return clickUrl ? (
            <a
              key={deal.id}
              href={clickUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-transform hover:scale-105"
              title={`Visit ${sponsor.company_name}`}
            >
              {content}
            </a>
          ) : (
            <div key={deal.id} className="inline-block">
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
