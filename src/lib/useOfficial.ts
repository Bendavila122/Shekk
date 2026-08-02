/**
 * Official for the UI: the member's paperwork checklist and document vault,
 * plus the mutations they're allowed to make on their own record.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApp } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import {
  clearOfficialTask,
  deleteOfficialDocument,
  listOfficialDocuments,
  listOfficialTasks,
  saveOfficialDocument,
  saveOfficialTask,
  startDocumentUpload,
} from "@/lib/official.functions";
import type { DocumentDraft, OfficialDocument, OfficialTask, TaskPatch } from "@/lib/official.server";
import { DOC_CATEGORIES, TRACKS, type DocCategoryId, type TrackId } from "@/lib/official-content";

const TASK_KEY = ["official", "tasks"];
const DOC_KEY = ["official", "documents"];

export type UploadType = "application/pdf" | "image/jpeg" | "image/png" | "image/webp" | "image/heic";

const UPLOAD_TYPES: UploadType[] = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];

export const UPLOAD_ACCEPT = UPLOAD_TYPES.join(",");

function isClockSkew(error: unknown) {
  return /issued at future|iat|Unauthorized/i.test(
    error instanceof Error ? error.message : String(error),
  );
}

export function useOfficial() {
  const { signedIn } = useApp();
  const qc = useQueryClient();

  const tasksQuery = useQuery<OfficialTask[]>({
    queryKey: TASK_KEY,
    queryFn: () => listOfficialTasks(),
    enabled: signedIn,
    staleTime: 30_000,
    throwOnError: false,
    retry: (count, error) => count < 4 && isClockSkew(error),
    retryDelay: (count) => Math.min(1500 * (count + 1), 5000),
  });

  const docsQuery = useQuery<OfficialDocument[]>({
    queryKey: DOC_KEY,
    queryFn: () => listOfficialDocuments(),
    enabled: signedIn,
    staleTime: 30_000,
    throwOnError: false,
    retry: (count, error) => count < 4 && isClockSkew(error),
    retryDelay: (count) => Math.min(1500 * (count + 1), 5000),
  });

  const saveTask = useMutation({
    mutationFn: (patch: TaskPatch) => saveOfficialTask({ data: patch }),
    onSuccess: (next) => qc.setQueryData(TASK_KEY, next),
  });

  const clearTask = useMutation({
    mutationFn: (v: { track: TrackId; stepKey: string }) => clearOfficialTask({ data: v }),
    onSuccess: (next) => qc.setQueryData(TASK_KEY, next),
  });

  const saveDocument = useMutation({
    mutationFn: (draft: DocumentDraft) => saveOfficialDocument({ data: draft }),
    onSuccess: (next) => qc.setQueryData(DOC_KEY, next),
  });

  const removeDocument = useMutation({
    mutationFn: (id: string) => deleteOfficialDocument({ data: { id } }),
    onSuccess: (next) => qc.setQueryData(DOC_KEY, next),
  });

  /** Upload a file into the member's own folder and hand back its path. */
  const upload = useMutation({
    mutationFn: async ({ category, file }: { category: DocCategoryId; file: File }) => {
      const contentType = file.type as UploadType;
      if (!UPLOAD_TYPES.includes(contentType)) {
        throw new Error("Use a PDF or a photo (JPG, PNG, WEBP or HEIC).");
      }
      if (file.size > 20_000_000) throw new Error("That file is over 20 MB — try a smaller scan.");
      const ticket = await startDocumentUpload({ data: { category, contentType } });
      const { error } = await supabase.storage
        .from("member-documents")
        .uploadToSignedUrl(ticket.path, ticket.token, file);
      if (error) throw new Error("Upload failed — check your connection and try again.");
      return { path: ticket.path, contentType, size: file.size };
    },
  });

  const tasks = tasksQuery.data ?? [];
  const documents = docsQuery.data ?? [];

  return {
    tasks,
    documents,
    loading: tasksQuery.isLoading || docsQuery.isLoading,
    refetch: () => {
      void tasksQuery.refetch();
      void docsQuery.refetch();
    },
    saveTask,
    clearTask,
    saveDocument,
    removeDocument,
    upload,
  };
}

/** How far through a track the member is. */
export function trackProgress(tasks: OfficialTask[], track: TrackId) {
  const definition = TRACKS.find((t) => t.id === track);
  const total = definition?.steps.length ?? 0;
  const done = tasks.filter((t) => t.track === track && t.done).length;
  return { done, total, pct: total ? done / total : 0 };
}

/** The next thing due, across every track. */
export function nextDue(tasks: OfficialTask[]) {
  return tasks
    .filter((t) => !t.done && t.dueOn)
    .sort((a, b) => (a.dueOn ?? "").localeCompare(b.dueOn ?? ""))[0] ?? null;
}

export function documentsFor(documents: OfficialDocument[], category: string) {
  return documents.filter((d) => d.category === category);
}

export function categoryCounts(documents: OfficialDocument[]) {
  const counts = new Map<string, number>();
  for (const c of DOC_CATEGORIES) counts.set(c.id, 0);
  for (const d of documents) counts.set(d.category, (counts.get(d.category) ?? 0) + 1);
  return counts;
}

export type { OfficialDocument, OfficialTask };
