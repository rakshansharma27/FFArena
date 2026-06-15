# FFArena — Project Tracker

> **Project:** FFArena (ffarena.live) — India's Grassroots Esports Infrastructure Platform
> **Stack:** Next.js 14 (App Router) · Supabase (PostgreSQL + Auth + Realtime + Storage) · Vercel · Cloudflare
> **Last Updated:** 2026-06-12
> **Maintainer:** @raksh

---

## Status Legend

| Symbol | Meaning     |
| ------ | ----------- |
| `[ ]`  | Not started |
| `[/]`  | In progress |
| `[x]`  | Completed   |
| `[!]`  | Blocked     |

---

## Phase 0: Setup & Foundation

> Goal: Production-ready monorepo, CI/CD, environment config, and database schema baseline.

- [x] **0.01** Register and verify domain `ffarena.live` on Cloudflare; set nameservers
- [x] **0.02** Connect `ffarena.live` to Vercel project; configure apex + `www` CNAME redirect
- [x] **0.03** Enable Cloudflare proxy (orange cloud) on all DNS A/CNAME records
- [x] **0.04** Create Supabase project in `ap-south-1` (Mumbai) region; note project ref ID
- [x] **0.05** Initialize Next.js 14 project with `--app` flag, TypeScript, Tailwind CSS, ESLint
- [x] **0.06** Configure `tsconfig.json` with strict mode, path aliases (`@/` → `src/`)
- [x] **0.07** Set up ESLint with `eslint-config-next` + `@typescript-eslint` rules; add `.eslintrc.json`
- [x] **0.08** Set up Prettier with `.prettierrc` (2-space indent, single quote, trailing comma)
- [x] **0.09** Create `.env.local` with all required variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`
- [x] **0.10** Add `.env.local` to `.gitignore`; create `.env.example` with placeholder values
- [x] **0.11** Configure Vercel environment variables for `preview` and `production` environments
- [x] **0.12** Install and configure `@supabase/supabase-js` v2 and `@supabase/ssr` packages
- [x] **0.13** Create `src/lib/supabase/client.ts` (browser client) and `src/lib/supabase/server.ts` (server client using cookies)
- [x] **0.14** Create `src/lib/supabase/middleware.ts`; add session refresh middleware to `middleware.ts`
- [x] **0.15** Write baseline SQL migration `0001_initial_schema.sql` — `profiles`, `games`, `tournaments` tables with RLS stubs
- [x] **0.16** Apply migration to Supabase using `supabase db push`; verify in Table Editor
- [x] **0.17** Enable Row Level Security (RLS) on all tables in Supabase dashboard
- [x] **0.18** Set up GitHub repository with branch protection on `main` (require PR + 1 approval)
- [x] **0.19** Create GitHub Actions workflow `.github/workflows/ci.yml` — lint, type-check, and build on every PR
- [x] **0.20** Configure Vercel GitHub integration for automatic preview deployments on PR
- [x] **0.21** Set up `husky` + `lint-staged` for pre-commit linting and formatting
- [x] **0.22** Create `src/app/layout.tsx` root layout with `<html lang="en">`, font (Geist/Inter), global CSS
- [x] **0.23** Create `src/app/page.tsx` placeholder landing page with "Coming Soon" banner
- [x] **0.24** Verify first successful Vercel production deploy at `https://ffarena.live`
- [x] **0.25** Install `shadcn/ui`; run `npx shadcn-ui@latest init`; select Tailwind CSS config

---

## Phase 1: Auth & Profiles

> Goal: Full authentication flow with OTP/email, Google OAuth, and editable user profiles.

