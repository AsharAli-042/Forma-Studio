import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/dashboard";
import { isConfigured } from "@/lib/config";
import { getAdminClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Studio workspace" };
export default async function StudioPage() {
  if (!isConfigured) return <Dashboard demo />;
  const admin = await getAdminClient();
  if (!admin) redirect("/login");
  return <Dashboard demo={false} email={admin.user.email} />;
}
