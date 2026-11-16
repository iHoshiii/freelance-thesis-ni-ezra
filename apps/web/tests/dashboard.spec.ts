import { test, expect } from "@playwright/test";

test("overview counts every allowed scan and distinguishes unreported device state", async ({ page }) => {
  await page.goto("/");
  const totals = page.locator(".summary-grid");
  await expect(totals).toBeVisible();
  await expect(totals.locator(".summary-card").nth(0)).toContainText("7");
  await expect(totals.locator(".summary-card").nth(1)).toContainText("30");
  await expect(totals.locator(".summary-card").nth(2)).toContainText("266");
  await expect(page.getByRole("region", { name: "Device monitor" }).locator(".monitor-metrics > div").last()).toContainText("--");
  await expect(page.getByText("PRIVATE DEVICE")).toHaveCount(0);
});

test("statistics aggregate beyond pagination, cover pH ranges and filter location", async ({ page }) => {
  await page.goto("/statistics?period=all");
  await expect(page.locator(".statistic-summary")).toContainText("265 / 1");
  await expect(page.locator(".distribution > div").nth(0)).toHaveText(/Below 4\s*1/);
  await expect(page.locator(".distribution > div").nth(2)).toHaveText(/6 to 7\s*264/);
  for (const name of ["Moisture", "Temperature", "NPK", "Scans"]) await page.getByRole("tab", { name, exact: true }).click();
  await expect(page.getByRole("img", { name: "Scan counts over time" })).toBeVisible();
  await page.goto("/statistics?period=all&location=North+plot");
  await expect(page.locator(".statistic-summary")).toContainText("133 / 0");
});

test("status checks the real server and database and handles a lost server", async ({ page }) => {
  const health = await page.request.get("/api/health");
  expect(await health.json()).toMatchObject({ server: "connected", database: "connected", schema: true });
  await page.route("**/api/health", (route) => route.abort());
  await page.goto("/status");
  await expect(page.getByRole("region", { name: "Connection health" })).toContainText("Cannot reach server");
  await expect(page.getByRole("region", { name: "Device monitor" }).locator('[data-callout="ph"]')).toContainText("--");
});

test("device heartbeat requires authentication and drives battery, queue and sensor health", async ({ page }) => {
  const report = { deviceId: "soil-test", batteryPercent: 12, pendingScans: 4, syncState: "syncing", ready: false, sensors: { ph: "error", moisture: "ok", temperature: "ok", npk: "not_installed" }, lastError: "pH probe disconnected" };
  expect((await page.request.post("/api/device-status", { data: report })).status()).toBe(401);
  expect((await page.request.post("/api/device-status", { data: report, headers: { Authorization: `Bearer ${"wrong-token-".repeat(5)}` } })).status()).toBe(401);
  const headers = { Authorization: `Bearer ${"test-device-token-".repeat(4)}` };
  expect((await page.request.post("/api/device-status", { data: { ...report, pendingScans: -1 }, headers })).status()).toBe(400);
  expect((await page.request.post("/api/device-status", { data: report, headers })).status()).toBe(200);
  await page.goto("/");
  const monitor = page.getByRole("region", { name: "Device monitor" });
  await expect(monitor).toContainText("12%");
  await expect(monitor).toContainText("Syncing");
  await expect(monitor.locator(".monitor-metrics > div").first()).toContainText("4");
  await page.getByRole("navigation").getByRole("link", { name: "Status", exact: true }).click();
  await expect(page.locator('[data-callout="ph"]')).toContainText("Problem reported");
  await expect(page.locator(".model-device-error:visible")).toHaveText("pH probe disconnected");
  const idle = { ...report, pendingScans: 0, syncState: "idle", ready: true, sensors: { ...report.sensors, ph: "ok" }, lastError: null };
  expect((await page.request.post("/api/device-status", { data: idle, headers })).status()).toBe(200);
  await page.goto("/");
  await expect(monitor).toContainText("No data to sync");
});
