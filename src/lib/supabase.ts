import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

export const supabase = createClient(env.supabaseUrl, env.supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    headers: {
      "x-zynx-mcp": "zynx-supabase-mcp"
    }
  }
});
