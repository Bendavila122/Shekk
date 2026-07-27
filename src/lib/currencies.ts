import { SPREAD_PCT } from "./mock";

export type CurrencyCode = "USD" | "GBP" | "EUR" | "CAD" | "AUD" | "ZAR";

export type Currency = {
  code: CurrencyCode;
  symbol: string;
  label: string;
  flag: string;
  /** Mid-market shekels per 1 unit — internal reference only. */
  ilsPerUnit: number;
};

/** Currencies students actually pay from. Every account is held in shekels. */
export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", label: "US dollar", flag: "🇺🇸", ilsPerUnit: 3.68 },
  { code: "GBP", symbol: "£", label: "British pound", flag: "🇬🇧", ilsPerUnit: 4.68 },
  { code: "EUR", symbol: "€", label: "Euro", flag: "🇪🇺", ilsPerUnit: 3.98 },
  { code: "CAD", symbol: "C$", label: "Canadian dollar", flag: "🇨🇦", ilsPerUnit: 2.69 },
  { code: "AUD", symbol: "A$", label: "Australian dollar", flag: "🇦🇺", ilsPerUnit: 2.42 },
  { code: "ZAR", symbol: "R", label: "South African rand", flag: "🇿🇦", ilsPerUnit: 0.2 },
];

export const currency = (code: CurrencyCode): Currency =>
  CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

export const money = (code: CurrencyCode, n: number) =>
  `${currency(code).symbol}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Shekk's own rate for a pay currency — ~3% below mid-market, built in. */
export const shekkRate = (code: CurrencyCode) =>
  +(currency(code).ilsPerUnit * (1 - SPREAD_PCT)).toFixed(4);

export function quoteTopUpIn(code: CurrencyCode, amount: number) {
  const rate = shekkRate(code);
  return { amount, credits: +(amount * rate).toFixed(2), rate, code };
}

/** Reference value of a shekel balance in the user's pay currency. */
export const refIn = (code: CurrencyCode, shekels: number) =>
  money(code, +(shekels / currency(code).ilsPerUnit).toFixed(2));
