import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/login-form";
import { isConfigured } from "@/lib/config";
export const metadata: Metadata = { title: "Studio sign in" };
export default function LoginPage() {
  return <main className="login-page"><div className="login-aside"><Logo light /><h1>Good conversations.<br />Beautiful <em>beginnings.</em></h1><p>A quiet place to organize what’s next.<br />Made for the way your studio works.</p></div><LoginForm demo={!isConfigured} /></main>;
}
