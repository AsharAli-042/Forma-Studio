import Link from "next/link";
import { Logo } from "@/components/logo";
export default function NotFound() {
  return <main className="shell py-12"><Logo /><div className="py-24"><span className="eyebrow">404 — A LITTLE OFF THE PLAN</span><h1 className="text-5xl mt-6 mb-5">Let’s find your way home.</h1><p className="text-sm text-stone-500">This space doesn’t exist yet.</p><Link className="primary-link" href="/">Back to Forma Studio ↗</Link></div></main>;
}
