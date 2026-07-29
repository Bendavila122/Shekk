/**
 * Shekk Admin — the operator console behind the consumer app.
 *
 * Everything the admin changes lives in one localStorage document
 * (`shekk.admin.v1`). The consumer app reads that document through the
 * selectors at the bottom of this file, so the two sides stay in sync
 * without the admin UI ever being part of the app shell.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { SERVICE_CATEGORIES, type Service, type ServiceStatus } from "./services";
import { BENEFITS, type Benefit } from "./benefits";
import type { CurrencyCode } from "./currencies";

/* ----------------------------------------------------------------- gate --- */

export const ADMIN_CODE = "0161";
const SESSION_KEY = "shekk.admin.unlocked";

/** Drop the operator session (used by the console's "Lock" action). */
export function clearAdminSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}



export function useAdminGate() {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      setUnlocked(sessionStorage.getItem(SESSION_KEY) === "1");
    } catch {
      /* ignore */
    }
    setChecked(true);
  }, []);

  const unlock = useCallback((code: string) => {
    if (code.trim() !== ADMIN_CODE) return false;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setUnlocked(true);
    return true;
  }, []);

  const lock = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setUnlocked(false);
  }, []);

  return { unlocked, checked, unlock, lock };
}

/* --------------------------------------------------------------- config --- */

export type Promotion = {
  id: string;
  title: string;
  blurb: string;
  emoji: string;
  /** Where the promo surfaces in the consumer app. */
  placement: "home" | "explore" | "benefits";
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
  createdISO: string;
};

export type CustomService = {
  id: string;
  categoryId: string;
  name: string;
  partner?: string;
  emoji: string;
  domain?: string;
  blurb: string;
  status: ServiceStatus;
};

export type AdminConfig = {
  hiddenServices: string[];
  serviceStatus: Record<string, ServiceStatus>;
  customServices: CustomService[];
  hiddenBenefits: string[];
  promotions: Promotion[];
  premiumPriceGbp: number;
  fxMarginFree: number;
  fxMarginPremium: number;
  signupsOpen: boolean;
  cardIssuingOpen: boolean;
  maintenanceNote: string;
};

export const defaultAdminConfig: AdminConfig = {
  hiddenServices: [],
  serviceStatus: {},
  customServices: [],
  hiddenBenefits: [],
  promotions: [],
  premiumPriceGbp: 14.99,
  fxMarginFree: 3,
  fxMarginPremium: 1.2,
  signupsOpen: true,
  cardIssuingOpen: true,
  maintenanceNote: "",
};

const CONFIG_KEY = "shekk.admin.v1";
const EVENT = "shekk-admin-config";

function readConfig(): AdminConfig {
  if (typeof window === "undefined") return defaultAdminConfig;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return defaultAdminConfig;
    return { ...defaultAdminConfig, ...(JSON.parse(raw) as Partial<AdminConfig>) };
  } catch {
    return defaultAdminConfig;
  }
}

function writeConfig(next: AdminConfig) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

/** Read + write the admin document. Any component using it stays in sync. */
export function useAdminConfig() {
  const [config, setConfig] = useState<AdminConfig>(defaultAdminConfig);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConfig(readConfig());
    setHydrated(true);
    const sync = () => setConfig(readConfig());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((patch: Partial<AdminConfig> | ((c: AdminConfig) => AdminConfig)) => {
    const current = readConfig();
    const next = typeof patch === "function" ? patch(current) : { ...current, ...patch };
    writeConfig(next);
    setConfig(next);
  }, []);

  const resetConfig = useCallback(() => {
    writeConfig(defaultAdminConfig);
    setConfig(defaultAdminConfig);
  }, []);

  return { config, hydrated, update, resetConfig };
}

/* ---------------------------------------------- consumer-app selectors --- */