- [x] **1.01** Enable Email/Password provider in Supabase Auth dashboard; configure rate limits
- [x] **1.02** Enable Google OAuth provider (Omitted by user constraint)
- [x] **1.03** Set Supabase Auth redirect URLs: `https://ffarena.live/auth/callback`, `http://localhost:3000/auth/callback`
- [x] **1.04** Create `src/app/auth/login/page.tsx` — login page with email + password form (Google OAuth omitted)
- [x] **1.05** Create `src/app/auth/register/page.tsx` — registration form (username, email, password, state dropdown, phone optional)
- [x] **1.06** Create `src/app/auth/callback/route.ts` — Next.js Route Handler to exchange Supabase auth code for session
- [x] **1.07** Create `src/app/auth/forgot-password/page.tsx` — forgot password form; call `supabase.auth.resetPasswordForEmail()`
- [x] **1.08** Create `src/app/auth/update-password/page.tsx` — update password form after email link click; call `supabase.auth.updateUser()`
- [x] **1.09** Write Supabase DB function `handle_new_user()` triggered on `auth.users` INSERT to auto-create row in `public.profiles`
- [x] **1.10** Write SQL migration `0002_auth_triggers.sql` with the `handle_new_user` trigger and function
- [x] **1.11** Design `profiles` table schema: `id (uuid FK auth.users)`, `username (text unique)`, `display_name`, `avatar_url`, `bio`, `state`, `city`, `phone`, `ff_uid`, `created_at`, `updated_at`
- [x] **1.12** Write RLS policies on `profiles`: SELECT (public), INSERT (own row only), UPDATE (own row only), DELETE (own row only)
- [x] **1.13** Create `src/app/dashboard/page.tsx` — authenticated dashboard shell with sidebar nav
- [x] **1.14** Add middleware route protection: redirect unauthenticated users from `/dashboard/*` to `/auth/login`
- [x] **1.15** Create `src/app/profile/[username]/page.tsx` — public profile page displaying avatar, stats, tournament history
- [x] **1.16** Create `src/app/profile/edit/page.tsx` — editable profile form (display name, bio, state, city, FF UID, avatar upload)
- [x] **1.17** Implement avatar upload: upload to Supabase Storage bucket `avatars`; update `profiles.avatar_url` with public URL
- [x] **1.18** Create Supabase Storage bucket `avatars` with public read, authenticated write, 2 MB file size limit
- [x] **1.19** Build `<AuthProvider>` context using `@supabase/ssr`; wrap app in `src/app/layout.tsx`
- [x] **1.20** Build `<UserNav>` component: shows avatar + username dropdown (Profile, Dashboard, Logout) when authenticated; Login/Register when not
- [x] **1.21** Add username uniqueness validation on registration — check `profiles.username` before form submit
- [x] **1.22** Implement OTP-based phone verification via Supabase Auth (Optional, profile settings phone linkage implemented)
- [x] **1.23** Write Vitest unit tests for auth utility functions (`getUser`, `requireAuth`, session helpers)
- [x] **1.24** Test full registration → login → profile edit → logout flow on both desktop and mobile

---

## Phase 2: Tournament Management

> Goal: Admins can create and manage tournaments; players can discover and register.

