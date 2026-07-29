/**
 * Real funding, or none at all.
 *
 * Shekk cannot credit its own members. A balance only rises when Airwallex
 * confirms a settled payment to the signed webhook. This hook is the whole
 * client-side story: is the partner connected, mint an intent, hand it to the
 * Airwallex payment sheet, then wait for the money to land.
 *
 * Phases: idle → starting (minting the intent) → collecting (the shopper is in
 * the Airwallex sheet) → awaiting (submitted; waiting on the webhook) →
 * settled.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { airwallexStatus, startTopUp } from "./airwallex.functions";
import type { CurrencyCode } from "./currencies";
import { useApp } from "./store";
import { useProfile } from "./useProfile";

export type PartnerStatus = {
  connected: boolean;
  environment: string;
} | null;

/** `null` while we're still asking. */
export function usePaymentPartner(): PartnerStatus {
  const [status, setStatus] = useState<PartnerStatus>(null);

  useEffect(() => {
    let alive = true;
    airwallexStatus()
      .then((s) => alive && setStatus(s))
      .catch(() => alive && setStatus({ connected: false, environment: "sandbox" }));
    return () => {
      alive = false;
    };
  }, []);

  return status;
}

export type FundingPhase = "idle" | "starting" | "collecting" | "awaiting" | "settled" | "error";

export type PendingIntent = {
  intentId: string;
  clientSecret: string;
  currency: string;
  amount: number;
};

export function useFunding() {
  const { signedIn, refreshLedger, state } = useApp();
  const partner = usePaymentPartner();
  const { verified, pending, loading: profileLoading } = useProfile();
  const [phase, setPhase] = useState<FundingPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [intent, setIntent] = useState<PendingIntent | null>(null);
  const startBalance = useRef(0);

  // While a payment is in flight, watch for the webhook's credit to arrive.
  useEffect(() => {
    if (phase !== "awaiting") return;
    const timer = setInterval(() => void refreshLedger(), 3000);
    const giveUp = setTimeout(() => setPhase("idle"), 5 * 60_000);
    return () => {
      clearInterval(timer);
      clearTimeout(giveUp);
    };
  }, [phase, refreshLedger]);

  useEffect(() => {
    if (phase === "awaiting" && state.balance > startBalance.current) setPhase("settled");
  }, [phase, state.balance]);

  /** Regulated accounts only fund after the identity checks pass. */
  const needsVerification = signedIn && !profileLoading && !verified;

  /** Why funding is unavailable right now, or null when it's good to go. */
  const blocked =
    partner === null
      ? "Checking the payment partner…"
      : !partner.connected
        ? "Adding money is unavailable — Shekk's payment partner isn't connected yet."
        : !signedIn
          ? "Sign in to add money to your shekel account."
          : needsVerification
            ? pending
              ? "Your identity checks are still being reviewed. You can add money as soon as they clear."
              : "Verify your identity before adding money — it takes about three minutes."
            : null;


  /** Mint a payment intent. The shopper then pays inside Airwallex's sheet. */
  const fund = useCallback(
    async (payCurrency: CurrencyCode, payAmount: number) => {
      setError(null);
      if (blocked) {
        setError(blocked);
        setPhase("error");
        return null;
      }
      setPhase("starting");
      startBalance.current = state.balance;
      try {
        const res = await startTopUp({ data: { currency: payCurrency, amount: payAmount } });
        if (!res.connected) throw new Error("Payment partner isn't connected yet.");
        const pending: PendingIntent = {
          intentId: res.intentId,
          clientSecret: res.clientSecret,
          currency: res.currency,
          amount: res.amount,
        };
        setIntent(pending);
        setPhase("collecting");
        return pending;
      } catch (e) {
        setError(e instanceof Error ? e.message : "That payment could not be started.");
        setPhase("error");
        return null;
      }
    },
    [blocked, state.balance],
  );

  /** Airwallex accepted the shopper's payment — now wait on the webhook. */
  const markSubmitted = useCallback(() => {
    setError(null);
    setPhase("awaiting");
  }, []);

  /** The sheet reported a problem; let them try again. */
  const failFunding = useCallback((message: string) => {
    setError(message);
    setPhase("collecting");
  }, []);

  const resetFunding = useCallback(() => {
    setPhase("idle");
    setError(null);
    setIntent(null);
  }, []);

  return {
    partner,
    blocked,
    needsVerification,
    phase,
    error,
    intent,
    intentId: intent?.intentId ?? null,
    fund,
    markSubmitted,
    failFunding,
    resetFunding,
  };
}
