import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

function readEnvLocal(key: string): string {
  const content = readFileSync(
    new URL("../../.env.local", import.meta.url),
    "utf8",
  );
  const line = content.split(/\r?\n/).find((l) => l.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1) : "";
}

const email = readEnvLocal("ADMIN_DEV_EMAIL");
const password = readEnvLocal("ADMIN_DEV_PASSWORD");

/**
 * `pnpm test:e2e` runs against a production build, where the dev login is
 * always disabled (src/lib/auth/dev-login.ts) and /admin/login shows a
 * disabled-sign-in message instead of the form. These tests need a working
 * sign-in, so they check the actual page at runtime and skip if it's not
 * available, rather than guessing from NODE_ENV.
 */
async function signInOrSkip(page: Page): Promise<void> {
  await page.goto("/admin/login");
  const disabledMessage = page.getByText(
    "Admin sign-in is not configured yet.",
  );
  if (await disabledMessage.isVisible().catch(() => false)) {
    test.skip(
      true,
      "Dev login is disabled in this build — run against `pnpm dev` instead.",
    );
  }

  await page.getByLabel("Email").fill(email);
  await page.locator("#admin-password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
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
