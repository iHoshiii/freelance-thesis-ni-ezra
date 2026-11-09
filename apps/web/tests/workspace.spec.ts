import { test, expect } from "@playwright/test";

test("shows the last scan and paginated history without a login", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Soil overview" })).toBeVisible();
  await expect(page.getByText("scan-001", { exact: true }).first()).toBeVisible();
  await expect(page.locator(".reading-value").first()).toContainText("0");
  await expect(page.locator(".scan-table tbody tr")).toHaveCount(20);
  await expect(page.getByText("PRIVATE SCAN")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Next", exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/dashboard-desktop.png", fullPage: true });
  await page.getByRole("link", { name: "Next", exact: true }).click();
  await expect(page.locator(".scan-table tbody")).toContainText("scan-021");
});

test("filters unknown times by upload date and keeps the last scan independent", async ({ page }) => {
  await page.goto("/?q=scan-unknown&period=today&basis=scanned");
  await expect(page.getByRole("heading", { name: "No matching scans" })).toBeVisible();
  await expect(page.locator(".latest-scan")).toContainText("scan-001");
  await page.getByLabel("Date by").selectOption("uploaded");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.locator(".scan-table tbody tr")).toHaveCount(1);
  await expect(page.locator(".scan-table tbody")).toContainText("Time unknown");
});

test("opens details and compares two scans", async ({ page }) => {
  await page.goto("/scans");
  await expect(page.locator(".scan-table tbody tr")).toHaveCount(20);
  await page.getByRole("checkbox").nth(0).check();
  await page.getByRole("checkbox").nth(1).check();
  await page.getByRole("button", { name: "Compare (2/2)", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("scan-001");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("link", { name: "scan-001", exact: true }).click();
  await expect(page.getByRole("heading", { name: "scan-001", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fertilizer advisor" })).toBeVisible();
  await expect(page.getByText("Awaiting model validation", { exact: true })).toBeVisible();
});

test("exports the same filtered scans and refuses records outside the workspace", async ({ page }) => {
  const response = await page.request.get("/api/scans/export?location=North+plot&q=scan-001");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("text/csv");
  const csv = await response.text();
  expect(csv).toContain("scan-001");
  expect(csv).not.toContain("scan-002");
  expect(csv).not.toContain("PRIVATE SCAN");
  const all = await page.request.get("/api/scans/export");
  expect((await all.text()).trim().split("\r\n")).toHaveLength(267);
  const invalid = await page.request.get("/api/scans/export?period=custom&from=bad&to=bad");
  expect(invalid.status()).toBe(400);
  await page.goto("/scans/private-device/550e8400-e29b-41d4-a716-446655440099");
  await expect(page.getByRole("heading", { name: "Scan not found" })).toBeVisible();
});

test("loads location trends and shows truthful device and setup status", async ({ page }) => {
  await page.goto("/?location=North+plot");
  await expect(page.locator(".trend-figure > svg")).toBeVisible();
  await page.getByRole("button", { name: "Moisture", exact: true }).click();
  await expect(page.locator(".trend-figure > svg")).toHaveAttribute("aria-label", /Moisture/);
  await page.goto("/devices");
  await expect(page.getByRole("heading", { name: "Test field unit" })).toBeVisible();
  await expect(page.getByText("PRIVATE DEVICE")).toHaveCount(0);
  await page.goto("/setup");
  await expect(page.getByRole("heading", { name: "Workspace setup" })).toBeVisible();
  await expect(page.getByText("4 / 4", { exact: true })).toBeVisible();
});

test("keeps mobile navigation and filters usable without page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".scan-table tbody tr")).toHaveCount(20);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("link", { name: "Last 7 days", exact: true }).click();
  await expect(page).toHaveURL(/period=7d/);
  await expect(page.getByRole("link", { name: "Last 7 days", exact: true })).toHaveAttribute("aria-current", "true");
  await expect(page.locator(".scan-table tbody tr")).toHaveCount(7);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/dashboard-mobile.png", fullPage: true });
});

test("acknowledges device retries without duplicate scans", async ({ page }) => {
  const data = { deviceId: "soil-test", recordId: "550e8400-e29b-41d4-a716-446655440050", sampleId: "retry-check", location: "Test plot", acquiredAt: null, timeQuality: "unknown", ph: 6.7, moisturePercent: null, temperatureC: null, npkRaw: null };
  const headers = { Authorization: `Bearer ${"test-device-token-".repeat(4)}` };
  const first = await page.request.post("/api/readings", { data, headers });
  expect(first.status()).toBe(200);
  const retry = await page.request.post("/api/readings", { data, headers });
  expect(await retry.json()).toEqual(await first.json());
  const conflict = await page.request.post("/api/readings", { data: { ...data, ph: 8 }, headers });
  expect(conflict.status()).toBe(409);
});
