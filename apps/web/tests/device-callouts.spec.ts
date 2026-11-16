import { test, expect, type Page } from "@playwright/test";
import type { ModelViewerElement } from "@google/model-viewer";

test.use({ viewport: { width: 1366, height: 688 }, reducedMotion: "reduce" });

async function pointerError(page: Page) {
  return page.locator(".device-callouts").evaluate((overlay) => {
    const viewer = document.querySelector("model-viewer") as ModelViewerElement;
    const canvas = viewer.getBoundingClientRect(), bounds = overlay.getBoundingClientRect();
    const lines = [...overlay.querySelectorAll<SVGPathElement>("[data-pointer]")].filter((line) => line.getAttribute("d"));
    if (!lines.length) return Infinity;
    return Math.max(...lines.map((line) => {
      const point = viewer.queryHotspot(`hotspot-${line.dataset.pointer}`)?.canvasPosition;
      const last = line.getAttribute("d")?.match(/L([^L]+)$/)?.[1];
      if (!point || !last) return 0;
      const [x, y] = last.split(",").map(Number);
      return Math.hypot(x - (canvas.left - bounds.left + point.x), y - (canvas.top - bounds.top + point.y));
    }));
  });
}

test("pointer tips follow the model through rotation and sidebar resizing", async ({ page }) => {
  await page.goto("/status");
  await expect(page.locator(".device-model-ready")).toBeVisible();
  await expect.poll(async () => page.locator("[data-pointer]").evaluateAll((lines) => lines.filter((line) => line.getAttribute("d")).length)).toBe(6);
  await expect.poll(() => pointerError(page)).toBeLessThan(2);
  await page.locator("model-viewer").evaluate((element) => {
    const viewer = element as ModelViewerElement;
    viewer.cameraOrbit = "-45deg 60deg 100%";
    viewer.jumpCameraToGoal();
  });
  await expect.poll(() => pointerError(page)).toBeLessThan(2);
  await page.mouse.move(25, 100);
  await expect(page.getByRole("button", { name: "Toggle sidebar" })).toHaveAttribute("aria-expanded", "true");
  await expect.poll(() => pointerError(page)).toBeLessThan(2);
  await page.setViewportSize({ width: 768, height: 688 });
  await expect.poll(() => pointerError(page)).toBeLessThan(2);
});

test("callouts switch devices together and clear stale telemetry", async ({ page }) => {
  let stale = false;
  await page.route("**/api/workspace?view=dashboard", async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    data.workspace.devices.push({ id: "soil-second", label: "Second field unit", lastContactAt: null, scanCount: 22 });
    data.reports = [{ deviceId: "soil-second", receivedAt: new Date(Date.now() - (stale ? 120000 : 0)).toISOString(), data: { deviceId: "soil-second", batteryPercent: 87, pendingScans: 0, syncState: "idle", ready: true, sensors: { ph: "ok", moisture: "ok", temperature: "ok", npk: "not_installed" }, lastError: null } }];
    data.checkedAt = Date.now();
    await route.fulfill({ response, json: data });
  });
  await page.goto("/status");
  await expect(page.locator('[data-callout="battery"]')).toContainText("--");
  await page.getByLabel("Device to monitor").selectOption("soil-second");
  await expect(page.locator('[data-callout="battery"]')).toContainText("87%");
  await expect(page.locator('[data-callout="device"]')).toContainText("22");
  await expect(page.locator('[data-callout="ph"]')).toContainText("OK");
  stale = true;
  await page.getByRole("button", { name: "Refresh data", exact: true }).click();
  await expect(page.locator('[data-callout="battery"]')).toContainText("--");
  await expect(page.locator('[data-callout="ph"]')).toContainText("--");
  await expect(page.locator('[data-callout="device"]')).toContainText("22");
  await expect(page.locator(".callout-ok")).toHaveCount(0);
});
