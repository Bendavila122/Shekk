/**
 * Insurance card wallet — server only.
 *
 * A member's health cover is theirs: rows are read and written as the signed-in
 * member through RLS, and the photos of the physical card live in a private
 * bucket keyed by user id. Nothing here is ever readable by another member.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type InsuranceCard = {
  id: string;
  providerId: string;
  providerName: string;
  plan: string | null;
  memberNumber: string | null;
  groupNumber: string | null;
  policyHolder: string | null;
  validFrom: string | null;
  validUntil: string | null;
  hotline: string | null;
  covers: string | null;
  isPrimary: boolean;
  frontPath: string | null;
  backPath: string | null;
  /** Short-lived signed links so the photos can be shown at the desk. */
  frontUrl: string | null;
  backUrl: string | null;
  createdAt: string;
};

export type CardDraft = {
  id?: string;
  providerId: string;
  providerName: string;
  plan?: string | null;
  memberNumber?: string | null;
  groupNumber?: string | null;
  policyHolder?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
  hotline?: string | null;
  covers?: string | null;
  isPrimary?: boolean;
  frontPath?: string | null;
  backPath?: string | null;
};

const BUCKET = "insurance-cards";

type Row = Record<string, unknown>;
type Db = SupabaseClient<any, any, any>;

const s = (row: Row, key: string) => (row[key] == null ? null : String(row[key]));

function clean(value: string | null | undefined) {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

async function signed(db: Db, path: string | null) {
  if (!path) return null;
  const { data } = await db.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

async function shape(db: Db, row: Row): Promise<InsuranceCard> {
  const frontPath = s(row, "front_path");
  const backPath = s(row, "back_path");
  return {
    id: String(row.id),
    providerId: String(row.provider_id),
    providerName: String(row.provider_name),
    plan: s(row, "plan"),
    memberNumber: s(row, "member_number"),
    groupNumber: s(row, "group_number"),
    policyHolder: s(row, "policy_holder"),
    validFrom: s(row, "valid_from"),
    validUntil: s(row, "valid_until"),
    hotline: s(row, "hotline"),
    covers: s(row, "covers"),
    isPrimary: Boolean(row.is_primary),
    frontPath,
    backPath,
    frontUrl: await signed(db, frontPath),
    backUrl: await signed(db, backPath),
    createdAt: String(row.created_at),
  };
}

export async function listCards(db: Db, userId: string): Promise<InsuranceCard[]> {
  const { data, error } = await db
    .from("insurance_cards")
    .select("*")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return Promise.all(((data ?? []) as Row[]).map((row) => shape(db, row)));
}

export async function saveCard(db: Db, userId: string, draft: CardDraft): Promise<InsuranceCard[]> {
  const payload = {
    user_id: userId,
    provider_id: draft.providerId,
    provider_name: draft.providerName.trim() || "Health cover",
    plan: clean(draft.plan),
    member_number: clean(draft.memberNumber),
    group_number: clean(draft.groupNumber),
    policy_holder: clean(draft.policyHolder),
    valid_from: clean(draft.validFrom),
    valid_until: clean(draft.validUntil),
    hotline: clean(draft.hotline),
    covers: clean(draft.covers),
    is_primary: Boolean(draft.isPrimary),
    front_path: clean(draft.frontPath),
    back_path: clean(draft.backPath),
  };

  if (draft.id) {
    const { error } = await db
      .from("insurance_cards")
      .update(payload)
      .eq("id", draft.id)
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await db.from("insurance_cards").insert(payload);
    if (error) throw error;
  }

  // Exactly one card can be the one you show first.
  if (payload.is_primary) {
    let others = db.from("insurance_cards").update({ is_primary: false }).eq("user_id", userId);
    if (draft.id) others = others.neq("id", draft.id);
    else others = others.neq("provider_id", "__none__").eq("is_primary", true);
    await others;
    if (!draft.id) {
      // Re-flag the row we just created, which the sweep above also cleared.
      const { data: latest } = await db
        .from("insurance_cards")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latest) await db.from("insurance_cards").update({ is_primary: true }).eq("id", (latest as Row).id as string);
    }
  }

  return listCards(db, userId);
}

export async function deleteCard(db: Db, userId: string, id: string): Promise<InsuranceCard[]> {
  const { data } = await db
    .from("insurance_cards")
    .select("front_path, back_path")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  const paths = [s((data ?? {}) as Row, "front_path"), s((data ?? {}) as Row, "back_path")].filter(
    (p): p is string => Boolean(p),
  );
  if (paths.length) await db.storage.from(BUCKET).remove(paths);

  const { error } = await db.from("insurance_cards").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
  return listCards(db, userId);
}

/** A one-shot upload ticket for a photo of the physical card. */
export async function createPhotoTicket(
  db: Db,
  userId: string,
  side: "front" | "back",
  contentType: string,
): Promise<{ path: string; token: string }> {
  const ext = contentType.split("/")[1] || "jpg";
  const path = `${userId}/${side}-${Date.now()}.${ext}`;
  const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error("Could not start the upload");
  return { path, token: data.token };
}
