import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, Card, PrimaryButton, ScreenHeader } from "@/components/AppShell";
import { InsuranceCardTile } from "@/components/health/InsuranceCard";
import { ServiceLogo } from "@/components/ServiceLogo";
import { useHealth } from "@/lib/useHealth";
import type { InsuranceCard } from "@/lib/health.server";
import {
  CLINIC_CHECKLIST,
  EMERGENCY_NUMBERS,
  PROVIDERS,
  PROVIDER_KIND_LABEL,
  provider,
  type ProviderKind,
} from "@/lib/health";
import { useProfile } from "@/lib/useProfile";

export const Route = createFileRoute("/explore/health")({
  head: () => ({
    meta: [
      { title: "Health cover · Shekk" },
      {
        name: "description",
        content:
          "Keep your Maccabi, Harel or PassportCard details in Shekk so a clinic visit in Israel takes one tap.",
      },
      { property: "og:title", content: "Health cover · Shekk" },
      {
        property: "og:description",
        content: "Your insurance card, assistance line and emergency numbers in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Health,
});

const KIND_ORDER: ProviderKind[] = ["travel", "international", "kupah", "urgent", "other"];

type Draft = {
  id?: string;
  providerId: string;
  providerName: string;
  plan: string;
  memberNumber: string;
  groupNumber: string;
  policyHolder: string;
  validFrom: string;
  validUntil: string;
  hotline: string;
  covers: string;
  isPrimary: boolean;
  frontPath: string | null;
  backPath: string | null;
};

const emptyDraft = (isPrimary: boolean): Draft => ({
  providerId: "",
  providerName: "",
  plan: "",
  memberNumber: "",
  groupNumber: "",
  policyHolder: "",
  validFrom: "",
  validUntil: "",
  hotline: "",
  covers: "",
  isPrimary,
  frontPath: null,
  backPath: null,
});

const fromCard = (card: InsuranceCard): Draft => ({
  id: card.id,
  providerId: card.providerId,
  providerName: card.providerName,
  plan: card.plan ?? "",
  memberNumber: card.memberNumber ?? "",
  groupNumber: card.groupNumber ?? "",
  policyHolder: card.policyHolder ?? "",
  validFrom: card.validFrom ?? "",
  validUntil: card.validUntil ?? "",
  hotline: card.hotline ?? "",
  covers: card.covers ?? "",
  isPrimary: card.isPrimary,
  frontPath: card.frontPath,
  backPath: card.backPath,
});

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength = 120,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-3 text-base outline-none focus:border-primary"
      />
    </label>
  );
}

function Health() {
  const { cards, loading, save, remove, uploadPhoto } = useHealth();
  const { profile } = useProfile();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const holderName = [profile?.legalFirstName, profile?.legalLastName].filter(Boolean).join(" ");

  useEffect(() => {
    if (!draft) setError(null);
  }, [draft]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  function pickProvider(id: string) {
    const meta = provider(id);
    setDraft((d) =>
      d
        ? {
            ...d,
            providerId: id,
            providerName: meta && id !== "other" ? meta.name : d.providerName,
            hotline: d.hotline || meta?.hotline || "",
          }
        : d,
    );
  }

  async function attach(side: "front" | "back", file: File) {
    setError(null);
    try {
      const path = await uploadPhoto.mutateAsync({ side, file });
      set(side === "front" ? "frontPath" : "backPath", path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  }

  async function submit() {
    if (!draft) return;
    if (!draft.providerId || !draft.providerName.trim()) {
      setError("Pick your provider first.");
      return;
    }
    setError(null);
    try {
      await save.mutateAsync({
        id: draft.id,
        providerId: draft.providerId,
        providerName: draft.providerName,
        plan: draft.plan,
        memberNumber: draft.memberNumber,
        groupNumber: draft.groupNumber,
        policyHolder: draft.policyHolder || holderName,
        validFrom: draft.validFrom,
        validUntil: draft.validUntil,
        hotline: draft.hotline,
        covers: draft.covers,
        isPrimary: draft.isPrimary,
        frontPath: draft.frontPath,
        backPath: draft.backPath,
      });
      setDraft(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save that card");
    }
  }

  return (
    <AppShell>
      <ScreenHeader title="Health cover" subtitle="Your card, in your pocket" />

      <div className="space-y-5 px-4 py-4">
        {!draft && (
          <>
            {loading && <Card className="text-sm text-muted-foreground">Opening your cards…</Card>}

            {!loading && cards.length === 0 && (
              <Card className="space-y-3">
                <p className="font-display text-lg font-bold">Add your health cover</p>
                <p className="text-sm text-muted-foreground">
                  Maccabi, Harel Yedidim, PassportCard, Cigna — whatever your program set you up
                  with. Save the member number once and you'll never dig through email at a clinic
                  desk again.
                </p>
                <PrimaryButton onClick={() => setDraft(emptyDraft(true))}>Add a card</PrimaryButton>
              </Card>
            )}

            {cards.map((card) => (
              <InsuranceCardTile
                key={card.id}
                card={card}
                onEdit={() => setDraft(fromCard(card))}
                onDelete={() => {
                  if (window.confirm(`Remove your ${card.providerName} card?`)) {
                    void remove.mutateAsync(card.id);
                  }
                }}
              />
            ))}

            {cards.length > 0 && (
              <button
                type="button"
                onClick={() => setDraft(emptyDraft(false))}
                className="tap w-full rounded-2xl border border-dashed border-border bg-card px-4 py-4 text-sm font-semibold text-muted-foreground"
              >
                + Add another card
              </button>
            )}

            <Card className="space-y-2">
              <p className="text-sm font-semibold">At the desk</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {CLINIC_CHECKLIST.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span aria-hidden>·</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <div>
              <p className="px-1 pb-2 text-sm font-semibold">If it's urgent</p>
              <div className="grid grid-cols-2 gap-2">
                {EMERGENCY_NUMBERS.map((e) => (
                  <a
                    key={e.number}
                    href={`tel:${e.number}`}
                    className="tap flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
                  >
                    <span className="text-xl" aria-hidden>
                      {e.emoji}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{e.label}</span>
                      <span className="block font-mono text-xs text-muted-foreground">{e.number}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {draft && (
          <div className="space-y-4">
            <Card className="space-y-3">
              <p className="text-sm font-semibold">Who covers you?</p>
              {KIND_ORDER.map((kind) => {
                const group = PROVIDERS.filter((p) => p.kind === kind);
                if (!group.length) return null;
                return (
                  <div key={kind} className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {PROVIDER_KIND_LABEL[kind]}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {group.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => pickProvider(p.id)}
                          className={`tap flex items-center gap-2 rounded-xl border p-2 text-left ${
                            draft.providerId === p.id
                              ? "border-primary bg-primary/10"
                              : "border-border bg-card"
                          }`}
                        >
                          <ServiceLogo
                            service={{ name: p.name, emoji: p.emoji, domain: p.domain }}
                            size={28}
                          />
                          <span className="min-w-0 truncate text-sm font-medium">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {provider(draft.providerId)?.note && (
                <p className="text-xs text-muted-foreground">{provider(draft.providerId)?.note}</p>
              )}
            </Card>

            <Card className="space-y-3">
              {draft.providerId === "other" && (
                <Field
                  label="Provider name"
                  value={draft.providerName}
                  onChange={(v) => set("providerName", v)}
                  placeholder="As printed on the card"
                />
              )}
              <Field
                label="Plan"
                value={draft.plan}
                onChange={(v) => set("plan", v)}
                placeholder="e.g. Yedidim Student"
              />
              <Field
                label="Member number"
                value={draft.memberNumber}
                onChange={(v) => set("memberNumber", v)}
                placeholder="The long number on the front"
                maxLength={64}
              />
              <Field
                label="Group / policy number"
                value={draft.groupNumber}
                onChange={(v) => set("groupNumber", v)}
                maxLength={64}
              />
              <Field
                label="Policy holder"
                value={draft.policyHolder}
                onChange={(v) => set("policyHolder", v)}
                placeholder={holderName || "Your full name"}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Valid from"
                  type="date"
                  value={draft.validFrom}
                  onChange={(v) => set("validFrom", v)}
                />
                <Field
                  label="Valid until"
                  type="date"
                  value={draft.validUntil}
                  onChange={(v) => set("validUntil", v)}
                />
              </div>
              <Field
                label="Assistance line"
                value={draft.hotline}
                onChange={(v) => set("hotline", v)}
                placeholder="24/7 number to call first"
                maxLength={40}
              />
              <Field
                label="What it covers"
                value={draft.covers}
                onChange={(v) => set("covers", v)}
                placeholder="e.g. GP, urgent care, no dental"
                maxLength={500}
              />
              <label className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-3">
                <input
                  type="checkbox"
                  checked={draft.isPrimary}
                  onChange={(e) => set("isPrimary", e.target.checked)}
                  className="size-4"
                />
                <span className="text-sm">Show this one first</span>
              </label>
            </Card>

            <Card className="space-y-3">
              <p className="text-sm font-semibold">Photo of the card</p>
              <p className="text-xs text-muted-foreground">
                Optional, and private to you. Handy when a clinic wants to see the physical card.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(["front", "back"] as const).map((side) => {
                  const saved = side === "front" ? draft.frontPath : draft.backPath;
                  return (
                    <label
                      key={side}
                      className="tap flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed border-border bg-card px-3 py-5 text-center"
                    >
                      <span className="text-sm font-semibold capitalize">{side}</span>
                      <span className="text-xs text-muted-foreground">
                        {saved ? "Photo attached" : "Tap to add"}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void attach(side, file);
                        }}
                      />
                    </label>
                  );
                })}
              </div>
              {uploadPhoto.isPending && (
                <p className="text-xs text-muted-foreground">Uploading photo…</p>
              )}
            </Card>

            {error && <Card className="bg-destructive/10 text-sm text-destructive">{error}</Card>}

            <PrimaryButton onClick={() => void submit()} disabled={save.isPending}>
              {save.isPending ? "Saving…" : draft.id ? "Save changes" : "Save card"}
            </PrimaryButton>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="tap w-full py-2 text-sm font-medium text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
