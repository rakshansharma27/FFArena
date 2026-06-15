# 🗺️ FFArena (ffarena.live) — Technical Implementation Plan

This document outlines the detailed timeline, project structure, milestone targets, system dependencies, risk registers, and deployment processes for the FFArena platform.

---

## 1. Timeline Overview (12-Week Roadmap)

The project will follow an iterative, mobile-first, server-less execution schedule, delivering working milestones every 2 weeks.

```
Week: | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
Ph0:  [===] (Setup & Foundational Architecture)
Ph1:      [===] (Authentication & RLS Security Profiles)
Ph2:          [======] (Tournament Engine & Team Roster Mgmt)
Ph3:                 [======] (Bracket Automation & Realtime Updates)
Ph4:                        [===] (ELO Computations & Leaderboards)
Ph5:                            [===] (UPI Payments & TDS Escrow Gate)
Ph6:                                [===] (Hyperlocal Sponsorships Portal)
Ph7:                                    [===] (PWA Polish & Mobile Core Optimization)
Ph8:                                        [======] (E2E Auditing & Launch)
```

---

## 2. Phase Breakdown

### Phase 0: Setup & Foundational Architecture (Week 1)

- **Tasks:**
  - Initialize Next.js 14 template inside the directory using TypeScript, App Router, and strict linting.
  - Set up Cloudflare DNS: delegate domains, configure CNAME records, verify `ffarena.live`.
  - Create Supabase project in the `ap-south-1` (Mumbai) region. Run baseline migrations (`Schema.md`).
  - Set up Vercel project linked to GitHub repository. Set environment variables.
  - Install styling primitives: Tailwind CSS, `shadcn/ui`, Lucide icons.
- **Definition of Done:** Next.js homepage loads on `https://ffarena.live` with 100/100 Lighthouse performance.

### Phase 1: Authentication & RLS Security Profiles (Week 2)

- **Tasks:**
  - Configure Supabase Auth: email/password and Google OAuth providers.
  - Build `<AuthProvider>` server-client session handshake wrappers.
  - Build login, signup, and verification pages matching the `Design.md` theme.
  - Verify the PostgreSQL trigger auto-creates profile rows when users sign up.
  - Lock routes `/dashboard/*`, `/profile/edit`, `/organizer/*` using Next.js middleware.
- **Definition of Done:** Users can log in/out, register, update their username/avatar, and read/write their own profile fields.

### Phase 2: Tournament Engine & Team Roster Management (Weeks 3-4)

- **Tasks:**
  - Implement organizer forms: multi-step wizard for creating tournaments (draft, registration open, rules definition).
  - Implement player search filters for active tournaments: filter by game type, city, and entry fees.
  - Create Team model: captains invite players via sharing links. Team members accept to join the roster.
  - Add registration validations (checking limits, fees, date bounds, and character UIDs).
- **Definition of Done:** Organizers can create tournaments, and players can form teams and register for those tournaments.

### Phase 3: Bracket Automation & Realtime Match Management (Weeks 5-6)

- **Tasks:**
  - Implement single-elimination bracket generation algorithm: auto-pairs registered teams and fills out empty matches with BYEs.
  - Build canvas-draggable/touch-swipeable bracket tree component in React.
  - Create score submission portal: captains upload end-game screenshots; organizers view conflict submissions side-by-side.
  - Establish Supabase Realtime subscription channels: push match score updates and bracket state changes to active users without page refreshes.
- **Definition of Done:** Bracket auto-populates, scores sync instantly in browser tabs, and winner teams advance to the next round.

### Phase 4: ELO Computations & Leaderboards (Week 7)

- **Tasks:**
  - Write backend ELO updates: recalculate points and ELO rankings when match statuses transition to COMPLETED.
  - Build Leaderboard pages: display rankings by game type with filters for city, college, and national scopes.
  - Implement player profile statistic grids (showing matches won, win ratios, kills, and ELO charts).
- **Definition of Done:** Leaderboard ranking shifts immediately upon match resolution.

### Phase 5: UPI Payments, TDS Escrow & Transaction Ledger (Week 8)

- **Tasks:**
  - Integrate Razorpay API wrappers for payments (entry fee collection).
  - Write prize distribution logic: calculate net payouts by applying a 30% TDS deduction on player winnings above ₹10,000.
  - Implement payout approvals for organizers, sending payouts to winner UPI addresses (`username@okbank`).
  - Build the transaction ledger view for organizer transparency, showing inflows, payouts, TDS cuts, and platform fees in real-time.
  - Log all transactions in `audit_logs` and `prize_transactions` tables.
- **Definition of Done:** Payouts resolve via UPI gateway, TDS is calculated, transaction ledgers display correct balance sheets, and audit files are created.

### Phase 6: Hyperlocal Sponsorships Portal (Week 9)

- **Tasks:**
  - Create Sponsor registration forms.
  - Implement ad slots in the UI: banner placements on tournament pages supporting bids starting at ₹2,000.
  - Build deal management system: sponsors propose deals, organizers review terms, and payouts are handled via escrow.
  - Configure the Automated Logo Placement engine which injects sponsor assets into tournament bracket displays.
  - Implement Sponsor analytics: click and impression log tracking for audience reports.
