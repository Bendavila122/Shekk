import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card, PrimaryButton, ScreenHeader } from "@/components/AppShell";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/explore/health")({
  head: () => ({
    meta: [
      { title: "Health · Shekk" },
      { name: "description", content: "Your student insurance card, nearby clinics and in-app appointment booking." },
      { property: "og:title", content: "Health · Shekk" },
      { property: "og:description", content: "Insurance card and clinic booking for your year abroad." },
    ],
  }),
  component: Health,
});

const CLINICS = [
  { id: "c1", name: "Terem Urgent Care — Romema", detail: "Open 24/6 · English-speaking staff", slot: "Today 17:40" },
  { id: "c2", name: "Meuhedet Clinic — Kiryat Moshe", detail: "GP · covered in full", slot: "Tomorrow 09:20" },
  { id: "c3", name: "Dental — Dr. Frankel, Rechavia", detail: "Student rate", slot: "Sun 12:00" },
];

function Health() {
  const { state } = useApp();
  const [booked, setBooked] = useState<string | null>(null);

  return (
    <AppShell>
      <ScreenHeader title="Health" subtitle="Insurance & clinics" />
      <div className="space-y-4 px-4 py-4">
        <div className="rounded-2xl bg-ink p-5 text-ink-foreground shadow-card">
          <p className="text-xs uppercase tracking-widest opacity-60">Student insurance</p>
          <p className="mt-1 font-display text-xl font-bold">{state.name || "Student"}</p>
          <p className="text-sm opacity-80">Harel Yedidim · Policy 4471-88203</p>
          <div className="mt-4 flex justify-between text-xs opacity-70">
            <span>Valid through Jul 2026</span>
            <span>Show at any clinic</span>
          </div>
        </div>

        {booked && <Card className="bg-success-soft text-sm">Appointment confirmed · {booked}</Card>}

        {CLINICS.map((c) => (
          <Card key={c.id} className="space-y-2">
            <p className="text-sm font-semibold">{c.name}</p>
            <p className="text-xs text-muted-foreground">{c.detail}</p>
            <PrimaryButton onClick={() => setBooked(`${c.name} · ${c.slot}`)} className="py-3 text-sm">
              Book {c.slot}
            </PrimaryButton>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
