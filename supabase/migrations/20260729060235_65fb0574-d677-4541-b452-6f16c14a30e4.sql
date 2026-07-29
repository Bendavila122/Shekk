CREATE TABLE public.member_profiles (
  user_id uuid PRIMARY KEY,
  email text,
  legal_first_name text,
  legal_middle_name text,
  legal_last_name text,
  date_of_birth date,
  nationality text,
  phone_country_code text,
  phone_number text,
  address_line1 text,
  address_line2 text,
  address_city text,
  address_state text,
  address_postcode text,
  address_country text,
  il_address_line1 text,
  il_address_city text,
  il_address_postcode text,
  id_document_type text,
  id_document_number text,
  id_issuing_country text,
  id_expiry date,
  tax_country text,
  tax_id text,
  occupation text,
  source_of_funds text,
  expected_monthly_ils integer,
  is_pep boolean NOT NULL DEFAULT false,
  is_us_person boolean NOT NULL DEFAULT false,
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  esign_accepted_at timestamptz,
  program text,
  cohort text,
  city text,
  arrival_date date,
  preferred_currency text NOT NULL DEFAULT 'USD',
  kyc_status text NOT NULL DEFAULT 'not_started',
  kyc_submitted_at timestamptz,
  kyc_reviewed_at timestamptz,
  kyc_rejection_reason text,
  reverify_due_at timestamptz,
  airwallex_cardholder_id text,
  airwallex_account_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.kyc_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  storage_path text NOT NULL,
  mime_type text,
  byte_size integer,
  status text NOT NULL DEFAULT 'uploaded',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX kyc_documents_user_idx ON public.kyc_documents (user_id);

GRANT SELECT ON public.member_profiles TO authenticated;
GRANT ALL ON public.member_profiles TO service_role;
GRANT SELECT ON public.kyc_documents TO authenticated;
GRANT ALL ON public.kyc_documents TO service_role;

ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own profile"
  ON public.member_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "No direct inserts on member profiles"
  ON public.member_profiles AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No direct updates on member profiles"
  ON public.member_profiles AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No direct deletes on member profiles"
  ON public.member_profiles AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);

CREATE POLICY "Members read their own documents"
  ON public.kyc_documents FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "No direct inserts on kyc documents"
  ON public.kyc_documents AS RESTRICTIVE FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "No direct updates on kyc documents"
  ON public.kyc_documents AS RESTRICTIVE FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No direct deletes on kyc documents"
  ON public.kyc_documents AS RESTRICTIVE FOR DELETE TO anon, authenticated USING (false);