import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1366, height: 688 }, reducedMotion: "reduce" });

test("opens each popup, contains keyboard focus, and restores focus when closed", async ({ page }) => {
  await page.goto("/");
  for (const name of ["Settings", "Help", "How to use"]) {
    await page.locator(".sidebar:visible").hover({ position: { x: 25, y: 100 } });
    await expect.poll(async () => (await page.locator(".sidebar:visible").boundingBox())?.width).toBe(216);
    const trigger = page.getByRole("button", { name, exact: true });
    await trigger.click();
    const popup = page.getByRole("dialog", { name, exact: true });
    await expect(popup).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(popup.getByRole("button", { name: `Close ${name}` })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    expect(await popup.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Tab");
    await expect(popup.getByRole("button", { name: `Close ${name}` })).toBeFocused();
    if (name === "Settings") await popup.getByRole("button", { name: `Close ${name}` }).click();
    else if (name === "Help") await page.keyboard.press("Escape");
    else await page.mouse.click(500, 10);
    await expect(popup).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  }
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL("/");
});

test("popup links navigate and help answers expand", async ({ page }) => {
  await page.goto("/");
  await page.locator(".sidebar:visible").hover({ position: { x: 25, y: 100 } });
  await expect.poll(async () => (await page.locator(".sidebar:visible").boundingBox())?.width).toBe(216);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("dialog", { name: "Settings", exact: true }).getByRole("link", { name: /Devices/ }).click();
  await expect(page).toHaveURL("/devices");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.locator(".sidebar:visible").hover({ position: { x: 25, y: 100 } });
  await expect.poll(async () => (await page.locator(".sidebar:visible").boundingBox())?.width).toBe(216);
  await page.getByRole("button", { name: "Help", exact: true }).click();
  const help = page.getByRole("dialog", { name: "Help", exact: true });
  await help.getByText("What does -- mean?", { exact: true }).click();
  await expect(help.getByText("A reading or device report is not available yet.", { exact: true })).toBeVisible();
  await help.getByRole("link", { name: "Check Status" }).click();
  await expect(page).toHaveURL("/status");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("touch users can open each popup with the sidebar collapsed or expanded", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 640 }, hasTouch: true, isMobile: true, reducedMotion: "reduce", baseURL: "http://127.0.0.1:3100" });
  const page = await context.newPage();
  try {
    await page.goto("/");
    for (const expanded of [false, true]) {
      if (expanded) await page.getByRole("button", { name: "Toggle sidebar" }).tap();
      for (const name of ["Settings", "Help", "How to use"]) {
        await page.getByRole("button", { name, exact: true }).tap();
        const popup = page.getByRole("dialog", { name, exact: true });
        await expect(popup).toBeVisible();
        const box = (await popup.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(16);
        expect(box.y).toBeGreaterThanOrEqual(16);
        expect(box.x + box.width).toBeLessThanOrEqual(344);
        expect(box.y + box.height).toBeLessThanOrEqual(624);
        await popup.getByRole("button", { name: `Close ${name}` }).tap();
        await expect(popup).not.toBeVisible();
      }
    }
  } finally { await context.close(); }
});
