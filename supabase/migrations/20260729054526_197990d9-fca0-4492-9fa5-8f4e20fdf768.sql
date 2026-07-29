REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.accounts, public.ledger_entries, public.holds, public.funding_events FROM authenticated;
REVOKE ALL ON public.accounts, public.ledger_entries, public.holds, public.funding_events FROM anon;

GRANT SELECT ON public.accounts, public.ledger_entries, public.holds, public.funding_events TO authenticated;
GRANT ALL ON public.accounts, public.ledger_entries, public.holds, public.funding_events TO service_role;

CREATE POLICY "No direct writes to accounts" ON public.accounts AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);
CREATE POLICY "No direct writes to ledger" ON public.ledger_entries AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);
CREATE POLICY "No direct writes to holds" ON public.holds AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);
CREATE POLICY "No direct writes to funding events" ON public.funding_events AS RESTRICTIVE FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

DROP TRIGGER IF EXISTS ledger_entries_append_only ON public.ledger_entries;
CREATE TRIGGER ledger_entries_append_only
  BEFORE UPDATE OR DELETE ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.ledger_is_immutable();