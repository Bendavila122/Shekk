import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { AppShell, Card, PrimaryButton, ScreenHeader } from "@/components/AppShell";
import { RESTAURANTS, ils } from "@/lib/mock";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/explore/food")({
  head: () => ({
    meta: [
      { title: "Food delivery · Shekk" },
      { name: "description", content: "Order kosher food to your dorm — kosher filter on by default, Shabbat-aware." },
      { property: "og:title", content: "Food delivery · Shekk" },
      { property: "og:description", content: "Kosher-first delivery paid with your credits." },
    ],
  }),
  component: Food,
});

function Food() {
  const { spend } = useApp();
  const [kosherOnly, setKosherOnly] = useState(true);
  const [shabbat, setShabbat] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [placed, setPlaced] = useState(false);

  const list = RESTAURANTS.filter((r) => (kosherOnly ? r.kosher : true));
  const rest = RESTAURANTS.find((r) => r.id === openId);
  const items = rest?.items ?? [];
  const subtotal = items.reduce((sum, i) => sum + (cart[i.id] ?? 0) * i.price, 0);
  const delivery = subtotal > 0 ? 12 : 0;

  if (placed && rest) {
    return (
      <AppShell>
        <ScreenHeader title="Order placed" subtitle={rest.name} onBack={() => { setPlaced(false); setOpenId(null); setCart({}); }} />
        <div className="space-y-4 px-4 py-8 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-success-soft">
            <Check className="size-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold">On the way</h2>
          <p className="text-sm text-muted-foreground">
            {rest.eta} to your dorm. Rider: Ofir · pays with your credits, no cash at the door.
          </p>
          <Card className="text-left text-sm">
            <p className="font-semibold">{rest.name}</p>
            {items
              .filter((i) => cart[i.id])
              .map((i) => (
                <p key={i.id} className="text-muted-foreground">
                  {cart[i.id]}× {i.name} — {ils(i.price * cart[i.id])}
                </p>
              ))}
            <p className="mt-2 font-semibold">Total paid {ils(subtotal + delivery)}</p>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (rest) {
    return (
      <AppShell>
        <ScreenHeader title={rest.name} subtitle={`${rest.tag} · ${rest.eta}`} onBack={() => setOpenId(null)} />
        <div className="space-y-3 px-4 py-4 pb-40">
          {shabbat && rest.closedShabbat && (
            <Card className="bg-warning-soft text-sm text-warning-foreground">
              Closed for Shabbat — order opens again motzei Shabbat, ~20:30.
            </Card>
          )}
          {items.map((i) => (
            <Card key={i.id} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold">{i.name}</p>
                <p className="text-xs text-muted-foreground">{ils(i.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCart((c) => ({ ...c, [i.id]: Math.max(0, (c[i.id] ?? 0) - 1) }))}
                  className="tap rounded-full bg-muted p-2"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-4 text-center text-sm font-semibold">{cart[i.id] ?? 0}</span>
                <button
                  onClick={() => setCart((c) => ({ ...c, [i.id]: (c[i.id] ?? 0) + 1 }))}
                  className="tap rounded-full bg-primary p-2 text-primary-foreground"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-20 border-t border-border bg-card p-4">
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal + delivery {ils(delivery)}</span>
            <span className="font-display text-lg font-bold">{ils(subtotal + delivery)}</span>
          </div>
          <PrimaryButton
            disabled={subtotal === 0 || (shabbat && rest.closedShabbat)}
            onClick={() => {
              spend(rest.name, "Food & drink", subtotal + delivery, rest.emoji);
              setPlaced(true);
            }}
          >
            {shabbat && rest.closedShabbat ? "Closed for Shabbat" : "Pay with credits"}
          </PrimaryButton>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ScreenHeader title="Food delivery" subtitle="Delivering to: dorm, Maalot Dafna" />
      <div className="space-y-4 px-4 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => setKosherOnly((v) => !v)}
            className={`tap rounded-full px-4 py-2 text-xs font-semibold ${
              kosherOnly ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            Kosher only {kosherOnly ? "✓" : ""}
          </button>
          <button
            onClick={() => setShabbat((v) => !v)}
            className={`tap rounded-full px-4 py-2 text-xs font-semibold ${
              shabbat ? "bg-ink text-ink-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            Preview Shabbat mode
          </button>
        </div>

        {shabbat && (
          <Card className="bg-warning-soft text-sm text-warning-foreground">
            Shabbat mode: most places are closed. Orders you place now queue for motzei Shabbat.
          </Card>
        )}

        {list.map((r) => {
          const closed = shabbat && r.closedShabbat;
          return (
            <button key={r.id} onClick={() => setOpenId(r.id)} className="tap w-full text-left">
              <Card className={`flex items-center gap-3 ${closed ? "opacity-60" : ""}`}>
                <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-2xl">{r.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.tag}</p>
                </div>
                <span className={`text-xs font-semibold ${closed ? "text-warning-foreground" : "text-success"}`}>
                  {closed ? "Closed for Shabbat" : r.eta}
                </span>
              </Card>
            </button>
          );
        })}
      </div>
    </AppShell>
  );
}
