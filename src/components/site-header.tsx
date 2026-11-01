"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="shell header-inner"><Logo /><nav id="mobile-navigation" className={open ? "site-nav open" : "site-nav"} aria-label="Main navigation">
    <a href="#work" onClick={() => setOpen(false)}>Our work</a><a href="#approach" onClick={() => setOpen(false)}>Our approach</a><a href="#services" onClick={() => setOpen(false)}>Services</a><Link href="/studio" onClick={() => setOpen(false)}>Studio portal</Link><a className="nav-cta" href="#contact" onClick={() => setOpen(false)}>Let’s talk</a>
  </nav><div className="header-actions"><ThemeToggle /><button className="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div></div></header>;
}
