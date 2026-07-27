import { useApp } from "@/lib/store";

/** Signup is disabled for now — screens just wait for persisted state to hydrate. */
export function useOnboardedGate() {
  const { hydrated } = useApp();
  return hydrated;
}
