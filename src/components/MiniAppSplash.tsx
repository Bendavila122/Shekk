import { useEffect, useState } from "react";
import type { MiniApp } from "@/lib/mini-apps";

/**
 * Launch screen for a mini app — shows for a beat when you open it from Shekk,
 * the way a real app splash does, then gets out of the way.
 */
export function MiniAppSplash({ app }: { app: MiniApp }) {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    setGone(false);
    const t = window.setTimeout(() => setGone(true), 780);
    return () => window.clearTimeout(t);
  }, [app.id]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-[60] flex flex-col items-center justify-center gap-3 ${app.surface} ${app.onSurface} transition-opacity duration-300 ${
        gone ? "opacity-0" : "opacity-100"
      }`}
    >
      <span className="text-5xl drop-shadow-sm">{app.emoji}</span>
      <p className="font-display text-2xl font-bold leading-none">{app.name}</p>
      <p className="max-w-[70%] text-center text-xs opacity-70">{app.tagline}</p>
      <p className="absolute bottom-8 text-[10px] font-semibold uppercase tracking-[0.3em] opacity-50">
        in Shekk
      </p>
    </div>
  );
}
