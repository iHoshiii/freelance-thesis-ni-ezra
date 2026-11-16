import { expect, test } from "@playwright/test";

test("reuses a shared cache across tabs and keeps content visible while refreshing", async ({ page }) => {
  let requests = 0;
  let release!: () => void;
  let hold = false;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/workspace?view=dashboard", async (route) => { requests++; if (hold) await gate; await route.continue(); });
  await page.goto("/");
  await expect(page.locator(".summary-grid")).toBeVisible();
  for (const label of ["Recommendations", "Status", "Overview"]) {
    await page.getByRole("navigation").getByRole("link", { name: label, exact: true }).click();
    await expect(page.locator(".topbar h1:visible")).toHaveText(label);
    await expect(page.locator(".page-skeleton:visible")).toHaveCount(0);
  }
  expect(requests).toBe(1);
  await expect(page.getByRole("button", { name: "Refresh data", exact: true })).toBeEnabled();
  hold = true;
  await page.getByRole("button", { name: "Refresh data", exact: true }).click();
  try {
    await expect(page.locator(".query-activity:visible")).toHaveText("Updating");
    await expect(page.locator(".summary-grid:visible")).toBeVisible();
    await expect(page.locator(".page-skeleton:visible")).toHaveCount(0);
    expect(requests).toBe(2);
  } finally { release(); }
  await expect(page.locator(".query-activity:visible")).toHaveCount(0);
});

test("retains the last good data on refresh failure and recovers with Retry", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".summary-grid")).toBeVisible();
  const before = (await page.locator(".summary-grid").textContent()) ?? "";
  await page.route("**/api/workspace?view=dashboard", (route) => route.fulfill({ status: 503, json: { error: "Temporary outage." } }));
  await page.getByRole("button", { name: "Refresh data", exact: true }).click();
  await expect(page.locator(".query-feedback")).toContainText("Showing saved data.");
  await expect(page.locator(".summary-grid")).toHaveText(before);
  await expect(page.locator(".page-skeleton")).toHaveCount(0);
  await page.unroute("**/api/workspace?view=dashboard");
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator(".query-feedback")).toHaveCount(0);
  await expect(page.locator(".summary-grid")).toHaveText(before);
});

test("keeps date filters in separate cache entries and submits filters without losing cache", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => { if (request.url().includes("/api/workspace?") && request.url().includes("view=statistics")) requests.push(request.url()); });
  await page.goto("/statistics?period=7d");
  await expect(page.locator(".statistic-summary")).toContainText("7 / 0");
  await page.getByLabel("Period").selectOption("30d");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.locator(".statistic-summary")).toContainText("30 / 0");
  await page.getByLabel("Period").selectOption("7d");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.locator(".statistic-summary")).toContainText("7 / 0");
  expect(requests).toHaveLength(2);
});

test("serves only workspace records from JSON APIs and rejects invalid input", async ({ request }) => {
  for (const view of ["dashboard", "scans", "statistics"]) {
    const response = await request.get(`/api/workspace?view=${view}`);
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toBe("private, no-store");
    expect(await response.text()).not.toMatch(/PRIVATE DEVICE|PRIVATE SCAN|token_hash|tokenHash/);
  }
  expect((await request.get("/api/workspace?view=scans&period=custom&from=bad&to=bad")).status()).toBe(400);
  expect((await request.get("/api/workspace?view=invalid")).status()).toBe(400);
});

test("shows saved data when offline and resumes refreshing after reconnecting", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.locator(".summary-grid")).toBeVisible();
  const before = (await page.locator(".summary-grid").textContent()) ?? "";
  await context.setOffline(true);
  await expect(page.locator(".query-feedback")).toContainText("You're offline.");
  await expect(page.getByRole("button", { name: "Refresh data", exact: true })).toBeDisabled();
  await expect(page.locator(".summary-grid")).toHaveText(before);
  await context.setOffline(false);
  await expect(page.locator(".query-feedback")).toHaveCount(0);
  await expect(page.locator(".summary-grid")).toHaveText(before);
});
