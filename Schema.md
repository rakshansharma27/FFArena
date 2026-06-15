# 🗄️ FFArena (ffarena.live) — Database Schema Specification

This document details the complete Supabase PostgreSQL 15 database schema, RLS policies, custom trigger functions, and indexes. All code blocks below represent valid, executable SQL designed for standard Supabase migration workflows.

---

## 1. Schema Overview

The database structure is designed around a relational hierarchy where:

1. Users register through **Supabase Auth**, which auto-populates `public.profiles` via a trigger.
2. Verified **Organizers** create **Tournaments**, which link to **Games** and specify formats/rules.
3. **Players** form **Teams** and register for Tournaments.
4. **Brackets** contain **Matches** linking two Teams.
5. Match outcomes trigger ELO calculation changes in `player_stats` and update `leaderboard_entries`.
6. Escrowed prize money is split into `prizes` and paid out via `prize_transactions` which audit payouts.
7. **Sponsors** bid on advertising slots creating `sponsorship_deals`.

```
                  +-------------------+
                  |    auth.users     | (Supabase Auth)
                  +---------+---------+
                            | (trigger)
                  +---------v---------+
                  |     profiles      <---------------+
                  +----+----+----+----+               |
                       |    |    |                    |
         +-------------+    |    +-------------+      |
         |                  |                  |      |
+--------v-------+  +-------v--------+  +------v------v-----+
|   tournaments  |  |     teams      |  |   player_stats    |
+---+----+---+---+  +---+----+---+---+  +------+------------+
    |    |   |          |    |                 |
    |    |   +----------+----+                 |
    |    |              |                      |
    |    |          +---v------------+  +------v------------+
    |    |          |  team_members  |  |leaderboard_entries|
    |    |          +----------------+  +-------------------+
    |    |
    |    +-----------------------------+
    |                                  |
+---v------------+              +------v---------+
|    matches     |              |     prizes     |
+--------+-------+              +------+---------+
         |                             |
+--------v-------+              +------v---------+
|    brackets    |              |  prize_trans   |
+----------------+              +----------------+
```

---

## 2. PostgreSQL Enums

```sql
-- Create custom enums for status states
CREATE TYPE user_role AS ENUM ('PLAYER', 'ORGANIZER', 'SPONSOR', 'ADMIN');
CREATE TYPE tournament_status AS ENUM ('DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED');
CREATE TYPE team_registration_status AS ENUM ('PENDING', 'CONFIRMED', 'DISQUALIFIED');
CREATE TYPE match_status AS ENUM ('SCHEDULED', 'PLAYING', 'COMPLETED', 'DISPUTED', 'BYE');
CREATE TYPE deal_status AS ENUM ('PROPOSED', 'ACTIVE', 'COMPLETED', 'REJECTED');
CREATE TYPE prize_status AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED');
CREATE TYPE team_member_role AS ENUM ('CAPTAIN', 'SUBSTITUTE', 'PLAYER');
CREATE TYPE leaderboard_scope AS ENUM ('CITY', 'COLLEGE', 'NATIONAL');
```

---

## 3. Core Tables DDL

### 3.1 Profiles Table

Extends the internal `auth.users` table. Managed by triggers.

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(30) UNIQUE NOT NULL CHECK (username ~ '^[a-zA-Z0-9_]{3,30}$'),
    display_name VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    bio VARCHAR(200),
    role user_role DEFAULT 'PLAYER'::user_role NOT NULL,
    state VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    phone VARCHAR(15) CHECK (phone ~ '^\+91[0-9]{10}$'),
    ff_uid VARCHAR(20),
    bgmi_uid VARCHAR(20),
    valorant_id VARCHAR(30),
    preferred_language VARCHAR(10) DEFAULT 'en' NOT NULL CHECK (preferred_language IN ('en', 'hi', 'ta', 'te', 'bn')),
    voice_announcements_enabled BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### 3.2 Games Table

Supported games dictionary.

