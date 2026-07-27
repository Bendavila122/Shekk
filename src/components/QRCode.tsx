import { useMemo } from "react";

/** Deterministic pseudo-QR renderer — a prototype visual, not a scannable code. */
export function QRCode({ value, className = "" }: { value: string; className?: string }) {
  const size = 29;
  const cells = useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const out: boolean[] = [];
    let x = h >>> 0;
    for (let i = 0; i < size * size; i++) {
      x ^= x << 13;
      x ^= x >>> 17;
      x ^= x << 5;
      x >>>= 0;
      out.push((x & 7) > 3);
    }
    return out;
  }, [value]);

  const isFinder = (r: number, c: number) =>
    (r < 8 && c < 8) || (r < 8 && c >= size - 8) || (r >= size - 8 && c < 8);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} role="img" aria-label="Your ShekelPay pay code">
      <rect width={size} height={size} fill="var(--card)" />
      {cells.map((on, i) => {
        const r = Math.floor(i / size);
        const c = i % size;
        if (!on || isFinder(r, c)) return null;
        return <rect key={i} x={c + 0.12} y={r + 0.12} width={0.76} height={0.76} rx={0.28} fill="var(--ink)" />;
      })}
      {[
        [0, 0],
        [0, size - 7],
        [size - 7, 0],
      ].map(([r, c], i) => (
        <g key={i}>
          <rect x={c} y={r} width={7} height={7} rx={2} fill="var(--ink)" />
          <rect x={c + 1.4} y={r + 1.4} width={4.2} height={4.2} rx={1.2} fill="var(--card)" />
          <rect x={c + 2.4} y={r + 2.4} width={2.2} height={2.2} rx={0.7} fill="var(--primary)" />
        </g>
      ))}
    </svg>
  );
}
