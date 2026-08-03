/**
 * The single journey/progress model for Shekk.
 *
 * Before the Great Simplification there were three competing progress
 * indicators: the Setup hub, the Before You Fly checklist and a per-programme
 * checklist. Everything preparation-related now reads from here, so the number
 * on Today, Israel and Israel Setup is always the same number.
 */
import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { useProfile } from "@/lib/useProfile";
import { useProgramme, useTravel } from "@/lib/useProgramme";
import { useLocalState, toggleId } from "@/lib/local-state";
import { SETUP_SECTIONS, type AutoKey, type SetupItem, type SetupSection } from "@/lib/setup-content";

export type JourneySection = {
  section: SetupSection;
  done: number;
  total: number;
  pct: number;
};

export function useJourney() {
  const { state } = useApp();
  const profile = useProfile();
  const { joined } = useProgramme();
  const { travel, daysToArrival } = useTravel();
  const { value: local, update, ready } = useLocalState("shekk.setup.v1", { done: [] as string[] });

  const auto: Record<AutoKey, boolean> = {
    programme: joined,
    profile: Boolean(
      (state.name?.trim() || profile.profile?.legalFirstName) &&
        (travel.arrivalDate || state.profile.arrivalDateISO),
    ),
    kyc: profile.verified,
    money: state.balance > 0,
  };

  const isDone = (item: SetupItem) => (item.auto ? auto[item.auto] : local.done.includes(item.id));

  const sections: JourneySection[] = useMemo(
    () =>
      SETUP_SECTIONS.map((section) => {
        const done = section.items.filter(isDone).length;
        return { section, done, total: section.items.length, pct: done / section.items.length };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [local.done, auto.programme, auto.profile, auto.kyc, auto.money],
  );

  const total = sections.reduce((s, x) => s + x.total, 0);
  const done = sections.reduce((s, x) => s + x.done, 0);
  const complete = total > 0 && done === total;

  /** The contextual next step: first unfinished item in the earliest unfinished section. */
  const next = useMemo(() => {
    for (const { section } of sections) {
      const item = section.items.find((i) => !isDone(i));
      if (item) return { section, item };
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  return {
    sections,
    total,
    done,
    pct: total ? done / total : 0,
    complete,
    next,
    isDone,
    daysToArrival,
    ready,
    toggle: (id: string) => update((p) => ({ done: toggleId(p.done, id) })),
  };
}