- **Definition of Done:** Verified sponsors can place bids on active college/city tournaments, and logo placements render on bracket pages.

### Phase 7: RTMP Streaming, i18n & Voice Announcements (Week 10)

- **Tasks:**
  - Set up stream configuration panel in Organizer dashboard: manage RTMP server endpoints and stream keys to push to YouTube/Twitch.
  - Implement overlay generator: render real-time Canvas templates that layer sponsor logos, brackets, and active match scores.
  - Configure `next-intl` localization framework: translate UI elements into Hindi, Tamil, Telugu, and Bengali.
  - Implement Web Speech API in the client browser: trigger audio text-to-speech results announcements on match resolution.
  - Add PWA manifest, service workers, and offline assets caching.
- **Definition of Done:** Organizers can configure stream keys, overlays render dynamically, UI translates successfully across 5 languages, and voice announcements announce winners.

### Phase 8: E2E Auditing & Launch (Weeks 11-12)

- **Tasks:**
  - Write end-to-end Cypress tests for tournament creation, team registrations, and streaming flows.
  - Audit Supabase RLS security policies.
  - Complete SEO indexing optimization (meta tags, sitemaps, open-graph cards).
  - Run a soft-launch tournament with 2 local college clubs, streaming it to YouTube with overlays active.
  - Resolve final bugs and launch the platform publicly at `ffarena.live`.
- **Definition of Done:** First official tournament completes, streaming live with overlays, and pays out winners via UPI.

---

## 3. Directory Layout (Next.js 14 App Router)

```
C:\Users\raksh\OneDrive\Desktop\Grassroots Esports Infrastructure\
├── public/                     # Static assets (logos, icons)
├── src/
│   ├── app/                    # Routing routes
│   │   ├── (auth)/             # Auth pages group
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── verify/
│   │   ├── (dashboard)/        # Main dashboard area
│   │   │   ├── dashboard/
│   │   │   ├── organizer/
│   │   │   ├── sponsor/
│   │   │   └── profile/
│   │   ├── (public)/           # Open-access routes
│   │   │   ├── tournaments/
│   │   │   │   ├── [slug]/
│   │   │   │   └── page.tsx
│   │   │   ├── leaderboards/
│   │   │   └── page.tsx
│   │   ├── api/                # API Endpoints
│   │   │   ├── webhooks/
│   │   │   └── payout/
│   │   ├── layout.tsx
│   │   └── providers.tsx
│   ├── components/             # Reusable UI parts
│   │   ├── ui/                 # shadcn components
│   │   ├── tournament/
│   │   ├── bracket/
│   │   └── layout/
│   ├── lib/                    # Configuration and utilities
│   │   ├── supabase/           # Server/Client supabase initializers
│   │   ├── utils/              # Helper functions
│   │   └── hooks/              # Custom React hooks
│   ├── types/                  # TypeScript interfaces
│   └── middleware.ts           # Route guard rules
├── package.json
└── tailwind.config.ts
```

---

## 4. Key Technical Decisions & Rationale

- **Next.js 14 App Router over Pages Router:**
  - _Why:_ Server Components fetch data directly from PostgreSQL/Supabase, sending pre-rendered HTML to the user's browser. This reduces loading times on mobile networks.
- **Supabase over Firebase:**
  - _Why:_ Relational data modeling is essential for handling tournament brackets, teams, and players. Supabase also has built-in Row Level Security, instant triggers, and native Realtime updates.
- **Razorpay over international gateways:**
  - _Why:_ Razorpay is the standard for payment processing in India, providing seamless integration with UPI apps (Paytm, GPay, PhonePe).
- **Cloudflare over Vercel Edge CDN alone:**
  - _Why:_ Provides free DDoS protection, DNS hosting, and caches assets locally in major Indian cities (reducing latency to <15ms).

---

## 5. Development Dependencies (`package.json`)

```json
{
  "name": "ffarena",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "@supabase/ssr": "^0.3.0",
    "@supabase/supabase-js": "^2.43.4",
    "clsx": "^2.1.1",
    "lucide-react": "^0.379.0",
    "next": "14.2.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.3.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.8",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/node": "^20.12.12",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.5",
    "vitest": "^1.6.0"
  }
}
```

---

## 6. Implementation Risk Register

| Risk                                      | Severity | Phase   | Mitigation                                                                                                                 |
| ----------------------------------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| **API Rate Limits on Supabase Free Tier** | High     | Phase 3 | Cache static page views using Cloudflare; throttle realtime subscription feeds.                                            |
| **Payment Failures / Double Payouts**     | Critical | Phase 5 | Implement database-level locks on payout transactions; log transaction history before making API calls to Razorpay.        |
| **Cheat / Score Submission Fraud**        | High     | Phase 3 | Implement dual-captain confirmation for score reporting; build admin dashboard for viewing match screenshots side-by-side. |
| **TDS Tax Compliance Legal Liabilities**  | Critical | Phase 5 | Keep net winnings below ₹10,000 for early versions; require PAN verification when net winnings cross ₹10,000 limit.        |
| **Mobile Latency (4G Dropouts)**          | Medium   | Phase 7 | Implement offline support via service workers; use optimistic state updates in the UI.                                     |
