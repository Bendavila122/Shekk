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
import { CURRENCIES, type CurrencyCode } from "./currencies";

/* ----------------------------------------------------------------- gate --- */

export const ADMIN_CODE = "0161";
const SESSION_KEY = "shekk.admin.unlocked";

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
  promotions: [
    {
      id: "promo-seed-1",
      title: "First Rav-Kav top-up on us",
      blurb: "New members get ₪30 back on their first travel-card load.",
      emoji: "🚌",
      placement: "home",
      ctaLabel: "Load Rav-Kav",
      ctaHref: "/explore/transit",
      active: true,
      createdISO: "2026-06-01",
    },
    {
      id: "promo-seed-2",
      title: "Premium for the chagim",
      blurb: "Two months of Shekk Premium free when you upgrade before Tishrei.",
      emoji: "👑",
      placement: "home",
      ctaLabel: "See Premium",
      ctaHref: "/membership",
      active: false,
      createdISO: "2026-07-04",
    },
  ],
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

const FIRST = ["Ari", "Rivki", "Yoni", "Tova", "Shua", "Elisheva", "Dovi", "Maya", "Noam", "Talia", "Zev", "Chana", "Ezra", "Bracha", "Yehuda", "Shira", "Meir", "Adina", "Gavi", "Leah"];
const LAST = ["Feldman", "Stein", "Adler", "Klein", "Berman", "Rosen", "Kaplan", "Weiss", "Gold", "Katz", "Levine", "Bauer", "Schwartz", "Mandel", "Reich"];
const CITIES = ["Jerusalem", "Tel Aviv", "Bet Shemesh", "Efrat", "Haifa", "Ra'anana", "Modiin"];
const PROGRAMS = ["Aish HaTorah", "Ohr Somayach", "Michlala", "Meor", "Midreshet Moriah", "Machon Maayan"];
const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia", "South Africa", "France"];

/** Deterministic pseudo-random so the console shows the same book every load. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export const ACCOUNTS: AdminAccount[] = Array.from({ length: 48 }, (_, i) => {
  const r = rng(i * 7919 + 13);
  const added = Math.round((600 + r() * 9000) / 10) * 10;
  const spent = Math.round(added * (0.35 + r() * 0.5));
  const sent = Math.round(added * (0.03 + r() * 0.12));
  const withdrawn = r() > 0.85 ? Math.round(added * 0.05) : 0;
  const premium = r() > 0.58;
  const statusRoll = r();
  return {
    id: `acc_${(1000 + i).toString()}`,
    name: `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`,
    city: CITIES[i % CITIES.length],
    program: PROGRAMS[(i * 2) % PROGRAMS.length],
    country: COUNTRIES[(i * 5) % COUNTRIES.length],
    currency: CURRENCIES[i % CURRENCIES.length].code,
    membership: premium ? "premium" : "free",
    status: statusRoll > 0.94 ? "suspended" : statusRoll > 0.86 ? "pending-kyc" : "active",
    balance: Math.max(0, added - spent - sent - withdrawn),
    addedTotal: added,
    spentTotal: spent,
    sentTotal: sent,
    convertedTotal: added,
    withdrawnTotal: withdrawn,
    cardIssued: premium && r() > 0.2,
    joinedISO: `2026-0${(i % 7) + 1}-${String((i % 27) + 1).padStart(2, "0")}`,
    lastActive: ["Today", "Yesterday", "2 days ago", "This week", "Last week"][i % 5],
  };
});

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
  const r = rng(4242);
  return Array.from({ length: 12 }, (_, i) => ({
    label: `W${i + 1}`,
    added: Math.round(18000 + r() * 22000 + i * 900),
    spent: Math.round(12000 + r() * 18000 + i * 700),
  }));
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
