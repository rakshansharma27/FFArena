# 🏆 FFArena (ffarena.live) — Product Requirements Document (PRD)

## 1. Executive Summary

### 1.1 Vision

To build the "district cricket league" equivalent for esports in India, establishing a structured, trust-based, and highly competitive grassroots ecosystem that feeds directly into the national gaming circuit.

### 1.2 Mission Statement

To democratize competitive gaming in India by replacing fragmented WhatsApp groups and Google Forms with professional-grade tournament organization, instant UPI prize payouts, local sponsorship matchmaking, and local pride leaderboards.

### 1.3 Tagline

_"Play Local. Rise National."_

### 1.4 Product Overview & Domain

**FFArena** (`ffarena.live`) is a mobile-first web platform designed to give tier-2, tier-3, and collegiate gamers in India their first taste of organized esports. The platform provides automated bracket management, secure escrowed prize pools, integrated UPI-based payouts with built-in TDS compliance, and local sponsorship matching for brand activations.

---

## 2. Problem Statement

The Indian gaming market is booming, with over 600 million gamers and esports revenues projected to exceed $1 billion. However, below the national professional tier, the ecosystem is highly fragmented and plagued by trust issues:

- **For Players:**
  - **Trust Deficit:** Organizers frequently delay or abscond with prize money.
  - **Fragmented Discovery:** Finding local tournaments requires scanning countless WhatsApp groups, Discord servers, and Instagram stories.
  - **No Career Path:** Excellent local performances are never recorded. There is no central, verified record (or ELO history) to show professional scouts.
  - **Friction:** Team registration is manual, requiring screenshot verification of payments and player IDs.

- **For Organizers (Collegiate & Grassroots):**
  - **Operational Nightmare:** Managing 64-team brackets, verifying player IDs, and collecting match scores via Google Forms/WhatsApp screenshots is manual, error-prone, and exhausting.
  - **Payment Friction:** Collecting entry fees and manually dispersing prizes via personal GPay/PhonePe accounts is messy, leads to tax complications, and limits scaling.
  - **Monetization Deficit:** Organizers struggle to pitch to local sponsors (like gaming cafes or local brands) due to lack of verified metrics, viewer analytics, and structured placement zones.

- **For Local Sponsors (PC Cafes, Accessories, Energy Drinks, Local Shops):**
  - **Zero Visibility:** No direct way to reach regional, hyper-focused gamer cohorts.
  - **Lack of Analytics:** Sponsoring a local tourney currently yields no proof of impression, click-through rate, or conversion.
  - **Fragmented Deals:** Negotiating individual sponsorships over DMs is slow and risky.

---

## 3. Target Users & Personas

### 3.1 Aakash — The Tier-2 Competitive Player

- **Profile:** 19-year-old college student from Gwalior, Madhya Pradesh.
- **Gaming Habit:** Plays Free Fire and BGMI on a mid-range Android phone (Redmi Note 12) for 4-5 hours daily.
- **Goals:** Wants to join a local squad, win cash prizes to fund in-game purchases/bill payments, and prove to his parents that esports is a viable career path.
- **Pain Points:** Constantly gets scammed by "fake" tournament organizers on Instagram who run away with entry fees. Finds it hard to locate tournaments occurring in Gwalior or his college campus.

### 3.2 Priya — The Collegiate Esports Organizer

- **Profile:** 21-year-old President of the Gaming & Anime Society at a private university in Bengaluru.
- **Goals:** Wants to run a successful 128-team inter-college Valorant and BGMI tournament with a ₹25,000 prize pool, attract a local sponsor, and finish brackets within a weekend without losing her mind.
- **Pain Points:** Spends hours chasing teams for GPay screenshots, manually verifying Free Fire UIDs, entering match scores into Excel sheets, and managing disputes over who won.

### 3.3 Rajan — The Local Gaming Cafe Owner (Sponsor)

- **Profile:** 32-year-old owner of "Pulse Gaming Lounge" in Pune.
- **Goals:** Wants to drive foot traffic to his cafe during weekdays and sell gaming hours/accessories.
- **Pain Points:** Sponsorship offers from national esports teams are too expensive. Sponsoring college fests manually is a black box with zero trackable ROI.

### 3.4 Vikram — The District Esports Coordinator

- **Profile:** 28-year-old regional representative for a state esports association in Rajasthan.
- **Goals:** Wants to identify the top 5 BGMI squads in the state for an official state-level championship.
- **Pain Points:** No centralized ranking or ELO system exists. Has to rely on subjective recommendations or scattered tournament results.

---

## 4. User Stories

### 4.1 As a Player

