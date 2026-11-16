import { test, expect } from "@playwright/test";
import type { ModelViewerElement } from "@google/model-viewer";

test.use({ viewport: { width: 1366, height: 688 }, reducedMotion: "reduce" });

test("loads the compact model with all components and supports rotation, zoom and reset", async ({ page }) => {
  const asset = await page.request.get("/models/compact-breadboard.glb");
  const buffer = await asset.body();
  expect(buffer.toString("utf8", 0, 4)).toBe("glTF");
  const gltf = JSON.parse(buffer.toString("utf8", 20, 20 + buffer.readUInt32LE(12)));
  expect(gltf.nodes.filter((node: { extras?: { part_number?: number } }) => node.extras?.part_number)).toHaveLength(19);
  await page.goto("/status");
  const viewer = page.locator("model-viewer");
  await expect(page.locator(".device-model-ready")).toBeVisible();
  await expect(page.locator("[data-callout]")).toHaveCount(6);
  await expect.poll(async () => page.locator("[data-pointer]").evaluateAll((lines) => lines.filter((line) => line.getAttribute("d")).length)).toBe(6);
  const pointer = page.locator('[data-pointer="ph"]');
  const initialPointer = await pointer.getAttribute("d");
  const initial = await viewer.evaluate((element) => (element as ModelViewerElement).getCameraOrbit());
  const box = (await viewer.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 20, { steps: 10 });
  await page.mouse.up();
  await expect.poll(async () => Math.abs((await viewer.evaluate((element) => (element as ModelViewerElement).getCameraOrbit())).theta - initial.theta)).toBeGreaterThan(.1);
  await expect(pointer).not.toHaveAttribute("d", initialPointer!);
  const beforeZoom = await viewer.evaluate((element) => (element as ModelViewerElement).getCameraOrbit().radius);
  await page.mouse.wheel(0, -150);
  await expect.poll(async () => (await viewer.evaluate((element) => (element as ModelViewerElement).getCameraOrbit())).radius).toBeLessThan(beforeZoom);
  await page.getByRole("button", { name: "Reset 3D view" }).click();
  await expect.poll(async () => Math.abs((await viewer.evaluate((element) => (element as ModelViewerElement).getCameraOrbit())).theta - initial.theta)).toBeLessThan(.01);
  await expect.poll(async () => Math.abs((await viewer.evaluate((element) => (element as ModelViewerElement).getCameraOrbit())).radius - initial.radius)).toBeLessThan(.01);
  await page.screenshot({ path: "test-results/device-status-desktop.png" });
});

test("keeps readings available when the model fails and retries the asset", async ({ page }) => {
  let fail = true;
  await page.route("**/models/compact-breadboard.glb*", (route) => fail ? route.fulfill({ status: 503, body: "Unavailable" }) : route.continue());
  await page.goto("/status");
  await expect(page.getByText("3D unavailable", { exact: true })).toBeVisible();
  await expect(page.getByAltText("Compact breadboard prototype")).toBeVisible();
  await expect(page.locator('[data-callout="ph"]')).toContainText("pH sensor");
  await expect(page.locator(".service-checks")).toContainText("Connected");
  fail = false;
  await page.locator(".device-model-message").getByRole("button", { name: "Retry" }).click();
  await expect(page.locator(".device-model-ready")).toBeVisible();
});

test("shows live device callouts on phones without covering each other", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.route("**/api/workspace?view=dashboard", async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    data.reports = [{ deviceId: "soil-test", receivedAt: new Date().toISOString(), data: { deviceId: "soil-test", batteryPercent: 12, pendingScans: 4, syncState: "error", ready: false, sensors: { ph: "error", moisture: "ok", temperature: "ok", npk: "not_installed" }, lastError: "pH probe disconnected" } }];
    data.checkedAt = Date.now();
    await route.fulfill({ response, json: data });
  });
  await page.goto("/status");
  await expect(page.locator(".device-model-ready")).toBeVisible();
  await page.getByRole("button", { name: "Toggle sidebar" }).click();
  await page.context().setOffline(true);
  await expect(page.locator(".query-feedback")).toBeVisible();
  await expect(page.locator('[data-callout="ph"]')).toContainText("Problem reported");
  await expect(page.locator('[data-callout="battery"]')).toContainText("12%");
  await expect(page.locator(".model-device-error")).toHaveText("pH probe disconnected");
  const fits = await page.locator(".device-callouts").evaluate((element) => {
    const parent = element.getBoundingClientRect();
    const boxes = [...element.querySelectorAll("[data-callout]")].map((label) => label.getBoundingClientRect());
    return boxes.every((box) => box.top >= parent.top && box.bottom <= parent.bottom && box.left >= parent.left && box.right <= parent.right)
      && boxes.every((box, i) => boxes.every((other, j) => i === j || box.right <= other.left || box.left >= other.right || box.bottom <= other.top || box.top >= other.bottom));
  });
  expect(fits).toBe(true);
  await page.screenshot({ path: "test-results/device-status-phone-model.png" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("does not load the 3D asset on Overview", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => { if (request.url().includes("/models/")) requests.push(request.url()); });
  await page.goto("/");
  await expect(page.locator(".summary-grid")).toBeVisible();
  expect(requests).toEqual([]);
});
