import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageTitle, Panel, Pill, Stat, Toggle } from "@/components/admin/AdminUI";
import { FACILITIES } from "@/lib/fitness";
import {
  adminVenueList,
  adminVenueMarkVerified,
  adminVenueSave,
  adminVenueSearchGoogle,
  adminVenueSetActive,
} from "@/lib/places/places-admin.functions";
import type { VenueMetaAdminRow } from "@/lib/places/admin.server";
import { verifiedLabel } from "@/lib/places";

export const Route = createFileRoute("/admin/places")({
  component: PlacesConsole,
});

type Draft = {
  placeId: string;
  label: string;
  nameSnapshot: string;
  chain: string;
  city: string;
  dayPassIls: string;
  monthlyIls: string;
  minContractMonths: string;
  facilities: string[];
  englishFriendly: boolean;
  shortStay: boolean;
  partner: boolean;
  partnerOffer: string;
  notes: string;
  internalNotes: string;
  active: boolean;
};

const emptyDraft = (placeId = "", nameSnapshot = ""): Draft => ({
  placeId,
  label: "",
  nameSnapshot,
  chain: "",
  city: "",
  dayPassIls: "",
  monthlyIls: "",
  minContractMonths: "",
  facilities: [],
  englishFriendly: false,
  shortStay: false,
  partner: false,
  partnerOffer: "",
  notes: "",
  internalNotes: "",
  active: true,
});

const toDraft = (r: VenueMetaAdminRow): Draft => ({
  placeId: r.placeId,
  label: r.label ?? "",
  nameSnapshot: r.nameSnapshot ?? "",
  chain: r.chain ?? "",
  city: r.city ?? "",
  dayPassIls: r.dayPassIls === null ? "" : String(r.dayPassIls),
  monthlyIls: r.monthlyIls === null ? "" : String(r.monthlyIls),
  minContractMonths: r.minContractMonths === null ? "" : String(r.minContractMonths),
  facilities: r.facilities,
  englishFriendly: r.englishFriendly,
  shortStay: r.shortStay,
  partner: r.partner,
  partnerOffer: r.partnerOffer ?? "",
  notes: r.notes ?? "",
  internalNotes: r.internalNotes ?? "",
  active: r.active,
});

const num = (v: string) => {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? Math.round(n) : null;
};

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary";

