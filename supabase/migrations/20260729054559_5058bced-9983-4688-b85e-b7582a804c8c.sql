DROP POLICY IF EXISTS "No direct writes to accounts" ON public.accounts;
DROP POLICY IF EXISTS "No direct writes to ledger" ON public.ledger_entries;
DROP POLICY IF EXISTS "No direct writes to holds" ON public.holds;
DROP POLICY IF EXISTS "No direct writes to funding events" ON public.funding_events;

CREATE POLICY "No direct inserts on accounts" ON public.accounts AS RESTRICTIVE FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "No direct updates on accounts" ON public.accounts AS RESTRICTIVE FOR UPDATE TO authenticated, anon USING (false) WITH CHECK (false);
CREATE POLICY "No direct deletes on accounts" ON public.accounts AS RESTRICTIVE FOR DELETE TO authenticated, anon USING (false);

CREATE POLICY "No direct inserts on ledger" ON public.ledger_entries AS RESTRICTIVE FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "No direct updates on ledger" ON public.ledger_entries AS RESTRICTIVE FOR UPDATE TO authenticated, anon USING (false) WITH CHECK (false);
CREATE POLICY "No direct deletes on ledger" ON public.ledger_entries AS RESTRICTIVE FOR DELETE TO authenticated, anon USING (false);

CREATE POLICY "No direct inserts on holds" ON public.holds AS RESTRICTIVE FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "No direct updates on holds" ON public.holds AS RESTRICTIVE FOR UPDATE TO authenticated, anon USING (false) WITH CHECK (false);
CREATE POLICY "No direct deletes on holds" ON public.holds AS RESTRICTIVE FOR DELETE TO authenticated, anon USING (false);

CREATE POLICY "No direct inserts on funding events" ON public.funding_events AS RESTRICTIVE FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "No direct updates on funding events" ON public.funding_events AS RESTRICTIVE FOR UPDATE TO authenticated, anon USING (false) WITH CHECK (false);
CREATE POLICY "No direct deletes on funding events" ON public.funding_events AS RESTRICTIVE FOR DELETE TO authenticated, anon USING (false);