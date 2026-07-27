import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { QrCode, Compass, Users, User, ChevronLeft } from "lucide-react";
import { useApp } from "@/lib/store";

const TABS = [
  { to: "/", label: "Pay", Icon: QrCode },
  { to: "/explore", label: "Explore", Icon: Compass },
  { to: "/social", label: "Social", Icon: Users },
  { to: "/me", label: "Me", Icon: User },
];

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen justify-center bg-ink/95 px-0 py-0 sm:px-4 sm:py-8">
      <div className="relative flex w-full max-w-[430px] flex-col overflow-hidden bg-background shadow-lift sm:rounded-[2.5rem] sm:border-8 sm:border-ink">
        {children}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <PhoneFrame>
      <div className="min-h-[calc(100vh-0px)] pb-24 sm:min-h-[860px]">{children}</div>
      <nav className="sticky bottom-0 z-20 grid grid-cols-4 border-t border-border bg-card/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur">
        {TABS.map(({ to, label, Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`tap flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>
    </PhoneFrame>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  back = "/explore",
}: {
  title: string;
  subtitle?: string;
  back?: string;
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
      <Link to={back} className="tap rounded-full bg-muted p-2 text-foreground">
        <ChevronLeft className="size-5" />
      </Link>
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
    </header>
  );
}

export function ReverifyBanner() {
  const { daysLeft } = useApp();
  if (daysLeft === null) return null;
  return (
    <Link
      to="/reverify"
      className="tap mx-4 mb-3 flex items-center justify-between gap-3 rounded-2xl bg-warning-soft px-4 py-3 text-warning-foreground"
    >
      <div>
        <p className="text-sm font-semibold">{daysLeft} days left to re-verify</p>
        <p className="text-xs opacity-80">Annual ID check — keeps your credits spendable.</p>
      </div>
      <span className="rounded-full bg-warning px-3 py-1.5 text-xs font-semibold text-warning-foreground">
        Re-verify
      </span>
    </Link>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-4 shadow-card ${className}`}>{children}</div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`tap w-full rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-primary-foreground disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}
