import { test, expect } from "@playwright/test";

test("shows the last scan and paginated history without a login", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Overview", exact: true })).toBeVisible();
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
  await page.goto("/?q=scan-unknown&period=today&basis=scanned");
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
  await page.goto("/?location=North+plot");
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
  await page.goto("/");
  await expect(page.locator(".scan-table tbody tr").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.locator(".history-controls > summary").click();
  await page.getByRole("link", { name: "Last 7 days", exact: true }).click();
  await expect(page).toHaveURL(/period=7d/);
  await expect(page.locator(".scan-table tbody tr").first()).toBeVisible();
  await expect(page.locator(".table-footer")).toContainText("of 7");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/dashboard-mobile.png", fullPage: true });
});

test("fits all four tabs and their controls into desktop, tablet and phone screens", async ({ page }) => {
  test.setTimeout(120000);
  async function fits() {
    const problems = await page.evaluate(() => {
      const selectors = [".topbar", ".sidebar nav", ".latest-scan", ".scan-history", ".scan-table tbody tr", ".table-footer", ".device-card", ".setup-workspace", ".step-footer", ".step-content pre", ".record-panel", ".advisor-panel", ".trend-panel", ".trend-data-page tbody tr", ".comparison-dialog[open]"];
      return selectors.flatMap((selector) => [...document.querySelectorAll(selector)].filter((element) => {
        const box = element.getBoundingClientRect();
        if (!box.width || !box.height) return false;
        return box.left < -1 || box.top < -1 || box.right > innerWidth + 1 || box.bottom > innerHeight + 1;
      }).map(() => selector));
    });
    expect(problems).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight && document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByText("Research workspace", { exact: true })).toHaveCount(0);
  }
  for (const viewport of [{ width: 1366, height: 688 }, { width: 1024, height: 768 }, { width: 390, height: 844 }, { width: 360, height: 640 }]) {
    await page.setViewportSize(viewport);
    for (const path of ["/", "/scans", "/devices", "/setup"]) {
      await page.goto(path);
      await expect(page.locator(".topbar h1:visible")).toHaveText(path === "/" ? "Overview" : path.slice(1, 2).toUpperCase() + path.slice(2));
      if (path === "/" || path === "/scans") {
        await expect(page.locator(".scan-table tbody tr").first()).toBeVisible();
        await expect(async () => {
          const clipped = await page.locator(".scan-table").evaluate((table) => table.getBoundingClientRect().bottom > table.parentElement!.getBoundingClientRect().bottom + 1);
          expect(clipped).toBe(false);
        }).toPass({ timeout: 5000 });
        await fits();
        if (path === "/") {
          await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
          const expandedMain = await page.locator("main").boundingBox();
          await page.getByRole("button", { name: "Hide sidebar", exact: true }).click();
          await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeHidden();
          const showSidebar = page.getByRole("button", { name: "Show sidebar", exact: true });
          await expect(showSidebar).toBeFocused();
          await expect(showSidebar).toHaveAttribute("aria-expanded", "false");
          await expect(page.locator(".sidebar .brand")).toHaveCount(0);
          await fits();
          const collapsedMain = await page.locator("main").boundingBox();
          expect(viewport.width > 700 ? collapsedMain!.width > expandedMain!.width : collapsedMain!.height > expandedMain!.height).toBe(true);
          await page.screenshot({ path: `test-results/sidebar-collapsed-${viewport.width}.png` });
          await showSidebar.press("Enter");
          await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
          await expect(page.getByRole("button", { name: "Hide sidebar", exact: true })).toHaveAttribute("aria-expanded", "true");
          await fits();
        }
        await page.locator(".history-controls > summary").click();
        await page.getByRole("link", { name: "Custom range", exact: true }).click();
        await expect(page.getByLabel("From", { exact: true })).toBeAttached();
        if (!await page.locator(".history-controls").getAttribute("open").then((value) => value !== null)) await page.locator(".history-controls > summary").click();
        await expect(page.getByRole("button", { name: "Apply", exact: true })).toBeInViewport();
        await expect(page.getByLabel("From", { exact: true })).toBeInViewport();
        await expect(page.getByLabel("To", { exact: true })).toBeInViewport();
        await page.getByRole("button", { name: "Close filters", exact: true }).click();
        await expect(page.locator(".history-controls")).not.toHaveAttribute("open", "");
      } else if (path === "/setup") {
        for (let index = 1; index <= 5; index++) {
          await page.getByRole("button", { name: new RegExp(`^Step ${index}:`) }).click();
          await fits();
        }
      } else {
        await expect(page.locator(".device-card")).toBeVisible();
        await fits();
      }
      await page.screenshot({ path: `test-results/fit-${viewport.width}-${path.replaceAll("/", "") || "overview"}.png` });
    }
    await page.goto("/scans");
    await page.getByRole("checkbox").nth(0).check();
    await page.getByRole("checkbox").nth(1).check();
    await page.getByRole("button", { name: "Compare (2/2)", exact: true }).click();
    await fits();
    await page.keyboard.press("Escape");
    await page.getByRole("link", { name: "scan-001", exact: true }).click();
    for (const label of ["Measurements", "Record", "Advisor"]) {
      await page.getByRole("button", { name: label, exact: true }).click();
      await fits();
    }
    await page.goto("/?location=North+plot");
    await page.getByRole("button", { name: "Trends", exact: true }).click();
    await expect(page.locator(".trend-figure > svg")).toBeVisible();
    await fits();
    await page.getByRole("button", { name: "View chart data", exact: true }).click();
    await expect(page.locator(".trend-data-page tbody tr").first()).toBeVisible();
    await fits();
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
