ALTER TABLE public.member_profiles
  ADD COLUMN IF NOT EXISTS airwallex_account_status text NOT NULL DEFAULT 'not_submitted',
  ADD COLUMN IF NOT EXISTS airwallex_account_id text,
  ADD COLUMN IF NOT EXISTS ils_account_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS airwallex_rejection_reason text;