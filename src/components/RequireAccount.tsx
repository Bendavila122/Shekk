/**
 * The front door.
 *
 * Shekk is a regulated money account, not a browsable site: nothing behind the
 * door is visible until someone has an account. This wraps the whole app and
 * sends anyone without a session to sign up, keeping only the handful of
 * routes that must work signed-out — auth, password reset, the terms and the
 * OAuth/consent plumbing — open.
 */

import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useApp } from "@/lib/store";

/** Routes a signed-out visitor is allowed to reach. */
const OPEN_PREFIXES = [
  "/auth",
  "/reset-password",
  "/terms",
  "/welcome",
  "/admin",
  "/api",
  "/mcp",
  "/.well-known",
  "/.lovable",
  "/sitemap.xml",
];

function isOpen(pathname: string) {
  return OPEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function RequireAccount({ children }: { children: ReactNode }) {
  const { signedIn, authChecked } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const open = isOpen(pathname);
  const locked = authChecked && !signedIn && !open;

  useEffect(() => {
    if (!locked) return;
    void navigate({
      to: "/auth",
      search: { next: pathname },
      replace: true,
    });
  }, [locked, navigate, pathname]);

  // Hold the door shut while we check, so no signed-out flash of the wallet.
  if (!open && (!authChecked || !signedIn)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground">SHEKK</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {authChecked ? "Taking you to sign in…" : "Opening your account…"}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
