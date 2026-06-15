-- Add format to tournaments
ALTER TABLE public.tournaments ADD COLUMN format VARCHAR(50) DEFAULT 'SINGLE_ELIMINATION' NOT NULL;

-- Enable RLS on brackets
ALTER TABLE public.brackets ENABLE ROW LEVEL SECURITY;

-- Matches: Allow organizers to insert matches
CREATE POLICY "Organizers can insert matches" ON public.matches FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.tournaments t 
        WHERE t.id = tournament_id AND t.organizer_id = auth.uid()
    )
);

-- Brackets: Allow public to view brackets
CREATE POLICY "Brackets are viewable by everyone" ON public.brackets FOR SELECT USING (true);

-- Brackets: Allow organizers to insert brackets
CREATE POLICY "Organizers can insert brackets" ON public.brackets FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.tournaments t 
        WHERE t.id = tournament_id AND t.organizer_id = auth.uid()
    )
);

-- Brackets: Allow organizers to update brackets
CREATE POLICY "Organizers can update brackets" ON public.brackets FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.tournaments t 
        WHERE t.id = tournament_id AND t.organizer_id = auth.uid()
    )
);

-- Brackets: Allow organizers to delete brackets
CREATE POLICY "Organizers can delete brackets" ON public.brackets FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.tournaments t 
        WHERE t.id = tournament_id AND t.organizer_id = auth.uid()
    )
);