```sql
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### 3.3 City Regions

Valid Indian regions list for filtering.

```sql
CREATE TABLE public.city_regions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    CONSTRAINT unique_city_state UNIQUE (city, state)
);
```

### 3.4 Tournaments Table

```sql
CREATE TABLE public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE RESTRICT,
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    banner_url TEXT,
    description TEXT,
    rules_markdown TEXT,
    max_teams INT NOT NULL CHECK (max_teams IN (4, 8, 16, 32, 64, 128, 256)),
    registered_count INT DEFAULT 0 NOT NULL,
    entry_fee_paise BIGINT DEFAULT 0 NOT NULL CHECK (entry_fee_paise >= 0), -- Stored in Paisa (no float errors)
    prize_pool_paise BIGINT DEFAULT 0 NOT NULL CHECK (prize_pool_paise >= 0),
    status tournament_status DEFAULT 'DRAFT'::tournament_status NOT NULL,
    city VARCHAR(50), -- Null represents National
    state VARCHAR(50), -- Added state column
    college VARCHAR(100), -- Null represents public open city-level
    rtmp_url TEXT, -- RTMP stream ingestion URL
    stream_key TEXT, -- RTMP stream key
    overlay_logo_url TEXT, -- Injected sponsor logo overlay URL
    overlay_theme JSONB, -- Dynamic overlay configuration details (accent colors, positions)
    registration_opens_at TIMESTAMPTZ NOT NULL,
    registration_closes_at TIMESTAMPTZ NOT NULL CHECK (registration_closes_at > registration_opens_at),
    starts_at TIMESTAMPTZ NOT NULL CHECK (starts_at > registration_closes_at),
    ends_at TIMESTAMPTZ NOT NULL CHECK (ends_at > starts_at),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### 3.5 Teams Table

```sql
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    logo_url TEXT,
    captain_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    registration_status team_registration_status DEFAULT 'PENDING'::team_registration_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_team_name_in_tournament UNIQUE (tournament_id, name)
);
```

### 3.6 Team Members Table

```sql
CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role team_member_role DEFAULT 'PLAYER'::team_member_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_player_in_tournament_team UNIQUE (team_id, player_id)
);
```

### 3.7 Matches Table

```sql
CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    round INT NOT NULL CHECK (round >= 1),
    match_order INT NOT NULL, -- Sorting left-to-right inside round
    team1_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    team2_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    winner_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    team1_score INT DEFAULT 0 NOT NULL,
    team2_score INT DEFAULT 0 NOT NULL,
    team1_screenshot TEXT,
    team2_screenshot TEXT,
    status match_status DEFAULT 'SCHEDULED'::match_status NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_match_position UNIQUE (tournament_id, round, match_order)
);
```

### 3.8 Brackets Table

Used to trace connectivity of nodes in bracket rendering engines.

```sql
CREATE TABLE public.brackets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    next_match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    is_left_child_of_next BOOLEAN -- Dictates if winner populates Team 1 or Team 2 of next match
);
```

### 3.9 Player Stats Table

Persistent gaming resume variables.

```sql
CREATE TABLE public.player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    kills INT DEFAULT 0 NOT NULL CHECK (kills >= 0),
    wins INT DEFAULT 0 NOT NULL CHECK (wins >= 0),
    tournaments_played INT DEFAULT 0 NOT NULL CHECK (tournaments_played >= 0),
    elo_rating INT DEFAULT 1000 NOT NULL CHECK (elo_rating >= 0),
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_player_game_stats UNIQUE (player_id, game_id)
);
```

### 3.10 Leaderboard Entries Table

```sql
CREATE TABLE public.leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope leaderboard_scope NOT NULL,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scope_value VARCHAR(100) NOT NULL, -- Holds 'Gwalior', 'IIT Bombay', or 'NATIONAL'
    points INT DEFAULT 0 NOT NULL,
    current_rank INT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_leaderboard_spot UNIQUE (scope, game_id, scope_value, player_id)
);
```

### 3.11 Sponsors Table

