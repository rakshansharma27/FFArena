-- ── Seasons Table ──
CREATE TABLE public.seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL CHECK (ends_at > starts_at),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add season_id column to leaderboard_entries
ALTER TABLE public.leaderboard_entries 
ADD COLUMN season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL;

-- Enable RLS on seasons
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies ──

-- Seasons Policies
CREATE POLICY "Seasons are viewable by everyone" 
ON public.seasons FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage seasons" 
ON public.seasons FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Player Stats Policies
CREATE POLICY "Player stats are viewable by everyone" 
ON public.player_stats FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage player stats" 
ON public.player_stats FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Leaderboard Entries Policies
CREATE POLICY "Leaderboard entries are viewable by everyone" 
ON public.leaderboard_entries FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage leaderboard entries" 
ON public.leaderboard_entries FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
