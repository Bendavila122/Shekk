import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Panel, PageTitle, Toggle, Pill } from "@/components/admin/AdminUI";
import { useAdminConfig, clearAdminSession } from "@/lib/admin";
import { PARTNERS } from "@/lib/banking";

export const Route = createFileRoute("/admin/controls")({
  component: Controls,
});

function Controls() {
  const { config, update, resetConfig } = useAdminConfig();
  const [note, setNote] = useState<string | null>(null);

  return (
    <>
      <PageTitle title="Controls" subtitle="System switches, partner status and console housekeeping." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Availability">
          <div className="space-y-3">
            <Toggle
              label="New sign-ups open"
              hint="Turn off to hold the waiting list while onboarding catches up."
              checked={config.signupsOpen}
              onChange={(v) => update({ signupsOpen: v })}
            />
            <Toggle
              label="Card issuing open"
              hint="Stops new Shekk Mastercards being requested. Existing cards keep working."
              checked={config.cardIssuingOpen}
              onChange={(v) => update({ cardIssuingOpen: v })}
            />
          </div>

          <label className="mt-4 block text-sm font-semibold">Status banner shown in the app</label>
          <textarea
            value={config.maintenanceNote}
            onChange={(e) => update({ maintenanceNote: e.target.value })}
            rows={3}
            placeholder="Leave empty for no banner."
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </Panel>

        <Panel title="Regulated partners">
          <div className="space-y-3">
            {Object.entries(PARTNERS).map(([key, p]) => (
              <div key={key} className="flex items-start justify-between gap-3 rounded-xl bg-muted p-3">
                <div>
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.role}</p>
                </div>
                <Pill tone="warning">{p.status}</Pill>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Every regulated function sits with a licensed partner. This console reflects their onboarding status.
          </p>
        </Panel>

        <Panel title="Console housekeeping">
          <p className="text-sm text-muted-foreground">
            Overrides made here are stored on this device only. Resetting restores the shipped catalogue, offers,
            promotions and pricing.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                resetConfig();
                setNote("Console overrides reset.");
              }}
              className="rounded-xl bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground"
            >
              Reset all overrides
            </button>
            <button
              type="button"
              onClick={() => {
                clearAdminSession();
                window.location.href = "/admin";
              }}
              className="rounded-xl bg-ink px-4 py-2 text-sm font-bold text-ink-foreground"
            >
              Lock console
            </button>
          </div>
          {note ? <p className="mt-3 text-xs font-semibold text-success">{note}</p> : null}
        </Panel>

        <Panel title="Access">
          <p className="text-sm text-muted-foreground">
            The console is reachable only at <span className="font-semibold text-foreground">/admin</span> and requires
            the operator code. It is never linked from the member app, and the session clears when the browser tab
            closes.
          </p>
        </Panel>
      </div>
    </>
  );
}
