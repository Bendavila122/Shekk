/**
 * Shekk financial partner layer.
 *
 * Shekk is not a bank. Every regulated function — KYC/AML, holding funds,
 * issuing the Mastercard, moving money — belongs to a licensed partner that
 * Shekk talks to over an API. This module is the single seam where those
 * partners plug in.
 *
 * Today every adapter is a simulator: it returns believable data instantly and
 * touches nothing real. When a real Banking-as-a-Service, issuing or FX
 * provider is signed, swap the implementation behind these same function
 * signatures and the rest of the app does not change.
 */

import type { CurrencyCode } from "./currencies";
import { currency } from "./currencies";

/** Named partners so the UI can attribute regulated functions honestly. */
export const PARTNERS = {
  banking: { name: "Partner bank", role: "Account issuing, safeguarding & AML", status: "in onboarding" },
  issuing: { name: "Mastercard issuer", role: "Card issuing & authorisation", status: "in onboarding" },
  kyc: { name: "Identity partner", role: "KYC, sanctions & re-verification", status: "in onboarding" },
  fx: { name: "FX partner", role: "Currency conversion & settlement", status: "in onboarding" },
} as const;

export type PartnerKey = keyof typeof PARTNERS;

/** Simulated latency so mock flows feel like real network calls. */
const settle = <T,>(value: T, ms = 700): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

/* ------------------------------------------------------------------ FX --- */

/** Shekk's retail margin over the interbank rate. */
export const FX_MARGIN = 0.03;

export type FxQuote = {
  from: CurrencyCode;
  amount: number;
  /** Interbank reference, shown for transparency. */
  interbank: number;
  /** Rate Shekk actually gives, margin included. */
  rate: number;
  /** Shekels landing in the account. */
  shekels: number;
  /** Margin expressed in the source currency. */
  fee: number;
  expiresInSec: number;
};

export function quoteFx(from: CurrencyCode, amount: number): FxQuote {
  const interbank = currency(from).ilsPerUnit;
  const rate = +(interbank * (1 - FX_MARGIN)).toFixed(4);
  const gross = amount * interbank;
  const shekels = +(amount * rate).toFixed(2);
  return {
    from,
    amount,
    interbank,
    rate,
    shekels,
    fee: +((gross - shekels) / interbank).toFixed(2),
    expiresInSec: 30,
  };
}

/* -------------------------------------------------------------- Funding --- */

export type FundingResult = {
  reference: string;
  shekels: number;
  method: "apple-pay" | "google-pay" | "bank-transfer" | "card";
};

/** Pull money in from a funding source and settle it as shekels. */
export async function requestFunding(
  method: FundingResult["method"],
  quote: FxQuote,
): Promise<FundingResult> {
  return settle({ reference: reference("FND"), shekels: quote.shekels, method });
}

/* ----------------------------------------------------------- Card issuing --- */

export type CardControls = {
  frozen: boolean;
  contactless: boolean;
  online: boolean;
  atm: boolean;
  monthlyLimit: number;
};

export const defaultCardControls: CardControls = {
  frozen: false,
  contactless: true,
  online: true,
  atm: true,
  monthlyLimit: 6000,
};

/** Ask the issuing partner for a virtual Mastercard. */
export async function issueCard(): Promise<{ last4: string; expiry: string; network: "mastercard" }> {
  return settle({ last4: "4417", expiry: "09/29", network: "mastercard" as const }, 1400);
}

/** Push the issued card into Apple Wallet / Google Wallet. */
export async function provisionToWallet(wallet: "apple" | "google"): Promise<{ wallet: string; ok: boolean }> {
  return settle({ wallet, ok: true }, 1100);
}

/* --------------------------------------------------------------- Transfers --- */

export async function sendToShekkUser(to: string, shekels: number) {
  return settle({ reference: reference("P2P"), to, shekels }, 600);
}

/* ------------------------------------------------------------------ util --- */

function reference(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
