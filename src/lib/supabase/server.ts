import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseKey } from "@/lib/config";

export async function createClient() {
  if (!supabaseUrl || !supabaseKey) throw new Error("Supabase is not configured.");
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (values) => {
        try { values.forEach(({ name, value, options }) => store.set(name, value, options)); }
        catch { /* Server Components are read-only; the proxy refreshes cookies. */ }
      },
    },
  });
}

export async function getAdminClient() {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  const { data: admin, error: roleError } = await client.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (roleError || !admin) return null;
  return { client, user };
}
