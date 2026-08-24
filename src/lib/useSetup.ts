/**
 * The member's setup checklist state.
 *
 * Some tasks Shekk can verify itself (programme joined, documents uploaded,
 * health card stored); the rest are ticked by hand and stored in setup_tasks so
 * they follow the member across devices. Signed-out visitors get a local-only
 * view so the checklist still reads sensibly before sign-in.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/store";
import { useProgramme } from "@/lib/useProgramme";
import { useOfficial } from "@/lib/useOfficial";
import { useHealth } from "@/lib/useHealth";
import { SETUP_TASKS } from "@/lib/setup-checklist";
import { track } from "@/lib/analytics";

const KEY = ["setup", "tasks"];

export function useSetup() {
  const { signedIn } = useApp();
  const qc = useQueryClient();
  const { joined } = useProgramme();
  const { documents } = useOfficial();
  const { cards } = useHealth();

  const query = useQuery<string[]>({
    queryKey: KEY,
    enabled: signedIn,
    staleTime: 30_000,
    throwOnError: false,
    queryFn: async () => {
      const { data, error } = await supabase.from("setup_tasks").select("task_key,done");
      if (error) throw error;
      return (data ?? []).filter((r) => r.done).map((r) => r.task_key as string);
    },
  });

  const ticked = new Set(query.data ?? []);

  /** Derived completions — Shekk already knows these are done. */
  const derived = new Set<string>();
  if (joined) derived.add("programme");
  if (documents.length > 0) derived.add("documents");
  if (cards.length > 0) derived.add("health");

  const isDone = (key: string) => ticked.has(key) || derived.has(key);
  const isDerived = (key: string) => derived.has(key) && !ticked.has(key);

  const toggle = useMutation({
    mutationFn: async (v: { key: string; done: boolean }) => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      if (!userId) throw new Error("Sign in to save your progress");
      if (v.done) {
        const { error } = await supabase
          .from("setup_tasks")
          .upsert({ user_id: userId, task_key: v.key, done: true, done_at: new Date().toISOString() }, { onConflict: "user_id,task_key" });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("setup_tasks").delete().eq("task_key", v.key);
        if (error) throw error;
      }
      return v;
    },
    onSuccess: (v) => {
      qc.setQueryData<string[]>(KEY, (prev = []) =>
        v.done ? Array.from(new Set([...prev, v.key])) : prev.filter((k) => k !== v.key),
      );
      if (v.done) track("setup_task_completed", { task: v.key });
    },
  });

  const total = SETUP_TASKS.length;
  const done = SETUP_TASKS.filter((t) => isDone(t.key)).length;

  return {
    isDone,
    isDerived,
    toggle,
    done,
    total,
    percent: total ? Math.round((done / total) * 100) : 0,
    complete: done === total,
    loading: signedIn && query.isLoading,
    /** The first open task, in journey order. */
    next: SETUP_TASKS.find((t) => !isDone(t.key)) ?? null,
  };
}
