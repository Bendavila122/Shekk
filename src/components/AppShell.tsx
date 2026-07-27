import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Wallet, Compass, Receipt, Users, User, ChevronLeft } from "lucide-react";
import { useApp } from "@/lib/store";

const TABS = [
  { to: "/", label: "Home", Icon: Wallet },
  { to: "/explore", label: "Explore", Icon: Compass },
  { to: "/activity", label: "Activity", Icon: Receipt },
  { to: "/social", label: "Social", Icon: Users },
  { to: "/me", label: "Me", Icon: User },
];

export function PhoneFrame({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div
      className={`flex min-h-screen justify-center bg-ink/95 px-0 py-0 sm:px-4 sm:py-8 ${
        wide ? "lg:min-h-0 lg:bg-background lg:px-0 lg:py-0" : ""
      }`}
    >
      <div
        className={`relative flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-background shadow-lift sm:min-h-[860px] sm:rounded-[2.5rem] sm:border-8 sm:border-ink ${
          wide ? "lg:min-h-[75vh] lg:max-w-none lg:rounded-none lg:border-0 lg:shadow-none" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Full-page flows (top-up, terms, re-verify) that sit outside the tab shell.
 * Mobile keeps the phone frame; desktop gets a centered card on the app canvas.
 */
export function FocusScreen({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen justify-center bg-ink/95 px-0 py-0 sm:px-4 sm:py-8 lg:bg-ink/[0.03] lg:px-8 lg:py-12">
      <div className="relative flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-background shadow-lift sm:min-h-[860px] sm:rounded-[2.5rem] sm:border-8 sm:border-ink lg:min-h-0 lg:max-w-2xl lg:rounded-3xl lg:border lg:border-border lg:shadow-card">
        {children}
      </div>
    </div>
  );
}



function useActive() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
}

export function AppShell({ children }: { children: ReactNode }) {
  const isActive = useActive();
  return (
    <div className="lg:flex lg:min-h-screen lg:bg-ink/[0.03]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:gap-1 lg:border-r lg:border-border lg:bg-card lg:px-4 lg:py-8">
        <p className="mb-6 px-3 font-display text-xl font-bold">ShekelPay</p>
        {TABS.map(({ to, label, Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`tap flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="size-5 shrink-0" strokeWidth={active ? 2.4 : 1.8} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </aside>

      <div className="lg:flex lg:min-w-0 lg:flex-1 lg:justify-center lg:px-8 lg:py-8">
        <div className="lg:w-full lg:max-w-3xl lg:overflow-hidden lg:rounded-3xl lg:border lg:border-border lg:bg-background lg:shadow-card">
          <PhoneFrame wide>
            <div className="flex-1 pb-6">{children}</div>
            <nav className="sticky bottom-0 z-20 grid grid-cols-4 border-t border-border bg-card/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur lg:hidden">
              {TABS.map(({ to, label, Icon }) => {
                const active = isActive(to);
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
        </div>
      </div>
    </div>
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
