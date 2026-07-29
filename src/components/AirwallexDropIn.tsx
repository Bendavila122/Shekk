/**
 * The real Airwallex payment sheet.
 *
 * Everything sensitive stays with Airwallex: the card number is typed into
 * their iframe, never into Shekk's DOM. All we hand it is the intent id and
 * client secret minted server-side, and all we get back is "the shopper
 * submitted". Shekels still only arrive when the signed webhook says the
 * payment settled — `onSubmitted` starts the wait, it does not credit anyone.
 *
 * Browser-only: the SDK is imported lazily inside the effect so it never runs
 * during SSR.
 */

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export type DropInProps = {
  intentId: string;
  clientSecret: string;
  currency: string;
  /** "sandbox" from the server maps to Airwallex's "demo" environment. */
  environment: string;
  onSubmitted: () => void;
  onError: (message: string) => void;
};

/** Read a themed CSS variable as a hex-ish colour the Airwallex iframe accepts. */
function cssColor(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;
  // Tokens are stored as bare HSL triples ("221 45% 19%").
  return /^[\d.]+\s/.test(raw) ? `hsl(${raw})` : raw;
}

export function AirwallexDropIn({
  intentId,
  clientSecret,
  currency,
  environment,
  onSubmitted,
  onError,
}: DropInProps) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Keep the callbacks fresh without re-mounting the iframe on every render.
  const submitted = useRef(onSubmitted);
  const failed = useRef(onError);
  submitted.current = onSubmitted;
  failed.current = onError;

  useEffect(() => {
    let alive = true;
    let element: { unmount: () => void; destroy?: () => void } | null = null;

    (async () => {
      try {
        const { init, createElement } = await import("@airwallex/components-sdk");
        await init({
          env: environment === "production" ? "prod" : "demo",
          enabledElements: ["payments"],
        });
        if (!alive) return;

        const dropIn = await createElement("dropIn", {
          intent_id: intentId,
          client_secret: clientSecret,
          currency,
          mode: "payment",
          appearance: {
            mode: "light",
            variables: {
              colorBrand: cssColor("--primary", "#1d4ed8"),
              colorText: cssColor("--foreground", "#1a2b48"),
            },
          },
        });
        if (!alive || !dropIn || !container.current) return;

        dropIn.on("ready", () => alive && setReady(true));
        dropIn.on("success", () => submitted.current());
        dropIn.on("error", (event: unknown) => {
          const message =
            (event as { error?: { message?: string } })?.error?.message ??
            "That payment was declined. Try another card.";
          failed.current(message);
        });

        dropIn.mount(container.current);
        element = dropIn as unknown as { unmount: () => void; destroy?: () => void };
      } catch (e) {
        if (alive) {
          failed.current(
            e instanceof Error ? e.message : "The payment sheet could not be loaded.",
          );
        }
      }
    })();

    return () => {
      alive = false;
      try {
        element?.destroy?.();
        element?.unmount();
      } catch {
        // The iframe is already gone; nothing to clean up.
      }
    };
  }, [intentId, clientSecret, currency, environment]);

  return (
    <div className="relative min-h-[220px]">
      {!ready ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Loading secure payment…
        </div>
      ) : null}
      <div ref={container} className={ready ? "" : "opacity-0"} />
    </div>
  );
}
