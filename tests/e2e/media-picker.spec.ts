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

/** Same production-build skip rationale as admin-sidebar.spec.ts. */
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

test("media picker opens from a section editor, switches tabs, and closes with Escape", async ({
  page,
}) => {
  await signInOrSkip(page);

  await page.goto("/admin/sections/about");
  await page.getByRole("button", { name: "Replace image" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Choose a photo")).toBeVisible();
  await expect(
    dialog.getByRole("tab", { name: "Choose from library" }),
  ).toHaveAttribute("aria-selected", "true");

  await dialog.getByRole("tab", { name: "Upload" }).click();
  await expect(dialog.getByRole("tab", { name: "Upload" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(dialog.getByText(/click to select/i)).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});