- [ ] **2.01** Design `tournaments` table schema: `id`, `title`, `slug`, `game_id`, `organizer_id`, `banner_url`, `description`, `rules_markdown`, `format` (solo/duo/squad), `max_teams`, `registered_teams`, `entry_fee_inr`, `prize_pool_inr`, `status` (draft/open/ongoing/completed/cancelled), `registration_opens_at`, `registration_closes_at`, `starts_at`, `ends_at`, `created_at`
- [ ] **2.02** Design `games` table: `id`, `name` (Free Fire, BGMI, Valorant…), `slug`, `logo_url`, `is_active`
- [ ] **2.03** Seed `games` table with initial data: Free Fire, BGMI, Valorant, Call of Duty Mobile
- [ ] **2.04** Design `tournament_registrations` table: `id`, `tournament_id`, `team_id`, `registered_by`, `status` (pending/confirmed/disqualified), `registered_at`
- [ ] **2.05** Write SQL migration `0003_tournaments.sql` with all three tables and FK constraints
- [ ] **2.06** Write RLS policies for `tournaments`: SELECT (public), INSERT/UPDATE/DELETE (organizer owns row or role=admin)
- [ ] **2.07** Add `role` column to `profiles` table: `player` (default), `organizer`, `admin`; write migration `0004_roles.sql`
- [ ] **2.08** Create `src/app/tournaments/page.tsx` — public tournament listing page with filters (game, status, entry fee, date)
- [ ] **2.09** Implement server-side filtering and pagination for tournament list (Supabase `.range()` + query params)
- [ ] **2.10** Create `src/app/tournaments/[slug]/page.tsx` — tournament detail page: banner, description, prize pool, rules, countdown timer, register button
- [ ] **2.11** Implement `<CountdownTimer>` component using `useEffect` + `setInterval`; display days/hours/minutes/seconds to `registration_closes_at`
- [ ] **2.12** Create `src/app/tournaments/[slug]/register/page.tsx` — registration flow: select team or create new, confirm entry fee, submit
- [ ] **2.13** Build registration guard: check `registration_opens_at <= now <= registration_closes_at` and `registered_teams < max_teams` before showing register button
- [ ] **2.14** Create `src/app/organizer/tournaments/create/page.tsx` — multi-step tournament creation wizard (Step 1: Basic Info, Step 2: Rules & Format, Step 3: Schedule & Prize, Step 4: Review)
- [ ] **2.15** Implement tournament banner upload to Supabase Storage bucket `tournament-banners` (public read, 5 MB limit, jpg/png/webp)
- [ ] **2.16** Create `src/app/organizer/tournaments/[id]/edit/page.tsx` — edit tournament form (only allowed when `status = draft`)
- [ ] **2.17** Create `src/app/organizer/tournaments/[id]/registrations/page.tsx` — view all registrations, confirm/disqualify buttons, CSV export
- [ ] **2.18** Implement slug auto-generation from tournament title on create; check uniqueness in DB
- [ ] **2.19** Add `<TournamentCard>` component: banner image, title, game badge, status pill, prize pool, entry fee, registered/max teams progress bar
- [ ] **2.20** Add `<GameBadge>` component: game logo + name, color-coded per game
- [ ] **2.21** Create `src/app/admin/tournaments/page.tsx` — admin view of all tournaments with bulk status update capability
- [ ] **2.22** Implement Supabase Realtime subscription on `tournament_registrations` to live-update registered team count on detail page
- [ ] **2.23** Add `rules_markdown` rendering using `react-markdown` + `remark-gfm` on tournament detail page
- [ ] **2.24** Write Supabase DB function `increment_registered_teams()` — atomically increment `tournaments.registered_teams` on confirmed registration
- [ ] **2.25** Implement tournament cancellation flow: organizer clicks Cancel → confirmation modal → status set to `cancelled` → all registrations marked `cancelled`
- [ ] **2.26** Add `<TournamentStatusPill>` component with color coding: green=open, yellow=ongoing, gray=completed, red=cancelled, blue=draft
- [ ] **2.27** Build `/api/tournaments/[slug]/register` POST route handler with server-side validation (auth check, slot availability, duplicate registration check)

---

## Phase 3: Bracket Engine

> Goal: Auto-generate and display single-elimination and round-robin brackets; update match results in real time.

