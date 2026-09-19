import { expect, test } from "@playwright/test";

test("the production scaffold renders without CMS credentials or network reads", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: "Flordegrace School", exact: true }),
  ).toBeVisible();
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