1.  **US-101:** As a player, I want to sign up easily using my mobile number and OTP so that I don't have to remember complex passwords.
2.  **US-102:** As a player, I want to link my Free Fire UID / BGMI Character ID to my profile so that my game identity is verified.
3.  **US-103:** As a player, I want to find tournaments filtering by my city, game, and entry fee so that I only see events relevant to me.
4.  **US-104:** As a player, I want to create a persistent team profile and invite my friends via a link so that we can register for squad tournaments instantly.
5.  **US-105:** As a player, I want to see a live-updating interactive bracket so that I know who my next opponent is and when my match starts.
6.  **US-106:** As a player, I want to submit screenshots of match results directly on the match page so that the system can verify my win.
7.  **US-107:** As a player, I want my prize money to be paid instantly to my UPI ID so that I don't have to wait weeks for bank transfers.
8.  **US-108:** As a player, I want to see my regional ELO score and city rank increase after a win so that I can show off my skills and get scouted.

### 4.2 As an Organizer

9.  **US-201:** As an organizer, I want to create a tournament page detailing rules, schedules, entry fees, and prize structures within 5 minutes.
10. **US-202:** As an organizer, I want the system to handle entry-fee collection and hold funds in a secure escrow so that players know the prize pool is guaranteed.
11. **US-203:** As an organizer, I want brackets to auto-generate based on registered teams so that I don't have to draw them manually.
12. **US-204:** As an organizer, I want to view disputed match screenshots side-by-side so that I can quickly make a fair decision.
13. **US-205:** As an organizer, I want to approve prize payouts with a single click at the end of the tournament, with the system handling TDS calculations automatically.
14. **US-206:** As an organizer, I want to set up banner advertisement slots on my tournament pages so that I can sell them to local sponsors.

### 4.3 As a Sponsor

15. **US-301:** As a sponsor, I want to register a business profile and set a monthly budget so that I can discover local sponsorship opportunities.
16. **US-302:** As a sponsor, I want to bid on tournament advertisement slots in specific cities/colleges so that I can reach my target local demographic.
17. **US-303:** As a sponsor, I want to verify that my ads were displayed and see how many clicks they generated so that I can measure ROI.
18. **US-304:** As a sponsor, I want to distribute exclusive discount codes to participants of sponsored tournaments to drive them to my physical store/cafe.

### 4.4 As a Platform Administrator

19. **US-401:** As an admin, I want to review and verify organizer applications so that we can prevent spam and fraud.
20. **US-402:** As an admin, I want to audit all high-value UPI payout transactions (>₹5,000) before they are sent to Razorpay to ensure legal compliance.
21. **US-403:** As an admin, I want to ban players who are caught cheating or submitting fraudulent screenshots to maintain platform integrity.

---

## 5. Core Features (MVP)

### 5.1 Tournament Creation & Management

- **Description:** Organizers can create, edit, and publish tournaments for games (Free Fire, BGMI, Valorant, CS2) with rules, schedules, max team sizes, entry fees, and prize structures.
- **User Value:** Turns an administrative nightmare into a 5-minute wizard.
- **Priority:** P0
- **Success Metric:** Number of tournaments created per month; time taken to create a tournament (<5 mins).

### 5.2 Team Registration & Escrow

- **Description:** Players can form squads, invite teammates, and register for tournaments. The platform handles registration fees via UPI, locking them in escrow.
- **User Value:** Solves the trust barrier; guarantees the prize pool exists.
- **Priority:** P0
- **Success Metric:** Registration conversion rate; total volume of escrow transactions.

### 5.3 Automated Bracket Generation

- **Description:** Auto-generates single-elimination, double-elimination, or round-robin brackets once registration closes. Supports seeding.
- **User Value:** Eliminates manually creating brackets in external software.
- **Priority:** P0
- **Success Metric:** % of tournaments with successfully generated and completed brackets.

### 5.4 Real-time Score Reporting & Dispute Resolution

- **Description:** Team captains upload screenshots of end-game score screens. Organizers approve results. If conflict occurs, a dispute view displays both submissions side-by-side.
- **User Value:** Speeds up match resolution; reduces stress during disputes.
- **Priority:** P0
- **Success Metric:** Average time to resolve a match (target: <15 mins).

### 5.5 UPI Prize Distribution & TDS Engine

- **Description:** Integrates with Razorpay payouts. Deducts 30% TDS automatically for individual net winnings exceeding ₹10,000 (compliant with Indian Section 194BA). Disburses to winner's UPI ID instantly upon organizer clearance.
- **User Value:** Safe, legal, and instant payouts directly to GPay, PhonePe, or Paytm.
- **Priority:** P0
- **Success Metric:** % of payouts processed within 5 seconds of organizer approval; zero tax compliance errors.

### 5.6 Player Profiles & Regional ELO System

- **Description:** Tracks matches played, kills, wins, and tournament history. Computes a regional ELO rating.
- **User Value:** Gives players a verifiable resume and status in their local community.
- **Priority:** P1
- **Success Metric:** Daily Active Users (DAU) viewing profiles; social sharing rate of profile cards.

### 5.7 Hyperlocal Leaderboards

- **Description:** Leaderboards categorized by City, College, and State.
- **User Value:** Drives "district pride" and tribal competition.
- **Priority:** P1
- **Success Metric:** User engagement on leaderboard routes.

### 5.8 Local Sponsor Marketplace

