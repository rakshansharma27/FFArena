import type { Metadata } from 'next'
import { Space_Grotesk, Inter, Geist } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "FFArena — India's Grassroots Esports Platform",
  description:
    'Create and join professional-grade local esports tournaments across Indian cities and colleges. Register squads, track live brackets, win UPI prizes, and find local brand sponsors.',
  keywords: [
    'esports',
    'India gaming',
    'BGMI',
    'Free Fire',
    'esports tournament',
    'esports brackets',
    'college gaming',
    'UPI payout',
    'scouting',
    'district esports',
  ],
  openGraph: {
    title: "FFArena — India's Grassroots Esports Platform",
    description:
      'Create and join professional-grade local esports tournaments across Indian cities and colleges.',
    url: 'https://ffarena.live',
    siteName: 'FFArena',
    locale: 'en-IN',
    type: 'website',
  },
}

import SupabaseProvider from '@/components/providers/supabase-provider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={cn(
        'h-full',
        'antialiased',
        spaceGrotesk.variable,
        inter.variable,
        'font-sans',
        geist.variable
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <SupabaseProvider>{children}</SupabaseProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
