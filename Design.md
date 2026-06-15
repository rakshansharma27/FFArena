# 🎨 FFArena (ffarena.live) — Design System & UI Guidelines

This document outlines the visual identity, typography, color tokens, component guidelines, and Tailwind configuration for the FFArena platform. The aesthetic is tailored specifically for the Indian gaming community: dark, energetic, high-contrast, and optimized for low-end mobile devices.

---

## 1. Design Philosophy

- **Dark-First Gaming Aesthetic:** Gamers expect dark interfaces. It reduces eye strain during long gaming sessions and makes colored accents pop.
- **Electric Accents (District Energy):** Combining deep space-blacks with high-intensity electric blue (representing modern tech) and neon orange (representing Indian energy, heat, and competitive spirit).
- **Mobile-First, Touch-Optimized:** Over 90% of grassroots esports users in India access platforms on mobile phones (Android). All interactive elements must have clear hit states, swipe gestures, and zero layout shift.
- **Performance Over Heavy Assets:** No auto-playing videos or heavy background image files. Leverage pure CSS gradients, SVG iconography, CSS animations, and modern system-based font loads to ensure fast delivery on 4G networks.
- **Local Identity Pride:** The UI should celebrate local cities and colleges. City-based badges and college banners should have prominent visual weight.

---

## 2. Color Palette

The color system uses custom HSL values configured for dark-mode-only delivery.

| Token                       | HSL / Hex                        | Usage                                        |
| --------------------------- | -------------------------------- | -------------------------------------------- |
| **Background (Base)**       | `#07070A` / `hsl(240, 30%, 3%)`  | Default main background for screens          |
| **Background (Surface)**    | `#0D0D14` / `hsl(240, 22%, 7%)`  | Cards, modal overlays, inputs                |
| **Background (Elevated)**   | `#151522` / `hsl(240, 22%, 11%)` | Hover states, dropdowns, headers             |
| **Primary (Electric Blue)** | `#0ea5e9` / `hsl(199, 89%, 48%)` | Buttons, focus rings, links, stats           |
| **Accent (Neon Orange)**    | `#ff6b00` / `hsl(25, 100%, 50%)` | Branding highlight, live indicators, rankups |
| **Border (Muted)**          | `#1e1e2f` / `hsl(240, 20%, 15%)` | Borders, separators, gridlines               |
| **Text (Primary)**          | `#f8fafc` / `hsl(210, 40%, 98%)` | Headers, titles, primary readings            |
| **Text (Secondary)**        | `#94a3b8` / `hsl(215, 20%, 65%)` | Subheadings, descriptions, helper text       |
| **Text (Muted)**            | `#475569` / `hsl(215, 16%, 47%)` | Placeholders, disabled states                |
| **Success**                 | `#10b981` / `hsl(142, 76%, 45%)` | Verified accounts, matches won, paid status  |
| **Warning**                 | `#f59e0b` / `hsl(38, 92%, 50%)`  | Pending matches, disputes, warnings          |
| **Error**                   | `#ef4444` / `hsl(0, 84%, 60%)`   | Disqualified teams, failed payouts, errors   |

---

## 3. Typography

FFArena uses a dual-font system to balance high-energy gaming aesthetics with readability.

- **Heading Font:** `Space Grotesk` (Google Font)
  - _Rationale:_ High-tech, futuristic geometric shapes that scream gaming without being illegible.
- **Body & UI Font:** `Inter` (System-fallback supported)
  - _Rationale:_ Highly readable at small sizes, optimal line-spacing, and supports Hindi characters cleanly if needed.

### Typography Scale (Mobile-First)

| Class       | Font Size         | Line Height       | Usage                                      |
| ----------- | ----------------- | ----------------- | ------------------------------------------ |
| `text-xs`   | `0.75rem` (12px)  | `1.125rem` (18px) | Badges, player role tags, timestamps       |
| `text-sm`   | `0.875rem` (14px) | `1.25rem` (20px)  | Card descriptions, tables, forms           |
| `text-base` | `1rem` (16px)     | `1.5rem` (24px)   | Body copy, default text, list items        |
| `text-lg`   | `1.125rem` (18px) | `1.75rem` (28px)  | Section headers, card titles               |
| `text-xl`   | `1.25rem` (20px)  | `1.875rem` (30px) | Modal titles, subsection headers           |
| `text-2xl`  | `1.5rem` (24px)   | `2.25rem` (36px)  | Tournament details header, dashboard title |
| `text-3xl`  | `1.875rem` (30px) | `2.625rem` (42px) | Landing page headers                       |

