import { expect, test } from "@playwright/test";

const routes = [["/", "Overview", ".summary-grid"], ["/scans", "Scans", ".scan-history"], ["/recommendations", "Recommendations", ".guidance-grid"], ["/statistics", "Statistics", ".statistics-panel"], ["/status", "Status", ".status-device"]];

test("shows fitted skeletons on slow first visits and keeps navigation interactive", async ({ page }) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of [{ width: 1366, height: 688 }, { width: 360, height: 640 }]) {
    await page.setViewportSize(viewport);
    for (const [path, title, ready] of routes) {
      let release!: () => void;
      const gate = new Promise<void>((resolve) => { release = resolve; });
      await page.route("**/api/workspace?**", async (route) => { await gate; await route.continue(); });
      try {
        await page.goto(path);
        const skeleton = page.getByRole("status", { name: `Loading ${title}`, exact: true });
        await expect(skeleton).toBeVisible();
        await expect(page.locator(".query-activity:visible")).toHaveText("Loading");
        if (viewport.width <= 700) await page.getByRole("button", { name: "Toggle sidebar" }).click();
        else await page.mouse.move(25, 100);
        await expect(page.getByRole("button", { name: "Toggle sidebar" })).toHaveAttribute("aria-expanded", "true");
        if (viewport.width <= 700) await page.getByRole("button", { name: "Toggle sidebar" }).click();
        else await page.mouse.move(viewport.width - 5, 100);
        await expect(page.getByRole("button", { name: "Toggle sidebar" })).toHaveAttribute("aria-expanded", "false");
        expect(await skeleton.locator(".skeleton-bone").first().evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
        const overflow = await page.evaluate(() => [...document.querySelectorAll(".page-skeleton, .skeleton-card")].some((element) => {
          const box = element.getBoundingClientRect();
          return box.width && box.height && (box.bottom > innerHeight + 1 || box.right > innerWidth + 1);
        }));
        expect(overflow).toBe(false);
        await page.screenshot({ path: `test-results/skeleton-${title.toLowerCase()}-${viewport.width}.png` });
      } finally { release(); }
      await expect(page.locator(`${ready}:visible`)).toBeVisible();
      await expect(page.locator(".page-skeleton:visible")).toHaveCount(0);
      await page.unroute("**/api/workspace?**");
    }
  }
});

test("shows an actionable first-load error and retries without pretending there are zero scans", async ({ page }) => {
  await page.route("**/api/workspace?**", (route) => route.fulfill({ status: 503, json: { error: "Storage unavailable." } }));
  await page.goto("/scans");
  await expect(page.getByRole("heading", { name: "Data unavailable", exact: true })).toBeVisible();
  await expect(page.getByText("No scans yet", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Retry", exact: true })).toBeEnabled();
  await page.unroute("**/api/workspace?**");
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator(".scan-table tbody tr").first()).toBeVisible();
});
