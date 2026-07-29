const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

/** Shows a notice while membership payments are running in test mode. */
export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="rounded-2xl border border-notice-border bg-notice-soft px-4 py-2.5 text-center text-xs text-notice-foreground">
        Membership checkout isn't live yet — finish payment setup to take real payments.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="rounded-2xl border border-notice-border bg-notice-soft px-4 py-2.5 text-center text-xs text-notice-foreground">
        Test mode — use card 4242 4242 4242 4242. No real money moves.
      </div>
    );
  }
  return null;
}
