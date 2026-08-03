import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { AppShell, Card, Notice, ScreenHeader } from "@/components/AppShell";
import { Chip, MicroLabel, SectionHead } from "@/components/Kit";
import { useLocalState } from "@/lib/local-state";
import {
  CITIES,
  COST_LINES,
  baselineInputs,
  cityOf,
  totalCost,
  type CityId,
  type CostInputs,
} from "@/lib/cost-content";

export const Route = createFileRoute("/explore/cost-of-living")({
  head: () => ({
    meta: [
      { title: "Cost of Living Calculator · Shekk" },
      {
        name: "description",
        content:
          "Pick an Israeli city, adjust rent, food, transport, going out and trips, and see a realistic monthly total in shekels for a student sharing a flat.",
      },
      { property: "og:title", content: "Cost of Living Calculator · Shekk" },
      {
        property: "og:description",
        content: "What a month in Jerusalem, Tel Aviv or Be'er Sheva actually costs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CostOfLiving,
});

const shekels = (n: number) => `₪${Math.round(n).toLocaleString("en-US")}`;

function CostOfLiving() {
  const { value, update } = useLocalState<{ inputs: CostInputs }>("shekk.cost.v1", {
    inputs: baselineInputs("jerusalem"),
  });
  const inputs = value.inputs;
  const [touched, setTouched] = useState(false);

  const city = cityOf(inputs.city);
  const total = totalCost(inputs);
  const base = totalCost(baselineInputs(inputs.city));
  const diff = total - base;

  const setCity = (id: CityId) => {
    update({ inputs: baselineInputs(id) });
    setTouched(false);
  };

  return (
    <AppShell>
      <ScreenHeader title="Cost of living" back="/israel" />

      <header className="px-4 pt-2">
        <div
          className="relative overflow-hidden rounded-[1.5rem] px-5 py-5 text-ink-foreground shadow-lift"
          style={{ backgroundImage: "var(--grad-balance)" }}
        >
          <span className="card-sheen pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <MicroLabel className="opacity-70">
              {city.emoji} {city.name} · per month
            </MicroLabel>
            <p className="mt-2 font-display text-[2.6rem] font-bold leading-none tracking-tight">
              {shekels(total)}
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed opacity-85">
              {touched
                ? diff === 0
                  ? "Exactly the typical student month here."
                  : diff > 0
                    ? `${shekels(diff)} above a typical month in ${city.name}.`
                    : `${shekels(-diff)} below a typical month in ${city.name}.`
                : city.note}
            </p>
          </div>
        </div>
      </header>

      <div className="mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CITIES.map((c) => (
          <Chip
            key={c.id}
            selected={c.id === inputs.city}
            onClick={() => setCity(c.id)}
            className="shrink-0 whitespace-nowrap"
          >
            {c.emoji} {c.name}
          </Chip>
        ))}
      </div>

      <div className="space-y-3 px-4 pb-12 pt-5">
        <SectionHead title="Adjust it to your life" hint="Drag each line until it looks like your month." />
        {COST_LINES.map((line) => {
          const amount = inputs[line.key] || 0;
          const share = total ? amount / total : 0;
          return (
            <Card key={line.key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13.5px] font-semibold">
                  <span className="mr-1.5" aria-hidden>
                    {line.emoji}
                  </span>
                  {line.label}
                </span>
                <span className="shrink-0 font-display text-[15px] font-bold">{shekels(amount)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={line.max}
                step={line.step}
                value={amount}
                onChange={(e) => {
                  setTouched(true);
                  update({ inputs: { ...inputs, [line.key]: Number(e.target.value) } });
                }}
                aria-label={line.label}
                className="mt-3 w-full accent-[var(--primary)]"
              />
              <p className="mt-1.5 text-[11.5px] leading-snug text-muted-foreground">
                {line.hint} · {Math.round(share * 100)}% of your month
              </p>
            </Card>
          );
        })}

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setCity(inputs.city)}
            className="tap inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card py-3 text-[12.5px] font-semibold"
          >
            <RotateCcw className="size-4" /> Reset to typical
          </button>
          <Link
            to="/explore/budget"
            className="tap inline-flex items-center justify-center rounded-full bg-primary py-3 text-[12.5px] font-bold text-primary-foreground"
          >
            Plan against income →
          </Link>
        </div>

        <Notice title="How to read this">
          These are student numbers for sharing a flat, not living alone. Rent moves most: the same budget goes much
          further in Be'er Sheva or Haifa than in central Tel Aviv.
        </Notice>
      </div>
    </AppShell>
  );
}