/** The service catalogue as the consumer app should see it right now. */
export function applyCatalogue(config: AdminConfig) {
  return SERVICE_CATEGORIES.map((cat) => {
    const custom: Service[] = config.customServices
      .filter((c) => c.categoryId === cat.id)
      .map((c) => ({
        id: c.id,
        name: c.name,
        partner: c.partner,
        emoji: c.emoji || "✨",
        domain: c.domain,
        blurb: c.blurb,
        status: c.status,
      }));
    return {
      ...cat,
      services: [...cat.services, ...custom]
        .filter((s) => !config.hiddenServices.includes(s.id))
        .map((s) => ({ ...s, status: config.serviceStatus[s.id] ?? s.status })),
    };
  }).filter((c) => c.services.length > 0);
}

export function useCatalogue() {
  const { config } = useAdminConfig();
  return useMemo(() => applyCatalogue(config), [config]);
}

export function useVisibleBenefits(): Benefit[] {
  const { config } = useAdminConfig();
  return useMemo(() => BENEFITS.filter((b) => !config.hiddenBenefits.includes(b.id)), [config]);
}

export function usePromotions(placement: Promotion["placement"]) {
  const { config } = useAdminConfig();
  return useMemo(
    () => config.promotions.filter((p) => p.active && p.placement === placement),
    [config, placement],
  );
}

/* ------------------------------------------------------------ analytics --- */

export type AdminAccount = {
  id: string;
  name: string;
  city: string;
  program: string;
  country: string;
  currency: CurrencyCode;
  membership: "free" | "premium";
  status: "active" | "pending-kyc" | "suspended";
  balance: number;
  addedTotal: number;
  spentTotal: number;
  sentTotal: number;
  convertedTotal: number;
  withdrawnTotal: number;
  cardIssued: boolean;
  joinedISO: string;
  lastActive: string;
};

/** No live book yet — the console starts empty until real accounts exist. */
export const ACCOUNTS: AdminAccount[] = [];

export type MoneyTotals = {
  added: number;
  spent: number;
  sent: number;
  converted: number;
  withdrawn: number;
  float: number;
  fxRevenue: number;
  membershipRevenue: number;
};

export function moneyTotals(accounts: AdminAccount[], config: AdminConfig): MoneyTotals {
  const t = accounts.reduce(
    (acc, a) => ({
      added: acc.added + a.addedTotal,
      spent: acc.spent + a.spentTotal,
      sent: acc.sent + a.sentTotal,
      converted: acc.converted + a.convertedTotal,
      withdrawn: acc.withdrawn + a.withdrawnTotal,
      float: acc.float + a.balance,
    }),
    { added: 0, spent: 0, sent: 0, converted: 0, withdrawn: 0, float: 0 },
  );
  const premiumCount = accounts.filter((a) => a.membership === "premium").length;
  const freeCount = accounts.length - premiumCount;
  const blended =
    (premiumCount * config.fxMarginPremium + freeCount * config.fxMarginFree) /
    Math.max(1, accounts.length) /
    100;
  return {
    ...t,
    fxRevenue: Math.round(t.converted * blended),
    membershipRevenue: Math.round(premiumCount * config.premiumPriceGbp * 4.68),
  };
}

/** Rolling 12-week money-in / money-out series for the charts. */
export function weeklySeries() {
  return Array.from({ length: 12 }, (_, i) => ({ label: `W${i + 1}`, added: 0, spent: 0 }));
}

export function spendByCategory(accounts: AdminAccount[]) {
  const cats = [
    { label: "Food & drink", share: 0.31, emoji: "🥙" },
    { label: "Transit & rides", share: 0.22, emoji: "🚌" },
    { label: "Groceries", share: 0.17, emoji: "🛒" },
    { label: "Events & tiyulim", share: 0.13, emoji: "🎟️" },
    { label: "Shops", share: 0.1, emoji: "🛍️" },
    { label: "Other", share: 0.07, emoji: "•" },
  ];
  const total = accounts.reduce((n, a) => n + a.spentTotal, 0);
  return cats.map((c) => ({ ...c, amount: Math.round(total * c.share) }));
}

export const shekels = (n: number) =>
  `₪${Math.round(n).toLocaleString("en-US")}`;
