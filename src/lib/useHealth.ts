/**
 * Health cover for the UI: the member's insurance cards, their photos, and the
 * mutations they're allowed to make on their own record.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import {
  listInsuranceCards,
  saveInsuranceCard,
  deleteInsuranceCard,
  startCardPhotoUpload,
} from "@/lib/health.functions";
import type { CardDraft, InsuranceCard } from "@/lib/health.server";

const KEY = ["insurance-cards"];

function isClockSkew(error: unknown) {
  return /issued at future|iat|Unauthorized/i.test(
    error instanceof Error ? error.message : String(error),
  );
}

export type PhotoType = "image/jpeg" | "image/png" | "image/webp" | "image/heic";

export function useHealth() {
  const { signedIn } = useApp();
  const qc = useQueryClient();

  const query = useQuery<InsuranceCard[]>({
    queryKey: KEY,
    queryFn: () => listInsuranceCards(),
    enabled: signedIn,
    staleTime: 30_000,
    throwOnError: false,
    retry: (count, error) => count < 4 && isClockSkew(error),
    retryDelay: (count) => Math.min(1500 * (count + 1), 5000),
  });

  const save = useMutation({
    mutationFn: (draft: CardDraft) => saveInsuranceCard({ data: draft }),
    onSuccess: (next) => qc.setQueryData(KEY, next),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteInsuranceCard({ data: { id } }),
    onSuccess: (next) => qc.setQueryData(KEY, next),
  });

  /** Upload a photo of the physical card and hand back its storage path. */
  const uploadPhoto = useMutation({
    mutationFn: async ({ side, file }: { side: "front" | "back"; file: File }) => {
      const contentType = file.type as PhotoType;
      const ticket = await startCardPhotoUpload({ data: { side, contentType } });
      const { error } = await supabase.storage
        .from("insurance-cards")
        .uploadToSignedUrl(ticket.path, ticket.token, file);
      if (error) throw new Error("Upload failed — try a smaller or clearer photo.");
      return ticket.path;
    },
  });

  const cards = query.data ?? [];

  return {
    cards,
    primary: cards.find((c) => c.isPrimary) ?? cards[0] ?? null,
    loading: query.isLoading,
    refetch: query.refetch,
    save,
    remove,
    uploadPhoto,
  };
}

export type { InsuranceCard };
