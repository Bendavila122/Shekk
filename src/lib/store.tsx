import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SEED_TXNS, type Txn } from "./mock";
import type { CurrencyCode } from "./currencies";
import { defaultCardControls, type CardControls } from "./banking";
import type { TierId } from "./membership";

export type VerificationStatus = "verified" | "expiring" | "needs-update";

export type SplitRequest = {
  id: string;
  from: string;
  reason: string;
  amount: number;
  paid: boolean;
};

/** What we learn during onboarding and use to personalise everything after. */
export type Profile = {
  homeCountry: string;
  arrivalDateISO: string | null;
  city: string;
};

export type CardState = CardControls & {
  issued: boolean;
  last4: string;
  expiry: string;
  inAppleWallet: boolean;
  inGoogleWallet: boolean;
};

export const defaultCard: CardState = {
  ...defaultCardControls,
  issued: false,
  last4: "4417",
  expiry: "09/29",
  inAppleWallet: false,
  inGoogleWallet: false,
};


export type ThemePref = "system" | "light" | "dark";

export type Settings = {
  /** Every account is held in shekels — this is the currency you pay from. */
  payCurrency: CurrencyCode;
  theme: ThemePref;
  hideBalance: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
  faceIdOnPay: boolean;
  confirmOver: number | null;
  autoTopUp: boolean;
  autoTopUpFloor: number;
  notifSplits: boolean;
  notifReceipts: boolean;
  notifDeals: boolean;
  notifReverify: boolean;
  shabbatQuiet: boolean;
  discoverable: boolean;
  showPhotoToMerchants: boolean;
  homeCity: string;
  hebrewDates: boolean;
  /** Display language for the whole app. */
  appLanguage: "en" | "he" | "es" | "fr" | "ru";
  /** How much transliterated Hebrew slang shows up in English copy. */
  language: "en" | "en-heb";
};

export const defaultSettings: Settings = {
  payCurrency: "USD",
  theme: "system",
  hideBalance: false,
  reduceMotion: false,
  hapticFeedback: true,
  faceIdOnPay: true,
  confirmOver: 200,
  autoTopUp: false,
  autoTopUpFloor: 100,
  notifSplits: true,
  notifReceipts: true,
  notifDeals: false,
  notifReverify: true,
  shabbatQuiet: true,
  discoverable: true,
  showPhotoToMerchants: true,
  homeCity: "Jerusalem",
  hebrewDates: true,
  appLanguage: "en",
  language: "en-heb",
};

type State = {
  onboarded: boolean;
  name: string;
  avatar: string | null;
  programId: string;
  cohort: string;
  balance: number;
  txns: Txn[];
  reverifyDueISO: string | null;
  reverifyDone: boolean;
  splits: SplitRequest[];
  feedOptIn: boolean;
  settings: Settings;
  profile: Profile;
  membership: TierId;
  memberSinceISO: string | null;
  card: CardState;
  /** Benefit ids the member has already redeemed. */
  redeemed: string[];
};

const STORAGE_KEY = "shekk.state.v3";

const initialState: State = {
  onboarded: true,
  name: "Ari Feldman",
  avatar: null,
  programId: "aish",
  cohort: "J26 · Fall–Spring",
  balance: 3850.0,
  txns: SEED_TXNS,
  reverifyDueISO: null,
  reverifyDone: true,
  splits: [
    { id: "sp1", from: "Rivki Stein", reason: "Gett to Yitzhak Navon", amount: 16.25, paid: false },
    { id: "sp2", from: "Yoni Adler", reason: "Pizza Kefar — motzei Shabbat", amount: 34.0, paid: false },
  ],
  feedOptIn: true,
  settings: defaultSettings,
  profile: { homeCountry: "United States", arrivalDateISO: null, city: "Jerusalem" },
  membership: "premium",
  memberSinceISO: "2025-09-01",
  card: { ...defaultCard, issued: true, inAppleWallet: true },
  redeemed: [],
};

export type OnboardingPayload = {
  name: string;
  programId: string;
  cohort?: string;
  homeCountry?: string;
  arrivalDateISO?: string | null;
  city?: string;
  appLanguage?: Settings["appLanguage"];
  payCurrency?: CurrencyCode;
};

type Ctx = {
  state: State;
  hydrated: boolean;
  daysLeft: number | null;
  verification: VerificationStatus;
  isPremium: boolean;
  completeOnboarding: (p: OnboardingPayload) => void;
  /** Money added to the shekel account, settled by the partner bank. */
  addMoney: (shekels: number, paid: number, sourceLabel?: string) => void;
  spend: (merchant: string, category: string, amount: number, icon: string) => void;
  receive: (merchant: string, amount: number, icon: string) => void;
  sendMoney: (to: string, amount: number, note?: string) => void;
  triggerReverify: () => void;
  completeReverify: () => void;
  payFriend: (id: string) => void;
  addSplit: (s: SplitRequest) => void;
  setFeedOptIn: (v: boolean) => void;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetSettings: () => void;
  setAvatar: (dataUrl: string | null) => void;
  setMembership: (tier: TierId) => void;
  setCard: (patch: Partial<CardState>) => void;
  redeemBenefit: (id: string) => void;
  reset: () => void;
};