function PlacesConsole() {
  const qc = useQueryClient();
  const list = useServerFn(adminVenueList);
  const searchGoogle = useServerFn(adminVenueSearchGoogle);
  const save = useServerFn(adminVenueSave);
  const setActive = useServerFn(adminVenueSetActive);
  const markVerified = useServerFn(adminVenueMarkVerified);

  const [search, setSearch] = useState("");
  const [googleTerm, setGoogleTerm] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const rows = useQuery({
    queryKey: ["admin", "venues", search],
    queryFn: () => list({ data: search ? { search } : {} }),
    staleTime: 15_000,
  });

  const found = useMutation({
    mutationFn: (query: string) => searchGoogle({ data: { query } }),
    onError: (e) => setNotice((e as Error).message),
  });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "venues"] });

  const saving = useMutation({
    mutationFn: (d: Draft) =>
      save({
        data: {
          placeId: d.placeId.trim(),
          label: d.label,
          nameSnapshot: d.nameSnapshot,
          chain: d.chain,
          city: d.city,
          dayPassIls: num(d.dayPassIls),
          monthlyIls: num(d.monthlyIls),
          minContractMonths: num(d.minContractMonths),
          facilities: d.facilities,
          englishFriendly: d.englishFriendly,
          shortStay: d.shortStay,
          partner: d.partner,
          partnerOffer: d.partner ? d.partnerOffer : "",
          notes: d.notes,
          internalNotes: d.internalNotes,
          active: d.active,
        },
      }),
    onSuccess: (r) => {
      setNotice(`Saved ${r.label || r.nameSnapshot || r.placeId}.`);
      setDraft(null);
      invalidate();
    },
    onError: (e) => setNotice((e as Error).message),
  });

  const activeMutation = useMutation({
    mutationFn: (v: { placeId: string; active: boolean }) => setActive({ data: v }),
    onSuccess: invalidate,
    onError: (e) => setNotice((e as Error).message),
  });

  const verifyMutation = useMutation({
    mutationFn: (placeId: string) => markVerified({ data: { placeId } }),
    onSuccess: () => {
      setNotice("Marked verified just now.");
      invalidate();
    },
    onError: (e) => setNotice((e as Error).message),
  });

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  const venues = rows.data ?? [];
  const withPrice = venues.filter((v) => v.monthlyIls !== null || v.dayPassIls !== null).length;
  const partners = venues.filter((v) => v.partner).length;
  const stale = venues.filter((v) => !v.verifiedAt).length;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const facilityOptions = useMemo(() => FACILITIES, []);

  return (
    <>
      <PageTitle title="Places & venues" subtitle="Shekk's own facts about a venue, joined to Google by place id." />

      <Panel className="mb-4">
        <p className="text-sm font-semibold">Shekk data only</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Never copy Google ratings, review counts, opening hours, photos, phone numbers or addresses into these
          fields. Those are fetched live from Google every time a member opens a screen and must not be stored.
          Record only what Shekk itself established: prices you confirmed with the venue, contract length,
          facilities, partner status and your own notes.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          <strong>Member notes</strong> are shown in the app. <strong>Internal notes</strong> stay in this console
          and are never returned to the app.
        </p>
      </Panel>

      {notice ? (
        <Panel className="mb-4">
          <p className="text-sm">{notice}</p>
        </Panel>
      ) : null}

      {rows.error ? (
        <Panel className="mb-4">
          <p className="text-sm text-destructive">{(rows.error as Error).message}</p>
        </Panel>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Venues" value={String(venues.length)} sub={`${venues.filter((v) => v.active).length} live`} />
        <Stat label="With a price" value={String(withPrice)} sub="Monthly or day pass recorded" />
        <Stat label="Partners" value={String(partners)} sub="Signed offers" />
        <Stat label="Unverified" value={String(stale)} sub="No verification stamp yet" />
      </div>

      <Panel title="Find a place on Google" className="mt-6">
        <p className="mb-3 text-sm text-muted-foreground">
          Search Google to get the correct place id. Nothing is saved until you fill in Shekk's own fields below.
        </p>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (googleTerm.trim().length >= 2) found.mutate(googleTerm.trim());
          }}
        >
          <input
            value={googleTerm}
            onChange={(e) => setGoogleTerm(e.target.value)}
            placeholder="e.g. Holmes Place Jerusalem"
            className={`${inputClass} max-w-md flex-1`}
          />
          <button
            type="submit"
            disabled={found.isPending}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {found.isPending ? "Searching…" : "Search Google"}
          </button>
        </form>

        {found.data?.length ? (
          <ul className="mt-4 space-y-2">
            {found.data.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.address}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">{p.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const existing = venues.find((v) => v.placeId === p.id);
                    setDraft(existing ? toDraft(existing) : emptyDraft(p.id, p.name));
                  }}
                  className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold"
                >
                  {venues.some((v) => v.placeId === p.id) ? "Edit Shekk data" : "Add Shekk data"}
                </button>
              </li>
            ))}
          </ul>
        ) : found.isSuccess ? (
          <p className="mt-3 text-sm text-muted-foreground">No places matched.</p>
        ) : null}
      </Panel>

      {draft ? (
        <Panel title={draft.nameSnapshot || draft.placeId || "New venue"} className="mt-6">
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.placeId.trim()) {
                setNotice("A Google place id is required.");
                return;
              }
              saving.mutate(draft);
            }}
          >
            <Field label="Google place id" hint="The only Google field Shekk is allowed to store.">
              <input
                value={draft.placeId}
                onChange={(e) => set("placeId", e.target.value)}
                className={`${inputClass} font-mono text-xs`}
              />
            </Field>
            <Field label="Name (for the console)" hint="Convenience only — the app always shows Google's name.">
              <input value={draft.nameSnapshot} onChange={(e) => set("nameSnapshot", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Internal label">
              <input value={draft.label} onChange={(e) => set("label", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Chain / brand">
              <input value={draft.chain} onChange={(e) => set("chain", e.target.value)} className={inputClass} />
            </Field>
            <Field label="City">
              <input value={draft.city} onChange={(e) => set("city", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Day pass (₪)" hint="Leave blank if unknown. Shekk never estimates a price.">
              <input
                value={draft.dayPassIls}
                onChange={(e) => set("dayPassIls", e.target.value)}
                inputMode="numeric"
                className={inputClass}
              />
            </Field>
            <Field label="Monthly (₪)" hint="Exactly what the venue quoted. No derived or averaged figures.">
              <input
                value={draft.monthlyIls}
                onChange={(e) => set("monthlyIls", e.target.value)}
                inputMode="numeric"
                className={inputClass}
              />
            </Field>
            <Field label="Minimum contract (months)" hint="1 means rolling monthly.">
              <input
                value={draft.minContractMonths}
                onChange={(e) => set("minContractMonths", e.target.value)}
                inputMode="numeric"
                className={inputClass}
              />
            </Field>

            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Facilities</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {facilityOptions.map((f) => {
                  const on = draft.facilities.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() =>
                        set(
                          "facilities",
                          on ? draft.facilities.filter((x) => x !== f.id) : [...draft.facilities, f.id],
                        )
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                      }`}
                    >
                      {f.emoji} {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              {(
                [
                  ["englishFriendly", "English spoken at the desk"],
                  ["shortStay", "Short-stay option exists (term contract or punch card)"],
                  ["partner", "Shekk partner"],
                  ["active", "Active (visible to members)"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
                  <span className="text-sm">{label}</span>
                  <Toggle label={label} checked={draft[key]} onChange={(v) => set(key, v)} />
                </div>
              ))}
            </div>

            <div className="md:col-span-2">
              <Field
                label="Partner offer"
                hint={
                  draft.partner
                    ? "Shown to members as a Shekk offer."
                    : "Turn on “Shekk partner” first — an offer is never published without a signed partner."
                }
              >
                <input
                  value={draft.partnerOffer}
                  onChange={(e) => set("partnerOffer", e.target.value)}
                  disabled={!draft.partner}
                  className={`${inputClass} disabled:opacity-50`}
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Member notes" hint="Shown in the app, under Shekk's own panel.">
                <textarea
                  value={draft.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Internal notes" hint="Console only. Never sent to the app.">
                <textarea
                  value={draft.internalNotes}
                  onChange={(e) => set("internalNotes", e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-2 md:col-span-2">
              <button
                type="submit"
                disabled={saving.isPending}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {saving.isPending ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </Panel>
      ) : (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setDraft(emptyDraft())}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold"
          >
            Add a venue by place id
          </button>
        </div>
      )}

      <Panel title="Venue metadata" className="mt-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name, chain, city or place id"
          className={`${inputClass} mb-4 max-w-md`}
        />

        {rows.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {!rows.isLoading && venues.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No venue metadata yet. Search Google above, then record what Shekk knows.
          </p>
        ) : null}

        <div className="space-y-3">
          {venues.map((v) => (
            <div key={v.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{v.label || v.nameSnapshot || v.placeId}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">{v.placeId}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {v.chain ? <Pill>{v.chain}</Pill> : null}
                    {v.city ? <Pill>{v.city}</Pill> : null}
                    {v.monthlyIls !== null ? <Pill tone="primary">₪{v.monthlyIls}/mo</Pill> : null}
                    {v.dayPassIls !== null ? <Pill>Day ₪{v.dayPassIls}</Pill> : null}
                    {v.partner ? <Pill tone="success">Partner</Pill> : null}
                    {v.shortStay ? <Pill>Short stay</Pill> : null}
                    {v.active ? <Pill tone="success">Live</Pill> : <Pill tone="warning">Hidden</Pill>}
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {verifiedLabel({ ...(v.verifiedAt ? { verifiedAt: v.verifiedAt } : {}) })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft(toDraft(v))}
                    className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => verifyMutation.mutate(v.placeId)}
                    className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold"
                  >
                    Mark verified now
                  </button>
                  <button
                    type="button"
                    onClick={() => activeMutation.mutate({ placeId: v.placeId, active: !v.active })}
                    className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold"
                  >
                    {v.active ? "Deactivate" : "Reactivate"}
                  </button>
                </div>
              </div>
              {v.internalNotes ? (
                <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                  Internal: {v.internalNotes}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
