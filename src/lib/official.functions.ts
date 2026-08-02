import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const trackId = z.enum(["visa", "army", "lone-soldier", "university"]);

const categoryId = z.enum([
  "passport",
  "visa",
  "program",
  "insurance",
  "army",
  "university",
  "financial",
  "other",
]);

const contentType = z.enum([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
]);

const taskSchema = z.object({
  track: trackId,
  stepKey: z.string().trim().min(1).max(64),
  title: z.string().trim().min(1).max(160),
  done: z.boolean().optional(),
  dueOn: z.string().trim().max(20).nullish(),
  note: z.string().trim().max(500).nullish(),
});

const documentSchema = z.object({
  id: z.string().uuid().optional(),
  category: categoryId,
  label: z.string().trim().min(1).max(160),
  storagePath: z.string().trim().max(300).optional(),
  mimeType: z.string().trim().max(120).nullish(),
  byteSize: z.number().int().min(0).max(30_000_000).nullish(),
  expiresOn: z.string().trim().max(20).nullish(),
  note: z.string().trim().max(500).nullish(),
});

export const listOfficialTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listTasks } = await import("@/lib/official.server");
    return listTasks(context.supabase, context.userId);
  });

export const saveOfficialTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => taskSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { saveTask } = await import("@/lib/official.server");
    return saveTask(context.supabase, context.userId, data);
  });

export const clearOfficialTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ track: trackId, stepKey: z.string().trim().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { clearTask } = await import("@/lib/official.server");
    return clearTask(context.supabase, context.userId, data.track, data.stepKey);
  });

export const listOfficialDocuments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listDocuments } = await import("@/lib/official.server");
    return listDocuments(context.supabase, context.userId);
  });

export const saveOfficialDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => documentSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { saveDocument } = await import("@/lib/official.server");
    return saveDocument(context.supabase, context.userId, data);
  });

export const deleteOfficialDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { deleteDocument } = await import("@/lib/official.server");
    return deleteDocument(context.supabase, context.userId, data.id);
  });

export const startDocumentUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ category: categoryId, contentType }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { createDocumentTicket } = await import("@/lib/official.server");
    return createDocumentTicket(context.supabase, context.userId, data.category, data.contentType);
  });
