import Link from "next/link";
import { Logo } from "@/components/logo";
export default function NotFound() {
  return <main className="shell py-12"><Logo /><div className="py-24"><span className="eyebrow">404 / PAGE NOT FOUND</span><h1 className="text-5xl mt-6 mb-5">This page isn’t here.</h1><p className="text-sm" style={{ color: "var(--muted)" }}>Check the address or return to the website.</p><Link className="primary-link" href="/">Back to Forma Studio</Link></div></main>;
}
