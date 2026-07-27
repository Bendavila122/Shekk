import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Card, ScreenHeader } from "@/components/AppShell";
import { SHULS } from "@/lib/mock";

export const Route = createFileRoute("/explore/community")({
  head: () => ({
    meta: [
      { title: "Community · ShekelPay" },
      { name: "description", content: "Shul finder, candle-lighting times, Chabad and Aish calendars, and a siddur reader." },
      { property: "og:title", content: "Community · ShekelPay" },
      { property: "og:description", content: "Zmanim, shuls and community events wherever you are in Israel." },
    ],
  }),
  component: Community,
});

const SIDDUR = [
  "מודה אני לפניך מלך חי וקים",
  "Modeh ani lefanecha melech chai v'kayam",
  "I gratefully thank You, living and eternal King, for You have returned my soul within me with compassion — abundant is Your faithfulness.",
];

function Community() {
  const [reader, setReader] = useState(false);

  return (
    <AppShell>
      <ScreenHeader title="Community" subtitle="Jerusalem · today" />
      <div className="space-y-4 px-4 py-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: "Candle lighting", v: "16:38" },
            { l: "Shabbat ends", v: "17:52" },
            { l: "Parsha", v: "Bo" },
          ].map((z) => (
            <Card key={z.l} className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{z.l}</p>
              <p className="font-display text-lg font-bold">{z.v}</p>
            </Card>
          ))}
        </div>

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Near you</h2>
          <div className="space-y-2">
            {SHULS.map((s) => (
              <Card key={s.id} className="flex items-center gap-3">
                <span className="text-2xl">{s.emoji}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.detail}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Siddur & Tikkun reader</p>
              <p className="text-xs text-muted-foreground">Nusach Ashkenaz · Sefard · Edot HaMizrach</p>
            </div>
            <button
              onClick={() => setReader((v) => !v)}
              className="tap rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground"
            >
              {reader ? "Close" : "Open"}
            </button>
          </div>
          {reader && (
            <div className="space-y-2 rounded-2xl bg-muted p-4">
              <p dir="rtl" className="text-right text-lg leading-relaxed">
                {SIDDUR[0]}
              </p>
              <p className="text-sm italic text-muted-foreground">{SIDDUR[1]}</p>
              <p className="text-sm">{SIDDUR[2]}</p>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