- [ ] **3.01** Design `teams` table: `id`, `name`, `slug`, `logo_url`, `captain_id`, `tournament_id`, `created_at`
- [ ] **3.02** Design `team_members` table: `id`, `team_id`, `player_id`, `role` (captain/member), `ff_uid`, `joined_at`
- [ ] **3.03** Design `brackets` table: `id`, `tournament_id`, `format` (single_elim/double_elim/round_robin/swiss), `total_rounds`, `created_at`
- [ ] **3.04** Design `matches` table: `id`, `bracket_id`, `round_number`, `match_number`, `team_a_id`, `team_b_id`, `winner_id`, `score_a`, `score_b`, `status` (scheduled/live/completed/bye), `scheduled_at`, `completed_at`
- [ ] **3.05** Write SQL migration `0005_brackets.sql` with all four tables and FK/index setup
- [ ] **3.06** Write RLS policies for `matches`: SELECT (public), INSERT/UPDATE (organizer of tournament or admin)
- [ ] **3.07** Write server-side bracket generation algorithm in `src/lib/bracket/generate.ts` — accepts array of team IDs, returns seeded match pairings with byes for non-power-of-2 sizes
- [ ] **3.08** Write `generateSingleElimination(teams: Team[]): Match[]` function; handle 4, 8, 16, 32 team brackets with byes
- [ ] **3.09** Write `generateRoundRobin(teams: Team[]): Match[]` function using round-robin tournament scheduling algorithm (circle method)
- [ ] **3.10** Create `/api/brackets/generate` POST Route Handler — calls generation algorithm, inserts bracket + matches into Supabase in a single transaction
- [ ] **3.11** Create `src/app/tournaments/[slug]/bracket/page.tsx` — bracket viewer page
- [ ] **3.12** Build `<SingleEliminationBracket>` React component using `react-tournament-bracket` or custom SVG rendering; display team names, scores, round labels
- [ ] **3.13** Build `<RoundRobinTable>` React component: standings table with W/L/D/Pts columns, sortable
- [ ] **3.14** Subscribe to Supabase Realtime `matches` table changes on bracket page; update scores without page reload
- [ ] **3.15** Create `src/app/organizer/tournaments/[id]/bracket/manage/page.tsx` — match result entry form: select match, enter scores, declare winner
- [ ] **3.16** Add match result validation: winner must be one of `team_a_id` or `team_b_id`; score must be non-negative integers
- [ ] **3.17** Implement auto-advancement: when a match result is saved, automatically populate `team_a_id` or `team_b_id` of the next round's match
- [ ] **3.18** Build `<MatchCard>` component: team A vs team B, score display, status indicator, scheduled time
- [ ] **3.19** Implement bracket seeding UI: drag-and-drop team ordering before bracket is locked; use `@dnd-kit/core`
- [ ] **3.20** Add bracket lock mechanism: once organizer clicks "Lock Bracket", no more registrations accepted, `tournament.status` → `ongoing`
- [ ] **3.21** Create shareable bracket URL: `ffarena.live/tournaments/[slug]/bracket` — no auth required to view
- [ ] **3.22** Add bracket export: "Download as PNG" button using `html2canvas` on bracket component
- [ ] **3.23** Write unit tests for `generateSingleElimination` with 4, 8, and 12 team inputs (byes); verify correct pairing and round counts

---

## Phase 4: Player Profiles & Leaderboards

> Goal: Rich player stat pages, game-specific leaderboards, and performance history.

- [x] **4.01** Design `player_stats` table (Completed in baseline)
- [x] **4.02** Design `leaderboard_entries` table (Completed in baseline)
- [x] **4.03** Design `seasons` table: `id`, `name`, `game_id`, `starts_at`, `ends_at`, `is_active`
- [x] **4.04** Write SQL migration `0004_leaderboards.sql` with seasons, relation on leaderboard, and public select RLS policies
- [ ] **4.05** Write Supabase DB function `calculate_leaderboard_points` (Post-MVP optimization)
- [ ] **4.06** Define FFArena scoring formula (Trigger handles point additions)
- [x] **4.07** Create `src/app/(public)/leaderboard/page.tsx` — leaderboard listing with game filter tabs
- [x] **4.08** Build `<LeaderboardTable>` component: rank badge, avatar, username, location, points
- [x] **4.09** Implement leaderboard pagination: top 50 players, server-side with Supabase `.range(0, 49)`
- [x] **4.10** Add "Season" selector dropdown to leaderboard page
- [x] **4.11** Highlight current user's row in leaderboard with a customized glow
- [x] **4.12** Create `src/app/(public)/profile/[username]/page.tsx` — full player profile
- [x] **4.13** Build summary statistics (Peak ELO, Wins, Tourneys, Kills)
- [x] **4.14** Build `<TournamentHistoryTable>` component displaying registered matches & team details
- [x] **4.15** Add "Games Played" radar/spider chart using a custom lightweight SVG radar component
- [ ] **4.16** Create Supabase scheduled cron job (pg_cron)
- [x] **4.17** Add state-level leaderboard filter using the India regions helper
- [x] **4.18** Create `src/app/(public)/leaderboard/[game]/[state]/page.tsx` — state-specific leaderboard (SEO-friendly URL)
- [ ] **4.19** Add "Share Profile" button on player profile
- [ ] **4.20** Add player badge system
- [ ] **4.21** Write `0007_badges.sql` migration for player_badges table

