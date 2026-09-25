import { expect, test } from "@playwright/test";

/**
 * The homepage now renders content-driven sections (SPEC-007): the exact
 * hero heading text comes from WordPress (or its bundled local fallback when
 * WordPress is unreachable — src/lib/wordpress/sections/hero.ts), so it isn't
 * a fixed string this test can assert. What the app actually guarantees
 * regardless of CMS state: a 200 response, no client-side JS errors, a
 * single <h1> heading always rendered, a <main> landmark, and the site-wide
 * noindex/nofollow robots meta (not launched publicly yet).
 */
test("the homepage renders with no client-side errors, a heading, and the noindex robots tag", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
  expect(errors).toEqual([]);
});

test("unknown routes return an honest not-found response", async ({ page }) => {
  const response = await page.goto("/not-a-school-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "Return home" })).toBeVisible();
});