- **Description:** Simple dashboard where organizers declare ad slots, and verified local brands (cafés, coaching centers, gaming peripherals) can purchase tournament sponsorships starting at ₹2,000. Features automated logo placement on brackets and streams, along with post-tournament audience reports.
- **User Value:** Provides grassroots organizers with real cash funding from local businesses.
- **Priority:** P1
- **Success Metric:** Total sponsorship volume transacted; sponsor retention rate; average sponsorship amount.

### 5.9 One-Click Stream Integration & Overlays

- **Description:** Lets organizers push live match feeds or bracket screens directly to YouTube/Twitch via one-click RTMP push. System auto-generates live overlay templates with tournament branding and sponsor logos dynamically injected.
- **User Value:** Professionalizes amateur broadcasts instantly, increasing viewer engagement and sponsor ROI.
- **Priority:** P1
- **Success Metric:** % of tournaments streamed; average hours watched per stream.

### 5.10 Vernacular-First UI & Regional Voice Announcements

- **Description:** Multi-lingual interface supporting English, Hindi, Tamil, Telugu, and Bengali. Dynamic notifications (WhatsApp, SMS, In-App) are dispatched in the user's preferred regional language. Match outcomes and brackets can be audibly announced via voice synthesis.
- **User Value:** Breaks the language barrier for Tier-2/3 collegiate and rural gamers.
- **Priority:** P1
- **Success Metric:** % of users using non-English UI options; voice feature engagement rate.

---

## 6. Out of Scope (v1)

- **In-game API Integrations:** Manual score entry and screenshot upload will be used. Automated API integrations for game score scraping are deferred to v2.
- **Server-Side Video Transcoding/Hosting:** The platform does not host the video streams directly; rather, it handles client-side RTMP routing configuration and overlays, outputting to YouTube/Twitch.
- **Advanced Team Communication (Voice/Chat):** Team communication is assumed to happen on Discord or in-game voice. We will only provide notification channels.
- **Web3/Crypto Payouts:** Strictly fiat UPI payments to remain compliant with Indian financial guidelines.

---

## 7. Success Metrics & KPIs

### 7.1 Growth & Activation

- **Registered Users:** 10,000+ within 3 months of launch.
- **Active Tournament Organizers:** 50+ verified organizers running events in Month 3.
- **Activation Rate:** 60% of registered players join at least one team or tournament within 7 days.

### 7.2 Engagement & Retention

- **Month 1 Retention (M1):** 35% of players return to view brackets, leaderboards, or profiles.
- **Avg. Matches Played:** 4.2 matches per registered user per month.

### 7.3 Financial

- **Escrow Volume (GTV):** ₹5,00,000 transacted in Month 3.
- **Sponsorship Volume:** ₹1,00,000 in completed local deals in Month 6.

---

## 8. Constraints & Requirements

### 8.1 Financial (Zero-Cost Infra)

- Must run entirely within free tiers:
  - **Frontend:** Cloudflare Pages (free unlimited bandwidth, static hosting).
  - **Backend:** Vercel (free serverless execution limits).
  - **Database:** Supabase Free Tier (500MB database, 50,000 monthly active users, 1GB storage).
  - **CI/CD:** GitHub Actions free tier.

### 8.2 Compliance & Legal (India)

- **TDS Compliance:** Must deduct 30% TDS under Section 194BA on net winnings and submit reports.
- **GST:** Display transparent processing fees (if any).
- **Real Money Gaming Laws:** Strictly classified as a "Game of Skill" (Valorant, BGMI, Free Fire, CS2 are skill-based). No chance-based games (roulette, slot, ludo, card-games) allowed.

### 8.3 Technical & Connectivity

- **Bandwidth:** Web app must load and function on Indian 4G connections (Jio/Airtel) with latency/packet loss.
- **Performance:** Next.js pages must have a Lighthouse performance score > 90. Mobile bundle size must be kept tiny.
- **PWA Readiness:** Service workers must cache core assets so brackets and schedules can be viewed offline.

---

## 9. Assumptions

- Players have access to a smartphone with a stable internet connection and a UPI ID (their own or their parents').
- Mobile games like Free Fire and BGMI will remain unbanned and popular in India.
- Local brands are willing to spend small amounts (₹2,000–₹10,000) for highly targeted student eyes.

---

## 10. Risks & Mitigations

| Risk                                                       | Severity | Mitigation                                                                                                                                  |
| ---------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Collusion & Score Fraud** (Captains uploading fake wins) | High     | Require dual-party screenshot upload. Auto-flag match if results mismatch, triggering admin arbitration.                                    |
| **Escrow Legality (RMG Bans)**                             | High     | Explicitly state that entry fees are pooled for skill-based tournament prizes, which is legally distinct from real-money gambling in India. |
| **API Limit Exhaustion (Supabase Free Tier)**              | Medium   | Implement aggressive edge caching via Cloudflare. Minimize polling by using Supabase Realtime only on active bracket screens.               |
| **Anti-Cheat Deficit**                                     | High     | Encourage community reporting. Require players to supply recording links (YouTube/drive) if accused of hacking/emulator use.                |
