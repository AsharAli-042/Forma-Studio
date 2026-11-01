import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { isConfigured, supabaseKey, supabaseUrl } from "@/lib/config";
import { inquirySchema, statuses } from "@/lib/inquiries";
import { getAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  // Next.js can normalize its internal URL to localhost even when the visitor
  // uses 127.0.0.1. The incoming Host header identifies the browser-facing host.
  const host = request.headers.get("host") || request.nextUrl.host;
  try {
    return new URL(origin).origin === new URL(`${request.nextUrl.protocol}//${host}`).origin;
  } catch { return false; }
}
export async function POST(request: NextRequest) {
  if (!isConfigured) return json({ error: "The live inquiry service is not connected yet." }, 503);
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  if (Number(request.headers.get("content-length") || 0) > 16000) return json({ error: "Your message is too large." }, 413);
  try {
    const text = await request.text();
    if (text.length > 16000) return json({ error: "Your message is too large." }, 413);
    const result = inquirySchema.safeParse(JSON.parse(text));
    if (!result.success) return json({ error: result.error.issues[0].message }, 400);
    if (result.data.website) return json({ ok: true });
    const { website: _honeypot, ...input } = result.data;
    void _honeypot;
    // Always submit as anon; admin cookies are never used for a public submission.
    const client = createClient(supabaseUrl!, supabaseKey!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await client.from("inquiries").insert(input);
    if (error) {
      console.error("Inquiry insert failed:", error.code);
      return json({ error: "We couldn’t save your inquiry. Please try again shortly." }, 503);
    }
    return json({ ok: true }, 201);
  } catch { return json({ error: "We couldn’t process this request. Please try again." }, 400); }
}
export async function GET() {
  if (!isConfigured) return json({ error: "Supabase is not configured." }, 503);
  const admin = await getAdminClient();
  if (!admin) return json({ error: "Please sign in with an authorized studio account." }, 401);
  const { data, error } = await admin.client.from("inquiries").select("*").order("created_at", { ascending: false }).limit(1000);
  if (error) return json({ error: "Inquiries could not be loaded. Please try again." }, 503);
  return json({ inquiries: data });
}
export async function PATCH(request: NextRequest) {
  if (!isConfigured) return json({ error: "Supabase is not configured." }, 503);
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  const admin = await getAdminClient();
  if (!admin) return json({ error: "Please sign in with an authorized studio account." }, 401);
  try {
    const result = z.object({ id: z.uuid(), status: z.enum(statuses) }).safeParse(await request.json());
    if (!result.success) return json({ error: "Invalid inquiry or status." }, 400);
    const { data, error } = await admin.client.from("inquiries").update({ status: result.data.status }).eq("id", result.data.id).select("id, status").maybeSingle();
    if (error) return json({ error: "The status could not be saved. Please try again." }, 503);
    if (!data) return json({ error: "Inquiry not found." }, 404);
    return json({ inquiry: data });
  } catch { return json({ error: "Invalid request." }, 400); }
}

export async function DELETE(request: NextRequest) {
  if (!isConfigured) return json({ error: "Supabase is not configured." }, 503);
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  const admin = await getAdminClient();
  if (!admin) return json({ error: "Please sign in with an authorized studio account." }, 401);
  try {
    const result = z.object({ id: z.uuid() }).safeParse(await request.json());
    if (!result.success) return json({ error: "Invalid inquiry." }, 400);
    const { data, error } = await admin.client.from("inquiries").delete().eq("id", result.data.id).select("id").maybeSingle();
    if (error?.code === "42501") return json({ error: "Deletion is not enabled in the database yet. Apply the admin-delete-inquiries SQL migration." }, 409);
    if (error) return json({ error: "The inquiry could not be deleted. Please try again." }, 503);
    if (!data) return json({ error: "Inquiry not found or deletion is not permitted. Refresh the inbox and check the database migration." }, 404);
    return json({ deleted: data.id });
  } catch { return json({ error: "Invalid request." }, 400); }
}
