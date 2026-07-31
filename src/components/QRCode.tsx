import { useMemo } from "react";
import QRCodeLib from "qrcode";

/** Real, scannable QR renderer (SVG, error-correction level M). */
export function QRCode({ value, className = "" }: { value: string; className?: string }) {
  const modules = useMemo(() => {
    try {
      const qr = QRCodeLib.create(value, { errorCorrectionLevel: "M" });
      const size = qr.modules.size;
      const data = qr.modules.data;
      return { size, data };
    } catch {
      return null;
    }
  }, [value]);

  if (!modules) return <div className={className} aria-hidden />;

  const { size, data } = modules;
  const quiet = 2;
  const total = size + quiet * 2;
  const cells: string[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (data[r * size + c]) cells.push(`M${c + quiet} ${r + quiet}h1v1h-1z`);
    }
  }

  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      className={className}
      role="img"
      aria-label="Your Shekk pay code"
      shapeRendering="crispEdges"
    >
      <rect width={total} height={total} fill="#ffffff" />
      <path d={cells.join("")} fill="#0b1020" />
    </svg>
  );
}
