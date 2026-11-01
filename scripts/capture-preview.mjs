import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:3000", { waitUntil: "load" });
  await page.locator(".hero-photo").waitFor();
  await page.screenshot({ path: "artifacts/home-desktop.png" });
  await page.screenshot({ path: "artifacts/home-full.png", fullPage: true });
  await page.goto("http://127.0.0.1:3000/studio", { waitUntil: "load" });
  await page.getByRole("button", { name: "Open inquiry from Olivia Bennett" }).waitFor();
  await page.screenshot({ path: "artifacts/dashboard-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "load" });
  await page.screenshot({ path: "artifacts/home-mobile.png" });
  await page.goto("http://127.0.0.1:3000/studio", { waitUntil: "load" });
  await page.getByRole("button", { name: "Open inquiry from Olivia Bennett" }).waitFor();
  await page.screenshot({ path: "artifacts/dashboard-mobile.png" });
  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: [...document.querySelectorAll("body *")].filter(el => el.getBoundingClientRect().right > innerWidth && !el.closest(".table-scroll")).map(el => ({ tag: el.tagName, className: typeof el.className === "string" ? el.className : "svg", right: el.getBoundingClientRect().right })),
  }));
  console.log(JSON.stringify(layout));
  console.log(JSON.stringify({ screenshots: 5, browserErrors: errors }));
  if (errors.length) process.exitCode = 1;
} finally { await browser.close(); }
