import { test, expect } from "@playwright/test";

test.describe("isolated authenticated content workflows", () => {
  test.skip(
    process.env.FGS_E2E_CONTENT !== "true",
    "Requires the isolated content database and synthetic session fixture.",
  );
  test.use({ storageState: process.env.E2E_ADMIN_STORAGE_STATE || undefined });
  test("saves all seven sections, publishes an image-only story, edits it and moves it to trash", async ({
    page,
  }) => {
    test.setTimeout(120000);
    for (const slug of [
      "hero",
      "about",
      "admission",
      "clubs",
      "gallery",
      "contact",
      "school-info",
    ]) {
      await page.goto("/admin/sections/" + slug);
      const field = page.locator(
        slug === "school-info"
          ? 'input[name="schoolName"]'
          : '[name="heading"]',
      );
      const original = await field.inputValue();
      await field.fill(original + " test");
      await page
        .getByRole("button", { name: "Save changes", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "Save changes", exact: true }),
      ).toBeDisabled();
      await page.reload();
      await expect(field).toHaveValue(original + " test");
      await field.fill(original);
      await page
        .getByRole("button", { name: "Save changes", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "Save changes", exact: true }),
      ).toBeDisabled();
    }
    await page.goto("/admin/articles/new");
    await page.getByLabel("Article Title").fill("Browser image-only story");
    await page.getByRole("button", { name: "Add Photos", exact: true }).click();
    const picker = page.getByRole("dialog");
    await picker.getByRole("tab", { name: "Upload", exact: true }).click();
    await picker
      .locator('input[type="file"]')
      .setInputFiles(".data/e2e-photo.png");
    await expect(picker).not.toBeVisible();
    await page
      .getByRole("button", { name: "Publish Article", exact: true })
      .click();
    await expect(
      page.getByText("Article published successfully!"),
    ).toBeVisible();
    const path = await page
      .getByRole("link", { name: "View published article" })
      .getAttribute("href");
    expect(path).toMatch(/^\/news\//);
    await page.goto(path!);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Browser image-only story",
    );
    await page.goto("/admin/articles");
    await page.getByRole("link", { name: "Edit", exact: true }).first().click();
    await page.getByLabel("Article Title").fill("Browser edited story");
    await page
      .getByRole("button", { name: "Save changes", exact: true })
      .click();
    await expect(
      page.getByText("Article saved.", { exact: true }),
    ).toBeVisible();
    await page.goto(path!);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Browser edited story",
    );
    await page.goto("/admin/articles");
    await page
      .getByRole("button", {
        name: 'Move "Browser edited story" to trash',
        exact: true,
      })
      .click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Move to Trash", exact: true })
      .click();
    await expect(page.getByRole("alertdialog")).not.toBeVisible();
    await expect(
      page.getByText("Article moved to trash.", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: 'Move "Browser edited story" to trash',
        exact: true,
      }),
    ).toHaveCount(0);
    const response = await page.goto(path!);
    expect(response?.status()).toBe(404);
  });
});
