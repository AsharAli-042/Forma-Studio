import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/login-form";
import { isConfigured } from "@/lib/config";
import { ThemeToggle } from "@/components/theme-toggle";
export const metadata: Metadata = { title: "Studio sign in" };
export default function LoginPage() {
  return <main className="login-page"><div className="login-aside"><Logo light /><h1>The studio,<br /><em>behind the scenes.</em></h1><p>Project inquiries, client details,<br />and the next steps for your team.</p><span className="login-aside-foot">FORMA STUDIO / PRIVATE ACCESS</span></div><div className="login-right"><div className="login-theme"><ThemeToggle /></div><LoginForm demo={!isConfigured} /></div></main>;
}
