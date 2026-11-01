import { expect, test } from "@playwright/test";

test("inquiry reaches dashboard and status persists after refresh", async ({ page }) => {
  await page.goto("/#contact");
  await page.getByLabel("Your name", { exact: true }).fill("Alex Employer");
  await page.getByLabel("Email address", { exact: true }).fill("alex@example.com");
  await page.getByRole("combobox", { name: "How can we help?", exact: true }).selectOption("Room refresh");
  await page.getByRole("combobox", { name: "Estimated budget", exact: true }).selectOption("$5,000–$15,000");
  await page.getByLabel("A little about your project", { exact: true }).fill("We would love a warmer living room with considered furniture and natural materials.");
  await page.getByRole("button", { name: "Start the conversation" }).click();
  await expect(page.getByRole("heading", { name: "Your demo inquiry is in." })).toBeVisible();
  await page.getByRole("link", { name: "View in studio portal" }).click();
  await expect(page).toHaveURL(/\/studio$/, { timeout: 15000 });
  const row = page.getByRole("row").filter({ hasText: "Alex Employer" });
  await expect(row).toContainText("New");
  await page.getByRole("button", { name: "Open inquiry from Alex Employer" }).click();
  await expect(page.getByRole("dialog")).toContainText("warmer living room");
  await page.getByLabel("Update status").selectOption("contacted");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(row).toContainText("Contacted");
  await page.reload();
  await expect(page.getByRole("row").filter({ hasText: "Alex Employer" })).toContainText("Contacted");
});

test("search, status filter, empty state, detail cancel, and CSV export work", async ({ page }) => {
  await page.goto("/studio");
  await expect(page.getByRole("button", { name: "Open inquiry from Olivia Bennett" })).toBeVisible();
  await page.getByRole("textbox", { name: "Search inquiries" }).fill("Olivia");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("combobox", { name: "Filter by status" }).selectOption("completed");
  await expect(page.getByText("No inquiries match your search.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(4);
  await page.getByRole("button", { name: "Open inquiry from Olivia Bennett" }).click();
  await page.getByLabel("Update status").selectOption("completed");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("row").filter({ hasText: "Olivia Bennett" })).toContainText("New");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^forma-inquiries-.*\.csv$/);
});

test("mobile menu, forms, and dashboard fit the screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Let’s talk" }).click();
  await expect(page.getByLabel("Your name", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.goto("/studio");
  await expect(page.getByRole("heading", { name: "Your next chapter." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("server API does not claim to save inquiries without a backend", async ({ request }) => {
  const getResponse = await request.get("/api/inquiries");
  expect(getResponse.status()).toBe(503);
  const postResponse = await request.post("/api/inquiries", { data: { name: "Test" } });
  expect(postResponse.status()).toBe(503);
  expect(await postResponse.json()).toHaveProperty("error");
});

test("demo sign-in and unknown routes render clearly", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Explore the demo" }).click();
  await expect(page.getByRole("heading", { name: "Your next chapter." })).toBeVisible();
  const response = await page.goto("/a-space-that-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "Back to Forma Studio" })).toBeVisible();
});