---

## Phase 5: Prize Distribution

> Goal: Transparent prize tracking, UPI-based payouts, and organizer escrow management.

- [x] **5.01** Design `prizes` table: position, amount_paise, winner_team_id, status (Completed)
- [x] **5.02** Design `prize_transactions` table: player_id, upi_id, amount_paise, tds_deducted_paise, net_payout_paise, status (Completed)
- [x] **5.03** Write SQL migration and RLS policies for prizes & transactions (Completed)
- [x] **5.04** Create `src/app/organizer/tournaments/[slug]/prizes/page.tsx` — prize distribution editor: input amount per placement, verify total <= `prize_pool_inr`
- [x] **5.05** Build prize breakdown UI: visual representation of prize split
- [x] **5.06** Create `src/app/organizer/tournaments/[slug]/payouts/page.tsx` — payout management dashboard with manual override and confirmation button
- [ ] **5.07** Add UPI ID collection in tournament registration flow: player enters UPI ID when registering
- [x] **5.08** Build `<PayoutStatusPill>` component style indicators: yellow=pending, blue=processing, green=paid, red=failed
- [ ] **5.09** Create `src/app/dashboard/earnings/page.tsx` — player earnings page
- [x] **5.10** Add Razorpay integration for entry fee collection: install `razorpay` npm package; create `/api/payments/create-order` Route Handler
- [x] **5.11** Create `/api/payments/verify` Route Handler: verify Razorpay signature and update registration status to confirmed
- [x] **5.12** Store Razorpay order ID and payment ID in teams table
- [x] **5.13** Add free tournament fast path: if entry_fee_paise = 0, skip payment flow; immediately confirm registration
- [ ] **5.14** Create admin prize audit log
- [ ] **5.15** Write migration for payout audit logs
- [ ] **5.16** Add email notification when a payout is marked paid
- [ ] **5.17** Create public prize breakdown page showing distribution percentages and total pool
- [ ] **5.18** Add prize pool funding verification upload
- [ ] **5.19** Implement 5% FFArena platform fee deduction from entry fee collection
- [ ] **5.20** Build `<EarningsChart>` component
- [x] **5.21** Design transaction ledger UI showing entry fees collected, TDS withheld, and disbursements
- [ ] **5.22** Create API endpoint to fetch financial summary logs
- [ ] **5.23** Add audit ledger check matching database transactions with Razorpay API events for organizer transparency

---

## Phase 6: Sponsor Portal

> Goal: Enable brands and local businesses to sponsor tournaments and get visibility.

