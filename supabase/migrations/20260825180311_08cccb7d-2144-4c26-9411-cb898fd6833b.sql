ALTER TABLE public.programme_votes
  ADD COLUMN IF NOT EXISTS vote_kind text NOT NULL DEFAULT 'poll';

ALTER TABLE public.programme_votes
  DROP CONSTRAINT IF EXISTS programme_votes_vote_kind_check;

ALTER TABLE public.programme_votes
  ADD CONSTRAINT programme_votes_vote_kind_check
  CHECK (vote_kind = ANY (ARRAY['poll'::text, 'question'::text, 'yes_no'::text]));