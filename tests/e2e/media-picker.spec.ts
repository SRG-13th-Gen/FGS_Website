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