---

## 4. Spacing & Layout

### Grid & Spacing Scale (Tailwind)

- **Base Unit:** 4px (1rem = 16px)
- **Paddings:**
  - Mobile Screens: `px-4 py-4` (16px)
  - Tablet/Desktop: `px-8 py-6` (32px / 24px)
  - Card Inner Padding: `p-4` (16px) or `p-5` (20px)
- **Gaps:**
  - Card grid gap: `gap-4`
  - Stack gap (vertical): `space-y-4`

### Responsive Breakpoints

- `sm`: `640px` (Tablets / large phones)
- `md`: `768px` (Laptops / iPads)
- `lg`: `1024px` (Desktop)
- `xl`: `1280px` (Ultra-wide)

---

## 5. Component Specifications

### 5.1 Buttons

Buttons are key transition points. They must have clear hover, focus, active, and loading states.

- **Primary Button:**
  - _Background:_ Gradient from Electric Blue to Cyan (`bg-gradient-to-r from-sky-500 to-cyan-500`)
  - _Text:_ White, semi-bold
  - _Hover State:_ Slight lift (`hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/20`)
  - _Active State:_ Push down (`active:translate-y-0`)
- **Secondary Button:**
  - _Background:_ Neutral dark-border with background surface opacity (`bg-surface/50 border border-muted`)
  - _Text:_ Neutral-200
  - _Hover State:_ White text, border-sky-500
- **Danger Button:**
  - _Background:_ Red-600 (`bg-red-600 hover:bg-red-700`)
  - _Text:_ White
- **Mobile Bottom Action Bar:**
  - Pinned to screen bottom on mobile (`fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur border-t border-muted z-50`).

### 5.2 Cards

- **Tournament Card:**
  - _Structure:_ Image Banner (16:9 ratio) + Game Tag + Title + City/College Badge + Prize Pool Highlight + Register Button / Status.
  - _Aesthetic:_ Border-radius: `rounded-2xl`, Border: `border-muted`, Background: `bg-surface`.
  - _Hover:_ Border shifts from muted to primary blue, banner zoom effect (`group-hover:scale-105` transition 300ms).

### 5.3 Input Fields

- **Form Control:**
  - _Background:_ Dark deep grey (`bg-[#101017]`)
  - _Border:_ `border-muted`
  - _Focus State:_ `focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none`
  - _Error State:_ `border-red-500 focus:ring-red-500`

### 5.4 Bracket Component

The bracket must render flawlessly on touchscreens:

- **Nodes:** Display Team logo, Team name, Score, Win/Loss indicator.
- **Connection Lines:** Render as clean SVGs that colorize based on match outcome (grey for unplayed, electric blue for path to current round, dimmed grey for losing path).
- **Scroll Container:** Touch-draggable wrapper (`overflow-x-auto select-none grab-cursor`) allowing fast swiping between rounds.

---

## 6. Iconography

We use **Lucide React** for UI icons. Standardized assignments:

- `Trophy` — Tournaments, prizes, leaderboards.
- `Users` — Teams, roster creation.
- `User` — Profiles, account settings.
- `Calendar` — Matches schedules.
- `CreditCard` — UPI/Payouts dashboard.
- `ShieldAlert` — Disputes, report cheat.
- `MapPin` — City, regional context.
- `School` — Collegiate context.
- `Tv` — Livestream link / broadcast status.

---

## 7. Animations & Micro-interactions

Using **Framer Motion** for React transitions:

```typescript
// Fade in container with slide-up for listing pages
export const fadeInUpContainer = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

// Item transition
export const fadeInUpItem = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

// Bracket expansion
export const bracketTransition = {
  layout: { duration: 0.3, ease: 'easeInOut' },
}
```

