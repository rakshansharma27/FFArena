-- ── Storage Buckets ──
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tournament-banners',
  'tournament-banners',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── Storage RLS Policies ──
-- Allow public to read banners
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'tournament-banners');

-- Allow organizers and admins to upload banners
CREATE POLICY "Organizers can upload banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tournament-banners'
  AND auth.uid() IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ORGANIZER', 'ADMIN'))
);

-- Allow users to update their own banners
CREATE POLICY "Organizers can update own banners"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tournament-banners'
  AND auth.uid() = owner
);

-- Allow users to delete their own banners
CREATE POLICY "Organizers can delete own banners"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tournament-banners'
  AND auth.uid() = owner
);

-- ── Database Functions & Triggers ──
-- Increment registered_count on tournaments when a team is confirmed
CREATE OR REPLACE FUNCTION public.increment_registered_teams()
RETURNS TRIGGER AS $$
BEGIN
    -- Only increment if it's a new confirmed team, or status changed to confirmed
    IF (TG_OP = 'INSERT' AND NEW.registration_status = 'CONFIRMED'::team_registration_status) OR 
       (TG_OP = 'UPDATE' AND OLD.registration_status != 'CONFIRMED'::team_registration_status AND NEW.registration_status = 'CONFIRMED'::team_registration_status) THEN
        
        UPDATE public.tournaments
        SET registered_count = registered_count + 1
        WHERE id = NEW.tournament_id;
        
    -- Decrement if a confirmed team is disqualified or deleted
    ELSIF (TG_OP = 'UPDATE' AND OLD.registration_status = 'CONFIRMED'::team_registration_status AND NEW.registration_status != 'CONFIRMED'::team_registration_status) OR
          (TG_OP = 'DELETE' AND OLD.registration_status = 'CONFIRMED'::team_registration_status) THEN
          
        UPDATE public.tournaments
        SET registered_count = GREATEST(registered_count - 1, 0)
        WHERE id = COALESCE(NEW.tournament_id, OLD.tournament_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_team_registration_status_change
    AFTER INSERT OR UPDATE OR DELETE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION public.increment_registered_teams();
