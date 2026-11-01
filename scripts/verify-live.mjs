import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const baseUrl = process.env.APP_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  await page.goto(new URL("/#contact", baseUrl).href, { waitUntil: "domcontentloaded" });
  assert.equal(await page.locator(".demo-form-note").count(), 0, "App must use live mode.");
  await page.getByLabel("Your name", { exact: true }).fill("Forma Connection Test (sample)");
  await page.getByLabel("Email address", { exact: true }).fill("forma-test@example.com");
  await page.getByRole("combobox", { name: "How can we help?", exact: true }).selectOption("Design consultation");
  await page.getByRole("combobox", { name: "Estimated budget", exact: true }).selectOption("Under $5,000");
  await page.getByLabel("A little about your project", { exact: true }).fill(`Sample inquiry created to verify the live website-to-database connection. Created ${new Date().toISOString()}. This is not a real customer request.`);
  const responsePromise = page.waitForResponse(response => response.url().endsWith("/api/inquiries") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Start the conversation" }).click();
  const response = await responsePromise;
  assert.equal(response.status(), 201, `Live inquiry submission failed: HTTP ${response.status()}.`);
  await page.locator(".inquiry-success").waitFor();
  console.log("PASS: public form saved a labelled sample inquiry to Supabase (HTTP 201).");

  const list = await page.request.get(new URL("/api/inquiries", baseUrl).href);
  assert.equal(list.status(), 401);
  const update = await page.request.patch(new URL("/api/inquiries", baseUrl).href, { data: { id: "00000000-0000-4000-8000-000000000000", status: "completed" } });
  assert.equal(update.status(), 401);
  console.log("PASS: unauthenticated inquiry reads and updates are denied (HTTP 401).");

  const invalid = await page.request.post(new URL("/api/inquiries", baseUrl).href, { data: { name: "Invalid" } });
  assert.equal(invalid.status(), 400);
  console.log("PASS: invalid form submissions are rejected (HTTP 400).");

  const foreignOrigin = await page.request.post(new URL("/api/inquiries", baseUrl).href, { headers: { Origin: "https://unrelated.example" }, data: { name: "Invalid" } });
  assert.equal(foreignOrigin.status(), 403);
  console.log("PASS: submissions from a different origin are rejected (HTTP 403).");

  await page.goto(new URL("/studio", baseUrl).href, { waitUntil: "domcontentloaded" });
  assert.equal(new URL(page.url()).pathname, "/login");
  await page.getByRole("button", { name: "Sign in to your studio" }).waitFor();
  console.log("PASS: signed-out dashboard redirects to the live sign-in page.");
  console.log("Admin sign-in and status persistence still require verification with your admin account.");
} finally { await browser.close(); }
