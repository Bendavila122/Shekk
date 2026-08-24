/**
 * Optional identity for public SIM server functions.
 *
 * The finder works signed out, so these entry points can't use
 * `requireSupabaseAuth` (it 401s without a session). Instead we read the bearer
 * token the client attaches, and validate it with Supabase Auth. Anything
 * unverifiable is simply treated as anonymous — never trusted.
 */

import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

export async function getSessionUserId(): Promise<string | null> {
  try {
    const header = getRequestHeader("authorization") ?? getRequestHeader("Authorization");
    const token = header?.replace(/^Bearer\s+/i, "").trim();
    if (!token) return null;

    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const db = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await db.auth.getUser(token);
    if (error) return null;
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}