const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<State>;
        setState({ ...initialState, ...saved, settings: { ...defaultSettings, ...(saved.settings ?? {}) } });
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  // Theme preference drives the document class (system follows the OS).
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = state.settings.theme === "dark" || (state.settings.theme === "system" && mq.matches);
      root.classList.toggle("dark", dark);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [hydrated, state.settings.theme]);

  // Display language drives lang/dir on the document.
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const lang = state.settings.appLanguage;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  }, [hydrated, state.settings.appLanguage]);

  // Motion preference is a single class the utilities can hang off.
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    document.documentElement.classList.toggle("reduce-motion", state.settings.reduceMotion);
  }, [hydrated, state.settings.reduceMotion]);

  const daysLeft = useMemo(() => {
    if (!state.reverifyDueISO || state.reverifyDone) return null;
    const ms = new Date(state.reverifyDueISO).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86_400_000));
  }, [state.reverifyDueISO, state.reverifyDone]);

  const verification: VerificationStatus = state.reverifyDone
    ? "verified"
    : daysLeft !== null && daysLeft > 7
      ? "expiring"
      : "needs-update";

  const value: Ctx = {
    state,
    hydrated,
    daysLeft,
    verification,
    isPremium: state.membership === "premium",
    completeOnboarding: (p) =>
      setState((s) => ({
        ...s,
        onboarded: true,
        name: p.name,
        programId: p.programId,
        cohort: p.cohort ?? s.cohort,
        txns: SEED_TXNS,
        profile: {
          homeCountry: p.homeCountry ?? s.profile.homeCountry,
          arrivalDateISO: p.arrivalDateISO ?? s.profile.arrivalDateISO,
          city: p.city ?? s.profile.city,
        },
        settings: {
          ...s.settings,
          homeCity: p.city ?? s.settings.homeCity,
          appLanguage: p.appLanguage ?? s.settings.appLanguage,
          payCurrency: p.payCurrency ?? s.settings.payCurrency,
        },
      })),
    addMoney: (shekels, paid, sourceLabel) =>
      setState((s) => ({
        ...s,
        balance: +(s.balance + shekels).toFixed(2),
        txns: [
          {
            id: `tx${Date.now()}`,
            merchant: `Money added · ${sourceLabel ?? `$${paid.toFixed(2)}`}`,
            category: "Top up",
            amount: shekels,
            date: "Just now",
            icon: "💳",
          },
          ...s.txns,
        ],
      })),
    sendMoney: (to, amount, note) =>
      setState((s) => ({
        ...s,
        balance: +(s.balance - amount).toFixed(2),
        txns: [
          {
            id: `tx${Date.now()}`,
            merchant: `Sent to ${to}${note ? ` · ${note}` : ""}`,
            category: "Transfers",
            amount: -amount,
            date: "Just now",
            icon: "↗️",
          },
          ...s.txns,
        ],
      })),
    setMembership: (membership) =>
      setState((s) => ({
        ...s,
        membership,
        memberSinceISO: membership === "premium" ? (s.memberSinceISO ?? new Date().toISOString().slice(0, 10)) : null,
        card: membership === "premium" ? s.card : { ...s.card, issued: false, inAppleWallet: false },
      })),
    setCard: (patch) => setState((s) => ({ ...s, card: { ...s.card, ...patch } })),
    redeemBenefit: (id) =>
      setState((s) => (s.redeemed.includes(id) ? s : { ...s, redeemed: [id, ...s.redeemed] })),

    spend: (merchant, category, amount, icon) =>
      setState((s) => ({
        ...s,
        balance: +(s.balance - amount).toFixed(2),
        txns: [
          { id: `tx${Date.now()}`, merchant, category, amount: -amount, date: "Just now", icon },
          ...s.txns,
        ],
      })),
    receive: (merchant, amount, icon) =>
      setState((s) => ({
        ...s,
        balance: +(s.balance + amount).toFixed(2),
        txns: [
          { id: `tx${Date.now()}`, merchant, category: "Friends", amount, date: "Just now", icon },
          ...s.txns,
        ],
      })),
    triggerReverify: () =>
      setState((s) => ({
        ...s,
        reverifyDone: false,
        reverifyDueISO: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      })),
    completeReverify: () => setState((s) => ({ ...s, reverifyDone: true, reverifyDueISO: null })),
    payFriend: (id) =>
      setState((s) => {
        const req = s.splits.find((x) => x.id === id);
        if (!req || req.paid) return s;
        return {
          ...s,
          balance: +(s.balance - req.amount).toFixed(2),
          splits: s.splits.map((x) => (x.id === id ? { ...x, paid: true } : x)),
          txns: [
            {
              id: `tx${Date.now()}`,
              merchant: `Split paid to ${req.from}`,
              category: "Friends",
              amount: -req.amount,
              date: "Just now",
              icon: "👥",
            },
            ...s.txns,
          ],
        };
      }),
    addSplit: (s2) => setState((s) => ({ ...s, splits: [s2, ...s.splits] })),
    setFeedOptIn: (v) => setState((s) => ({ ...s, feedOptIn: v })),
    setSetting: (key, value) => setState((s) => ({ ...s, settings: { ...s.settings, [key]: value } })),
    resetSettings: () => setState((s) => ({ ...s, settings: defaultSettings })),
    setAvatar: (avatar) => setState((s) => ({ ...s, avatar })),
    reset: () => setState(initialState),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
