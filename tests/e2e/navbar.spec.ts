import { expect, test } from "@playwright/test";

// An article page renders its navbar and footer even without a content
// database, so this exercises the links from a non-homepage route.
test.describe("section links from a non-homepage route", () => {
  test("navbar section link goes to the homepage section", async ({ page }) => {
    await page.goto("/news/any-slug-at-all");
    await page
      .getByRole("banner")
      .getByRole("link", { name: "About Us" })
      .click();
    await page.waitForURL(/\/#about$/);
    await expect(page.locator("#about")).toBeInViewport();
  });

  test("footer quick link goes to the homepage section", async ({ page }) => {
    await page.goto("/news/any-slug-at-all");
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Admission" })
      .click();
    await page.waitForURL(/\/#admission$/);
    await expect(page.locator("#admission")).toBeInViewport();
  });

  test("no navbar item is marked current on an article page", async ({
    page,
  }) => {
    await page.goto("/news/any-slug-at-all");
    await expect(
      page.getByRole("banner").locator("[aria-current]"),
    ).toHaveCount(0);
  });
});
