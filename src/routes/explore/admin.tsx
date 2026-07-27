import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { CheckCircle2, Clock, FileText } from "lucide-react";

export const Route = createFileRoute("/explore/admin")({
  head: () => ({
    meta: [
      { title: "Admin · ShekelPay" },
      { name: "description", content: "Track your student visa status and keep program documents in one place." },
      { property: "og:title", content: "Admin · ShekelPay" },
      { property: "og:description", content: "Visa tracker and document storage for your program year." },
    ],
  }),
  component: Admin,
});

const STEPS = [
  { label: "A/2 student visa submitted", done: true, note: "12 Sep" },
  { label: "Biometrics at Misrad HaPnim", done: true, note: "03 Oct" },
  { label: "Extension for spring semester", done: false, note: "Due 15 Feb" },
];

const DOCS = [
  { name: "Passport photo page.pdf", size: "1.2 MB" },
  { name: "Program acceptance letter.pdf", size: "340 KB" },
  { name: "Insurance policy — Harel.pdf", size: "820 KB" },
  { name: "Parent consent form.pdf", size: "210 KB" },
];

function Admin() {
  return (
    <AppShell>
      <ScreenHeader title="Admin" subtitle="Visa & documents" />
      <div className="space-y-4 px-4 py-4">
        <Card className="space-y-3">
          <h2 className="text-base font-semibold">Visa status</h2>
          {STEPS.map((s) => (
            <div key={s.label} className="flex items-start gap-3">
              {s.done ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
              ) : (
                <Clock className="mt-0.5 size-5 shrink-0 text-warning" />
              )}
              <div>
                <p className="text-sm font-semibold">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.note}</p>
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-0">
          <p className="border-b border-border p-4 text-base font-semibold">Program documents</p>
          {DOCS.map((d) => (
            <div key={d.name} className="flex items-center gap-3 border-b border-border p-4 last:border-0">
              <FileText className="size-5 text-primary" />
              <span className="flex-1 truncate text-sm">{d.name}</span>
              <span className="text-xs text-muted-foreground">{d.size}</span>
            </div>
          ))}
        </Card>
      </div>
    </AppShell>
  );
}
