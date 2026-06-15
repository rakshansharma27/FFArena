# FFArena — Project Rules & Conventions

> **Version:** 1.0.0  
> **Last Updated:** 2026-06-12  
> **Project:** FFArena (ffarena.live) — India's Grassroots Esports Infrastructure Platform  
> **Stack:** Next.js · Supabase · Tailwind CSS · TypeScript · Vercel · Cloudflare

These rules are **non-negotiable** for all contributors, AI coding assistants, and automated pipelines. Every line of code merged into `main` must comply with the standards defined here. When in doubt, consult this document first — then ask a human.

---

## Table of Contents

1. [General Philosophy](#1-general-philosophy)
2. [Project Structure Rules](#2-project-structure-rules)
3. [TypeScript Rules](#3-typescript-rules)
4. [React & Next.js Rules](#4-react--nextjs-rules)
5. [Styling Rules (Tailwind CSS)](#5-styling-rules-tailwind-css)
6. [Supabase Rules](#6-supabase-rules)
7. [API Design Rules](#7-api-design-rules)
8. [Git Rules](#8-git-rules)
9. [Security Rules](#9-security-rules)
10. [Performance Rules](#10-performance-rules)
11. [Testing Rules](#11-testing-rules)
12. [Accessibility Rules](#12-accessibility-rules)
13. [India-Specific Rules](#13-india-specific-rules)
14. [Deployment Rules](#14-deployment-rules)

---

## 1. General Philosophy

### 1.1 Core Code Principles

| Principle                                | Meaning for FFArena                                                                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Clarity > Cleverness**                 | A junior dev reviewing code at 2 AM during a live tournament should understand it immediately. No over-engineered abstractions.        |
| **Mobile-First**                         | The median FFArena user is on a ₹8,000 Android phone with Jio 4G. Every UI decision must start with the 320px viewport.                |
| **India-First**                          | UPI, INR, TDS, Hindi readiness, low-bandwidth assumptions, and IST timezone are not afterthoughts — they are first-class requirements. |
| **Boring Technology**                    | Prefer established, well-documented libraries (Next.js, Supabase, Tailwind) over experimental ones. Stable > trendy.                   |
| **Fail Loudly in Dev, Silently in Prod** | Throw hard errors locally. In production, log errors to the audit system and show user-friendly messages.                              |

### 1.2 AI Coding Assistant Guidelines (Cursor / GitHub Copilot)

If you are using an AI assistant to generate code for this project, the following rules apply:

- **Always review AI-generated code line by line** before committing. AI assistants do not know about FFArena's business logic, RLS policies, or TDS requirements.
- **Never accept AI suggestions for:**
  - Any Supabase query that touches `prize_payouts`, `audit_logs`, `kyc_verifications`, or `wallets`.
  - Any authentication or session-handling logic.
  - Any database migration file.
- **Always prompt AI with context:** Include the relevant TypeScript type, the Supabase table schema, and the expected response shape when asking for help with data-fetching code.
- **AI-generated test cases are allowed** but must be manually verified for correctness against actual tournament rules (ELO, TDS, bracket seeding).
- **Do not use AI to write `.env` files, secrets, or API keys** under any circumstance.

### 1.3 Definition of Good Code for FFArena

A piece of code is considered "good" for this project when it satisfies **all** of the following:

1. **Typed end-to-end** — Every input, output, API response, and DB query result is TypeScript-typed with no `any`.
2. **RLS-aware** — The developer has consciously thought about which Supabase Row Level Security policy governs this data access.
3. **Mobile-performant** — The UI it produces has no CLS (Cumulative Layout Shift) > 0.1, no LCP > 2.5s on a mid-range Android device on 4G.
4. **Auditable** — Any action involving money (prize entry fees, payouts, TDS) writes to `audit_logs` before returning a success response.
5. **Readable without context** — A new contributor joining the team can understand the intent of the function without needing to ask anyone.

---

## 2. Project Structure Rules

### 2.1 Top-Level Directory Layout

```
ffarena/
├── app/                        # Next.js App Router pages & layouts
│   ├── (auth)/                 # Route group: unauthenticated pages
│   ├── (dashboard)/            # Route group: authenticated pages
│   ├── (marketing)/            # Route group: public landing pages
│   ├── api/                    # Next.js API routes (Route Handlers)
│   └── layout.tsx              # Root layout
├── components/
│   ├── ui/                     # Primitive UI components (Button, Input, Modal)
│   ├── features/               # Feature-specific compound components
│   │   ├── tournament/
│   │   ├── leaderboard/
│   │   ├── wallet/
│   │   └── profile/
│   └── shared/                 # Shared composite components (Navbar, Footer)
├── lib/
│   ├── supabase/               # Supabase client factories & typed helpers
│   ├── validations/            # All Zod schemas (co-located by domain)
│   ├── utils/                  # Pure utility functions (formatting, math)
│   ├── hooks/                  # Custom React hooks (use prefix)
│   ├── actions/                # Next.js Server Actions
│   └── constants/              # App-wide constants (no magic numbers in code)
├── types/
│   ├── database.types.ts       # Auto-generated Supabase types (DO NOT HAND-EDIT)
│   ├── api.types.ts            # API request/response types
│   └── domain.types.ts         # Domain model types (Tournament, Player, etc.)
├── public/                     # Static assets
│   ├── icons/
│   └── images/
├── styles/
│   └── globals.css             # Global CSS, CSS variables, Tailwind base
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── supabase/
│   ├── migrations/             # SQL migration files (numbered, sequential)
│   ├── functions/              # Supabase Edge Functions
│   └── seed.sql                # Local development seed data
└── docs/                       # Project documentation (PRD, architecture)
```

### 2.2 Folder Naming Conventions

- All folders: **kebab-case** (e.g., `prize-pool/`, `match-history/`, `kyc-verification/`).
- Route groups in App Router: wrapped in parentheses, kebab-case: `(auth)`, `(dashboard)`.
- Dynamic route segments: `[tournamentId]`, `[playerId]` — use **camelCase** inside brackets.
- Never use underscores in folder names. Never use spaces.

### 2.3 File Naming Conventions

| File Type               | Convention                                           | Example                   |
| ----------------------- | ---------------------------------------------------- | ------------------------- |
| React Components        | `PascalCase.tsx`                                     | `TournamentCard.tsx`      |
| Page files (App Router) | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` | `page.tsx`                |
| Hooks                   | `use-kebab-case.ts`                                  | `use-tournament-data.ts`  |
| Utility functions       | `kebab-case.ts`                                      | `format-currency.ts`      |
| Zod schemas             | `kebab-case.schema.ts`                               | `tournament.schema.ts`    |
| Server Actions          | `kebab-case.actions.ts`                              | `payout.actions.ts`       |
| Test files              | `*.test.ts` / `*.test.tsx`                           | `elo-calculator.test.ts`  |
| Type files              | `kebab-case.types.ts`                                | `tournament.types.ts`     |
| Constants               | `kebab-case.constants.ts`                            | `tournament.constants.ts` |

### 2.4 Import Order Convention

Imports must follow this strict order, with a blank line between each group:

```typescript
// 1. Node built-ins (rare in this project)
import path from 'path'

// 2. External packages
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// 3. Next.js internals
import { notFound } from 'next/navigation'
import Image from 'next/image'

// 4. Internal absolute imports (using @/ alias)
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils/format-currency'

// 5. Internal relative imports (siblings, children only — never traverse up more than 1 level)
import { TournamentCard } from './TournamentCard'

// 6. Types (always last, using `import type`)
import type { Tournament } from '@/types/domain.types'
```

Use `eslint-plugin-import` with `import/order` rule to enforce this automatically.

### 2.5 Barrel Exports (`index.ts`)

- Every `components/ui/`, `components/features/<feature>/`, and `lib/utils/` directory **must** have an `index.ts` barrel file.
- Barrel files export only what is intended to be public API for that module.
- Do **not** create barrel files inside `app/` — Next.js App Router handles its own exports.
- Do **not** re-export types through barrels that already export values — use explicit `export type` where needed.

```typescript
// components/ui/index.ts — correct
export { Button } from './Button'
export { Input } from './Input'
export type { ButtonProps } from './Button'
```

---

## 3. TypeScript Rules

### 3.1 Compiler Configuration

- **Strict mode is always enabled.** `"strict": true` in `tsconfig.json` is permanent and non-negotiable.
- Additional flags that must be enabled: `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`.
- `skipLibCheck` may be `true` only to handle third-party library issues — never to skip our own types.

### 3.2 No `any` Types

- **`any` is banned.** ESLint rule `@typescript-eslint/no-explicit-any` is set to `error`.
- Use `unknown` for values of truly unknown shape, then narrow with type guards or Zod parsing.
- Use `never` to mark exhaustive checks in switch statements and discriminated unions.
- Exception: type assertions (`as SomeType`) are permitted only when casting from a Supabase auto-generated type to a domain type, and must include a comment explaining why.

```typescript
// ❌ Banned
function processResult(data: any) { ... }

// ✅ Correct
function processResult(data: unknown) {
  const parsed = tournamentSchema.parse(data); // narrows via Zod
  ...
}
```

### 3.3 Interface vs Type

| Use `interface` for...                                                    | Use `type` for...                                          |
| ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Object shapes that may be extended (e.g., component props, domain models) | Union types, intersection types, mapped types, tuple types |
| Supabase Row types when adding computed fields                            | Function signatures as standalone aliases                  |
| Any shape that another interface might `extend`                           | Utility type aliases (`type TournamentId = string`)        |

```typescript
// ✅ Props → interface
interface TournamentCardProps {
  tournament: Tournament
  onRegister: (id: string) => void
}

// ✅ Union → type
type TournamentStatus = 'upcoming' | 'live' | 'completed' | 'cancelled'

// ✅ Function → type
type FormatCurrency = (amount: number, currency?: string) => string
```

### 3.4 Enum Usage

- **Native TypeScript `enum` is banned.** It produces runtime objects and has surprising semantics.
- Use **`const` object + `as const` + a derived union type** instead:

```typescript
// ❌ Banned
enum TournamentFormat {
  BR,
  TDM,
  CS,
}

// ✅ Correct
const TOURNAMENT_FORMAT = {
  BR: 'battle_royale',
  TDM: 'team_deathmatch',
  CS: 'clash_squad',
} as const

type TournamentFormat = (typeof TOURNAMENT_FORMAT)[keyof typeof TOURNAMENT_FORMAT]
// => 'battle_royale' | 'team_deathmatch' | 'clash_squad'
```

- Keep all such constants in `lib/constants/` — never define them inline in components.

### 3.5 API Response Typing

- Every function that calls `fetch()`, a Supabase query, or a Server Action **must** have an explicit return type annotation.
- All Supabase auto-generated types live in `types/database.types.ts`. Do not copy-paste table shapes manually.
- Regenerate `database.types.ts` after every migration using: `supabase gen types typescript`.

### 3.6 Zod Schemas for All External Data

- Every piece of data crossing a trust boundary (form submission, API response, URL params, cookie values) **must** be parsed with a Zod schema before use.
- Schemas live in `lib/validations/` and are named `<domain>.schema.ts`.
- Always use `.parse()` inside try-catch or `.safeParse()` + check `.success` — never assume external data matches the schema.
- Infer TypeScript types from Zod schemas: `type TournamentInput = z.infer<typeof tournamentInputSchema>`.

---

## 4. React & Next.js Rules

### 4.1 Server Components vs Client Components

**Default to Server Components.** Add `'use client'` only when the component requires:

- Browser-only APIs (`window`, `localStorage`, `navigator`)
- React hooks (`useState`, `useEffect`, `useRef`, `useContext`)
- Event listeners or interactive UI state

| Server Component                    | Client Component                            |
| ----------------------------------- | ------------------------------------------- |
| Tournament list page (fetches data) | Tournament registration button (form state) |
| Player profile display              | Live scoreboard (WebSocket/Realtime)        |
| Leaderboard table                   | Match filter dropdown                       |
| Static marketing pages              | Prize wallet balance display                |

**Push `'use client'` as far down the component tree as possible.** A page should be a Server Component wrapping a small Client Component island — not the other way around.

### 4.2 No `useEffect` for Data Fetching

- **Never use `useEffect` + `fetch` to load data.** This was a React 17 pattern and is deprecated for this project.
- **Server Components:** Use `async/await` directly in the component body. This is the default.
- **Client-side dynamic data** (e.g., live match scores, wallet balance): Use **TanStack Query** (`useQuery`, `useMutation`).
- `useEffect` is permitted only for: DOM side effects, third-party SDK initialization (Razorpay, Firebase), and cleanup operations.

### 4.3 Component Structure

Every component file must follow this internal structure order:

```typescript
// 1. Imports
// 2. Types / Interfaces
// 3. Constants local to this file (if any)
// 4. The component function (named, never default arrow function at module level)
// 5. Sub-components (if co-located, clearly separated)
// 6. Default export at the very bottom
```

- Components must be **named function declarations** or **named arrow functions assigned to a const**, not anonymous default exports.
- Maximum component length: **150 lines**. If longer, extract sub-components or custom hooks.

```typescript
// ❌ Banned
export default function ({ title }: { title: string }) { ... }
export default () => { ... }

// ✅ Correct
export function TournamentCard({ title }: TournamentCardProps) { ... }
export default TournamentCard;
```

### 4.4 Props Interface Naming

Props interfaces are always named `<ComponentName>Props`:

```typescript
interface TournamentCardProps { ... }
interface PrizePoolBadgeProps { ... }
interface RegisterButtonProps { ... }
```

### 4.5 Event Handler Naming

- All event handlers must use the `handle` prefix: `handleClick`, `handleSubmit`, `handleRegister`, `handlePayout`.
- Props that accept event handlers must use the `on` prefix: `onClick`, `onSubmit`, `onRegister`, `onPayout`.

```typescript
// Inside a parent component
function handleTournamentRegister(id: string) { ... }

// Passed as prop
<RegisterButton onRegister={handleTournamentRegister} />

// Inside RegisterButton
function RegisterButton({ onRegister }: RegisterButtonProps) {
  function handleClick() { onRegister(tournamentId); }
  return <button onClick={handleClick}>Register</button>;
}
```

### 4.6 Custom Hooks Naming

- All custom hooks must start with `use`: `useTournamentData`, `useWalletBalance`, `useEloRating`.
- Custom hooks that wrap TanStack Query must follow: `use<Resource><Action>`: `useTournamentsList`, `usePlayerProfile`, `usePayoutMutation`.
- Hook files: `lib/hooks/use-<kebab-case>.ts`.

### 4.7 List Rendering and Keys

- **Never use array index as `key`** unless the list is static and never reordered.
- Use the database row ID (UUID) as the `key` for all Supabase-sourced lists.
- Always declare keys on the outermost element of the mapped JSX.

### 4.8 Error Boundaries

- Every route segment (`app/**/page.tsx`) must have a sibling `error.tsx` that is a Client Component.
- `error.tsx` must display a user-friendly message in plain English (and optionally Hindi), a retry button, and log the error to Sentry (or console in dev).
- Never show stack traces, SQL errors, or internal error codes to the user.

### 4.9 Suspense Boundaries

- Every async Server Component that fetches data must be wrapped in a `<Suspense fallback={<Skeleton />}>` at the page level.
- Skeleton components must match the shape of the loaded content (no generic spinners for primary content areas).
- Use `loading.tsx` at the route segment level for page-level loading states.

---

## 5. Styling Rules (Tailwind CSS)

### 5.1 No Inline Styles

- `style={{ ... }}` is banned except for: dynamic CSS custom property values (e.g., `style={{ '--progress': `${pct}%` }}`).
- Use Tailwind utility classes or CSS variables for all styling.

### 5.2 CSS Variables for Theme Tokens

Define all design tokens as CSS custom properties in `styles/globals.css`:

```css
:root {
  --color-primary: #ff6b00; /* FFArena orange */
  --color-primary-dark: #e55a00;
  --color-surface: #0f0f0f; /* Dark background */
  --color-surface-elevated: #1a1a1a;
  --color-text-primary: #ffffff;
  --color-text-secondary: #a0a0a0;
  --color-success: #22c55e;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  --radius-card: 12px;
  --radius-button: 8px;
}
```

Reference these in Tailwind config via `extend.colors` so they are available as utility classes.

### 5.3 Component Variants via `cva()`

Use `class-variance-authority` for all components that have multiple visual variants. Never conditionally concatenate class strings with template literals.

```typescript
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2',
  {
    variants: {
      variant: {
        primary: 'bg-[--color-primary] text-white hover:bg-[--color-primary-dark]',
        ghost: 'bg-transparent text-[--color-text-primary] hover:bg-white/10',
        danger: 'bg-[--color-danger] text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-base',
        lg: 'h-14 px-8 text-lg min-w-[44px] min-h-[44px]', // touch-safe
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)
```

### 5.4 Responsive Prefix Order

Always write responsive prefixes in ascending breakpoint order. Linters should enforce this.

```tsx
// ✅ Correct — mobile first, then scale up
<div className="text-sm md:text-base lg:text-lg">

// ❌ Wrong order
<div className="lg:text-lg text-sm md:text-base">
```

### 5.5 Dark Mode Strategy

- FFArena is a **dark-mode-first** application. The default theme is dark.
- Use Tailwind's `class` dark mode strategy (`darkMode: 'class'` in `tailwind.config.ts`).
- The `dark` class is always applied to `<html>` by default. Light mode is a future feature — do not implement it now, but do not hardcode colors that would break it.
- Never use Tailwind's `dark:` prefix for the primary dark styles — those are the default. Use `light:` (custom) only when a light mode is explicitly added.

### 5.6 Arbitrary Values Policy

- Arbitrary Tailwind values (`w-[347px]`, `text-[13.5px]`) are **banned** unless the value comes directly from a design spec and cannot be expressed with any existing token.
- When you must use an arbitrary value, add a comment above the element explaining the source.
- Always prefer CSS variables over arbitrary values for repeated custom values.

---

## 6. Supabase Rules

### 6.1 Always Use the Typed Client

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

export function createSupabaseServerClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { ... } }
  );
}
```

The `Database` generic type parameter is **mandatory** on every client instantiation. Raw untyped `createClient()` calls are banned in application code.

### 6.2 Never Expose the Service Role Key to the Client

- `SUPABASE_SERVICE_ROLE_KEY` must **never** appear in any file that is imported by a Client Component or shipped to the browser.
- Service role operations (admin-level queries, bypassing RLS) are allowed only in:
  - Supabase Edge Functions (server-side, Deno runtime)
  - Next.js Server Actions tagged `'use server'`
  - Next.js API Route Handlers under `app/api/`
- Accessing the service role key in a file without `'use server'` or in a client bundle is a **critical security violation**.

### 6.3 Mutations Must Go Through Server Actions or API Routes

- No Supabase `.insert()`, `.update()`, `.delete()`, or `.upsert()` calls in Client Components.
- Client Components call a Server Action (or API route), which then performs the Supabase mutation server-side.
- This ensures: auth token is validated server-side, RLS is enforced, audit logging can be added, and no service role key leaks.

### 6.4 Row Level Security (RLS) Requirements

- **RLS must be enabled on every table** before the table is deployed to production.
- Every new migration that creates a table must include the corresponding `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` statement and at minimum one policy.
- RLS policies must be reviewed in every PR that adds or modifies a table.
- The CI pipeline must include a check that no table in the production schema has RLS disabled.
- Tables that require service role bypass (e.g., `audit_logs` which users should never write directly) must have RLS enabled with **no permissive policies for authenticated/anon users** — only service role access.

### 6.5 Query Column Selection

- Never use `select('*')` in production code. Always explicitly list the columns your component needs.
- This reduces payload size, prevents over-fetching sensitive columns (e.g., `kyc_pan_number`), and makes queries self-documenting.

```typescript
// ❌ Banned in production
const { data } = await supabase.from('tournaments').select('*')

// ✅ Correct
const { data } = await supabase
  .from('tournaments')
  .select('id, name, status, prize_pool_inr, start_at, max_teams')
```

### 6.6 Supabase Edge Functions for Sensitive Operations

The following operations **must** be implemented as Supabase Edge Functions, not as Next.js API routes:

| Operation                        | Edge Function Name  | Reason                                                       |
| -------------------------------- | ------------------- | ------------------------------------------------------------ |
| Prize pool payout disbursement   | `disburse-prize`    | Requires service role; must be audited; rate-limited at edge |
| TDS certificate generation       | `generate-tds-cert` | Sensitive financial data                                     |
| KYC verification webhook handler | `kyc-webhook`       | Third-party webhook must be validated with HMAC              |
| ELO recalculation batch job      | `recalculate-elo`   | CPU-bound, should not block Next.js server                   |

---

## 7. API Design Rules

### 7.1 RESTful URL Conventions

```
GET    /api/tournaments                    → List tournaments
POST   /api/tournaments                    → Create tournament
GET    /api/tournaments/[id]               → Get single tournament
PATCH  /api/tournaments/[id]               → Update tournament (partial)
DELETE /api/tournaments/[id]               → Delete tournament

GET    /api/tournaments/[id]/registrations → List registrations for tournament
POST   /api/tournaments/[id]/registrations → Register a team

POST   /api/payouts                        → Initiate payout
GET    /api/payouts/[id]/status            → Check payout status
```

- Resource names are always **plural nouns**.
- Use `PATCH` for partial updates, `PUT` only for full replacement (rarely needed).
- Nested resources are allowed up to one level of nesting: `/api/tournaments/[id]/registrations`. Never go deeper.

### 7.2 Consistent Response Shape

Every API route must return a response matching this shape:

```typescript
// Success response
{
  data: T,          // The actual response payload
  error: null,
  meta: {           // Optional, for paginated lists
    page: number,
    pageSize: number,
    total: number,
    hasMore: boolean
  }
}

// Error response
{
  data: null,
  error: {
    code: string,       // Machine-readable: 'TOURNAMENT_NOT_FOUND', 'INSUFFICIENT_BALANCE'
    message: string,    // Human-readable, safe to display to user
    field?: string      // For validation errors: the field that failed
  },
  meta: null
}
```

Define these shapes in `types/api.types.ts` and create a typed `apiResponse()` helper in `lib/utils/api-response.ts`.

### 7.3 HTTP Status Codes

| Situation                         | Status Code               |
| --------------------------------- | ------------------------- |
| Success (read)                    | 200 OK                    |
| Success (created)                 | 201 Created               |
| Success (no content)              | 204 No Content            |
| Validation error                  | 400 Bad Request           |
| Unauthenticated                   | 401 Unauthorized          |
| Authorized but forbidden          | 403 Forbidden             |
| Resource not found                | 404 Not Found             |
| Conflict (duplicate registration) | 409 Conflict              |
| Rate limited                      | 429 Too Many Requests     |
| Server error                      | 500 Internal Server Error |

### 7.4 Input Validation

- Every `POST`, `PATCH`, `PUT` endpoint must validate its request body with a Zod schema before any business logic runs.
- URL parameters (`[id]`) must be validated as a valid UUID format using Zod.
- Query parameters must be parsed and validated with Zod (use `z.coerce.number()` for pagination params).
- Return a `400` with the specific Zod validation error if parsing fails.

### 7.5 Rate Limiting

- All public endpoints (unauthenticated) are rate-limited to **30 requests / minute per IP**.
- Authenticated endpoints: **120 requests / minute per user**.
- Payout endpoints: **5 requests / minute per user**.
- Implement rate limiting at the Cloudflare WAF level for DDoS protection, and at the Next.js middleware level for application-level logic.

### 7.6 Error Message Safety

- Never include SQL error messages, stack traces, Supabase error details, or internal service names in API responses.
- Log the full internal error to the server console / Sentry.
- Return only the sanitized `error.message` string and a machine-readable `error.code` to the client.

---

## 8. Git Rules

### 8.1 Branch Naming

```
feat/tournament-bracket-generation
feat/upi-payout-integration
fix/elo-calculation-draws
fix/mobile-nav-overflow
chore/update-supabase-types
chore/upgrade-nextjs-15
docs/supabase-rls-policies
refactor/wallet-service-extraction
hotfix/prize-payout-double-spend
```

- Always branch from `main` (or `dev` if a dev branch is maintained).
- Delete branches after merging.
- Branch names must be all lowercase, using hyphens as separators.

### 8.2 Commit Message Format — Conventional Commits

```
<type>(<scope>): <short description in imperative mood>

[Optional body: explain WHY, not WHAT]

[Optional footer: Refs #issue, BREAKING CHANGE: ...]
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `style`, `revert`

**Scopes:** `tournament`, `wallet`, `auth`, `leaderboard`, `payout`, `kyc`, `elo`, `bracket`, `api`, `db`, `ui`

```
# ✅ Good commits
feat(tournament): add double-elimination bracket generation
fix(payout): prevent duplicate disbursal on network retry
chore(db): regenerate supabase types after migration 0014
perf(leaderboard): add composite index on player_id + season_id
docs(rls): document prize_payouts row level security policy

# ❌ Bad commits
"fixed stuff"
"WIP"
"update"
"tournament changes"
```

### 8.3 Branch Protection Rules

- **No direct commits to `main`** — enforced by GitHub branch protection rules.
- All changes to `main` must go through a Pull Request.
- Required: at least 1 approving review from a human team member before merge.
- Required: all CI checks must pass (type check, lint, tests, build).
- **Squash merge** all PRs — keep `main` history linear and clean.
- Each squash commit message must follow the Conventional Commits format.

### 8.4 Release Tagging

- Tag releases on `main` with semantic versioning: `v1.0.0`, `v1.1.0`, `v2.0.0`.
- Patch: `v1.0.x` — bug fixes only.
- Minor: `v1.x.0` — new features, backward compatible.
- Major: `vX.0.0` — breaking changes (rare; requires team discussion).
- Use `git tag -a v1.0.0 -m "Release v1.0.0: description"`.

---

## 9. Security Rules

### 9.1 Secret Management

- **Never commit secrets, API keys, or passwords to Git.** This includes: Supabase service role key, Razorpay API keys, UPI gateway credentials, Sentry DSN, internal webhook secrets.
- All secrets are stored in `.env.local` (gitignored). Never in `.env`, `.env.development`, or `.env.production` (these may be committed by accident).
- Production secrets are stored in **Vercel Environment Variables** (not `.env.local`) under the Production environment only.
- `.gitignore` must always include: `.env*`, `!.env.example`. The `.env.example` file (with placeholder values, no real secrets) is committed to document required variables.

### 9.2 Input Sanitization

- All user-generated text content (player names, team names, tournament descriptions) must be sanitized before storage and before rendering.
- Use `DOMPurify` when rendering HTML from user input. If a field will never need HTML rendering, store and display as plain text.
- `dangerouslySetInnerHTML` is **banned** without explicit DOMPurify sanitization immediately prior to use. Add a comment when used explaining the sanitization.
- `eval()` is **permanently banned** with zero exceptions.
- SQL injection is prevented by always using Supabase's parameterized query builder — never construct raw SQL strings with user input.

### 9.3 Authentication & Authorization

- Every Server Action and API route that accesses user-specific data must verify the session using `supabase.auth.getUser()` — not `getSession()` (which reads from cookie and can be spoofed).
- Role checks (e.g., "is this user a tournament organizer?") must be performed server-side by querying the `user_roles` table — never trust role information sent from the client.
- JWT expiry is set to 1 hour. Refresh tokens are valid for 30 days.

### 9.4 Prize Payout Security

This is FFArena's highest-risk operation:

- **Rate limit:** Maximum 5 payout initiation requests per user per minute, 3 per hour.
- **Double-spend prevention:** Payout record must be created with status `pending` in an atomic transaction before calling the UPI gateway. If the record already exists for the same `match_id + player_id`, return a 409 Conflict.
- **Audit log:** Every payout attempt (successful or failed) must write a row to `audit_logs` with: `user_id`, `amount_inr`, `tds_deducted_inr`, `net_payout_inr`, `upi_id`, `gateway_reference`, `status`, `created_at`, `ip_address`.
- **KYC gate:** No payout can be initiated unless `kyc_verifications.status = 'approved'` for that user.
- **TDS gate:** TDS must be calculated and confirmed by the user in the UI before the payout API is called. The confirmed TDS amount is sent in the request body and validated server-side against the calculated value.

### 9.5 Content Security Policy

Set the following headers via `next.config.ts` or Cloudflare:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 10. Performance Rules

### 10.1 Images

- All images must use `next/image`. Native `<img>` tags are banned except in SVG-based components.
- Always provide `width` and `height` props (or `fill` with a sized parent) to eliminate CLS.
- Use `priority` prop only for images that are above the fold (LCP candidates).
- All user-uploaded images (avatars, team logos) are stored in Supabase Storage and served through Cloudflare CDN with a 30-day cache TTL.
- Maximum avatar size: 512×512px, max file size: 200KB. Enforce this in the upload Server Action.

### 10.2 Fonts

- All fonts must use `next/font`. No Google Fonts `<link>` tags in HTML.
- Font files must be self-hosted (next/font/google handles this automatically at build time).
- FFArena uses: **Inter** (UI text), **Rajdhani** (display/headings, esports aesthetic), both loaded via `next/font/google`.

### 10.3 Web Vitals Targets

| Metric                                | Target          | Rationale                |
| ------------------------------------- | --------------- | ------------------------ |
| LCP (Largest Contentful Paint)        | < 2.5s          | 4G mobile India          |
| FID / INP (Interaction to Next Paint) | < 200ms         | Fast UI response         |
| CLS (Cumulative Layout Shift)         | < 0.1           | No jumping layouts       |
| TTFB (Time to First Byte)             | < 600ms         | Vercel Edge + Cloudflare |
| Bundle size (JS, gzipped)             | < 150KB initial | Low-end devices          |

### 10.4 Component Loading Strategy

- All components below the fold must be lazily loaded using `next/dynamic` with a skeleton fallback.
- Heavy third-party libraries (Lottie animations, charting libraries) must be dynamically imported.
- Never import a library at the top level if it is only used in a modal or a rarely-visited tab.

### 10.5 Database Query Performance

- All list endpoints must be paginated. **Maximum page size: 20 items.** Never return unbounded lists.
- All `ORDER BY` columns must be indexed.
- All foreign key columns must be indexed.
- Before every deployment, run `EXPLAIN ANALYZE` on the 5 most frequent queries (leaderboard, tournament list, match history, payout status, profile) and confirm sequential scans are not occurring on large tables.
- Use Supabase's built-in `select()` column projection — never fetch columns that are not rendered.

### 10.6 Low-Bandwidth Considerations

- No auto-playing videos anywhere in the application.
- No GIF animations larger than 200KB. Prefer CSS animations or Lottie JSON for micro-animations.
- WebP format required for all raster images. PNG/JPG allowed only when WebP is not supported by the source.
- Do not load analytics scripts (Google Analytics, etc.) in the initial page load — defer them to `afterInteractive` strategy using `next/script`.

---

## 11. Testing Rules

### 11.1 What Must Be Unit Tested

The following modules have 100% unit test coverage requirement (no exceptions):

| Module                     | File                              | Test File                               |
| -------------------------- | --------------------------------- | --------------------------------------- |
| ELO rating calculator      | `lib/utils/elo-calculator.ts`     | `tests/unit/elo-calculator.test.ts`     |
| TDS deduction calculator   | `lib/utils/tds-calculator.ts`     | `tests/unit/tds-calculator.test.ts`     |
| Bracket generation (SE/DE) | `lib/utils/bracket-generator.ts`  | `tests/unit/bracket-generator.test.ts`  |
| Prize pool distribution    | `lib/utils/prize-distribution.ts` | `tests/unit/prize-distribution.test.ts` |
| UPI ID validator           | `lib/utils/upi-validator.ts`      | `tests/unit/upi-validator.test.ts`      |
| INR formatter              | `lib/utils/format-currency.ts`    | `tests/unit/format-currency.test.ts`    |

### 11.2 Integration Tests Required

The following flows must have integration tests that run against a local Supabase instance:

- Tournament creation → team registration → bracket generation → result submission → ELO update.
- Prize pool contribution → match completion → TDS calculation → payout initiation → audit log write.
- User signup → KYC submission → KYC approval → first payout unlock.

### 11.3 Testing Framework & Configuration

- **Framework:** Vitest (fast, native ESM, compatible with Next.js).
- **Database:** Integration tests run against a local Supabase instance started with `supabase start`. Never run integration tests against the production or staging Supabase project.
- **Fixtures:** Test fixtures (mock tournaments, players, matches) live in `tests/fixtures/`. Do not hardcode fixture data inline in test files.
- **Mocking:** Use Vitest's built-in mocking for third-party services (Razorpay, UPI gateway). Never make real network calls in unit tests.

### 11.4 Coverage Requirements

| Scope                           | Minimum Coverage                |
| ------------------------------- | ------------------------------- |
| `lib/utils/`                    | 100%                            |
| `lib/actions/` (Server Actions) | 80%                             |
| `app/api/` (Route Handlers)     | 80%                             |
| `components/ui/`                | 60% (snapshot tests acceptable) |
| `components/features/`          | 50%                             |

---

## 12. Accessibility Rules

### 12.1 Interactive Elements

- Every interactive element (button, link, input, select, toggle) must have an accessible name, either from its visible text content or from an `aria-label` / `aria-labelledby`.
- Icon-only buttons must have `aria-label` describing the action: `<button aria-label="Close modal">`.
- Custom interactive widgets (tournament bracket visualization, drag-to-reorder team slots) must implement the appropriate ARIA role and keyboard interaction pattern per WAI-ARIA Authoring Practices.

### 12.2 Touch Target Size

- Minimum touch target size: **44×44px** for all interactive elements on mobile.
- Buttons smaller than 44×44px visually must have invisible padding (via CSS) to meet this requirement. Do not reduce padding below this threshold for "compact" designs.

### 12.3 Color & Contrast

- Text on background must meet **WCAG AA contrast ratio: 4.5:1** minimum for normal text, **3:1** for large text (18px+ or 14px+ bold).
- Critical UI (error states, payout confirmation, TDS warnings) must meet **WCAG AAA: 7:1**.
- Never convey information using color alone. Always pair color with an icon, text label, or pattern.

### 12.4 Keyboard Navigation

- All interactive features must be fully operable with keyboard only (Tab, Shift+Tab, Enter, Space, Arrow keys).
- Modal dialogs must trap focus while open and restore focus to the trigger element on close.
- The tournament bracket view must be keyboard-navigable with arrow keys between match slots.
- Skip-to-main-content link must be the first focusable element on every page.

### 12.5 Screen Reader Compatibility

- Use semantic HTML elements (`<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`) over generic `<div>` elements wherever semantically appropriate.
- Dynamic content updates (live score changes, registration confirmations) must use `aria-live="polite"` regions.
- Loading states must announce to screen readers: `<div role="status" aria-live="polite">Loading tournament data...</div>`.
- Form error messages must be associated with their fields via `aria-describedby`.

---

## 13. India-Specific Rules

### 13.1 Currency Display

- All monetary amounts are stored in the database as **integer paise** (1 INR = 100 paise) to avoid floating-point precision errors. `prize_pool = 50000` means ₹500.00.
- All monetary amounts displayed to the user are formatted as **₹X,XX,XXX** using the Indian numbering system (lakhs, crores): `₹1,00,000` not `₹100,000`.
- Always use the Rupee symbol `₹` — never `Rs`, `INR` as prefix, or `/` notations.
- Implement formatting using: `new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.

### 13.2 TDS (Tax Deducted at Source) Requirements

- **Rule:** Winnings above ₹10,000 from a single tournament are subject to **30% TDS** under Section 194BA of the Income Tax Act (online gaming, effective April 2023).
- TDS must be calculated **server-side** before any payout is confirmed. Client-calculated TDS is advisory only.
- The confirmation UI must display:
  - Gross prize amount
  - TDS deducted (30% of gross)
  - Net payout to player
  - Text: _"TDS of 30% is deducted as per Section 194BA of the Income Tax Act, 1961"_
- TDS details must be included in the `audit_logs` record.
- FFArena must generate a TDS certificate (Form 16B equivalent) for any player whose cumulative TDS in a financial year exceeds ₹100.

### 13.3 i18n & Regional Language Support

- The platform must fully support dynamic language switching. Supported languages are **English (en)**, **Hindi (hi)**, **Tamil (ta)**, **Telugu (te)**, and **Bengali (bn)**.
- All user-facing strings must be externalized — no hardcoded English strings in JSX. Use the `next-intl` translation wrapper with standard JSON dictionaries (`messages/en.json`, `messages/hi.json`, etc.) from day one.
- Date/time must use `Intl.DateTimeFormat` with explicit `locale` and `timeZone: 'Asia/Kolkata'`.
- Never assume the user's browser locale is `en-IN`. Always pass the locale explicitly.

### 13.3.1 Web Speech API (Voice Results Announcements)

- Match completion and bracket updates should trigger browser-native voice synthesis using `window.speechSynthesis` (Web Speech API).
- **Guidelines for Voice Announcements:**
  - Audio must only fire if the player has `voice_announcements_enabled = true` in their settings and has interacted with the document first (browser gesture restriction).
  - Use simple text templates in the active regional language:
    - _Hindi:_ "विजेता टीम है [Team Name]"
    - _Tamil:_ "வெற்றி பெற்ற அணி [Team Name]"
    - _Bengali:_ "বিজয়ী দল হলো [Team Name]"
  - Rate limit speech triggers: do not queue multiple matches simultaneously; discard outdated score announcements.
  - Set default speech attributes: `rate = 0.9` (slower for clear Indian pronunciation), `pitch = 1.0`.
  - Always clean up speech queues on component unmount: call `window.speechSynthesis.cancel()`.

### 13.4 UPI ID Validation

UPI IDs must be validated against this regex before attempting a transfer:

```typescript
// lib/validations/upi.schema.ts
const UPI_ID_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/

export const upiIdSchema = z
  .string()
  .regex(UPI_ID_REGEX, 'Invalid UPI ID format. Example: yourname@upi')
  .toLowerCase()
```

Validate at: form submission (client, advisory), Server Action (server, authoritative), and Edge Function (before transfer, final gate).

### 13.5 Phone Number Format

- All Indian phone numbers are stored as strings in E.164 format: `+919876543210`.
- Display format: `+91 98765 43210`.
- Input format: accept `10-digit` numbers and prepend `+91`. Do not force users to type `+91`.
- Validation: `z.string().regex(/^\+91[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')`.

### 13.6 Date & Time Format

- **Display format:** `DD/MM/YYYY` (e.g., `12/06/2026`) — Indian standard.
- **Time display:** 12-hour format with IST suffix (e.g., `08:30 PM IST`).
- **Database storage:** Always UTC ISO 8601 strings (Supabase handles this automatically with `timestamptz`).
- **Tournament scheduling:** Always show times in IST. Never show UTC to users.
- **Upcoming tournament countdown:** Show in `Xd Xh Xm` format, not ISO duration strings.

### 13.7 Low-Bandwidth Optimization

- Hero images on the landing page must have a fallback low-quality image placeholder (LQIP) loaded first.
- Tournament cover images must be served in three sizes via Supabase Storage image transformations: `thumbnail` (200px), `card` (400px), `banner` (800px).
- The app must function (browse, register, view results) with **no JavaScript** on critical paths where feasible (Server Components handle this).
- Respect the `Save-Data` HTTP header: if set, skip loading any non-essential media or animations.

---

## 14. Deployment Rules

### 14.1 Environments

| Environment       | URL                                   | Supabase Project                              | Vercel Project    |
| ----------------- | ------------------------------------- | --------------------------------------------- | ----------------- |
| Local Development | `localhost:3000`                      | `ffarena-local` (Docker via `supabase start`) | N/A               |
| Staging / Preview | `<branch>.ffarena-preview.vercel.app` | `ffarena-staging`                             | Vercel Preview    |
| Production        | `ffarena.live`                        | `ffarena-production`                          | Vercel Production |

- **Never** connect a local development instance to the production Supabase project.
- **Never** run database migrations from a local machine against the production database.
- All production environment variable changes must be made through Vercel Dashboard — not through `.env` files or CLI.

### 14.2 Deployment Pipeline

```
Developer → Push branch → GitHub PR opened
  → Vercel Preview Deployment triggered automatically
  → CI runs: tsc --noEmit, eslint, vitest, next build
  → PR reviewed and approved by teammate
  → Squash merge to main
  → Vercel Production Deployment triggered automatically
  → Post-deploy smoke test: /api/health check, homepage LCP check
```

- **No manual deployments** to production from local using `vercel --prod`. All production deployments come from merges to `main`.
- Hotfixes follow the same pipeline via a `hotfix/` branch — no exceptions, even for urgent fixes.

### 14.3 Database Migration Rules

- All schema changes must be in a numbered SQL migration file: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`.
- Migrations are forward-only. Never edit a migration file after it has been applied to the staging or production database.
- Rollback plans must be documented in the PR description for any migration that: drops a column, drops a table, changes a column type, or removes an RLS policy.
- **Migrations are reviewed in isolation** — a PR that contains both application code and a migration must have both parts explicitly approved.
- Apply migrations to staging first, observe for 24 hours, then apply to production.

### 14.4 Supabase Branching Strategy

- Use **Supabase branching** for all feature development that requires schema changes.
- Each feature branch in GitHub has a corresponding Supabase branch: `feat/tournament-bracket-generation` → Supabase branch `feat-tournament-bracket-generation`.
- Supabase branches are merged to the staging project after PR approval, and to production after staging validation.
- Never use the production Supabase branch for development or testing, even for read-only experiments.

### 14.5 Post-Deployment Checklist

Before marking any production deployment as complete, verify:

- [ ] All Vercel environment variables are set for the production environment.
- [ ] Supabase RLS is enabled on all new tables.
- [ ] Database indexes for new query patterns have been applied.
- [ ] New API routes are covered by Cloudflare rate limiting rules.
- [ ] Audit logging is active for any new financial operation.
- [ ] The `/api/health` endpoint returns `200 OK`.
- [ ] Sentry error tracking is receiving events from the new deployment.
- [ ] The prize payout flow has been tested end-to-end in staging with a real UPI ID (test amount: ₹1).
- [ ] `database.types.ts` has been regenerated and reflects the latest schema.
- [ ] No `console.log` statements exist in production bundle (verified via build output).

---

## Appendix A: Banned Practices Quick Reference

| Banned                                         | Use Instead                                 |
| ---------------------------------------------- | ------------------------------------------- |
| `any` type                                     | `unknown` + Zod narrowing                   |
| Native TypeScript `enum`                       | `const` object + `as const` + derived union |
| `useEffect` for data fetching                  | Server Components or TanStack Query         |
| `select('*')` in Supabase                      | Explicit column projection                  |
| `<img>` HTML tag                               | `next/image` component                      |
| Inline `style={{ }}` attributes                | Tailwind classes or CSS custom properties   |
| Hardcoded strings in JSX                       | `t()` i18n translation function             |
| Direct commits to `main`                       | Pull Request with CI passing                |
| Secrets in any git-tracked file                | Vercel Env Vars / `.env.local` (gitignored) |
| Array index as React `key` prop                | Database UUID / stable unique ID            |
| `eval()` anywhere                              | (No alternative — never use)                |
| `dangerouslySetInnerHTML` without sanitization | DOMPurify-sanitized content + comment       |
| Service role key in client bundle              | Edge Functions / Server Actions only        |
| Raw SQL string concatenation                   | Supabase parameterized query builder        |
| Unbounded list queries                         | Paginated queries (max 20 items/page)       |
| Auto-playing video/audio                       | User-initiated playback only                |

---

## Appendix B: Key File Locations Reference

| What                          | Where                                              |
| ----------------------------- | -------------------------------------------------- |
| Supabase auto-generated types | `types/database.types.ts`                          |
| Domain model types            | `types/domain.types.ts`                            |
| API request/response types    | `types/api.types.ts`                               |
| Zod schemas                   | `lib/validations/<domain>.schema.ts`               |
| Server Actions                | `lib/actions/<domain>.actions.ts`                  |
| Custom React hooks            | `lib/hooks/use-<name>.ts`                          |
| App-wide constants            | `lib/constants/<domain>.constants.ts`              |
| Supabase client factories     | `lib/supabase/server.ts`, `lib/supabase/client.ts` |
| Global CSS & design tokens    | `styles/globals.css`                               |
| DB migration files            | `supabase/migrations/YYYYMMDDHHMMSS_*.sql`         |
| Supabase Edge Functions       | `supabase/functions/<function-name>/index.ts`      |
| Unit tests                    | `tests/unit/*.test.ts`                             |
| Integration tests             | `tests/integration/*.test.ts`                      |
| Test fixtures                 | `tests/fixtures/<domain>.fixture.ts`               |
| Environment variable template | `.env.example` (committed, no real values)         |

---

## Appendix C: ESLint Rule Summary

The following ESLint rules are set to `error` (build-breaking) in `.eslintrc.json`:

```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unused-vars": "error",
  "@typescript-eslint/explicit-function-return-type": "warn",
  "import/order": ["error", { "groups": ["builtin", "external", "internal", "relative", "type"] }],
  "no-eval": "error",
  "react/no-danger": "error",
  "react-hooks/exhaustive-deps": "error",
  "react-hooks/rules-of-hooks": "error",
  "@next/next/no-img-element": "error",
  "jsx-a11y/alt-text": "error",
  "jsx-a11y/aria-label-has-associated-control": "error"
}
```

---

_This document is maintained by the FFArena core team. All rule changes require a PR to this file with rationale documented in the PR description. No rule is changed silently. Last reviewed: 2026-06-12._
