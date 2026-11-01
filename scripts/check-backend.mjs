import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.log("Configuration: missing project URL or publishable key.");
  process.exit(1);
}
let validUrl = false;
try { validUrl = new URL(url).protocol === "https:"; } catch {}
let role;
if (key.startsWith("eyJ")) {
  try { role = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString()).role; } catch {}
}
if (!validUrl || key.startsWith("sb_secret_") || role === "service_role") {
  console.log("Configuration: invalid URL or privileged key. Use the HTTPS project URL and a publishable/anon key.");
  process.exit(1);
}
console.log("Configuration: both values present; no privileged key detected.");
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(20000) }) } });
try {
  const auth = await fetch(new URL("/auth/v1/settings", url), { headers: { apikey: key }, signal: AbortSignal.timeout(20000) });
  console.log(`Supabase authentication endpoint: HTTP ${auth.status}`);
  for (const [table, column] of [["inquiries", "id"], ["admins", "user_id"]]) {
    const { error, data, status } = await client.from(table).select(column).limit(0);
    console.log(JSON.stringify({ table, httpStatus: status, code: error?.code || null, result: error?.code === "PGRST205" ? "Table is missing: run supabase/schema.sql." : error?.code === "42501" ? "Anonymous reads are denied as expected." : error ? "Connection or configuration needs attention." : data?.length === 0 ? "Table responds with no rows; verify RLS configuration." : "Unexpected response." }));
  }
} catch (error) {
  console.log(JSON.stringify({ connection: "failed", type: error.name, code: error.cause?.code || null }));
  process.exitCode = 1;
}
try {
  const api = await fetch("http://127.0.0.1:3000/api/inquiries", { signal: AbortSignal.timeout(15000) });
  const studio = await fetch("http://127.0.0.1:3000/studio", { redirect: "manual", signal: AbortSignal.timeout(15000) });
  console.log(JSON.stringify({ localApiStatus: api.status, studioStatus: studio.status, studioRedirect: studio.headers.get("location") }));
} catch { console.log("Local app: not reachable; start npm run dev."); }
