import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Panel, PageTitle, Stat, Pill } from "@/components/admin/AdminUI";
import { useAdminConfig, type CustomService } from "@/lib/admin";
import { SERVICE_CATEGORIES, STATUS_LABEL, type ServiceStatus } from "@/lib/services";
import { BENEFITS } from "@/lib/benefits";
import { ServiceLogo } from "@/components/ServiceLogo";

export const Route = createFileRoute("/admin/apps")({
  component: Apps,
});

const STATUSES: ServiceStatus[] = ["live", "integrating", "guide"];

function Apps() {
  const { config, update } = useAdminConfig();
  const [tab, setTab] = useState<"services" | "benefits">("services");

  const all = useMemo(
    () =>
      SERVICE_CATEGORIES.flatMap((c) =>
        c.services.map((s) => ({ ...s, categoryId: c.id, categoryLabel: c.label, custom: false })),
      ).concat(
        config.customServices.map((c) => ({
          ...c,
          featured: false,
          categoryLabel: SERVICE_CATEGORIES.find((x) => x.id === c.categoryId)?.label ?? c.categoryId,
          custom: true,
        })) as never[],
      ),
    [config.customServices],
  );

  const hidden = config.hiddenServices;
  const toggleHidden = (id: string) =>
    update((c) => ({
      ...c,
      hiddenServices: c.hiddenServices.includes(id)
        ? c.hiddenServices.filter((x) => x !== id)
        : [...c.hiddenServices, id],
    }));

  const setStatus = (id: string, status: ServiceStatus) =>
    update((c) => ({ ...c, serviceStatus: { ...c.serviceStatus, [id]: status } }));

  const removeCustom = (id: string) =>
    update((c) => ({ ...c, customServices: c.customServices.filter((s) => s.id !== id) }));

  const toggleBenefit = (id: string) =>
    update((c) => ({
      ...c,
      hiddenBenefits: c.hiddenBenefits.includes(id)
        ? c.hiddenBenefits.filter((x) => x !== id)
        : [...c.hiddenBenefits, id],
    }));

  return (
    <>
      <PageTitle title="Apps & services" subtitle="What appears in Explore, and which offers run in Benefits." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Services" value={String(all.length)} sub={`${hidden.length} hidden`} />
        <Stat label="Live in app" value={String(all.filter((s) => (config.serviceStatus[s.id] ?? s.status) === "live").length)} />
        <Stat label="Custom added" value={String(config.customServices.length)} />
        <Stat label="Benefits running" value={String(BENEFITS.length - config.hiddenBenefits.length)} />
      </div>

      <div className="mt-6 flex gap-2">
        {(["services", "benefits"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "services" ? (
        <>
          <AddServiceForm onAdd={(s) => update((c) => ({ ...c, customServices: [s, ...c.customServices] }))} />

          <Panel title="Catalogue" className="mt-4">
            <div className="divide-y divide-border">
              {all.map((s) => {
                const isHidden = hidden.includes(s.id);
                const status = config.serviceStatus[s.id] ?? s.status;
                return (
                  <div key={s.id} className="flex flex-wrap items-center gap-3 py-3">
                    <ServiceLogo service={{ name: s.name, domain: s.domain, emoji: s.emoji }} size={40} />
                    <div className="min-w-40 flex-1">
                      <p className={`text-sm font-semibold ${isHidden ? "line-through opacity-50" : ""}`}>
                        {s.name} {s.custom ? <Pill tone="primary">custom</Pill> : null}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.categoryLabel} · {s.blurb}
                      </p>
                    </div>
                    <select
                      value={status}
                      onChange={(e) => setStatus(s.id, e.target.value as ServiceStatus)}
                      aria-label={`Status for ${s.name}`}
                      className="rounded-xl border border-border bg-background px-2.5 py-1.5 text-xs font-semibold outline-none"
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>{STATUS_LABEL[st]}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => toggleHidden(s.id)}
                      aria-label={isHidden ? `Show ${s.name}` : `Hide ${s.name}`}
                      className="rounded-xl bg-muted p-2 text-muted-foreground hover:text-foreground"
                    >
                      {isHidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                    {s.custom ? (
                      <button
                        type="button"
                        onClick={() => removeCustom(s.id)}
                        aria-label={`Delete ${s.name}`}
                        className="rounded-xl bg-destructive/10 p-2 text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Panel>
        </>
      ) : (
        <Panel title="Benefits marketplace" className="mt-4">
          <div className="divide-y divide-border">
            {BENEFITS.map((b) => {
              const isHidden = config.hiddenBenefits.includes(b.id);
              return (
                <div key={b.id} className="flex items-center gap-3 py-3">
                  <ServiceLogo service={{ name: b.brand, domain: b.domain, emoji: b.emoji }} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${isHidden ? "line-through opacity-50" : ""}`}>{b.brand}</p>
                    <p className="truncate text-xs text-muted-foreground">{b.headline}</p>
                  </div>
                  <Pill tone={b.premium ? "primary" : "muted"}>{b.premium ? "Premium" : "All members"}</Pill>
                  <button
                    type="button"
                    onClick={() => toggleBenefit(b.id)}
                    aria-label={isHidden ? `Run ${b.brand} offer` : `Pause ${b.brand} offer`}
                    className="rounded-xl bg-muted p-2 text-muted-foreground hover:text-foreground"
                  >
                    {isHidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </>
  );
}

function AddServiceForm({ onAdd }: { onAdd: (s: CustomService) => void }) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(SERVICE_CATEGORIES[0].id);
  const [blurb, setBlurb] = useState("");
  const [domain, setDomain] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [status, setStatus] = useState<ServiceStatus>("integrating");

  return (
    <Panel title="Add a service" className="mt-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onAdd({
            id: `custom-${Date.now()}`,
            categoryId,
            name: name.trim(),
            blurb: blurb.trim() || "Added from the console",
            domain: domain.trim() || undefined,
            emoji: emoji || "✨",
            status,
          });
          setName("");
          setBlurb("");
          setDomain("");
        }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          aria-label="Service name"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          aria-label="Category"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="brand.com (for the logo)"
          aria-label="Domain"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <input
          value={blurb}
          onChange={(e) => setBlurb(e.target.value)}
          placeholder="One-line description"
          aria-label="Description"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:col-span-2"
        />
        <div className="flex gap-3">
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
            aria-label="Fallback emoji"
            className="w-16 rounded-xl border border-border bg-background px-3 py-2 text-center text-sm outline-none"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ServiceStatus)}
            aria-label="Initial status"
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground sm:col-span-2 lg:col-span-3"
        >
          <Plus className="size-4" strokeWidth={3} /> Add to Explore
        </button>
      </form>
    </Panel>
  );
}
