"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

export function LoginForm({ demo }: { demo: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const values = new FormData(event.currentTarget);
      const client = createClient();
      const { data, error } = await client.auth.signInWithPassword({ email: String(values.get("email")), password: String(values.get("password")) });
      if (error || !data.user) throw new Error("We couldn’t sign you in. Check your email and password.");
      const { data: admin, error: roleError } = await client.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
      if (roleError || !admin) {
        await client.auth.signOut();
        throw new Error("This account does not have studio access. Ask the project owner to add you as an admin.");
      }
      router.replace("/studio");
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Sign-in is unavailable. Please try again."); }
    finally { setPending(false); }
  }
  return <div className="login-panel"><span className="eyebrow">THE FORMA WORKSPACE</span><h2>Welcome back.</h2><p>{demo ? "Explore the studio workspace with sample inquiries. This demo does not require an account." : "A little clarity for your day. Sign in to manage your studio inquiries."}</p>{demo ? <><div className="demo-form-note">Demo data stays in your browser. Connect Supabase to enable protected admin sign-in and live inquiries.</div><Link className="submit-button" href="/studio">Explore the demo <ArrowUpRight size={17} /></Link></> : <form onSubmit={submit}><label>Email address<input type="email" name="email" required autoComplete="username" placeholder="you@yourstudio.com" /></label><label>Password<input type="password" name="password" required autoComplete="current-password" placeholder="Your studio password" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="submit-button" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in to your studio"}{pending ? <LoaderCircle size={17} className="animate-spin" /> : <ArrowUpRight size={17} />}</button></form>}<Link href="/" className="flex items-center gap-2"><ArrowLeft size={13} /> Back to the website</Link></div>;
}
