/**
 * Official mini app — server only.
 *
 * A member's paperwork is theirs alone. Task ticks and documents are read and
 * written as the signed-in member through RLS, and files live in a private
 * bucket keyed by user id with short-lived signed links for viewing.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export const DOC_BUCKET = "member-documents";

type Row = Record<string, unknown>;
type Db = SupabaseClient<any, any, any>;

const s = (row: Row, key: string) => (row[key] == null ? null : String(row[key]));

function clean(value: string | null | undefined) {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

export type OfficialTask = {
  id: string;
  track: string;
  stepKey: string;
  title: string;
  done: boolean;
  doneAt: string | null;
  dueOn: string | null;
  note: string | null;
};

export type OfficialDocument = {
  id: string;
  category: string;
  label: string;
  storagePath: string;
  mimeType: string | null;
  byteSize: number | null;
  expiresOn: string | null;
  note: string | null;
  createdAt: string;
  /** Short-lived signed link so the file can be shown at the desk. */
  url: string | null;
};

function shapeTask(row: Row): OfficialTask {
  return {
    id: String(row.id),
    track: String(row.track),
    stepKey: String(row.step_key),
    title: String(row.title),
    done: Boolean(row.done),
    doneAt: s(row, "done_at"),
    dueOn: s(row, "due_on"),
    note: s(row, "note"),
  };
}

async function shapeDocument(db: Db, row: Row): Promise<OfficialDocument> {
  const path = String(row.storage_path);
  const { data } = await db.storage.from(DOC_BUCKET).createSignedUrl(path, 60 * 60);
  return {
    id: String(row.id),
    category: String(row.category),
    label: String(row.label),
    storagePath: path,
    mimeType: s(row, "mime_type"),
    byteSize: row.byte_size == null ? null : Number(row.byte_size),
    expiresOn: s(row, "expires_on"),
    note: s(row, "note"),
    createdAt: String(row.created_at),
    url: data?.signedUrl ?? null,
  };
}

/* ───────────────────────────────── Tasks ───────────────────────────────── */

export async function listTasks(db: Db, userId: string): Promise<OfficialTask[]> {
  const { data, error } = await db
    .from("official_tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as Row[]).map(shapeTask);
}

export type TaskPatch = {
  track: string;
  stepKey: string;
  title: string;
  done?: boolean;
  dueOn?: string | null;
  note?: string | null;
};

/** Create or update one step of a member's checklist, then return the lot. */
export async function saveTask(db: Db, userId: string, patch: TaskPatch): Promise<OfficialTask[]> {
  const payload: Row = {
    user_id: userId,
    track: patch.track,
    step_key: patch.stepKey,
    title: patch.title,
    done: Boolean(patch.done),
    done_at: patch.done ? new Date().toISOString() : null,
    due_on: clean(patch.dueOn),
    note: clean(patch.note),
  };

  const { error } = await db
    .from("official_tasks")
    .upsert(payload, { onConflict: "user_id,track,step_key" });
  if (error) throw error;

  return listTasks(db, userId);
}

export async function clearTask(db: Db, userId: string, track: string, stepKey: string): Promise<OfficialTask[]> {
  const { error } = await db
    .from("official_tasks")
    .delete()
    .eq("user_id", userId)
    .eq("track", track)
    .eq("step_key", stepKey);
  if (error) throw error;
  return listTasks(db, userId);
}

/* ─────────────────────────────── Documents ─────────────────────────────── */

export async function listDocuments(db: Db, userId: string): Promise<OfficialDocument[]> {
  const { data, error } = await db
    .from("official_documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return Promise.all(((data ?? []) as Row[]).map((row) => shapeDocument(db, row)));
}

export type DocumentDraft = {
  id?: string;
  category: string;
  label: string;
  storagePath?: string;
  mimeType?: string | null;
  byteSize?: number | null;
  expiresOn?: string | null;
  note?: string | null;
};

export async function saveDocument(db: Db, userId: string, draft: DocumentDraft): Promise<OfficialDocument[]> {
  const base: Row = {
    category: draft.category,
    label: draft.label.trim() || "Document",
    expires_on: clean(draft.expiresOn),
    note: clean(draft.note),
  };

  if (draft.id) {
    const { error } = await db
      .from("official_documents")
      .update(base)
      .eq("id", draft.id)
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    if (!draft.storagePath) throw new Error("Upload the file first");
    // Only ever accept a path inside the member's own folder.
    if (!draft.storagePath.startsWith(`${userId}/`)) throw new Error("Bad file path");
    const { error } = await db.from("official_documents").insert({
      ...base,
      user_id: userId,
      storage_path: draft.storagePath,
      mime_type: clean(draft.mimeType),
      byte_size: draft.byteSize == null ? null : Math.max(0, Math.round(draft.byteSize)),
    });
    if (error) throw error;
  }

  return listDocuments(db, userId);
}

export async function deleteDocument(db: Db, userId: string, id: string): Promise<OfficialDocument[]> {
  const { data } = await db
    .from("official_documents")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  const path = data ? s(data as Row, "storage_path") : null;
  if (path) await db.storage.from(DOC_BUCKET).remove([path]);

  const { error } = await db.from("official_documents").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
  return listDocuments(db, userId);
}

const EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

/** A one-shot upload ticket inside the member's own folder. */
export async function createDocumentTicket(
  db: Db,
  userId: string,
  category: string,
  contentType: string,
): Promise<{ path: string; token: string }> {
  const ext = EXT[contentType] ?? "bin";
  const path = `${userId}/${category}-${Date.now()}.${ext}`;
  const { data, error } = await db.storage.from(DOC_BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error("Could not start the upload");
  return { path, token: data.token };
}
