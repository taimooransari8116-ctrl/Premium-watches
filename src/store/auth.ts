import { supabase } from "./supabaseClient";
import type { Session } from "@supabase/supabase-js";

export async function adminSignIn(email: string, password: string): Promise<{ session: Session | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { session: data.session, error: error?.message ?? null };
}

export async function adminSignOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getAdminSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
