/** A pressed ink stamp: city name, date and a little "Shekk Passport" ring. */
import { stampDate, type PassportCity } from "@/lib/passport";

export function PassportStamp({
  city,
  date,
  animate = false,
  size = 132,
}: {
  city: PassportCity;
  date?: string;
  animate?: boolean;
  size?: number;
}) {
  return (
    <div
      className={`relative grid place-items-center ${animate ? "pp-stamp-in" : ""}`}
      style={{ width: size, height: size, transform: animate ? undefined : "rotate(-8deg)", color: city.ink }}
    >
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth="2.4" opacity="0.85">
          <circle cx="60" cy="60" r="52" strokeDasharray="5 4" />
          <circle cx="60" cy="60" r="43" />
        </g>
        <path d="M22 52 h76" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
        <path d="M22 78 h76" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
      </svg>
      <div className="absolute inset-0 grid place-items-center px-4 text-center">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-70">Shekk</p>
          <p className="font-display text-[15px] font-bold uppercase leading-tight tracking-tight">{city.name}</p>
          <p className="mt-0.5 text-[8.5px] font-semibold uppercase tracking-[0.16em] opacity-80">{stampDate(date)}</p>
        </div>
      </div>
    </div>
  );
}
