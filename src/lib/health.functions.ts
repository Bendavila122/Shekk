import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const draftSchema = z.object({
  id: z.string().uuid().optional(),
  providerId: z.string().min(1).max(64),
  providerName: z.string().trim().min(1).max(120),
  plan: z.string().trim().max(120).nullish(),
  memberNumber: z.string().trim().max(64).nullish(),
  groupNumber: z.string().trim().max(64).nullish(),
  policyHolder: z.string().trim().max(120).nullish(),
  validFrom: z.string().trim().max(20).nullish(),
  validUntil: z.string().trim().max(20).nullish(),
  hotline: z.string().trim().max(40).nullish(),
  covers: z.string().trim().max(500).nullish(),
  isPrimary: z.boolean().optional(),
  frontPath: z.string().trim().max(300).nullish(),
  backPath: z.string().trim().max(300).nullish(),
});

export const listInsuranceCards = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listCards } = await import("@/lib/health.server");
    return listCards(context.supabase, context.userId);
  });

export const saveInsuranceCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => draftSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { saveCard } = await import("@/lib/health.server");
    return saveCard(context.supabase, context.userId, data);
  });

export const deleteInsuranceCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { deleteCard } = await import("@/lib/health.server");
    return deleteCard(context.supabase, context.userId, data.id);
  });

export const startCardPhotoUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        side: z.enum(["front", "back"]),
        contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/heic"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { createPhotoTicket } = await import("@/lib/health.server");
    return createPhotoTicket(context.supabase, context.userId, data.side, data.contentType);
  });
