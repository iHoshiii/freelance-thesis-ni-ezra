import { expect, test } from "@playwright/test";

test("opens Configuration and saves the pH 4 reference / pH 3 measured example per device", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation").getByRole("link", { name: "Configuration", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Configuration", exact: true })).toBeVisible();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Configuration", exact: true })).toHaveAttribute("aria-current", "page");
  await page.getByLabel("Device ID", { exact: true }).fill("soil-test");
  await expect(page.getByRole("button", { name: "Save in this browser" })).toBeDisabled();
  await page.getByLabel("Reference pH", { exact: true }).fill("4");
  await page.getByLabel("Device measured pH").fill("3");
  await expect(page.locator(".calibration-result")).toContainText("+1.00");
  await expect(page.locator(".calibration-example")).toContainText("4.00 corrected");
  await expect(page.getByLabel("Device calibration command")).toHaveText("ph-offset soil-test 1.000000");
  await page.getByLabel("Reference and notes (optional)").fill("pH 4 reference buffer");
  await page.getByRole("button", { name: "Save in this browser" }).click();
  await expect(page.locator(".calibration-save-status")).toContainText("Saved +1.00 pH in this browser");
  await expect(page.locator(".calibration-history")).toContainText("pH 4 reference buffer");
  await page.screenshot({ path: "test-results/configuration-desktop.png" });
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export last saved check" }).click();
  expect((await download).suggestedFilename()).toBe("soil-test-ph-calibration.json");
  await page.reload();
  await page.getByLabel("Device ID", { exact: true }).fill("soil-test");
  await expect(page.locator(".calibration-history")).toContainText("+1.00");
  await page.getByLabel("Device ID", { exact: true }).fill("soil-other");
  await expect(page.locator(".calibration-history")).toContainText("No calibration checks saved");
  expect((await page.request.get("/api/workspace?view=dashboard")).ok()).toBe(true);
});

test("accounts for an existing offset and refuses out-of-range previews", async ({ page }) => {
  await page.goto("/configuration");
  await page.getByLabel("Reference pH", { exact: true }).fill("4");
  await page.getByLabel("Device measured pH").fill("4");
  await page.getByLabel("Existing device offset (pH)", { exact: false }).fill("1");
  await expect(page.locator(".calibration-result")).toContainText("+1.00");
  await page.getByLabel("Try another device reading").fill("14");
  await expect(page.locator(".calibration-test-result")).toHaveText("Corrected pH: 14.00");
  await page.getByLabel("Existing device offset (pH)", { exact: false }).fill("0");
  await page.getByLabel("Device measured pH").fill("3");
  await expect(page.locator(".calibration-test-result")).toContainText("Outside pH 0 to 14");
  await page.getByLabel("Reference pH", { exact: true }).fill("15");
  await expect(page.getByRole("button", { name: "Save in this browser" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Copy device command" })).toBeDisabled();
});

test("keeps correction controls usable when browser storage is corrupt", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("soilsense:ph-calibration:v1", "corrupt"));
  await page.goto("/configuration");
  await page.getByLabel("Reference pH", { exact: true }).fill("4");
  await page.getByLabel("Device measured pH").fill("3");
  await expect(page.locator(".calibration-form").getByRole("alert")).toContainText("preserved");
  await expect(page.getByRole("button", { name: "Save in this browser" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Copy device command" })).toBeEnabled();
});

test("fits the new sidebar tab and calibration form on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/configuration");
  await page.getByRole("button", { name: "Toggle sidebar" }).click();
  const configuration = page.getByRole("navigation").getByRole("link", { name: "Configuration", exact: true });
  await expect(configuration).toBeVisible();
  const box = await configuration.boundingBox();
  expect(box!.x + box!.width).toBeLessThanOrEqual(361);
  await configuration.click();
  await page.getByLabel("Reference pH", { exact: true }).fill("4");
  await page.getByLabel("Device measured pH").fill("3");
  await expect(page.locator(".calibration-result")).toContainText("+1.00");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/configuration-mobile.png" });
});

test("shows the correction actually recorded with a scan and exports its provenance", async ({ page }) => {
  const response = await page.request.get("/api/workspace?view=scans&q=scan-002&period=all");
  const data = await response.json();
  const scan = data.scans.find((item: { sampleId: string }) => item.sampleId === "scan-002");
  expect(scan.ph).toBeCloseTo(6.3);
  expect(scan.phCalibration).toEqual({ beforeOffset: 5.3, offset: 1 });
  await page.goto(`/scans/soil-test/${scan.recordId}`);
  await expect(page.locator(".scan-correction")).toContainText("pH before offset: 5.30");
  await expect(page.locator(".scan-correction")).toContainText("Applied offset: +1.00");
  const csv = await page.request.get("/api/scans/export?q=scan-002&period=all");
  expect(await csv.text()).toContain("pH before offset,pH offset");
  expect(await csv.text()).toContain(',"5.3","1"\r\n');
});
