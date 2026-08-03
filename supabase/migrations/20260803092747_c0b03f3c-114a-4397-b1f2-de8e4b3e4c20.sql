ALTER TABLE public.member_travel
  ADD COLUMN IF NOT EXISTS home_country text,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS onboarding_step text,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;