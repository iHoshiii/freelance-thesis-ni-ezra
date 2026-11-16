import { expect, test } from "@playwright/test";

test("animates on hover without shifting the page or covering navigation", async ({ page }) => {
  await page.goto("/status");
  const sidebar = page.getByRole("complementary", { name: "Workspace sidebar" });
  const toggle = page.getByRole("button", { name: "Toggle sidebar" });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  const content = await page.locator("main").boundingBox();
  expect(await sidebar.evaluate(element => getComputedStyle(element).transitionProperty)).toContain("width");
  await sidebar.hover({ position: { x: 25, y: 100 } });
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect.poll(async () => (await sidebar.boundingBox())?.width).toBe(216);
  expect(await page.locator("main").boundingBox()).toEqual(content);
  await expect(page.getByRole("button", { name: /Expand sidebar|Collapse sidebar/ })).toHaveCount(0);
  await page.getByRole("navigation").getByRole("link", { name: "Status", exact: true }).click();
  await page.mouse.move(500, 100);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect.poll(async () => (await sidebar.boundingBox())?.width).toBe(64);
  await page.screenshot({ path: "test-results/sidebar-collapsed.png" });
  await sidebar.hover({ position: { x: 25, y: 100 } });
  await expect.poll(async () => (await sidebar.boundingBox())?.width).toBe(216);
  await page.screenshot({ path: "test-results/sidebar-expanded.png" });
});

test("opens for keyboard navigation and closes when focus leaves or Escape is pressed", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Toggle sidebar" });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("navigation").getByRole("link", { name: "Overview", exact: true })).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.focus();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.locator("main").focus();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("lets touch users tap the logo and closes after choosing a tab or tapping content", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, baseURL: "http://127.0.0.1:3100" });
  const page = await context.newPage();
  try {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Toggle sidebar" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.tap();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await toggle.tap();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.tap();
    await page.getByRole("navigation").getByRole("link", { name: "Status", exact: true }).tap();
    await expect(page.locator(".topbar h1:visible")).toHaveText("Status");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.tap();
    await page.locator("main:visible").tap({ position: { x: 285, y: 150 } });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect.poll(async () => (await page.getByRole("complementary", { name: "Workspace sidebar" }).boundingBox())?.width).toBe(56);
    await page.screenshot({ path: "test-results/sidebar-touch.png" });
  } finally { await context.close(); }
});
