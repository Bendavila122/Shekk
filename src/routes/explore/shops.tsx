import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { SHOPS } from "@/lib/mock";

export const Route = createFileRoute("/explore/shops")({
  head: () => ({
    meta: [
      { title: "Shops & discounts · Shekk" },
      { name: "description", content: "Student promo codes applied automatically when you order through partner apps inside Shekk." },
      { property: "og:title", content: "Shops & discounts · Shekk" },
      { property: "og:description", content: "Student discounts around Jerusalem, no coupon app required." },
    ],
  }),
  component: Shops,
});

function Shops() {
  const [saved, setSaved] = useState<string[]>(["s1"]);

  return (
    <AppShell>
      <ScreenHeader title="Shops" subtitle="Student discounts near you" />
      <div className="space-y-3 px-4 py-4">
        {SHOPS.map((s) => (
          <Card key={s.id} className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-2xl">{s.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{s.name}</p>
              <p className="truncate text-xs text-success">{s.promo}</p>
            </div>
            <button
              onClick={() => setSaved((p) => (p.includes(s.id) ? p.filter((x) => x !== s.id) : [...p, s.id]))}
              className={`tap rounded-full px-3 py-2 text-xs font-semibold ${
                saved.includes(s.id) ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {saved.includes(s.id) ? "Saved" : "Save"}
            </button>
          </Card>
        ))}
        <Card className="text-xs text-muted-foreground">
          Discounts apply automatically when you order through a partner app inside Shekk — we pay them and deduct the discounted amount in tokens.
        </Card>
      </div>
    </AppShell>
  );
}
