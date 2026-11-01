import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

const baseUrl = process.env.APP_URL;
if (!baseUrl) throw new Error("Set APP_URL to the deployed website URL.");

if (process.argv.includes("--wait")) {
  console.log("Waiting for Vercel to serve the redesigned homepage…");
  const deadline = Date.now() + 240000;
  let ready = false;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl, { cache: "no-store", signal: AbortSignal.timeout(15000) });
      const html = await response.text();
      if (response.ok && html.includes("hero-photo-frame") && /aria-label="Dark theme"[^>]*disabled/.test(html)) { ready = true; break; }
    } catch { /* Deployment may be switching versions. */ }
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  assert.ok(ready, "The redesigned deployment is not serving yet. Check Vercel's build status.");
}

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Rooms to live in.");
  assert.equal(await page.locator(".demo-form-note").count(), 0, "Production must use the live backend.");
  const toggle = page.getByRole("button", { name: "Dark theme", exact: true });
  await expect(toggle).toBeEnabled({ timeout: 30000 });
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  console.log("PASS: redesigned homepage is live; theme changes persist after refresh.");

  const inquiries = await page.request.get(new URL("/api/inquiries", baseUrl).href);
  assert.equal(inquiries.status(), 401);
  const deletion = await page.request.delete(new URL("/api/inquiries", baseUrl).href, { data: { id: "00000000-0000-4000-8000-000000000000" } });
  assert.equal(deletion.status(), 401);
  await page.goto(new URL("/studio", baseUrl).href, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(new URL("/login", baseUrl).href);
  await expect(page.getByRole("button", { name: "Sign in to your studio" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Dark theme", exact: true })).toHaveAttribute("aria-pressed", "false");
  console.log("PASS: live admin access stays protected and the login page shares the selected theme.");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Services", exact: true })).toBeVisible();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(errors, []);
  console.log("PASS: mobile navigation and page width; no browser errors. No inquiries were created.");
} finally { await browser.close(); }
