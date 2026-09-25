import { expect, test, type Page } from "@playwright/test";

test.use({ storageState: process.env.E2E_ADMIN_STORAGE_STATE || undefined });

async function signInOrSkip(page: Page): Promise<void> {
  test.skip(
    !process.env.E2E_ADMIN_STORAGE_STATE,
    "Requires a school-approved Google session fixture.",
  );
  await page.goto("/admin");
  await page.waitForURL(/\/admin$/);
}

test("desktop: sidebar navigates to every section without a full reload error", async ({
  page,
}) => {
  await signInOrSkip(page);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.getByRole("link", { name: "Hero" }).click();
  await page.waitForURL(/\/admin\/sections\/hero$/);
  await expect(page.getByRole("heading", { name: "Hero" })).toBeVisible();

  await page.getByRole("link", { name: "School Info" }).click();
  await page.waitForURL(/\/admin\/sections\/school-info$/);

  await page.getByRole("link", { name: "All News" }).click();
  await page.waitForURL(/\/admin\/articles$/);
});

test("mobile: sidebar is off-canvas, opens via the trigger, and a link navigates", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await signInOrSkip(page);

  // Off-canvas: the nav link is not usable until the trigger opens the sidebar.
  await expect(page.getByRole("link", { name: "About" })).not.toBeVisible();

  await page.getByRole("button", { name: "Toggle sidebar" }).click();
  await page.getByRole("link", { name: "About" }).click();
  await page.waitForURL(/\/admin\/sections\/about$/);
});
