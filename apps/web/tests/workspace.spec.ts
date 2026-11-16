import { test, expect } from "@playwright/test";

test("shows the last scan and paginated history without a login", async ({ page }) => {
  await page.goto("/scans");
  await expect(page.getByRole("heading", { name: "Scans", exact: true })).toBeVisible();
  await expect(page.getByText("scan-001", { exact: true }).first()).toBeVisible();
  await expect(page.locator(".reading-value").first()).toContainText("0");
  await expect(page.locator(".scan-table tbody tr").first()).toBeVisible();
  await expect(page.getByText("PRIVATE SCAN")).toHaveCount(0);
  await expect(page.locator(".table-footer").getByText("Next", { exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/dashboard-desktop.png", fullPage: true });
  const footer = page.locator(".table-footer");
  for (let i = 0; i < 20 && await footer.getByRole("button", { name: "Next", exact: true }).count(); i++) {
    const previousRange = await footer.innerText();
    await footer.getByRole("button", { name: "Next", exact: true }).click();
    await expect(footer).not.toHaveText(previousRange);
  }
  await footer.getByRole("link", { name: "Next", exact: true }).click();
  await expect(page.locator(".scan-table tbody")).toContainText("scan-021");
});

test("filters unknown times by upload date and keeps the last scan independent", async ({ page }) => {
  await page.goto("/scans?q=scan-unknown&period=today&basis=scanned");
  await expect(page.getByRole("heading", { name: "No matching scans" })).toBeVisible();
  await expect(page.locator(".latest-scan")).toContainText("scan-001");
  await page.locator(".history-controls > summary").click();
  await page.getByLabel("Date by").selectOption("uploaded");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.locator(".scan-table tbody tr")).toHaveCount(1);
  await expect(page.locator(".scan-table tbody")).toContainText("Time unknown");
});

test("opens details and compares two scans", async ({ page }) => {
  await page.goto("/scans");
  await expect(page.locator(".scan-table tbody tr").nth(1)).toBeVisible();
  await page.getByRole("checkbox").nth(0).check();
  await page.getByRole("checkbox").nth(1).check();
  await page.getByRole("button", { name: "Compare (2/2)", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("scan-001");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("link", { name: "scan-001", exact: true }).click();
  await expect(page.getByRole("heading", { name: "scan-001", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Advisor", exact: true }).click();
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
  await page.goto("/scans?location=North+plot");
  await page.getByRole("button", { name: "Trends", exact: true }).click();
  await expect(page.locator(".trend-figure > svg")).toBeVisible();
  await page.getByRole("button", { name: "Moisture", exact: true }).click();
  await expect(page.locator(".trend-figure > svg")).toHaveAttribute("aria-label", /Moisture/);
  await page.goto("/devices");
  await expect(page.getByRole("heading", { name: "Test field unit" })).toBeVisible();
  await expect(page.getByText("PRIVATE DEVICE")).toHaveCount(0);
  await page.goto("/setup");
  await expect(page.getByRole("heading", { name: "Setup", exact: true })).toBeVisible();
  await expect(page.getByText("4 / 4", { exact: true })).toBeVisible();
});

test("keeps mobile navigation and filters usable without page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/scans");
  await expect(page.locator(".scan-table tbody tr").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.locator(".history-controls > summary").click();
  await page.getByRole("link", { name: "Last 7 days", exact: true }).last().click();
  await expect(page).toHaveURL(/period=7d/);
  await expect(page.locator(".scan-table tbody tr").first()).toBeVisible();
  await expect(page.locator(".table-footer")).toContainText("of 7");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/dashboard-mobile.png", fullPage: true });
});

test("fits five tabs in expanded and collapsed sidebars on all screen sizes", async ({ page }) => {
  test.setTimeout(180000);
  const routes = [["/", "Overview"], ["/scans", "Scans"], ["/recommendations", "Recommendations"], ["/statistics", "Statistics"], ["/status", "Status"]];
  for (const viewport of [{ width: 1366, height: 688 }, { width: 1024, height: 768 }, { width: 390, height: 844 }, { width: 360, height: 640 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    for (const collapsed of [false, true]) {
      for (const [path, label] of routes) {
        await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: label, exact: true }).click();
        await expect(page.locator(".topbar h1:visible")).toHaveText(label);
        if (path === "/") await expect(page.locator(".summary-grid:visible")).toBeVisible();
        if (path === "/scans") await expect(page.locator(".scan-table tbody tr").first()).toBeVisible();
        if (path === "/recommendations") await expect(page.locator(".guidance-grid:visible")).toBeVisible();
        if (path === "/statistics") await expect(page.locator(".distribution")).toBeVisible();
        if (path === "/status") await expect(page.locator(".monitor-panel:visible")).toBeVisible();
        await expect(page.locator(".sidebar:visible nav a")).toHaveCount(5);
        await page.mouse.move(collapsed ? viewport.width - 5 : 25, 100);
        await expect(page.getByRole("button", { name: "Toggle sidebar", exact: true })).toHaveAttribute("aria-expanded", String(!collapsed));
        await expect(async () => {
          const problems = await page.evaluate(() => {
            const selectors = [".summary-card", ".monitor-panel", ".monitor-footer", ".latest-upload", ".latest-scan", ".scan-history", ".table-footer", ".guidance-card", ".recommendation-note", ".workspace-footnote", ".service-panel", ".statistics-panel", ".statistic-note", ".sidebar nav"];
            return selectors.flatMap(selector => [...document.querySelectorAll(selector)].filter(element => {
              const box = element.getBoundingClientRect();
              return box.width && box.height && (box.left < -1 || box.top < -1 || box.right > innerWidth + 1 || box.bottom > innerHeight + 1);
            }).map(() => selector));
          });
          expect(problems).toEqual([]);
        }).toPass({ timeout: 5000 });
        expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight && document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.screenshot({ path: "test-results/" + label.toLowerCase() + "-" + viewport.width + (collapsed ? "-collapsed" : "") + ".png" });
      }
    }
  }
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
