"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="shell py-24"><span className="eyebrow">A SMALL INTERRUPTION</span><h1 className="text-5xl mt-6 mb-5">Let’s try that again.</h1><p className="text-sm text-stone-500">We couldn’t load this space. Please try again in a moment.</p><button className="primary-link mr-5" onClick={reset}>Try again ↗</button><Link className="text-link" href="/">Back to the website</Link></main>;
}
