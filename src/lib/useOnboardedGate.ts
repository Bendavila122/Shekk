import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";

/** Sends users to onboarding until they've signed up. */
export function useOnboardedGate() {
  const { state, hydrated } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    if (hydrated && !state.onboarded) navigate({ to: "/onboarding" });
  }, [hydrated, state.onboarded, navigate]);
  return hydrated && state.onboarded;
}
