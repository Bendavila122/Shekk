/**
 * Shekk Location Platform — saved places. Server only.
 *
 * Runs through the caller's own authenticated client, so RLS is the guard: a
 * member can only ever see and change their own rows.
 */

import type { SavedPlace } from "./types";

type Client = { from: (t: string) => any };

type Row = {
  id: string;
  google_place_id: string;
  app: string;
  category: string | null;
  label: string | null;
  name_snapshot: string | null;
  created_at: string;
};

const toSaved = (r: Row): SavedPlace => ({
  id: r.id,
  placeId: r.google_place_id,
  app: r.app,
  category: r.category,
  label: r.label,
  name: r.name_snapshot,
  savedAt: r.created_at,
});

export async function listSaved(supabase: Client, app?: string): Promise<SavedPlace[]> {
  let q = supabase.from("saved_places").select("*").order("created_at", { ascending: false });
  if (app) q = q.eq("app", app);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(toSaved);
}

export async function savePlace(
  supabase: Client,
  userId: string,
  input: { placeId: string; app: string; category?: string | null; name?: string | null },
): Promise<SavedPlace> {
  const { data, error } = await supabase
    .from("saved_places")
    .upsert(
      {
        user_id: userId,
        google_place_id: input.placeId,
        app: input.app,
        category: input.category ?? null,
        name_snapshot: input.name ?? null,
      },
      { onConflict: "user_id,google_place_id,app" },
    )
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return toSaved(data as Row);
}

export async function unsavePlace(
  supabase: Client,
  input: { placeId: string; app: string },
): Promise<void> {
  const { error } = await supabase
    .from("saved_places")
    .delete()
    .eq("google_place_id", input.placeId)
    .eq("app", input.app);
  if (error) throw new Error(error.message);
}
