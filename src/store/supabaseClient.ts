import { createClient } from "@supabase/supabase-js";

/**
 * This is your real Auxoro Supabase project. The "publishable" key
 * (sb_publishable_...) is meant to be public — it's designed to sit in
 * client-side code and public repos. Actual protection comes from the
 * Row Level Security policies on the tables themselves (see
 * supabase-schema.sql), not from keeping this key secret.
 */
const SUPABASE_URL = "https://kidjcwvlchipzyttekpe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7Qsf-tI8kYxLrB1XV0AHfg_mKZZ9xwq";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
