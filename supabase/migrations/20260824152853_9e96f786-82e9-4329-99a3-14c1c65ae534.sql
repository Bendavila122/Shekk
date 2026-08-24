-- ─────────────────────────── sim_providers ───────────────────────────
CREATE TABLE public.sim_providers (
  id text PRIMARY KEY,
  name text NOT NULL,
  blurb text,
  site_url text,
  mode text NOT NULL DEFAULT 'disabled' CHECK (mode IN ('disabled','affiliate','voucher','api')),
  affiliate_url_template text,
  affiliate_network text,
  affiliate_tracking_id text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sim_providers TO anon;
GRANT SELECT ON public.sim_providers TO authenticated;
GRANT ALL ON public.sim_providers TO service_role;

ALTER TABLE public.sim_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active SIM providers are readable"
  ON public.sim_providers FOR SELECT
  USING (active = true);

CREATE TRIGGER sim_providers_touch
  BEFORE UPDATE ON public.sim_providers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ─────────────────────────── sim_plans ───────────────────────────
CREATE TABLE public.sim_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id text NOT NULL REFERENCES public.sim_providers(id) ON DELETE CASCADE,
  external_id text,
  name text NOT NULL,
  headline text,
  country_code text NOT NULL DEFAULT 'IL',
  plan_type text NOT NULL DEFAULT 'data_only' CHECK (plan_type IN ('data_only','data_voice','local_number')),
  data_mb integer,
  unlimited boolean NOT NULL DEFAULT false,
  fair_use_note text,
  validity_days integer,
  calls_included boolean NOT NULL DEFAULT false,
  texts_included boolean NOT NULL DEFAULT false,
  phone_number_included boolean NOT NULL DEFAULT false,
  rechargeable boolean NOT NULL DEFAULT false,
  activation_policy text,
  operator text,
  networks text[],
  net_cost_minor integer,
  display_price_minor integer NOT NULL DEFAULT 0,
  display_price_label text,
  display_period_label text,
  currency text NOT NULL DEFAULT 'GBP',
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','api')),
  active boolean NOT NULL DEFAULT true,
  in_stock boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  rank_boost integer NOT NULL DEFAULT 0,
  points text[] NOT NULL DEFAULT '{}'::text[],
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX sim_plans_provider_external_key
  ON public.sim_plans (provider_id, external_id)
  WHERE external_id IS NOT NULL;
CREATE INDEX sim_plans_active_idx ON public.sim_plans (active, country_code);

GRANT SELECT ON public.sim_plans TO anon;
GRANT SELECT ON public.sim_plans TO authenticated;
GRANT ALL ON public.sim_plans TO service_role;

ALTER TABLE public.sim_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active SIM plans are readable"
  ON public.sim_plans FOR SELECT
  USING (active = true);

CREATE TRIGGER sim_plans_touch
  BEFORE UPDATE ON public.sim_plans
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ─────────────────────────── sim_recommendations ───────────────────────────
CREATE TABLE public.sim_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  ranked jsonb NOT NULL DEFAULT '[]'::jsonb,
  top_plan_id uuid REFERENCES public.sim_plans(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sim_recommendations_user_idx ON public.sim_recommendations (user_id, created_at DESC);

GRANT SELECT ON public.sim_recommendations TO authenticated;
GRANT ALL ON public.sim_recommendations TO service_role;

ALTER TABLE public.sim_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own SIM recommendations"
  ON public.sim_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ─────────────────────────── sim_clicks ───────────────────────────
CREATE TABLE public.sim_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  provider_id text REFERENCES public.sim_providers(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES public.sim_plans(id) ON DELETE SET NULL,
  recommendation_id uuid REFERENCES public.sim_recommendations(id) ON DELETE SET NULL,
  target_url text NOT NULL,
  affiliate boolean NOT NULL DEFAULT false,
  converted_at timestamptz,
  reported_amount_minor integer,
  reported_currency text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sim_clicks_created_idx ON public.sim_clicks (created_at DESC);
CREATE INDEX sim_clicks_user_idx ON public.sim_clicks (user_id, created_at DESC);

GRANT SELECT ON public.sim_clicks TO authenticated;
GRANT ALL ON public.sim_clicks TO service_role;

ALTER TABLE public.sim_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own SIM handoffs"
  ON public.sim_clicks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ─────────────────────────── sim_orders ───────────────────────────
CREATE TABLE public.sim_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id text NOT NULL REFERENCES public.sim_providers(id) ON DELETE RESTRICT,
  plan_id uuid REFERENCES public.sim_plans(id) ON DELETE SET NULL,
  mode text NOT NULL CHECK (mode IN ('voucher','api')),
  status text NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment','paid','fulfilling','fulfilled','failed','refunded')),
  amount_minor integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GBP',
  stripe_session_id text,
  stripe_payment_intent text,
  provider_order_ref text,
  failure_reason text,
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sim_orders_user_idx ON public.sim_orders (user_id, created_at DESC);

GRANT SELECT ON public.sim_orders TO authenticated;
GRANT ALL ON public.sim_orders TO service_role;

ALTER TABLE public.sim_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own SIM orders"
  ON public.sim_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER sim_orders_touch
  BEFORE UPDATE ON public.sim_orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ─────────────────────────── sim_esims ───────────────────────────
CREATE TABLE public.sim_esims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.sim_orders(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id text NOT NULL REFERENCES public.sim_providers(id) ON DELETE RESTRICT,
  plan_id uuid REFERENCES public.sim_plans(id) ON DELETE SET NULL,
  iccid text,
  activation_code text,
  lpa_string text,
  qr_url text,
  smdp_address text,
  matching_id text,
  status text NOT NULL DEFAULT 'provisioning'
    CHECK (status IN ('provisioning','ready','active','expired','failed')),
  installed_at timestamptz,
  expires_at timestamptz,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sim_esims_user_idx ON public.sim_esims (user_id, created_at DESC);

GRANT SELECT ON public.sim_esims TO authenticated;
GRANT ALL ON public.sim_esims TO service_role;

ALTER TABLE public.sim_esims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own eSIMs"
  ON public.sim_esims FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER sim_esims_touch
  BEFORE UPDATE ON public.sim_esims
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();