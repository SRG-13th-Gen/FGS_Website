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

  await page.getByRole("link", { name: "All Posts" }).click();
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

test("desktop: exactly one sidebar item is active on every admin page", async ({
  page,
}) => {
  await signInOrSkip(page);
  const cases = [
    ["/admin", "Dashboard"],
    ["/admin/sections/alumni", "Alumni Achievements"],
    ["/admin/articles", "All Posts"],
    ["/admin/articles?category=pta", "All Posts"],
    ["/admin/articles?category=alumni", "All Posts"],
    ["/admin/articles/new", "Add New"],
    ["/admin/articles/new?category=alumni", "Add New"],
  ] as const;
  for (const [path, label] of cases) {
    await page.goto(path);
    const active = page.locator(
      '[data-sidebar="menu-button"][data-active="true"]',
    );
    await expect(active).toHaveCount(1);
    await expect(active).toHaveText(label);
  }
});

test("desktop: the sidebar has Posts and no separate Alumni or PTA groups", async ({
  page,
}) => {
  await signInOrSkip(page);
  await expect(page.getByRole("link", { name: "All Posts" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Alumni Achievements" }),
  ).toBeVisible();
  await expect(page.getByText("PTA Activities")).toHaveCount(0);
  await expect(page.getByText("Alumni Activities")).toHaveCount(0);
});

test("desktop: the old activity routes redirect to the filtered list", async ({
  page,
}) => {
  await signInOrSkip(page);
  await page.goto("/admin/alumni/activities");
  await page.waitForURL(/\/admin\/articles\?category=alumni$/);
  await page.goto("/admin/pta/activities");
  await page.waitForURL(/\/admin\/articles\?category=pta$/);
});

test("desktop: category filter keeps its choice in the URL and Add New preselects it", async ({
  page,
}) => {
  await signInOrSkip(page);
  await page.goto("/admin/articles");
  const filter = page.getByRole("navigation", {
    name: "Filter posts by category",
  });
  await expect(filter.getByRole("link")).toHaveText([
    "All",
    "Announcements",
    "Events",
    "Clubs",
    "PTA",
    "Alumni",
  ]);
  await filter.getByRole("link", { name: "PTA" }).click();
  await page.waitForURL(/\/admin\/articles\?category=pta$/);
  await expect(filter.getByRole("link", { name: "PTA" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  // The page's own button, not the sidebar item of the same name.
  await page
    .getByRole("main")
    .getByRole("link", { name: "Add New", exact: true })
    .click();
  await page.waitForURL(/\/admin\/articles\/new\?category=pta$/);
});
