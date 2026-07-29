/**
 * Real funding, or none at all.
 *
 * Shekk cannot credit its own members. A balance only rises when Airwallex
 * confirms a settled payment to the signed webhook. This hook is the whole
 * client-side story: is the partner connected, start a payment, wait for the
 * money to land.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { airwallexStatus, startTopUp } from "./airwallex.functions";
import type { CurrencyCode } from "./currencies";
import { useApp } from "./store";

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

export type FundingPhase = "idle" | "starting" | "awaiting" | "settled" | "error";

export function useFunding() {
  const { signedIn, refreshLedger, state } = useApp();
  const partner = usePaymentPartner();
  const [phase, setPhase] = useState<FundingPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [intentId, setIntentId] = useState<string | null>(null);
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

  /** Why funding is unavailable right now, or null when it's good to go. */
  const blocked =
    partner === null
      ? "Checking the payment partner…"
      : !partner.connected
        ? "Adding money is unavailable — Shekk's payment partner isn't connected yet."
        : !signedIn
          ? "Sign in to add money to your shekel account."
          : null;

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
        setIntentId(res.intentId);
        setPhase("awaiting");
        return res;
      } catch (e) {
        setError(e instanceof Error ? e.message : "That payment could not be started.");
        setPhase("error");
        return null;
      }
    },
    [blocked, state.balance],
  );

  const resetFunding = useCallback(() => {
    setPhase("idle");
    setError(null);
    setIntentId(null);
  }, []);

  return { partner, blocked, phase, error, intentId, fund, resetFunding };
}
