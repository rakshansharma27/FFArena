# FFArena — Technical Specification Document

> **Project:** FFArena — India's Grassroots Esports Infrastructure Platform  
> **Domain:** [ffarena.live](https://ffarena.live)  
> **Version:** 1.0.0  
> **Last Updated:** 2026-06-12  
> **Classification:** Internal — Engineering Team

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Tech Stack](#2-tech-stack)
3. [API Design](#3-api-design)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Real-time Architecture](#5-real-time-architecture)
6. [Payment Architecture](#6-payment-architecture)
7. [Performance Requirements](#7-performance-requirements)
8. [Security](#8-security)
9. [Monitoring & Observability](#9-monitoring--observability)
10. [Environment Variables](#10-environment-variables)
11. [Development Setup](#11-development-setup)

---

## 1. System Architecture

### 1.1 High-Level Architecture Diagram

```mermaid
graph TD
    subgraph "Client Layer"
        A["Browser / PWA\n(Next.js SSR + CSR)"]
        B["Android WebView\n(Future native wrapper)"]
    end

    subgraph "Edge / CDN Layer"
        C["Cloudflare CDN\nDNS · DDoS · TLS · Cache"]
    end

    subgraph "Application Layer — Vercel"
        D["Next.js 14 App\n(SSR · ISR · API Routes · Server Actions)"]
        E["Vercel Edge Network\n(Global PoPs · Preview Deployments)"]
        F["Serverless Functions\n(/api/* routes)"]
    end

    subgraph "Data & Auth Layer — Supabase"
        G["PostgreSQL 15\n(Primary DB)"]
        H["Supabase Auth\n(OTP · OAuth · JWT)"]
        I["Supabase Realtime\n(WebSocket Channels)"]
        J["Supabase Storage\n(Avatars · Banners · Assets)"]
        K["Supabase Edge Functions\n(Deno · Webhooks · Prize Payouts)"]
    end

    subgraph "Third-party Services"
        L["Razorpay\n(UPI Payments · Payouts)"]
        M["Resend\n(Transactional Email)"]
        N["MSG91 / Twilio\n(SMS OTP · Notifications)"]
        O["Discord OAuth 2.0"]
        P["Google OAuth 2.0"]
        Q["Sentry\n(Error Monitoring)"]
    end

    subgraph "DevOps"
        R["GitHub\n(Source · PRs · Actions CI/CD)"]
        S["Vercel Dashboard\n(Analytics · Logs · Deployments)"]
    end

    A --> C
    B --> C
    C --> E
    E --> D
    D --> F
    D --> G
    D --> H
    D --> I
    D --> J
    F --> K
    K --> L
    K --> M
    K --> N
    H --> O
    H --> P
    D --> Q
    R --> E
```

### 1.2 Component Overview

| Component          | Technology                        | Role                                                              |
| ------------------ | --------------------------------- | ----------------------------------------------------------------- |
| Frontend + Backend | Next.js 14 (App Router) on Vercel | SSR, ISR, API routes, Server Actions, admin UI                    |
| Database           | Supabase PostgreSQL 15            | All relational data: players, tournaments, matches, teams, prizes |
| Authentication     | Supabase Auth + NextAuth.js v5    | Mobile OTP, Google OAuth, Discord OAuth, JWT sessions             |
| Realtime           | Supabase Realtime                 | Live match score updates, bracket progression                     |
| File Storage       | Supabase Storage                  | User avatars, tournament banners, sponsor logos                   |
| Edge Functions     | Supabase Edge Functions (Deno)    | Prize payout webhooks, score validation, TDS computation          |
| CDN & DNS          | Cloudflare                        | ffarena.live DNS, TLS, global caching, DDoS mitigation            |
| Payments           | Razorpay                          | Entry fee collection (UPI), prize distribution (payout API)       |
| Email              | Resend                            | Tournament invites, registration confirmations, payout receipts   |
| SMS                | MSG91                             | OTP for Indian mobile numbers, match reminders                    |
| Error Tracking     | Sentry                            | Frontend + backend error capture, alerts                          |
| CI/CD              | GitHub Actions + Vercel           | Lint → Test → Build → Deploy pipeline                             |

### 1.3 Deployment Topology

```
ffarena.live  ──►  Cloudflare (Proxy ON, SSL Full-Strict)
                        │
                        ├── Static assets (JS/CSS/images) ── Cloudflare Cache (Edge TTL: 1 year, immutable)
                        │
                        └── Dynamic requests ──► Vercel Edge Network
                                                       │
                                                       ├── SSR pages  (Vercel Serverless, us-east-1 + ap-south-1)
                                                       ├── ISR pages  (revalidate: 60s for leaderboards)
                                                       └── /api/*     (Vercel Serverless Functions, 10s timeout)

Supabase Project Region: ap-south-1 (Mumbai)  ◄── co-located with Vercel ap-south-1 PoP
```

**Branch Strategy:**

- `main` → Production deployment at `ffarena.live`
- `develop` → Preview deployment at `develop.ffarena.live` (Cloudflare Pages DNS override)
- `feature/*` → Ephemeral Vercel preview URLs per PR
- Database migrations run via `supabase db push` gated behind a manual GitHub Actions approval step on `main`.

---

## 2. Tech Stack

### 2.1 Frontend

| Package                 | Version   | Purpose                                                            |
| ----------------------- | --------- | ------------------------------------------------------------------ |
| `next`                  | `^14.2.x` | App Router, SSR, ISR, Image Optimization, Middleware               |
| `react` / `react-dom`   | `^18.3.x` | UI runtime                                                         |
| `typescript`            | `^5.4.x`  | Static typing across the entire codebase                           |
| `tailwindcss`           | `^3.4.x`  | Utility-first CSS; custom theme for FFArena brand                  |
| `@shadcn/ui`            | Latest    | Accessible, composable component library (Radix UI primitives)     |
| `framer-motion`         | `^11.x`   | Page transitions, bracket animations, trophy reveal                |
| `react-hook-form`       | `^7.x`    | Performant form state management                                   |
| `zod`                   | `^3.x`    | Schema validation (shared with backend)                            |
| `@hookform/resolvers`   | `^3.x`    | Connects Zod schemas to React Hook Form                            |
| `zustand`               | `^4.x`    | Lightweight global client state (user session, sidebar, modals)    |
| `@tanstack/react-query` | `^5.x`    | Server state, caching, background refetching, pagination           |
| `socket.io-client`      | `^4.x`    | Fallback realtime (if Supabase Realtime unavailable)               |
| `@supabase/supabase-js` | `^2.x`    | Supabase JS client for browser-side operations                     |
| `lucide-react`          | `^0.x`    | Icon set (consistent with shadcn/ui)                               |
| `next-themes`           | `^0.x`    | Dark/light mode toggle with system preference                      |
| `react-hot-toast`       | `^2.x`    | Lightweight toast notifications                                    |
| `date-fns`              | `^3.x`    | Date formatting for match schedules (IST-aware)                    |
| `next-intl`             | `^3.x`    | Vernacular-first UI localization for Hindi, Tamil, Telugu, Bengali |
| Web Speech API          | Native    | Browser voice synthesis for automated result announcements         |

**File structure conventions (App Router):**

```
src/
├── app/
│   ├── (auth)/           # Route group: login, register, OTP verify
│   ├── (dashboard)/      # Route group: player dashboard, stats
│   ├── (public)/         # Route group: landing, tournament listings
│   ├── admin/            # Admin panel (ADMIN role only)
│   ├── api/              # API routes (REST handlers)
│   ├── layout.tsx        # Root layout (fonts, theme provider, analytics)
│   └── globals.css       # Tailwind base + FFArena CSS variables
├── components/
│   ├── ui/               # shadcn/ui generated components
│   ├── tournament/       # TournamentCard, BracketView, Leaderboard
│   ├── match/            # LiveScoreCard, MatchTimer, ScoreInput
│   ├── player/           # PlayerProfile, AvatarUpload, StatsChart
│   └── shared/           # Navbar, Footer, LoadingSpinner, ErrorBoundary
├── lib/
│   ├── supabase/         # client.ts, server.ts, middleware.ts
│   ├── auth/             # session helpers, role guards
│   ├── validators/       # Zod schemas (shared client + server)
│   ├── utils.ts          # cn(), formatINR(), formatDate()
│   └── constants.ts      # ROLES, GAME_MODES, PRIZE_TIERS
├── hooks/                # useUser, useTournament, useRealtime, useBreakpoint
├── stores/               # Zustand stores: useAppStore, useMatchStore
└── types/                # Global TypeScript types, Supabase generated types
```

### 2.2 Backend

| Package                | Version       | Purpose                                                       |
| ---------------------- | ------------- | ------------------------------------------------------------- |
| `next` API Routes      | `^14.2.x`     | RESTful endpoints under `/api/*`                              |
| Next.js Server Actions | `^14.2.x`     | Mutative operations with built-in CSRF protection             |
| `@supabase/ssr`        | `^0.x`        | Server-side Supabase client with cookie-based sessions        |
| `next-auth`            | `^5.x (beta)` | Discord + Google OAuth integration, session management        |
| `zod`                  | `^3.x`        | Request body and query param validation at every API boundary |
| `@upstash/ratelimit`   | `^1.x`        | Redis-backed rate limiting via Upstash (Vercel-compatible)    |
| `@upstash/redis`       | `^1.x`        | Token bucket / sliding window counters                        |
| `resend`               | `^3.x`        | Email sending SDK                                             |

All API route handlers follow this structure:

```typescript
// src/app/api/tournaments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { tournamentSchema } from '@/lib/validators/tournament'
import { ratelimit } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)
  if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = tournamentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const { data, error } = await supabase.from('tournaments').insert(parsed.data).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data }, { status: 201 })
}
```

### 2.3 Database (Supabase / PostgreSQL 15)

**Core Tables:**

| Table                      | Primary Key                   | Description                                                     |
| -------------------------- | ----------------------------- | --------------------------------------------------------------- |
| `profiles`                 | `id uuid FK → auth.users`     | Extended user data: username, avatar_url, city, phone           |
| `roles`                    | `id uuid`                     | Role definitions: PLAYER, ORGANIZER, SPONSOR, ADMIN             |
| `user_roles`               | `(user_id, role_id)`          | M:N junction table for role assignments                         |
| `games`                    | `id uuid`                     | Supported games: Free Fire, BGMI, Valorant, etc.                |
| `tournaments`              | `id uuid`                     | Tournament metadata: name, game, format, prize_pool, status     |
| `tournament_registrations` | `(tournament_id, team_id)`    | Team registrations with payment status                          |
| `teams`                    | `id uuid`                     | Team: name, logo_url, captain_id, city                          |
| `team_members`             | `(team_id, player_id)`        | Team roster with join date and role (captain/member)            |
| `matches`                  | `id uuid`                     | Match: tournament_id, round, team_a_id, team_b_id, scheduled_at |
| `match_scores`             | `id uuid FK → matches`        | Live scores: kills, placement, total_points, submitted_by       |
| `leaderboards`             | `(tournament_id, team_id)`    | Aggregated points per tournament phase                          |
| `prizes`                   | `id uuid FK → tournaments`    | Prize tier definitions: rank, amount_inr, razorpay_payout_id    |
| `prize_claims`             | `id uuid`                     | Player payout requests, TDS records, status                     |
| `sponsors`                 | `id uuid`                     | Sponsor: brand_name, logo_url, website, contact_email           |
| `tournament_sponsors`      | `(tournament_id, sponsor_id)` | Sponsorship deals with prize contribution amount                |
| `notifications`            | `id uuid`                     | In-app notifications: user_id, type, payload, read_at           |
| `audit_logs`               | `id uuid`                     | Immutable log: who changed what, when (for disputes)            |

**Key Indexes:**

```sql
CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX idx_matches_scheduled_at ON matches(scheduled_at DESC);
CREATE INDEX idx_match_scores_match_id ON match_scores(match_id);
CREATE INDEX idx_leaderboards_tournament_rank ON leaderboards(tournament_id, total_points DESC);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_tournament_registrations_status ON tournament_registrations(tournament_id, payment_status);
```

### 2.4 Infrastructure

| Service           | Tier / Plan         | Config                                                         |
| ----------------- | ------------------- | -------------------------------------------------------------- |
| **Vercel**        | Pro                 | Auto-scaling serverless, 10s function timeout, 100GB bandwidth |
| **Supabase**      | Pro (Mumbai region) | 8GB DB, 100GB storage, 250 concurrent realtime connections     |
| **Cloudflare**    | Pro                 | Full proxy, WAF, Rate Limiting rules, Cache Rules              |
| **GitHub**        | Free / Team         | Actions: 2000 min/month, branch protection on `main`           |
| **Upstash Redis** | Pay-per-use         | Rate limiting store; 10K req/day free tier                     |

### 2.5 Third-party Integrations

| Service                    | SDK / API                        | Purpose                                                            |
| -------------------------- | -------------------------------- | ------------------------------------------------------------------ |
| **Razorpay**               | `razorpay` npm SDK + REST API v1 | Entry fee orders, prize payout transfers                           |
| **Discord OAuth**          | Supabase Auth provider           | Player SSO login                                                   |
| **Google OAuth**           | Supabase Auth provider           | Player SSO login                                                   |
| **Resend**                 | `resend` npm SDK                 | Tournament confirmations, payout receipts, weekly digest           |
| **MSG91**                  | REST API (OTP v5)                | SMS OTP for Indian +91 phone numbers (regionalized templates)      |
| **Sentry**                 | `@sentry/nextjs`                 | Frontend + API error tracking, performance tracing                 |
| **Livepeer / OBS overlay** | RTMP Forwarder + Canvas API      | Client-side composited sponsor logo overlays & RTMP broadcast keys |

---

## 3. API Design

### 3.1 Conventions

- **Base URL:** `https://ffarena.live/api`
- **Format:** JSON (`Content-Type: application/json`)
- **Auth:** Bearer JWT in `Authorization` header OR Supabase session cookie (`sb-access-token`)
- **Versioning:** `/api/v1/*` path prefix (current); breaking changes increment version
- **Pagination:** Cursor-based via `?cursor=<uuid>&limit=<n>` (default limit: 20, max: 100)
- **Errors:** `{ "error": "<message>", "code": "<ERROR_CODE>", "details": {} }`
- **Success:** `{ "data": <payload>, "meta": { "count": n, "cursor": "<next_cursor>" } }`
- **Rate Limits:** 60 req/min per IP for public endpoints; 300 req/min per authenticated user

### 3.2 Endpoint Reference

#### Tournaments

| Method   | Path                                     | Auth              | Description                                                   |
| -------- | ---------------------------------------- | ----------------- | ------------------------------------------------------------- |
| `GET`    | `/api/v1/tournaments`                    | Public            | List all tournaments (filterable by `game`, `status`, `city`) |
| `GET`    | `/api/v1/tournaments/:id`                | Public            | Get tournament detail including bracket and prize structure   |
| `POST`   | `/api/v1/tournaments`                    | ORGANIZER         | Create a new tournament                                       |
| `PATCH`  | `/api/v1/tournaments/:id`                | ORGANIZER (owner) | Update tournament metadata                                    |
| `DELETE` | `/api/v1/tournaments/:id`                | ADMIN             | Soft-delete a tournament                                      |
| `POST`   | `/api/v1/tournaments/:id/publish`        | ORGANIZER (owner) | Set status to PUBLISHED                                       |
| `GET`    | `/api/v1/tournaments/:id/bracket`        | Public            | Get full bracket tree with match results                      |
| `POST`   | `/api/v1/tournaments/:id/register`       | PLAYER            | Register a team; triggers Razorpay order creation             |
| `GET`    | `/api/v1/tournaments/:id/stream/config`  | ORGANIZER         | Fetch RTMP ingestion server URL and stream keys               |
| `POST`   | `/api/v1/tournaments/:id/stream/overlay` | ORGANIZER         | Set overlay settings, sponsor banners, and branding themes    |

**`GET /api/v1/tournaments` Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Free Fire City Cup — Pune Q1",
      "game": "FREE_FIRE",
      "format": "BATTLE_ROYALE",
      "status": "REGISTRATION_OPEN",
      "entry_fee_inr": 100,
      "prize_pool_inr": 5000,
      "max_teams": 24,
      "registered_teams": 11,
      "scheduled_start": "2026-07-01T14:00:00+05:30",
      "city": "Pune",
      "banner_url": "https://storage.ffarena.live/banners/ff-pune-q1.jpg",
      "organizer": { "id": "uuid", "username": "ArenaHost_Rahul" }
    }
  ],
  "meta": { "count": 1, "cursor": null }
}
```

#### Teams

| Method   | Path                                  | Auth             | Description                                   |
| -------- | ------------------------------------- | ---------------- | --------------------------------------------- |
| `GET`    | `/api/v1/teams`                       | Public           | List teams (filterable by `city`, `game`)     |
| `GET`    | `/api/v1/teams/:id`                   | Public           | Team profile, roster, match history           |
| `POST`   | `/api/v1/teams`                       | PLAYER           | Create a new team (requester becomes captain) |
| `PATCH`  | `/api/v1/teams/:id`                   | PLAYER (captain) | Update team name, logo                        |
| `POST`   | `/api/v1/teams/:id/invite`            | PLAYER (captain) | Invite a player by username                   |
| `POST`   | `/api/v1/teams/:id/join`              | PLAYER           | Accept an invite token                        |
| `DELETE` | `/api/v1/teams/:id/members/:playerId` | PLAYER (captain) | Remove a team member                          |

#### Matches

| Method  | Path                           | Auth      | Description                                                    |
| ------- | ------------------------------ | --------- | -------------------------------------------------------------- |
| `GET`   | `/api/v1/matches`              | Public    | List matches (filterable by `tournament_id`, `status`, `date`) |
| `GET`   | `/api/v1/matches/:id`          | Public    | Get match detail including live scores                         |
| `PATCH` | `/api/v1/matches/:id/schedule` | ORGANIZER | Update match scheduled time                                    |
| `POST`  | `/api/v1/matches/:id/scores`   | ORGANIZER | Submit final match scores                                      |
| `PATCH` | `/api/v1/matches/:id/scores`   | ORGANIZER | Correct submitted scores (audit-logged)                        |
| `POST`  | `/api/v1/matches/:id/dispute`  | PLAYER    | Raise a score dispute with evidence URL                        |

**`POST /api/v1/matches/:id/scores` Request Body:**

```json
{
  "scores": [
    {
      "team_id": "uuid",
      "placement": 1,
      "kills": 12,
      "placement_points": 12,
      "kill_points": 24,
      "total_points": 36
    }
  ],
  "match_proof_url": "https://storage.ffarena.live/proofs/match-abc123.jpg"
}
```

#### Players

| Method  | Path                                        | Auth          | Description                                           |
| ------- | ------------------------------------------- | ------------- | ----------------------------------------------------- |
| `GET`   | `/api/v1/players/:id`                       | Public        | Player profile, stats, career history                 |
| `PATCH` | `/api/v1/players/me`                        | PLAYER (self) | Update own profile (username, bio, city)              |
| `POST`  | `/api/v1/players/me/avatar`                 | PLAYER (self) | Upload avatar (multipart, stored to Supabase Storage) |
| `GET`   | `/api/v1/players/me/notifications`          | PLAYER (self) | Paginated notification list                           |
| `PATCH` | `/api/v1/players/me/notifications/:id/read` | PLAYER (self) | Mark notification as read                             |

#### Leaderboards

| Method | Path                                  | Auth   | Description                                  |
| ------ | ------------------------------------- | ------ | -------------------------------------------- |
| `GET`  | `/api/v1/leaderboards/global`         | Public | All-time top players by total prize winnings |
| `GET`  | `/api/v1/leaderboards/tournament/:id` | Public | Per-tournament team leaderboard              |
| `GET`  | `/api/v1/leaderboards/city/:city`     | Public | City-level player rankings                   |
| `GET`  | `/api/v1/leaderboards/game/:game`     | Public | Game-specific global rankings                |

**Caching:** Leaderboard responses are ISR-cached with `revalidate: 60` (1 minute). Heavy aggregation is offloaded to a PostgreSQL materialized view `mv_tournament_leaderboard` refreshed on score submission.

#### Sponsors

| Method | Path                                    | Auth    | Description                                                 |
| ------ | --------------------------------------- | ------- | ----------------------------------------------------------- |
| `GET`  | `/api/v1/sponsors`                      | Public  | List all active sponsors                                    |
| `GET`  | `/api/v1/sponsors/:id`                  | Public  | Sponsor detail and sponsored tournaments                    |
| `POST` | `/api/v1/sponsors`                      | ADMIN   | Create a sponsor record                                     |
| `POST` | `/api/v1/sponsors/campaigns`            | SPONSOR | Purchase a campaign (min budget ₹2,000) for a tournament    |
| `GET`  | `/api/v1/sponsors/campaigns/:id/report` | SPONSOR | Get campaign performance audit report (impressions, clicks) |

#### Prizes

| Method | Path                            | Auth                  | Description                              |
| ------ | ------------------------------- | --------------------- | ---------------------------------------- |
| `GET`  | `/api/v1/prizes/tournament/:id` | Public                | Prize tier breakdown for a tournament    |
| `POST` | `/api/v1/prizes/claim`          | PLAYER                | Submit prize claim (UPI ID, PAN for TDS) |
| `GET`  | `/api/v1/prizes/claim/:id`      | PLAYER (self) / ADMIN | Check payout status                      |
| `POST` | `/api/v1/prizes/disburse`       | ADMIN                 | Trigger Razorpay payout batch (internal) |

---

## 4. Authentication & Authorization

### 4.1 Auth Providers

| Method            | Provider                 | Target Users                            |
| ----------------- | ------------------------ | --------------------------------------- |
| Phone OTP         | MSG91 → Supabase Auth    | Primary — Indian mobile users (+91)     |
| Email OTP         | Supabase Auth (built-in) | Fallback for users without a smartphone |
| Google OAuth 2.0  | Supabase Auth → Google   | Fast registration for college students  |
| Discord OAuth 2.0 | Supabase Auth → Discord  | Gamers already using Discord            |

### 4.2 OTP Authentication Flow (Mobile — Primary)

```
1. User enters +91 XXXXXXXXXX on /login
2. Frontend calls POST /api/v1/auth/send-otp
   → Backend calls MSG91 OTP v5 API to send 6-digit OTP via SMS
   → OTP stored in Upstash Redis with 10-minute TTL (key: otp:{phone})
3. User enters OTP on /login/verify
4. Frontend calls POST /api/v1/auth/verify-otp
   → Backend validates OTP from Redis
   → Calls supabase.auth.signInWithOtp({ phone }) to issue Supabase JWT
   → On success: creates/upserts row in public.profiles
5. Supabase returns: access_token (JWT, 1h), refresh_token (7d)
6. Tokens stored in httpOnly cookies via @supabase/ssr middleware
7. Subsequent requests: middleware reads cookie, validates JWT, injects user into request context
```

### 4.3 OAuth Flow (Google / Discord)

```
1. User clicks "Continue with Google/Discord"
2. Frontend calls supabase.auth.signInWithOAuth({ provider: 'google' | 'discord', redirectTo: '/auth/callback' })
3. User is redirected to provider consent screen
4. Provider redirects to /auth/callback with code
5. Supabase exchanges code for tokens; upserts user in auth.users
6. Next.js /auth/callback route handler upserts public.profiles and assigns default PLAYER role
7. Redirect to /dashboard
```

### 4.4 Role System

```
PLAYER    — Default role on registration. Can register teams, join tournaments, claim prizes.
ORGANIZER — Elevated. Can create/manage tournaments, submit match scores, view organizer dashboard.
SPONSOR   — Read-only analytics + ability to manage their own sponsor profile.
ADMIN     — Full platform access: user management, prize disbursement, manual overrides, audit logs.
```

Roles are stored in `user_roles` (M:N). A single user may hold multiple roles (e.g., an organizer who is also a player).

### 4.5 Middleware-based Route Protection

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const supabase = createMiddlewareClient(request, response)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const protectedPaths = ['/dashboard', '/admin', '/api/v1/prizes/claim']
  const adminPaths = ['/admin']

  if (protectedPaths.some((p) => pathname.startsWith(p)) && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (adminPaths.some((p) => pathname.startsWith(p))) {
    const role = await getUserRole(session?.user?.id)
    if (role !== 'ADMIN') return NextResponse.redirect(new URL('/403', request.url))
  }
  return response
}
```

### 4.6 Supabase Row-Level Security (RLS) Overview

All tables have RLS **enabled by default**. No anonymous access to write operations.

```sql
-- profiles: users can only update their own row
CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- tournaments: anyone can read; only organizer (owner) can update
CREATE POLICY "tournaments_public_read" ON tournaments
  FOR SELECT USING (status != 'DRAFT' OR organizer_id = auth.uid());

CREATE POLICY "tournaments_organizer_write" ON tournaments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name IN ('ORGANIZER','ADMIN'))
  );

-- match_scores: only organizer of the parent tournament or ADMIN can insert
CREATE POLICY "match_scores_organizer_insert" ON match_scores
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM matches m JOIN tournaments t ON m.tournament_id = t.id
            WHERE m.id = match_id AND t.organizer_id = auth.uid())
    OR is_admin(auth.uid())
  );

-- prize_claims: users can only read/insert their own claims
CREATE POLICY "prize_claims_self" ON prize_claims
  FOR ALL USING (player_id = auth.uid());
```

### 4.7 JWT Token Handling

- **Access Token:** Supabase-issued JWT, valid for **1 hour**. Contains `sub` (user ID), `role` (Supabase role), `app_metadata.roles` (FFArena roles array).
- **Refresh Token:** Valid for **7 days**. Stored in httpOnly, SameSite=Strict cookie.
- **Rotation:** `@supabase/ssr` automatically refreshes tokens on expiry via the middleware.
- **Revocation:** Achieved by deleting the session from `auth.sessions` (admin action) or calling `supabase.auth.signOut()`.

---

## 5. Real-time Architecture

### 5.1 Supabase Realtime Channels

Supabase Realtime is used for live match score updates and bracket progression. Each tournament gets its own channel namespace.

```typescript
// hooks/useMatchRealtime.ts
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useMatchStore } from '@/stores/useMatchStore'

export function useMatchRealtime(matchId: string) {
  const updateScore = useMatchStore((s) => s.updateScore)

  useEffect(() => {
    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_scores',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => updateScore(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
        (payload) => updateScore(payload.new)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, updateScore])
}
```

**Channel Naming Convention:**

- `match:{matchId}` — Live score updates for a single match
- `tournament:{tournamentId}:bracket` — Bracket progression events
- `tournament:{tournamentId}:leaderboard` — Real-time points table
- `notifications:{userId}` — Per-user in-app notification push

### 5.2 Optimistic Updates

All score-submission UIs use optimistic updates via TanStack Query:

```typescript
const mutation = useMutation({
  mutationFn: submitScore,
  onMutate: async (newScore) => {
    await queryClient.cancelQueries({ queryKey: ['match', matchId] })
    const previous = queryClient.getQueryData(['match', matchId])
    queryClient.setQueryData(['match', matchId], (old) => mergeScore(old, newScore))
    return { previous }
  },
  onError: (_err, _vars, context) => {
    queryClient.setQueryData(['match', matchId], context.previous) // rollback
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['match', matchId] })
  },
})
```

### 5.3 Reconnection Handling

- Supabase Realtime client auto-reconnects with exponential backoff (1s → 2s → 4s → max 30s).
- On reconnection, TanStack Query `refetchOnWindowFocus` and `refetchOnReconnect: true` trigger a full data refresh to reconcile any missed events.
- A `useOnlineStatus` hook monitors `navigator.onLine` and displays a toast banner: _"Connection lost — scores may be delayed"_ when offline.

---

## 6. Payment Architecture

### 6.1 Entry Fee Collection Flow

```
1. Player registers team for a paid tournament (entry_fee_inr > 0)
2. Frontend calls POST /api/v1/tournaments/:id/register
3. Backend (API route):
   a. Validates team eligibility (correct player count, no duplicate registrations)
   b. Creates Razorpay Order via SDK:
      razorpay.orders.create({ amount: fee * 100, currency: 'INR', receipt: registrationId })
   c. Stores order_id in tournament_registrations.razorpay_order_id with status=PENDING
   d. Returns { orderId, keyId, amount } to frontend
4. Frontend opens Razorpay checkout modal (UPI, Card, Net Banking)
5. On payment success: Razorpay calls POST /api/v1/webhooks/razorpay (Supabase Edge Function)
6. Webhook handler:
   a. Verifies HMAC-SHA256 signature (razorpay_payment_id + razorpay_order_id + secret)
   b. Updates tournament_registrations.payment_status = 'PAID'
   c. Increments tournaments.registered_teams counter
   d. Sends confirmation email via Resend
   e. Sends SMS via MSG91
```

### 6.2 Prize Payout Flow (Post-Tournament)

```
1. ADMIN triggers POST /api/v1/prizes/disburse for a completed tournament
2. Backend fetches all prize_claims with status=APPROVED
3. For each claim:
   a. Validates PAN card format (TDS compliance)
   b. Calculates TDS: if amount > ₹10,000 → deduct 30% (Section 194B IT Act)
   c. Net payout amount = gross_amount - tds_amount
   d. Creates Razorpay Payout via Fund Account API:
      { account_number, fund_account_id (UPI), amount, currency: 'INR', mode: 'UPI', purpose: 'prize' }
   e. Stores razorpay_payout_id in prize_claims, status = PROCESSING
4. Razorpay webhook confirms payout success → updates prize_claims.status = PAID
5. TDS certificates generated and stored as PDFs in Supabase Storage (for player Form 16B)
6. Email + SMS sent to player confirming payout with net amount and TDS breakdown
```

### 6.3 TDS Calculation Logic

```typescript
// lib/prize/tds.ts
const TDS_THRESHOLD_INR = 10_000
const TDS_RATE = 0.3 // 30% per Section 194B

export function calculateTDS(grossPrize: number): { net: number; tds: number } {
  if (grossPrize <= TDS_THRESHOLD_INR) {
    return { net: grossPrize, tds: 0 }
  }
  const tds = Math.floor(grossPrize * TDS_RATE)
  return { net: grossPrize - tds, tds }
}
```

### 6.4 Prize Escrow

- All entry fees are held in the FFArena Razorpay business account (not released to organizer).
- Prize pool = (entry_fee × registered_teams) + sponsor_contributions.
- Funds remain escrowed until `tournament.status = 'COMPLETED'` and ADMIN approves disbursement.
- Platform fee: 10% of total prize pool deducted before disbursement (configurable per tournament).

---

## 7. Performance Requirements

| Metric                         | Target                            | Measurement Method                                        |
| ------------------------------ | --------------------------------- | --------------------------------------------------------- |
| First Contentful Paint (FCP)   | < 1.5s (on 4G, India)             | Vercel Speed Insights / Lighthouse                        |
| Largest Contentful Paint (LCP) | < 3.0s (on 4G)                    | Lighthouse CI in GitHub Actions                           |
| Time to Interactive (TTI)      | < 4.0s (mid-range Android)        | Lighthouse CI                                             |
| API p95 Response Time          | < 500ms                           | Vercel Analytics / Sentry Performance                     |
| API p99 Response Time          | < 1200ms                          | Sentry Performance                                        |
| Realtime Score Update Latency  | < 2.0s (from DB write to browser) | Manual e2e timing in staging                              |
| DB Query p95                   | < 100ms                           | Supabase Dashboard → Query Performance                    |
| Availability SLA               | 99.5% monthly uptime              | Vercel Status + UptimeRobot                               |
| Concurrent Users (peak)        | 500 simultaneous                  | Vercel auto-scales; Supabase Pro 250 Realtime connections |

**Mobile-first Constraints:**

- Target device: Android 8.0+, 2GB RAM, Snapdragon 450-class CPU
- Bundle size: JavaScript < 200KB gzipped for initial route
- Images: All served via Next.js `<Image>` with WebP conversion and Cloudflare edge caching
- Fonts: `next/font` with `display: swap`; only 2 font weights loaded (400, 600)
- No layout shift: CLS < 0.1 enforced via explicit image dimensions and skeleton loaders

---

## 8. Security

### 8.1 Row-Level Security (RLS)

- RLS is **enabled on every table** in the `public` schema.
- The `service_role` key is **never exposed** to the client; it is only used in Edge Functions and server-side API routes.
- All client-side Supabase operations use the `anon` key, which has no permissions beyond what RLS policies explicitly allow.

### 8.2 API Rate Limiting

Using Upstash Redis with sliding window algorithm:

```typescript
// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute per IP
  analytics: true,
})

// Stricter limits for auth endpoints (prevent OTP spam)
export const authRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(5, '10 m'), // 5 OTP sends per 10 minutes per IP
})
```

**Per-route limits:**

| Endpoint                          | Limit                  |
| --------------------------------- | ---------------------- |
| `POST /api/v1/auth/send-otp`      | 5 req / 10 min per IP  |
| `POST /api/v1/auth/verify-otp`    | 10 req / 10 min per IP |
| `POST /api/v1/tournaments`        | 10 req / hour per user |
| `POST /api/v1/matches/:id/scores` | 30 req / hour per user |
| `GET /api/v1/*` (read)            | 120 req / min per IP   |

### 8.3 Input Sanitization

- All API request bodies are validated through Zod schemas before any DB operation.
- User-generated text fields (bio, team names) are sanitized with `DOMPurify` on the client and stripped of HTML server-side using a custom `sanitizeHtml()` utility.
- File uploads (avatars, banners) are restricted by MIME type (`image/jpeg`, `image/png`, `image/webp`), max size 5MB, and are scanned with Cloudflare's image optimization pipeline.
- SQL injection is not possible due to Supabase's parameterized query interface (no raw string interpolation into queries).

### 8.4 CORS Policy

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://ffarena.live' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ]
  },
}
```

### 8.5 Additional Security Measures

| Measure                        | Implementation                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| HTTPS everywhere               | Cloudflare Full-Strict TLS; HSTS preload enabled                                       |
| CSP Header                     | `Content-Security-Policy` via Next.js headers; strict-dynamic nonce                    |
| XSS Protection                 | React JSX escaping + DOMPurify for user HTML; `X-XSS-Protection: 1; mode=block`        |
| Clickjacking                   | `X-Frame-Options: DENY` on all pages                                                   |
| Secrets rotation               | All keys rotated every 90 days; Vercel environment variables encrypted at rest         |
| Webhook signature verification | HMAC-SHA256 on all Razorpay webhook payloads                                           |
| PAN data handling              | PAN stored encrypted using `pgcrypto` extension; only displayed masked to users        |
| Audit logging                  | All admin actions written to `audit_logs` table (append-only, no UPDATE/DELETE policy) |

---

## 9. Monitoring & Observability

### 9.1 Vercel Analytics & Speed Insights

- **Web Analytics:** Enabled project-wide. Tracks page views, unique visitors, top countries, device types. Privacy-friendly (no cookies).
- **Speed Insights:** Tracks Core Web Vitals (LCP, FID, CLS) per page per deployment. Alerts configured if LCP degrades > 20% from baseline.
- **Function Logs:** All API route invocations logged with duration, status code, and error payload. Retained for 30 days.

### 9.2 Sentry

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2, // 20% of transactions traced
  profilesSampleRate: 0.1, // 10% profiled
  replaysOnErrorSampleRate: 1.0, // 100% session replay on errors
  replaysSessionSampleRate: 0.05, // 5% general session replay
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
})
```

**Sentry Alerts configured for:**

- Any unhandled exception in production → Slack #alerts-prod + email to on-call engineer
- Error rate > 1% on any API route → PagerDuty
- Payment webhook failures → immediate Slack alert to #payments-alerts

### 9.3 Supabase Dashboard

- **Query Performance:** Supabase pg_stat_statements extension enabled. Slow query log threshold: 500ms.
- **Realtime Connections:** Dashboard tracks active channels and connection counts.
- **Storage Usage:** Monitored monthly; alert if > 80GB (approaching 100GB limit).
- **Auth Metrics:** Daily active users, OTP success/failure rates, OAuth provider breakdown.

### 9.4 UptimeRobot

- External uptime monitoring from 3 global locations every 5 minutes.
- Monitors: `https://ffarena.live`, `https://ffarena.live/api/v1/tournaments` (health check endpoint).
- Incident notifications: SMS + email to admin on-call.

### 9.5 Health Check Endpoint

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase.from('profiles').select('id').limit(1)
  return NextResponse.json(
    {
      status: error ? 'degraded' : 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION,
      db: error ? 'unreachable' : 'connected',
    },
    { status: error ? 503 : 200 }
  )
}
```

---

## 10. Environment Variables

All environment variables are stored in Vercel's encrypted environment variable store and injected at build/runtime. Never committed to the repository.

### 10.1 Supabase

| Variable                        | Scope       | Description                                            |
| ------------------------------- | ----------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Public      | Supabase project URL (`https://<ref>.supabase.co`)     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public      | Supabase anonymous (publishable) key — safe for client |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only | Full DB access key — **never expose to client**        |
| `SUPABASE_JWT_SECRET`           | Server-only | Used to verify Supabase JWTs in custom middleware      |
| `SUPABASE_DB_URL`               | Server-only | Direct PostgreSQL connection string (for migrations)   |

### 10.2 Authentication

| Variable                | Scope       | Description                                           |
| ----------------------- | ----------- | ----------------------------------------------------- |
| `NEXTAUTH_SECRET`       | Server-only | 32-byte random secret for NextAuth.js session signing |
| `NEXTAUTH_URL`          | Server-only | Canonical URL: `https://ffarena.live`                 |
| `GOOGLE_CLIENT_ID`      | Server-only | Google OAuth 2.0 client ID                            |
| `GOOGLE_CLIENT_SECRET`  | Server-only | Google OAuth 2.0 client secret                        |
| `DISCORD_CLIENT_ID`     | Server-only | Discord application client ID                         |
| `DISCORD_CLIENT_SECRET` | Server-only | Discord application client secret                     |

### 10.3 Payments

| Variable                  | Scope             | Description                                                |
| ------------------------- | ----------------- | ---------------------------------------------------------- |
| `RAZORPAY_KEY_ID`         | Public (checkout) | Razorpay publishable key for frontend checkout modal       |
| `RAZORPAY_KEY_SECRET`     | Server-only       | Razorpay secret for order creation and payout API          |
| `RAZORPAY_WEBHOOK_SECRET` | Server-only       | HMAC secret for webhook signature verification             |
| `RAZORPAY_ACCOUNT_NUMBER` | Server-only       | FFArena's Razorpay X business account number (for payouts) |

### 10.4 Messaging & Email

| Variable            | Scope       | Description                               |
| ------------------- | ----------- | ----------------------------------------- |
| `MSG91_AUTH_KEY`    | Server-only | MSG91 API authentication key              |
| `MSG91_TEMPLATE_ID` | Server-only | OTP SMS template ID registered with MSG91 |
| `RESEND_API_KEY`    | Server-only | Resend transactional email API key        |
| `EMAIL_FROM`        | Server-only | Sender address: `noreply@ffarena.live`    |

### 10.5 Infrastructure & Monitoring

| Variable                   | Scope       | Description                                   |
| -------------------------- | ----------- | --------------------------------------------- |
| `UPSTASH_REDIS_REST_URL`   | Server-only | Upstash Redis endpoint for rate limiting      |
| `UPSTASH_REDIS_REST_TOKEN` | Server-only | Upstash Redis auth token                      |
| `NEXT_PUBLIC_SENTRY_DSN`   | Public      | Sentry DSN for client-side error reporting    |
| `SENTRY_AUTH_TOKEN`        | Server-only | Sentry auth token for source map upload in CI |
| `NEXT_PUBLIC_APP_VERSION`  | Public      | Injected by CI: `git rev-parse --short HEAD`  |
| `NEXT_PUBLIC_APP_ENV`      | Public      | `production` / `preview` / `development`      |

### 10.6 `.env.local` Template (Development)

```dotenv
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_DB_URL=postgresql://postgres:password@db.your-ref.supabase.co:5432/postgres

# Auth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Payments (use Razorpay test keys in development)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-test-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
RAZORPAY_ACCOUNT_NUMBER=your-razorpayx-account-number

# Messaging
MSG91_AUTH_KEY=your-msg91-key
MSG91_TEMPLATE_ID=your-template-id
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@ffarena.live

# Infrastructure
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your-sentry-auth-token
NEXT_PUBLIC_APP_VERSION=local-dev
NEXT_PUBLIC_APP_ENV=development
```

---

## 11. Development Setup

### 11.1 Prerequisites

| Tool           | Version     | Install                                              |
| -------------- | ----------- | ---------------------------------------------------- |
| Node.js        | `v20.x LTS` | [nodejs.org](https://nodejs.org) or `nvm install 20` |
| pnpm           | `v9.x`      | `npm install -g pnpm`                                |
| Git            | `v2.40+`    | [git-scm.com](https://git-scm.com)                   |
| Supabase CLI   | `v1.x`      | `npm install -g supabase`                            |
| Docker Desktop | Latest      | Required for local Supabase (PostgreSQL container)   |
| VS Code        | Latest      | Recommended editor                                   |

**Recommended VS Code Extensions:**

- `bradlc.vscode-tailwindcss` — Tailwind CSS IntelliSense
- `dbaeumer.vscode-eslint` — ESLint integration
- `esbenp.prettier-vscode` — Prettier formatter
- `Supabase.supabase-vscode` — Supabase schema viewer
- `GitHub.copilot` — AI code suggestions

### 11.2 Local Setup Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/ffarena.git
cd ffarena

# 2. Install dependencies
pnpm install

# 3. Copy environment variable template
cp .env.example .env.local
# → Fill in all values as described in Section 10.6

# 4. Start local Supabase (requires Docker Desktop running)
supabase start
# This starts: PostgreSQL (port 54322), Studio (port 54323), Auth (port 54321), Storage, Realtime

# 5. Apply database migrations
supabase db push
# Or, to reset from scratch with seed data:
supabase db reset

# 6. Generate TypeScript types from your Supabase schema
pnpm supabase:types
# Runs: supabase gen types typescript --local > src/types/supabase.ts

# 7. Seed development data (optional but recommended)
pnpm db:seed
# Creates: 5 sample tournaments, 20 players, 8 teams, 3 sponsors

# 8. Start the Next.js development server
pnpm dev
# App available at:      http://localhost:3000
# Supabase Studio at:    http://localhost:54323
# Supabase API at:       http://localhost:54321
```

### 11.3 Available Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint && tsc --noEmit",
    "format": "prettier --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "supabase:types": "supabase gen types typescript --local > src/types/supabase.ts",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "db:seed": "tsx scripts/seed.ts",
    "db:reset": "supabase db reset"
  }
}
```

### 11.4 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI / CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm tsc --noEmit

  unit-tests:
    runs-on: ubuntu-latest
    needs: lint-and-type-check
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm test

  lighthouse-ci:
    runs-on: ubuntu-latest
    needs: unit-tests
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile && pnpm build
      - uses: treosh/lighthouse-ci-action@v11
        with:
          budgetPath: ./.lighthouserc.json
          uploadArtifacts: true

  deploy:
    runs-on: ubuntu-latest
    needs: [unit-tests]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 11.5 Database Migration Workflow

```bash
# Create a new migration file
supabase migration new add_dispute_table

# Edit: supabase/migrations/<timestamp>_add_dispute_table.sql
# Add SQL DDL/DML statements

# Apply locally and verify
supabase db reset

# Push to Supabase cloud staging
supabase db push --db-url "$STAGING_DB_URL"

# After QA sign-off, push to production (requires GitHub Actions manual approval gate)
supabase db push --db-url "$PRODUCTION_DB_URL"
```

### 11.6 Branching & PR Convention

| Branch                       | Purpose                       | Deploy Target                                   |
| ---------------------------- | ----------------------------- | ----------------------------------------------- |
| `main`                       | Production-ready code         | `ffarena.live` (Vercel Production)              |
| `develop`                    | Integration branch            | `dev.ffarena.live` (Vercel Preview)             |
| `feature/<ticket-id>-<slug>` | Individual feature work       | Ephemeral Vercel Preview URL                    |
| `hotfix/<slug>`              | Critical production bug fixes | Merges directly to `main` with expedited review |
| `chore/<slug>`               | Tooling, dependency updates   | Standard PR flow through `develop`              |

**PR Requirements before merge to `main`:**

- [ ] All CI checks pass (lint, types, tests, Lighthouse budget)
- [ ] At least 1 peer code review approval
- [ ] Supabase migration reviewed by tech lead (if DB changes present)
- [ ] Environment variables documented if new ones added
- [ ] Linked GitHub issue resolved

---

## Appendix A: Supported Games

| Game ID      | Display Name               | Mode               | Score Format             |
| ------------ | -------------------------- | ------------------ | ------------------------ |
| `FREE_FIRE`  | Garena Free Fire           | Battle Royale      | Kills + Placement points |
| `BGMI`       | Battlegrounds Mobile India | Battle Royale      | Kills + Placement points |
| `VALORANT`   | Valorant                   | 5v5 FPS            | Rounds won               |
| `COD_MOBILE` | Call of Duty Mobile        | Battle Royale / MP | Kills / Rounds           |
| `CHESS`      | Chess.com Online           | 1v1                | ELO / W-D-L              |

---

## Appendix B: Tournament Status State Machine

```
DRAFT → REGISTRATION_OPEN → REGISTRATION_CLOSED → IN_PROGRESS → COMPLETED → ARCHIVED
              ↓                                                        ↑
         CANCELLED ←─────────────────────────────────────────────────┘
         (at any point before COMPLETED, by ADMIN or ORGANIZER)
```

---

## Appendix C: Error Code Reference

| Code                     | HTTP Status | Meaning                                                     |
| ------------------------ | ----------- | ----------------------------------------------------------- |
| `AUTH_REQUIRED`          | 401         | Missing or invalid JWT                                      |
| `FORBIDDEN`              | 403         | Insufficient role for this action                           |
| `NOT_FOUND`              | 404         | Resource does not exist                                     |
| `VALIDATION_ERROR`       | 422         | Zod schema violation; `details` contains field-level errors |
| `RATE_LIMITED`           | 429         | Too many requests from this IP/user                         |
| `PAYMENT_FAILED`         | 402         | Razorpay order creation or payout failed                    |
| `DB_ERROR`               | 500         | Supabase query error (logged to Sentry)                     |
| `WEBHOOK_INVALID`        | 400         | Webhook HMAC signature mismatch                             |
| `TEAM_FULL`              | 409         | Team already at maximum roster capacity                     |
| `DUPLICATE_REGISTRATION` | 409         | Team already registered for this tournament                 |

---

_This document is the authoritative engineering reference for FFArena. All implementation decisions not covered here must be documented as a Decision Record (DR) in `/docs/decisions/` and linked from this document._

_For questions, contact the platform engineering team at **engineering@ffarena.live**._
