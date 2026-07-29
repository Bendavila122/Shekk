import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Panel, PageTitle, Stat, Pill, Toggle } from "@/components/admin/AdminUI";
import { useAdminConfig, type Promotion } from "@/lib/admin";

export const Route = createFileRoute("/admin/promotions")({
  component: Promotions,
});

const PLACEMENTS: Promotion["placement"][] = ["home", "explore", "benefits"];

function Promotions() {
  const { config, update } = useAdminConfig();
  const promos = config.promotions;

  const patch = (id: string, p: Partial<Promotion>) =>
    update((c) => ({ ...c, promotions: c.promotions.map((x) => (x.id === id ? { ...x, ...p } : x)) }));
  const remove = (id: string) =>
    update((c) => ({ ...c, promotions: c.promotions.filter((x) => x.id !== id) }));

  return (
    <>
      <PageTitle title="Promotions" subtitle="Cards we push into Home, Explore and Benefits." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total" value={String(promos.length)} />
        <Stat label="Live now" value={String(promos.filter((p) => p.active).length)} tone="positive" />
        {PLACEMENTS.slice(0, 2).map((pl) => (
          <Stat key={pl} label={`On ${pl}`} value={String(promos.filter((p) => p.placement === pl && p.active).length)} />
        ))}
      </div>

      <NewPromotion onAdd={(p) => update((c) => ({ ...c, promotions: [p, ...c.promotions] }))} />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {promos.map((p) => (
          <Panel key={p.id}>
            <div className="flex items-start gap-3">
              <span className="text-3xl">{p.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold">{p.title}</p>
                <p className="text-sm text-muted-foreground">{p.blurb}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Pill tone="primary">{p.placement}</Pill>
                  <Pill tone={p.active ? "success" : "muted"}>{p.active ? "Live" : "Paused"}</Pill>
                  <span className="text-[11px] text-muted-foreground">
                    {p.ctaLabel} → {p.ctaHref}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label={`Delete ${p.title}`}
                className="rounded-xl bg-destructive/10 p-2 text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {PLACEMENTS.map((pl) => (
                <button
                  key={pl}
                  type="button"
                  onClick={() => patch(p.id, { placement: pl })}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                    p.placement === pl ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {pl}
                </button>
              ))}
              <div className="ml-auto">
                <Toggle label="Live" checked={p.active} onChange={(v) => patch(p.id, { active: v })} />
              </div>
            </div>
          </Panel>
        ))}
        {promos.length === 0 ? (
          <Panel>
            <p className="text-sm text-muted-foreground">No promotions yet. Add one above.</p>
          </Panel>
        ) : null}
      </div>
    </>
  );
}

function NewPromotion({ onAdd }: { onAdd: (p: Promotion) => void }) {
  const [title, setTitle] = useState("");
  const [blurb, setBlurb] = useState("");
  const [emoji, setEmoji] = useState("🎉");
  const [placement, setPlacement] = useState<Promotion["placement"]>("home");
  const [ctaLabel, setCtaLabel] = useState("Have a look");
  const [ctaHref, setCtaHref] = useState("/benefits");

  return (
    <Panel title="New promotion" className="mt-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          onAdd({
            id: `promo-${Date.now()}`,
            title: title.trim(),
            blurb: blurb.trim() || "",
            emoji: emoji || "🎉",
            placement,
            ctaLabel: ctaLabel.trim() || "Open",
            ctaHref: ctaHref.trim() || "/",
            active: true,
            createdISO: new Date().toISOString().slice(0, 10),
          });
          setTitle("");
          setBlurb("");
        }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Headline"
          aria-label="Headline"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          value={blurb}
          onChange={(e) => setBlurb(e.target.value)}
          placeholder="One-line detail"
          aria-label="Detail"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:col-span-2"
        />
        <input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
          aria-label="Emoji"
          className="rounded-xl border border-border bg-background px-3 py-2 text-center text-sm outline-none"
        />
        <select
          value={placement}
          onChange={(e) => setPlacement(e.target.value as Promotion["placement"])}
          aria-label="Placement"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
        >
          {PLACEMENTS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input
          value={ctaLabel}
          onChange={(e) => setCtaLabel(e.target.value)}
          placeholder="Button label"
          aria-label="Button label"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          value={ctaHref}
          onChange={(e) => setCtaHref(e.target.value)}
          placeholder="/benefits"
          aria-label="Button link"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:col-span-2"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          <Plus className="size-4" strokeWidth={3} /> Publish
        </button>
      </form>
    </Panel>
  );
}