- [ ] **6.01** Design `sponsors` table: `id`, `brand_name`, `logo_url`, `website_url`, `contact_email`, `contact_name`, `tier` (title/co/community), `status` (pending/active/inactive), `created_at`
- [ ] **6.02** Design `tournament_sponsors` table: `id`, `tournament_id`, `sponsor_id`, `tier`, `display_order`, `banner_url`, `created_at`
- [ ] **6.03** Write migration `0010_sponsors.sql` with both tables, FK constraints, RLS (sponsors: self-manage; admin: full access)
- [ ] **6.04** Create `src/app/sponsors/apply/page.tsx` — sponsor application form: brand name, logo upload, website, contact, interested tournaments, budget range, message
- [ ] **6.05** Add sponsor logo upload to Supabase Storage bucket `sponsor-logos` (public read, authenticated write, 2 MB limit)
- [ ] **6.06** Create `src/app/admin/sponsors/page.tsx` — admin sponsor management: view all applications, approve/reject, assign tier
- [ ] **6.07** Create `src/app/admin/sponsors/[id]/assign/page.tsx` — assign sponsor to specific tournaments with tier selection
- [ ] **6.08** Build `<SponsorBanner>` component: displays sponsor logo + link on tournament detail page, ordered by `display_order`
- [ ] **6.09** Add sponsor visibility on bracket page: persistent sponsor logo strip at top of bracket view
- [ ] **6.10** Create `src/app/sponsors/[id]/dashboard/page.tsx` — sponsor self-service dashboard: view sponsored tournaments, impression stats (page views), download logo asset kit
- [ ] **6.11** Track tournament detail page views in `tournament_views` table: `tournament_id`, `viewer_ip_hash`, `viewed_at` — used for sponsor impression reporting
- [ ] **6.12** Build sponsor reach report: count unique viewers per sponsored tournament; display in sponsor dashboard as "Estimated Impressions"
- [ ] **6.13** Create media kit download feature: zip of tournament banner + sponsor logo for post-event use; generated via Supabase Edge Function
- [ ] **6.14** Add "Powered By" footer on all public tournament pages listing sponsors with logos
- [ ] **6.15** Build sponsor tier pricing page `src/app/sponsors/pricing/page.tsx`: Title (Rs. 25,000), Co-Sponsor (Rs. 10,000), Community (Rs. 2,500) — static page with feature comparison table
- [ ] **6.16** Update `sponsors/pricing` to reflect minimum budget starting at ₹2,000 for local brands (cafés, coaching centers, gaming peripherals)
- [ ] **6.17** Add automated logo placement configuration in sponsor campaign creation flow `/sponsors/portal/create`
- [ ] **6.18** Implement post-event audience metrics reports generation and download (PDF format) on `/sponsors/portal/[dealId]`

---

## Phase 7: Polish & Mobile

> Goal: Production-quality UI, responsive mobile experience, performance, and accessibility.

- [ ] **7.01** Implement full responsive layout for all pages: mobile-first CSS, test at 375px, 768px, 1280px, 1920px breakpoints
- [ ] **7.02** Create `<MobileNav>` bottom navigation bar for mobile: Home, Tournaments, Leaderboard, Profile — visible only on `md:hidden`
- [ ] **7.03** Add `next/image` optimization to all user-uploaded images (avatars, banners, logos); set appropriate `sizes` prop
- [ ] **7.04** Implement skeleton loading states for all data-fetching components using `shadcn/ui Skeleton`
- [ ] **7.05** Add `<ErrorBoundary>` components around all async data sections; show user-friendly error UI with retry button
- [ ] **7.06** Implement toast notifications system using `shadcn/ui Toaster`: success/error/info for all user actions
- [ ] **7.07** Add PWA support: create `manifest.json`, `src/app/icon.png`, `apple-touch-icon.png`; add service worker via `next-pwa`
- [ ] **7.08** Run Lighthouse audit on homepage and tournament detail page; achieve score >= 90 on Performance, Accessibility, SEO
- [ ] **7.09** Add Open Graph meta tags to all public pages: title, description, `og:image` (tournament banner or default FFArena OG image)
- [ ] **7.10** Generate dynamic `og:image` for each tournament using `@vercel/og` (ImageResponse Route Handler)
- [ ] **7.11** Implement `dark mode` support using Tailwind `dark:` classes and `next-themes` package; respect `prefers-color-scheme`
- [ ] **7.12** Add ARIA labels, roles, and keyboard navigation support to all interactive components; test with screen reader
- [ ] **7.13** Configure Cloudflare Cache Rules: cache static assets for 1 year; cache tournament list page for 60 seconds; bypass cache for authenticated pages
- [ ] **7.14** Add `robots.txt` and `sitemap.xml` (dynamically generated) via Next.js Route Handlers
- [ ] **7.15** Implement infinite scroll on tournament listing page as alternative to pagination (using `Intersection Observer`)
- [ ] **7.16** Add confetti animation (`canvas-confetti`) on tournament registration success page
- [ ] **7.17** Create `src/app/not-found.tsx` custom 404 page with FFArena branding and "Back to Home" CTA
- [ ] **7.18** Configure `next-intl` framework: setup translations for `hi`, `ta`, `te`, `bn` (Hindi, Tamil, Telugu, Bengali) UI directories
- [ ] **7.19** Build language switcher dropdown component `<LanguageSelector>` in Navbar and Account Settings
- [ ] **7.20** Integrate Web Speech API text-to-speech engine: write utility `speakWinner()` for announcing match winners
- [ ] **7.21** Build voice announcement toggles in Account settings and match score boards
- [ ] **7.22** Build stream configuration panel `/organizer/[id]/stream`: add RTMP ingestion and stream key fields
- [ ] **7.23** Build Canvas compositor overlay generator: create overlay canvas (1920x1080) displaying sponsor logo, tournament bracket round, and scores
- [ ] **7.24** Test RTMP stream forwarding with OBS Studio mock sources