```sql
CREATE TABLE public.sponsors (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name VARCHAR(100) NOT NULL,
    website_url TEXT,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### 3.12 Sponsorship Deals

```sql
CREATE TABLE public.sponsorship_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE RESTRICT,
    amount_paise BIGINT NOT NULL CHECK (amount_paise >= 200000), -- Minimum sponsorship ₹2,000 (200,000 paise)
    deliverables_markdown TEXT NOT NULL,
    status deal_status DEFAULT 'PROPOSED'::deal_status NOT NULL,
    clicks_count INT DEFAULT 0 NOT NULL CHECK (clicks_count >= 0),
    impressions_count INT DEFAULT 0 NOT NULL CHECK (impressions_count >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### 3.13 Prizes Table

```sql
CREATE TABLE public.prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    position INT NOT NULL CHECK (position >= 1),
    amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
    winner_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    status prize_status DEFAULT 'PENDING'::prize_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_position_payout UNIQUE (tournament_id, position)
);
```

### 3.14 Prize Transactions Table

Audited bank/UPI transfers.

```sql
CREATE TABLE public.prize_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prize_id UUID NOT NULL REFERENCES public.prizes(id) ON DELETE RESTRICT,
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    upi_id VARCHAR(100) NOT NULL CHECK (upi_id ~ '^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$'),
    razorpay_payout_id VARCHAR(100),
    amount_paise BIGINT NOT NULL,
    tds_deducted_paise BIGINT NOT NULL, -- 30% calculation audit
    net_payout_paise BIGINT NOT NULL,
    status prize_status DEFAULT 'PENDING'::prize_status NOT NULL,
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### 3.15 Notifications Table

```sql
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### 3.16 Audit Logs Table

```sql
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

---

## 4. Row Level Security (RLS) Policies

All tables must run with RLS active in production. Here are the core policies to run:

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorship_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

---------------------------------------------------------
-- PROFILES POLICIES
---------------------------------------------------------
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

---------------------------------------------------------
-- TOURNAMENTS POLICIES
---------------------------------------------------------
CREATE POLICY "Tournaments are viewable by everyone" ON public.tournaments
    FOR SELECT USING (true);

CREATE POLICY "Organizers can insert own tournaments" ON public.tournaments
    FOR INSERT WITH CHECK (
        auth.uid() = organizer_id
        AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ORGANIZER', 'ADMIN'))
    );

CREATE POLICY "Organizers can update own tournaments" ON public.tournaments
    FOR UPDATE USING (
        auth.uid() = organizer_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

---------------------------------------------------------
-- TEAMS POLICIES
---------------------------------------------------------
CREATE POLICY "Teams are viewable by everyone" ON public.teams
    FOR SELECT USING (true);

CREATE POLICY "Captains can insert team" ON public.teams
    FOR INSERT WITH CHECK (auth.uid() = captain_id);

CREATE POLICY "Captains can update own team" ON public.teams
    FOR UPDATE USING (auth.uid() = captain_id);

---------------------------------------------------------
-- MATCHES POLICIES
---------------------------------------------------------
CREATE POLICY "Matches are viewable by everyone" ON public.matches
    FOR SELECT USING (true);

CREATE POLICY "Organizers of tournament can edit matches" ON public.matches
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.tournaments t
            WHERE t.id = tournament_id AND t.organizer_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
    );

---------------------------------------------------------
-- PRIZE TRANSACTIONS POLICIES
---------------------------------------------------------
CREATE POLICY "Users can view own transactions" ON public.prize_transactions
    FOR SELECT USING (player_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN'));
```

---

## 5. Custom Database Functions & Triggers

### 5.1 Updated At Automatic Timestamps

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trigger_update_tournaments_timestamp BEFORE UPDATE ON public.tournaments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trigger_update_teams_timestamp BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trigger_update_matches_timestamp BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### 5.2 Auto-create Profile on Signup

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_username VARCHAR(30);
    v_display_name VARCHAR(50);
BEGIN
    -- Derive username from email prefix cleanly
    v_username := LOWER(SPLIT_PART(NEW.email, '@', 1));
    -- Append random digits if username exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) THEN
        v_username := v_username || floor(random() * 9000 + 1000)::text;
    END IF;

    v_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1));

    INSERT INTO public.profiles (
        id,
        username,
        display_name,
        avatar_url,
        role,
        state,
        city
    ) VALUES (
        NEW.id,
        v_username,
        v_display_name,
        NEW.raw_user_meta_data->>'avatar_url',
        'PLAYER'::user_role,
        COALESCE(NEW.raw_user_meta_data->>'state', 'Maharashtra'),
        COALESCE(NEW.raw_user_meta_data->>'city', 'Mumbai')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5.3 Automated Leaderboard Updater

Triggers when a match is completed to award points and recalculate ranks.

```sql
CREATE OR REPLACE FUNCTION public.update_leaderboard_ranks()
RETURNS TRIGGER AS $$
DECLARE
    r RECORD;
    v_winner_players UUID[];
    v_game_id UUID;
    v_city VARCHAR(50);
    v_college VARCHAR(100);
BEGIN
    -- Verify transition to COMPLETED
    IF NEW.status = 'COMPLETED'::match_status AND (OLD.status IS NULL OR OLD.status <> 'COMPLETED'::match_status) THEN
        -- Fetch metadata
        SELECT game_id, city, college INTO v_game_id, v_city, v_college
        FROM public.tournaments WHERE id = NEW.tournament_id;

        -- Identify winning team players
        IF NEW.winner_id IS NOT NULL THEN
            SELECT ARRAY_AGG(player_id) INTO v_winner_players
            FROM public.team_members
            WHERE team_id = NEW.winner_id;

            -- Update or insert profile stats
            FOR r IN SELECT unnest(v_winner_players) AS p_id LOOP
                -- Upsert Player stats
                INSERT INTO public.player_stats (player_id, game_id, wins, tournaments_played, elo_rating)
                VALUES (r.p_id, v_game_id, 1, 1, 1050)
                ON CONFLICT (player_id, game_id) DO UPDATE SET
                    wins = player_stats.wins + 1,
                    elo_rating = player_stats.elo_rating + 25;

                -- Upsert National Leaderboard
                INSERT INTO public.leaderboard_entries (scope, game_id, player_id, scope_value, points, current_rank)
                VALUES ('NATIONAL'::leaderboard_scope, v_game_id, r.p_id, 'NATIONAL', 10, 1)
                ON CONFLICT (scope, game_id, scope_value, player_id) DO UPDATE SET
                    points = leaderboard_entries.points + 10;

                -- Upsert City Leaderboard
                IF v_city IS NOT NULL THEN
                    INSERT INTO public.leaderboard_entries (scope, game_id, player_id, scope_value, points, current_rank)
                    VALUES ('CITY'::leaderboard_scope, v_game_id, r.p_id, v_city, 10, 1)
                    ON CONFLICT (scope, game_id, scope_value, player_id) DO UPDATE SET
                        points = leaderboard_entries.points + 10;
                END IF;
            END LOOP;
        END IF;

        -- Dynamic rank recalculation for scope
        WITH ranked AS (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY scope, game_id, scope_value ORDER BY points DESC) as r_num
            FROM public.leaderboard_entries
            WHERE game_id = v_game_id
        )
        UPDATE public.leaderboard_entries le
        SET current_rank = r.r_num
        FROM ranked r
        WHERE le.id = r.id;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_leaderboard_on_match_resolve
    AFTER UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION public.update_leaderboard_ranks();
```

---

## 6. Performance Optimization Indexes

```sql
-- Search tournaments fast by active status and date ranges
CREATE INDEX idx_tournaments_search ON public.tournaments (status, registration_closes_at, starts_at);
-- Filter tournaments by local criteria
CREATE INDEX idx_tournaments_location ON public.tournaments (state, city) WHERE status = 'REGISTRATION_OPEN'::tournament_status;
-- Quick registration lookups
CREATE INDEX idx_team_members_lookup ON public.team_members (player_id, team_id);
-- Match loading for specific tournament rounds
CREATE INDEX idx_matches_navigation ON public.matches (tournament_id, round, match_order);
-- Fast leaderboard retrievals
CREATE INDEX idx_leaderboard_lookup ON public.leaderboard_entries (scope, game_id, scope_value, points DESC);
```

---

## 7. Seed Data

Run this seed batch to establish initial platforms and regional reference points:

```sql
-- Seed Games
INSERT INTO public.games (name, slug, logo_url, is_active) VALUES
('Free Fire Max', 'free-fire-max', 'https://assets.ffarena.live/games/ff.png', true),
('Battlegrounds Mobile India', 'bgmi', 'https://assets.ffarena.live/games/bgmi.png', true),
('Valorant', 'valorant', 'https://assets.ffarena.live/games/valorant.png', true),
('Counter-Strike 2', 'cs2', 'https://assets.ffarena.live/games/cs2.png', true);

-- Seed City Regions
INSERT INTO public.city_regions (city, district, state) VALUES
('Gwalior', 'Gwalior', 'Madhya Pradesh'),
('Indore', 'Indore', 'Madhya Pradesh'),
('Pune', 'Pune', 'Maharashtra'),
('Mumbai', 'Mumbai City', 'Maharashtra'),
('Bengaluru', 'Bengaluru Urban', 'Karnataka'),
('Chennai', 'Chennai', 'Tamil Nadu'),
('Hyderabad', 'Hyderabad', 'Telangana'),
('Jaipur', 'Jaipur', 'Rajasthan');
```
