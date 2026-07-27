import { Link, useRouterState, useRouter, useCanGoBack, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Wallet, Compass, Receipt, Users, User, ChevronLeft, Menu, X, Plus, Info } from "lucide-react";
import { useApp } from "@/lib/store";
import { ils, usdRef } from "@/lib/mock";


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
        <MobileNav />
      </div>
    </div>
  );
}

/** Highlighted notice / key-info block — deliberately off-palette so it stands out. */
export function Notice({
  children,
  title,
  className = "",
}: {
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-notice-border bg-notice-soft px-4 py-3 text-notice-foreground ${className}`}
    >
      {title ? (
        <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide">
          <Info className="size-3.5" /> {title}
        </p>
      ) : null}
      <div className="text-xs leading-relaxed">{children}</div>
    </div>
  );
}

/** Bottom tab bar + compact balance strip, shared by every screen (mobile). */
export function MobileNav() {
  const isActive = useActive();
  const { state } = useApp();

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 border-t border-border bg-card lg:hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Token balance</p>
          <p className="font-display text-sm font-bold leading-tight">
            {ils(state.balance)} <span className="text-[10px] font-medium text-muted-foreground">≈ {usdRef(state.balance)}</span>
          </p>
        </div>
        <Link
          to="/topup"
          className="tap flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-primary-foreground shadow-card"
        >
          <Plus className="size-4" strokeWidth={3} /> Top up
        </Link>
      </div>
      <nav className="flex items-stretch justify-between px-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5">
        {TABS.map(({ to, label, Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`tap flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.6 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}




function useActive() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
}

/** Token balance + top up, shown inside the navigation. */
function NavBalance({ onNavigate }: { onNavigate?: () => void }) {
  const { state } = useApp();
  return (
    <div className="mt-auto rounded-2xl bg-ink px-4 py-3 text-ink-foreground">
      <p className="text-[10px] uppercase tracking-widest opacity-60">Token balance</p>
      <p className="font-display text-2xl font-bold leading-tight">{ils(state.balance)}</p>
      <p className="text-[11px] opacity-60">≈ {usdRef(state.balance)} reference</p>
      <Link
        to="/topup"
        onClick={onNavigate}
        className="tap mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-card px-4 py-3 text-sm font-bold uppercase tracking-wide text-primary shadow-lift ring-2 ring-card/60 transition-transform hover:scale-[1.03] active:scale-[0.98]"
      >
        <Plus className="size-4" strokeWidth={3} /> Top up
      </Link>

    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const isActive = useActive();


  return (
    <div className="lg:flex lg:min-h-screen lg:bg-ink/[0.03]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:gap-1 lg:border-r lg:border-border lg:bg-card lg:px-4 lg:py-8">
        <div className="mb-4 flex items-center gap-2 px-3">
          <img src="/favicon.png" alt="Shekk logo" width={32} height={32} className="size-8 rounded-lg border border-border bg-white" />
          <p className="font-display text-xl font-bold">Shekk</p>
        </div>

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
        <NavBalance />
      </aside>

      <div className="lg:flex lg:min-w-0 lg:flex-1 lg:justify-center lg:px-8 lg:py-8">
        <div className="lg:w-full lg:max-w-3xl lg:overflow-hidden lg:rounded-3xl lg:border lg:border-border lg:bg-background lg:shadow-card">
          <PhoneFrame wide>
            <MobileNav />
            <div className="flex-1 pb-6">{children}</div>
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
  onBack,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  onBack?: () => void;
}) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
      <button
        type="button"
        aria-label="Go back"
        onClick={() => {
          if (onBack) { onBack(); return; }
          if (canGoBack) router.history.back();
          else navigate({ to: back });
        }}
        className="tap rounded-full bg-muted p-2 text-foreground"
      >
        <ChevronLeft className="size-5" />
      </button>
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
      className="tap mx-4 mb-3 flex items-center justify-between gap-3 rounded-2xl border border-notice-border bg-notice-soft px-4 py-3 text-notice-foreground"
    >
      <div>
        <p className="text-sm font-semibold">{daysLeft} days left to re-verify</p>
        <p className="text-xs opacity-80">Annual ID check — keeps your credits spendable.</p>
      </div>
      <span className="rounded-full bg-notice-foreground px-3 py-1.5 text-xs font-semibold text-notice-soft">
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
