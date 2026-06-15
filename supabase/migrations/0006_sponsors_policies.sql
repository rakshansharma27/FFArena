-- Row Level Security (RLS) Policies for Sponsors and Sponsorship Deals

-- ── Sponsors Table Policies ──
CREATE POLICY "Public read access for sponsors" ON public.sponsors
    FOR SELECT USING (true);

CREATE POLICY "Sponsors can insert their own brand profile" ON public.sponsors
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Sponsors can update their own brand profile" ON public.sponsors
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Sponsors can delete their own brand profile" ON public.sponsors
    FOR DELETE USING (auth.uid() = id);


-- ── Sponsorship Deals Table Policies ──
CREATE POLICY "Public read access for sponsorship deals" ON public.sponsorship_deals
    FOR SELECT USING (true);

CREATE POLICY "Sponsors can propose deals" ON public.sponsorship_deals
    FOR INSERT WITH CHECK (
        auth.uid() = sponsor_id
    );

CREATE POLICY "Sponsors can edit proposed deals" ON public.sponsorship_deals
    FOR UPDATE USING (
        auth.uid() = sponsor_id 
        AND status = 'PROPOSED'::deal_status
    );

CREATE POLICY "Organizers can manage deals for their tournaments" ON public.sponsorship_deals
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.tournaments t
            WHERE t.id = tournament_id AND t.organizer_id = auth.uid()
        )
    );