### Confetti (Canvas Confetti)

- **Trigger:** Payout confirmation modal success, tournament completion screen.
- **Parameters:** Double explosion from left and right edges, custom colors matching Electric Blue and Neon Orange.

---

## 8. Game-specific UI Accents

We apply game-specific borders and accents to differentiate listings:

- **Free Fire:**
  - _Primary Color:_ `hsl(28, 100%, 53%)` (Free Fire Gold/Orange)
  - _Background accent:_ Radial gradient fading to orange
- **BGMI (Battlegrounds Mobile India):**
  - _Primary Color:_ `hsl(84, 52%, 41%)` (Military Olive Green)
  - _Background accent:_ Radial gradient fading to olive
- **Valorant:**
  - _Primary Color:_ `hsl(355, 84%, 48%)` (Riot Crimson Red)
  - _Background accent:_ Radial gradient fading to crimson

---

## 9. Tailwind Configuration

Here is the complete `tailwind.config.ts` code content:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(100%)' },
          '50%': { opacity: '0.8', filter: 'brightness(120%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s infinite ease-in-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

---

## 10. CSS Global Variables (`globals.css`)

Here is the global styling template configured for `globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 240 30% 3%;
    --foreground: 210 40% 98%;

    --card: 240 22% 7%;
    --card-foreground: 210 40% 98%;

    --popover: 240 22% 7%;
    --popover-foreground: 210 40% 98%;

    --primary: 199 89% 48%;
    --primary-foreground: 210 40% 98%;

    --secondary: 240 20% 15%;
    --secondary-foreground: 210 40% 98%;

    --muted: 240 20% 15%;
    --muted-foreground: 215 20% 65%;

    --accent: 25 100% 50%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 210 40% 98%;

    --border: 240 20% 15%;
    --input: 240 20% 15%;
    --ring: 199 89% 48%;

    --radius: 1rem;
  }
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: var(--font-inter), sans-serif;
  -webkit-font-smoothing: antialiased;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-space-grotesk), sans-serif;
  letter-spacing: -0.02em;
}

/* Custom Drag scrollbars for bracket */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}
.overflow-x-auto::-webkit-scrollbar-track {
  background: hsl(var(--background));
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--muted));
  border-radius: 3px;
}
.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--primary));
}
```

---

## 12. Stream Overlay & Vernacular Layout Guidelines

### 12.1 Dynamic Stream Overlay Specs

When generating livestream overlays (1920×1080 canvas composites):

- **Sponsor Logo Placement:** Located in the top-right corner. Max-width `240px`, max-height `80px`. Must have a subtle dark-glass background block (`bg-surface/40 backdrop-blur border border-muted`) to ensure visibility on bright game streams.
- **Tournament Title & Status:** Top-left corner. Uses `font-heading` (Space Grotesk) with a clean electric blue text shadow.
- **Match Live Scoreboard:** Bottom-center overlay. Height `90px`, width `600px`. Displays Team 1 Name · score (vs) score · Team 2 Name.
- **Safe Zones:** Interactive widgets and logos must stay within the action-safe boundaries (minimum 5% margins from the canvas edges).

### 12.2 Vernacular Font & Layout Adjustments

- **Text Expansion Handling:** Non-English UI texts (especially Hindi, Tamil, Telugu, and Bengali) can expand by up to 30%. Never use fixed widths (`w-32`) for labels; always use flex container structures (`flex-grow`, `px-4`, `w-fit`) to prevent clipping.
- **Line-Height Overrides:** Indian script fonts require higher vertical padding. Global override classes:
  ```css
  .lang-hi,
  .lang-ta,
  .lang-te,
  .lang-bn {
    line-height: 1.625;
    letter-spacing: 0.01em;
  }
  ```
- **Voice Announcement Toggle UI:**
  - Volume/Speaker icon (`Volume2` or `VolumeX` from Lucide) placed next to match scoreboards.
  - A pulsating green animation ring when voice results announcements are active (`animate-pulse border-emerald-500`).
