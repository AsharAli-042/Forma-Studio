import { mkdir } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:3100";
const heroOnly = process.argv.includes("--hero-only");
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(60000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const theme of ["dark", "light"]) {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    const toggle = page.getByRole("button", { name: "Dark theme", exact: true });
    await toggle.waitFor();
    if ((await toggle.getAttribute("aria-pressed")) !== String(theme === "dark")) await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", String(theme === "dark"));
    await page.locator(".hero-photo").evaluate(img => img.decode());
    await page.screenshot({ path: "artifacts/home-desktop-" + theme + ".png" });
    await page.screenshot({ path: "artifacts/home-full-" + theme + ".png", fullPage: true });
    if (heroOnly) {
      await page.locator(".hero-visual").screenshot({ path: "artifacts/hero-frame-" + theme + ".png" });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
      await page.locator(".hero-photo").evaluate(img => img.decode());
      await page.locator(".hero-visual").screenshot({ path: "artifacts/hero-frame-mobile-" + theme + ".png" });
      await page.setViewportSize({ width: 1440, height: 1080 });
      continue;
    }
    await page.goto(new URL("/studio", baseUrl).href, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Open inquiry from Olivia Bennett" }).waitFor();
    await page.screenshot({ path: "artifacts/dashboard-desktop-" + theme + ".png" });
    await page.getByRole("button", { name: "Open inquiry from Olivia Bennett" }).click();
    await page.screenshot({ path: "artifacts/inquiry-" + theme + ".png" });
    await page.getByRole("button", { name: "Close inquiry", exact: true }).click();
    await page.goto(new URL("/login", baseUrl).href, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Dark theme", exact: true })).toHaveAttribute("aria-pressed", String(theme === "dark"));
    await page.screenshot({ path: "artifacts/login-" + theme + ".png" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.locator(".hero-photo").evaluate(img => img.decode());
    await page.screenshot({ path: "artifacts/home-mobile-" + theme + ".png" });
    await page.goto(new URL("/studio", baseUrl).href, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Open inquiry from Olivia Bennett" }).waitFor();
    await page.screenshot({ path: "artifacts/dashboard-mobile-" + theme + ".png" });
    await page.setViewportSize({ width: 1440, height: 1080 });
  }
  console.log(JSON.stringify({ screenshots: heroOnly ? 8 : 14, browserErrors: errors }));
  if (errors.length) process.exitCode = 1;
} finally { await browser.close(); }
