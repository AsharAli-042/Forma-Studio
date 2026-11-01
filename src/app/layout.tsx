import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Forma Studio — Spaces for the way you live", template: "%s | Forma Studio" },
  description: "Thoughtful interiors, natural materials, and a little room to breathe. Discover Forma Studio’s approach to a home that feels like you.",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem('forma-theme')==='light'?'light':'dark'}catch{document.documentElement.dataset.theme='dark'}`;
  return <html lang="en" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning><head><script id="forma-theme" dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body>{children}</body></html>;
}
