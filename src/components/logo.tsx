import Link from "next/link";
export function Logo({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`brand ${light ? "brand-light" : ""}`} aria-label="Forma Studio home"><span className="brand-symbol" aria-hidden="true"><i /><i /><i /><i /></span><span>forma<span className="brand-dot">.</span><small>INTERIOR DESIGN STUDIO</small></span></Link>;
}
