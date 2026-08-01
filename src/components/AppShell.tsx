import { Link, useRouterState, useRouter, useCanGoBack, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Wallet, Compass, Tag, Users, User, ChevronLeft, Plus, Info, Menu, X, Settings, LifeBuoy, Home, Receipt, CreditCard, Crown, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/store";
import { ils } from "@/lib/mock";
import { refIn } from "@/lib/currencies";
import { MembershipDunningBanner } from "@/components/MembershipDunningBanner";
import { useUnreadChats } from "@/lib/useSocial";
import { MiniAppSplash } from "@/components/MiniAppSplash";
import { miniAppFor } from "@/lib/mini-apps";



const TABS = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/wallet", label: "Wallet", Icon: Wallet },
  { to: "/explore", label: "Explore", Icon: Compass },
  { to: "/benefits", label: "Benefits", Icon: Tag },
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
export function FocusScreen({
  children,
  /** Sign-in and other pre-account screens have no app navigation yet. */
  nav = true,
}: {
  children: ReactNode;
  nav?: boolean;
}) {
  return (
    <div className="flex min-h-screen justify-center bg-ink/95 px-0 py-0 sm:px-4 sm:py-8 lg:bg-ink/[0.03] lg:px-8 lg:py-12">
      <div className="relative flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-background shadow-lift sm:min-h-[860px] sm:rounded-[2.5rem] sm:border-8 sm:border-ink lg:min-h-0 lg:max-w-2xl lg:rounded-3xl lg:border lg:border-border lg:shadow-card">
        <div className={`flex-1 ${nav ? "pb-28 lg:pb-6" : "pb-6"}`}>{children}</div>
        {nav ? (
          <>
            <QuickMenu />
            <MobileNav />
          </>
        ) : null}

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

/** Bottom tab bar, shared by every screen (mobile). Home sits centred and raised. */
export function MobileNav() {
  const isActive = useActive();
  const unread = useUnreadChats();
  const side = TABS.filter((t) => t.to !== "/me" && t.to !== "/");
  const left = side.slice(0, 2);
  const right = side.slice(2);
  const homeActive = isActive("/");

  const item = (to: string, label: string, Icon: typeof Home) => {
    const active = isActive(to);
    const badge = to === "/social" && unread > 0 ? unread : 0;
    return (
      <Link
        key={to}
        to={to}
        className={`tap-flat flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <span className="relative">
          <Icon className="size-6" strokeWidth={active ? 2.6 : 1.8} />
          {badge > 0 && (
            <span className="absolute -right-2 -top-1 min-w-4 rounded-full bg-destructive px-1 text-center text-[10px] font-bold leading-4 text-white">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </span>
        <span>{label}</span>
      </Link>
    );
  };


  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-card lg:hidden">
      <nav className="flex items-end justify-between px-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2">
        {left.map(({ to, label, Icon }) => item(to, label, Icon))}

        <Link
          to="/"
          aria-label="Home"
          className="tap-flat flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold"
        >
          <span
            className={`flex size-6 items-center justify-center ${
              homeActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="size-6" strokeWidth={homeActive ? 2.6 : 1.8} />
          </span>
          <span className={homeActive ? "text-primary" : "text-muted-foreground"}>Home</span>
        </Link>


        {right.map(({ to, label, Icon }) => item(to, label, Icon))}
      </nav>
    </div>
  );
}


/** Top-right quick menu (mobile): balance, top up, Me, Settings, Help. */
export function QuickMenu() {
  const [open, setOpen] = useState(false);
  const { state } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <div className="pointer-events-none fixed left-1/2 top-0 z-50 w-full max-w-[430px] -translate-x-1/2">
        <button
          type="button"
          aria-label={open ? "Close quick menu" : "Open quick menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="tap pointer-events-auto absolute right-3 top-3 rounded-full border border-border bg-card p-2.5 text-foreground shadow-card"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>


      {open ? (
        <>
          <button
            type="button"
            aria-label="Close quick menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="fixed left-1/2 top-16 z-50 ml-[-15px] w-60 max-w-[calc(100vw-1.5rem)] translate-x-[calc(215px-100%)] overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
            <div className="border-b border-border bg-ink px-4 py-3 text-ink-foreground">
              <p className="text-[10px] uppercase tracking-widest opacity-60">Balance</p>
              <p className="font-display text-xl font-bold leading-tight">{ils(state.balance)}</p>
              <p className="text-[11px] opacity-60">≈ {refIn(state.settings.payCurrency, state.balance)} reference</p>
            </div>
            <Link
              to="/topup"
              className="tap-flat flex items-center gap-2 border-b border-border px-4 py-3 text-sm font-bold text-primary"
            >
              <Plus className="size-4" strokeWidth={3} /> Add money
            </Link>
            <Link to="/activity" className="tap-flat flex items-center gap-2 px-4 py-3 text-sm font-semibold">
              <Receipt className="size-4 text-muted-foreground" /> Activity
            </Link>
            <Link to="/card" className="tap-flat flex items-center gap-2 px-4 py-3 text-sm font-semibold">
              <CreditCard className="size-4 text-muted-foreground" /> Shekk Card
            </Link>
            <Link to="/membership" className="tap-flat flex items-center gap-2 px-4 py-3 text-sm font-semibold">
              <Crown className="size-4 text-muted-foreground" /> Membership
            </Link>
            <Link to="/me" className="tap-flat flex items-center gap-2 px-4 py-3 text-sm font-semibold">
              <User className="size-4 text-muted-foreground" /> Me
            </Link>
            <Link to="/settings" className="tap-flat flex items-center gap-2 px-4 py-3 text-sm font-semibold">
              <Settings className="size-4 text-muted-foreground" /> Settings
            </Link>
            <Link to="/help" className="tap-flat flex items-center gap-2 px-4 py-3 text-sm font-semibold">
              <LifeBuoy className="size-4 text-muted-foreground" /> Help
            </Link>
            <Link
              to="/admin"
              className="tap-flat flex items-center gap-2 border-t border-border px-4 py-3 text-xs font-semibold text-muted-foreground"
            >
              <ShieldCheck className="size-4" /> Console
            </Link>

          </div>
        </>
      ) : null}
    </div>
  );
}

function useActive() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
}


/** Balance + top up, shown inside the navigation. */
function NavBalance({ onNavigate }: { onNavigate?: () => void }) {
  const { state } = useApp();
  return (
    <div className="mt-auto rounded-2xl bg-ink px-4 py-3 text-ink-foreground">
      <p className="text-[10px] uppercase tracking-widest opacity-60">Balance</p>
      <p className="font-display text-2xl font-bold leading-tight">{ils(state.balance)}</p>
      <p className="text-[11px] opacity-60">≈ {refIn(state.settings.payCurrency, state.balance)} reference</p>
      <Link
        to="/topup"
        onClick={onNavigate}
        className="tap mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-card px-4 py-3 text-sm font-bold uppercase tracking-wide text-primary shadow-lift ring-2 ring-card/60 transition-transform hover:scale-[1.03] active:scale-[0.98]"
      >
        <Plus className="size-4" strokeWidth={3} /> Add money
      </Link>

    </div>
  );
}

/** The five tab destinations; anything deeper is a mini app or info page. */
const TAB_ROOTS = new Set(TABS.map((t) => t.to));

export function AppShell({ children }: { children: ReactNode }) {
  const isActive = useActive();
  const unread = useUnreadChats();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  /* Tab roots get the Shekk chrome. Anything deeper is a mini app or info page:
     no tab bar, no Shekk quick menu — it runs as its own little app. */
  const isTabRoot = TAB_ROOTS.has(pathname === "/" ? "/" : pathname.replace(/\/$/, ""));
  const mini = miniAppFor(pathname);
  const standalone = !isTabRoot;

  return (
    <div className="lg:flex lg:min-h-screen lg:bg-ink/[0.03]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:gap-1 lg:border-r lg:border-border lg:bg-card lg:px-4 lg:py-8">
        <div className="mb-4 flex items-center gap-2 px-3">
          <img src="/logo.png" alt="Shekk logo" width={32} height={32} className="size-8 rounded-lg border border-border bg-white" />
          <p className="font-display text-xl font-bold">Shekk</p>
        </div>

        {TABS.map(({ to, label, Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`tap-flat flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="size-5 shrink-0" strokeWidth={active ? 2.4 : 1.8} />
              <span className="truncate">{label}</span>
              {to === "/social" && unread > 0 && (
                <span className="ml-auto min-w-5 rounded-full bg-destructive px-1.5 text-center text-[11px] font-bold leading-5 text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}

            </Link>
          );
        })}
        <NavBalance />
      </aside>

      <div className="lg:flex lg:min-w-0 lg:flex-1 lg:justify-center lg:px-8 lg:py-8">
        <div className="lg:w-full lg:max-w-3xl lg:overflow-hidden lg:rounded-3xl lg:border lg:border-border lg:bg-background lg:shadow-card">
          <PhoneFrame wide>
            {standalone ? null : (
              <>
                <QuickMenu />
                <MobileNav />
              </>
            )}

            <div className={`flex-1 lg:pb-6 ${standalone ? "pb-[max(1rem,env(safe-area-inset-bottom))]" : "pb-28"}`}>
              {standalone ? null : <MembershipDunningBanner />}
              {children}
            </div>

            {mini ? <MiniAppSplash key={mini.id} app={mini} /> : null}
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  /* Inside a mini app the bar is the app's own, not a Shekk banner — it floats
     over the app's content instead of sitting in a card-coloured strip. */
  const inMiniApp = miniAppFor(pathname) !== null;
  return (
    <>
      {/* spacer keeps content clear of the fixed header on mobile */}
      <div className="h-[60px] lg:hidden" aria-hidden />
      <header
        className={`fixed left-1/2 top-0 z-40 flex w-full max-w-[430px] -translate-x-1/2 items-center gap-3 px-4 py-3 pr-16 lg:sticky lg:left-auto lg:max-w-none lg:translate-x-0 lg:pr-4 ${
          inMiniApp ? "bg-background/80 backdrop-blur" : "border-b border-border bg-card"
        }`}
      >
        <button
          type="button"
          aria-label="Go back"
          onClick={() => {
            if (onBack) { onBack(); return; }
            if (canGoBack) router.history.back();
            else navigate({ to: back });
          }}
          className="tap shrink-0 rounded-full bg-muted p-2 text-foreground"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">{title}</h1>
          {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      </header>
    </>
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
        <p className="text-xs opacity-80">Annual ID check — keeps your account and card active.</p>
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
