"use client";
import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseKey } from "@/lib/config";
export function createClient() {
  if (!supabaseUrl || !supabaseKey) throw new Error("Supabase is not configured.");
  return createBrowserClient(supabaseUrl, supabaseKey);
}
