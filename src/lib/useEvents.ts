/**
 * Events & tickets — client hooks.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  adminCreateEvent,
  adminEventTickets,
  adminListEvents,
  adminSetEventStatus,
  adminSyncPartner,
  adminUpdateEvent,
  buyTicket,
  getEvent,
  listEvents,
  myTickets,
} from "./events.functions";

export const EVENT_KIND_LABEL: Record<string, string> = {
  shabbaton: "Shabbaton",
  tiyul: "Tiyul",
  club: "Club night",
  shiur: "Shiur",
  chesed: "Chesed",
  other: "Event",
};

/** "Thu 14 Aug · 18:30" */
export function eventWhen(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · ${d.toLocaleTimeString(
    "en-GB",
    { hour: "2-digit", minute: "2-digit" },
  )}`;
}

export function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const tomorrow = new Date(today.getTime() + 86_400_000);
  if (same(d, today)) return "Today";
  if (same(d, tomorrow)) return "Tomorrow";
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

export function useEvents() {
  const fn = useServerFn(listEvents);
  return useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: () => fn(),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useEvent(eventId: string) {
  const fn = useServerFn(getEvent);
  return useQuery({
    queryKey: ["events", "one", eventId],
    queryFn: () => fn({ data: { eventId } }),
    retry: 1,
  });
}

export function useMyTickets() {
  const fn = useServerFn(myTickets);
  return useQuery({
    queryKey: ["events", "tickets"],
    queryFn: () => fn(),
    retry: 1,
  });
}

export function useBuyTicket() {
  const fn = useServerFn(buyTicket);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { eventId: string; quantity: number }) =>
      fn({
        data: {
          ...vars,
          idempotencyKey: `ticket:${vars.eventId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["ledger"] });
    },
  });
}

/* ------------------------------------------------------------------- admin --- */

export function useAdminEvents(enabled: boolean) {
  const fn = useServerFn(adminListEvents);
  return useQuery({
    queryKey: ["admin", "events"],
    queryFn: () => fn(),
    enabled,
    retry: false,
  });
}

export function useAdminEventTickets(eventId: string | null) {
  const fn = useServerFn(adminEventTickets);
  return useQuery({
    queryKey: ["admin", "events", "tickets", eventId],
    queryFn: () => fn({ data: { eventId: eventId! } }),
    enabled: Boolean(eventId),
    retry: false,
  });
}

type Draft = Parameters<typeof adminCreateEvent>[0] extends { data: infer D } ? D : never;

export function useSaveEvent() {
  const create = useServerFn(adminCreateEvent);
  const update = useServerFn(adminUpdateEvent);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { eventId?: string | null; draft: Draft }) =>
      vars.eventId
        ? update({ data: { ...(vars.draft as object), eventId: vars.eventId } as never })
        : create({ data: vars.draft as never }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useSetEventStatus() {
  const fn = useServerFn(adminSetEventStatus);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { eventId: string; status: "draft" | "published" | "cancelled" }) =>
      fn({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useSyncPartner() {
  const fn = useServerFn(adminSyncPartner);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (provider: "eventer" | "tickchak") => fn({ data: { provider } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "events"] }),
  });
}
