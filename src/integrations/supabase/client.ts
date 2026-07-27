import { createClient } from "@supabase/supabase-js";

// Publishable (anon) key — safe to expose in the browser. RLS still applies.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://xpsbkvclcpdcsxfuqpqy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_fOTeEO5Wo_xtOv7sCJzXXw_VnZUVJEA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