---

## Phase 8: Launch

> Goal: Beta launch to first 500 users, onboard first 3 tournaments, marketing and monitoring setup.

- [ ] **8.01** Set up Vercel Analytics: enable Web Analytics and Speed Insights; add `<Analytics />` and `<SpeedInsights />` to root layout
- [ ] **8.02** Set up Sentry for error tracking: install `@sentry/nextjs`; configure `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- [ ] **8.03** Set up Supabase `pg_cron` for daily leaderboard recalculation and weekly inactive tournament cleanup
- [ ] **8.04** Configure Supabase database backups: enable Point-in-Time Recovery (PITR) for production project
- [ ] **8.05** Write `CONTRIBUTING.md` with branch naming convention, PR template, and commit message format (Conventional Commits)
- [ ] **8.06** Write `README.md` with project overview, local setup instructions, env variable docs, and architecture diagram link
- [ ] **8.07** Create admin seed script `scripts/seed-admin.ts` to promote first user to `admin` role via service role key
- [ ] **8.08** Onboard first 3 tournament organizers manually: create accounts, assign `organizer` role, walkthrough tutorial
- [ ] **8.09** Run first test tournament (internal team): 8-player Free Fire squad tournament end-to-end
- [ ] **8.10** Set up Cloudflare WAF rules: block known bad bots, rate-limit `/api/` endpoints to 100 req/min per IP
- [ ] **8.11** Configure Cloudflare DDoS protection to `High` sensitivity for `/api/` routes
- [ ] **8.12** Set up Resend email service: verify `noreply@ffarena.live` sender domain; configure DNS TXT/CNAME for DKIM
- [ ] **8.13** Create email templates in Resend: Welcome email, Tournament Registration Confirmation, Bracket Published, Payout Received
- [ ] **8.14** Draft and publish Privacy Policy and Terms of Service pages (`src/app/legal/privacy/page.tsx`, `src/app/legal/terms/page.tsx`)
- [ ] **8.15** Create social media accounts: Instagram `@ffarena.live`, Discord server (player community + organizer channels), Twitter/X `@FFArenaLive`
- [ ] **8.16** Set up Google Search Console: submit sitemap, verify domain ownership via Cloudflare TXT record
- [ ] **8.17** Launch closed beta: share invite link with 10 college gaming communities in Maharashtra and Karnataka

---

## Bugs & Issues

> Add bugs here as they are discovered. Format: `[!] **BUG-XXX** Description — Reported: YYYY-MM-DD — Severity: Low/Medium/High/Critical`

_(No bugs logged yet — project pre-launch)_

---

## Backlog (Post-MVP)

> Features planned after initial launch. Not committed to a sprint.

- [ ] **BCK-01** Mobile app (React Native / Expo) — iOS and Android clients sharing Supabase backend
- [ ] **BCK-02** Live match streaming embed — integrate YouTube Live or AnyClip stream iframe on match pages
- [ ] **BCK-03** In-game stat sync API — Free Fire and BGMI partner API integration for automatic kill/placement data pull
- [ ] **BCK-04** Team roster management — persistent teams across tournaments; team logo, team page, roster history
- [ ] **BCK-05** Discord bot — post tournament announcements, bracket updates, and match results to Discord servers
- [ ] **BCK-06** Referral system — invite friends, earn FFArena coins redeemable for entry fee discounts
- [ ] **BCK-07** FFArena Coins economy — virtual currency for platform engagement rewards
- [ ] **BCK-08** City League system — seasonal leagues for Pune, Mumbai, Bangalore, Hyderabad, Delhi brackets
- [ ] **BCK-09** Organizer certification program — verified badge for trusted organizers with track record
- [ ] **BCK-10** Anti-cheat report system — player-submitted cheating reports with evidence upload; admin review queue
- [ ] **BCK-11** Player ban/suspension system — admin can ban player accounts with reason and duration
- [ ] **BCK-12** Tournament spectator mode — non-registered users can watch bracket progress and match scores live
- [ ] **BCK-13** Fantasy esports module — pick players before a tournament, score points based on their real performance
- [ ] **BCK-14** College affiliation — players can link their college; college leaderboards by institution
- [ ] **BCK-15** Coach/analyst role — team accounts with coach role; access to analytics dashboards
- [ ] **BCK-16** Match replay upload — organizers can upload match replay files; players can view linked replays
- [ ] **BCK-17** Twitch integration — auto-post tournament results to connected Twitch accounts via Twitch EventSub
- [ ] **BCK-18** WhatsApp notifications — WhatsApp Business API integration for match schedule and result alerts
- [ ] **BCK-19** Multi-language support — Hindi, Marathi, Kannada, Telugu UI via `next-intl`
- [ ] **BCK-20** Player compare tool — side-by-side stat comparison of two players for a given game/season
- [ ] **BCK-21** Tournament templates — organizers can save a tournament config as a template and reuse it
- [ ] **BCK-22** Automated prize escrow — Razorpay route-based escrow holds entry fees until tournament completion, then auto-disburses
- [ ] **BCK-23** Public API — REST and GraphQL API for third-party apps and content creators to consume FFArena data
- [ ] **BCK-24** Organizer analytics dashboard — detailed breakdowns: registration funnel, drop-off rate, geographic distribution of participants
- [ ] **BCK-25** Volunteer/staff roles per tournament — organizers can invite moderators with limited admin access scoped to one event
- [ ] **BCK-26** Double-elimination bracket support — loser's bracket tracking with correct next-match propagation
- [ ] **BCK-27** Swiss system bracket support — for large player pools (100+) where full elimination is impractical
- [ ] **BCK-28** Point-based qualifier system — multiple qualifier tournaments feed points into a grand final seeding
- [ ] **BCK-29** In-app chat — tournament-specific chat rooms using Supabase Realtime Broadcast; persistent message history
- [ ] **BCK-30** Streamer mode — hide sensitive player info (phone, UPI ID) in UI for organizers streaming their screen
- [ ] **BCK-31** Advanced SEO — structured data (JSON-LD) for tournaments as `Event` schema; player profiles as `Person` schema
- [ ] **BCK-32** Email digest — weekly "Your Week in FFArena" digest: upcoming tournaments in your state, leaderboard rank change

---

## Notes

> Use this section for meeting notes, decisions, blockers, research links, and architecture decisions.

_(Empty — add notes here as needed)_

---

_Tracker maintained at `C:\Users\raksh\OneDrive\Desktop\Grassroots Esports Infrastructure\Tracker.md`_
_Generated: 2026-06-12 | FFArena v0.1.0-alpha_
