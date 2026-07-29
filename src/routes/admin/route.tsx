import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  BarChart3,
  Boxes,
  Coins,
  Crown,
  LayoutGrid,
  Lock,
  LogOut,
  Megaphone,
  Settings2,
  Users,
} from "lucide-react";
import { useAdminGate } from "@/lib/admin";
import { useAdminSession, useClaimConsole } from "@/lib/admin-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Shekk Console" },
      { name: "description", content: "Internal Shekk operations console." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", Icon: BarChart3, exact: true },
  { to: "/admin/money", label: "Money flow", Icon: Coins },
  { to: "/admin/accounts", label: "Accounts", Icon: Users },
  { to: "/admin/memberships", label: "Memberships", Icon: Crown },
  { to: "/admin/apps", label: "Apps & services", Icon: LayoutGrid },
  { to: "/admin/promotions", label: "Promotions", Icon: Megaphone },
  { to: "/admin/controls", label: "Controls", Icon: Settings2 },
] as const;

function AdminLayout() {
  const { unlocked, checked, unlock, lock } = useAdminGate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!checked) return <div className="min-h-screen bg-ink" />;
  if (!unlocked) return <CodeGate onSubmit={unlock} />;


  return (
    <div className="flex min-h-screen bg-ink/[0.04]">
      <aside className="hidden w-60 shrink-0 flex-col gap-1 border-r border-border bg-ink px-3 py-6 text-ink-foreground md:flex">
        <div className="mb-5 px-3">
          <p className="font-display text-lg font-bold leading-tight">Shekk Console</p>
          <p className="text-[11px] uppercase tracking-widest opacity-50">Internal only</p>
        </div>
        {NAV.map(({ to, label, Icon, ...rest }) => {
          const active = "exact" in rest && rest.exact ? pathname === to : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active ? "bg-ink-foreground/15 text-ink-foreground" : "text-ink-foreground/60 hover:bg-ink-foreground/10"
              }`}
            >
              <Icon className="size-4.5 shrink-0" />
              {label}
            </Link>
          );
        })}
        <div className="mt-auto space-y-1 px-1 pt-6">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-foreground/60 hover:bg-ink-foreground/10"
          >
            <Boxes className="size-4.5" /> Back to app
          </Link>
          <button
            type="button"
            onClick={lock}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-foreground/60 hover:bg-ink-foreground/10"
          >
            <LogOut className="size-4.5" /> Lock console
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex gap-1 overflow-x-auto border-b border-border bg-ink px-3 py-2 text-ink-foreground md:hidden">
          {NAV.map(({ to, label, ...rest }) => {
            const active = "exact" in rest && rest.exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                  active ? "bg-ink-foreground/20" : "text-ink-foreground/60"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
          <ConsoleAccess>
            <Outlet />
          </ConsoleAccess>
        </main>
      </div>
    </div>
  );
}

function CodeGate({ onSubmit }: { onSubmit: (code: string) => boolean }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-ink-foreground">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!onSubmit(code)) {
            setError(true);
            setCode("");
          }
        }}
        className="w-full max-w-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-2xl bg-ink-foreground/10 p-3">
            <Lock className="size-5" />
          </span>
          <div>
            <p className="font-display text-xl font-bold leading-tight">Shekk Console</p>
            <p className="text-xs opacity-60">Enter your access code</p>
          </div>
        </div>
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
            setError(false);
          }}
          inputMode="numeric"
          autoFocus
          placeholder="••••"
          aria-label="Access code"
          className="w-full rounded-2xl border border-ink-foreground/20 bg-ink-foreground/5 px-5 py-4 text-center font-display text-2xl tracking-[0.5em] text-ink-foreground outline-none placeholder:text-ink-foreground/30 focus:border-ink-foreground/50"
        />
        {error ? <p className="mt-3 text-center text-xs text-danger">Incorrect code.</p> : null}
        <button
          type="submit"
          className="mt-4 w-full rounded-2xl bg-ink-foreground px-5 py-4 text-sm font-bold uppercase tracking-wide text-ink"
        >
          Unlock
        </button>
        <p className="mt-6 text-center text-[11px] opacity-40">
          Shekk internal operations. Activity is logged.
        </p>
      </form>
    </div>
  );
}

/**
 * The operator code opens the console shell; real member data needs a signed-in
 * account holding the `admin` role. The first operator to claim an unclaimed
 * console becomes that admin.
 */
function ConsoleAccess({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error } = useAdminSession();
  const claim = useClaimConsole();

  if (isLoading) {
    return <p className="py-16 text-center text-sm text-muted-foreground">Checking operator access…</p>;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-card">
        <p className="font-display text-lg font-bold">Sign in to continue</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The console reads live member data, so it needs a signed-in Shekk account as well as the operator code.
        </p>
        <Link
          to="/auth"
          className="mt-4 inline-block rounded-xl bg-ink px-5 py-3 text-sm font-bold text-ink-foreground"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  if (!data.isAdmin) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-card">
        <p className="font-display text-lg font-bold">This account is not an operator</p>
        <p className="mt-1 text-sm text-muted-foreground">
          If nobody has claimed the console yet, you can take the admin role now. Otherwise ask an existing operator
          to add you.
        </p>
        <button
          type="button"
          disabled={claim.isPending}
          onClick={() => claim.mutate()}
          className="mt-4 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {claim.isPending ? "Claiming…" : "Claim operator access"}
        </button>
        {claim.data && !claim.data.isAdmin ? (
          <p className="mt-3 text-xs text-destructive">The console already has an admin.</p>
        ) : null}
      </div>
    );
  }

  return <>{children}</>;
}
