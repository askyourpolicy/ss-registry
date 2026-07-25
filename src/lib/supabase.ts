/// <reference types="vite/client" />
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// Built on first use so an incomplete configuration reaches the caller that can render it instead of
// throwing while this module is imported.
export function getSupabaseClient() {
  client ??= createClient(
    requireVariable("VITE_SUPABASE_URL"),
    requireVariable("VITE_SUPABASE_ANON_KEY"),
  );
  return client;
}

function requireVariable(name: "VITE_SUPABASE_ANON_KEY" | "VITE_SUPABASE_URL") {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`${name} is required to reach Supabase.`);
  }
  return value;
}
