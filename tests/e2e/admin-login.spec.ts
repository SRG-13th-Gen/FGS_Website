import { expect, test } from "@playwright/test";

test("unauthenticated visitors requesting /admin are redirected to /admin/login", async ({
  page,
}) => {
  await page.goto("/admin");
  await page.waitForURL(/\/admin\/login$/);
  expect(new URL(page.url()).pathname).toBe("/admin/login");
});

test("the admin login page renders without the protected admin header", async ({
  page,
}) => {
  const response = await page.goto("/admin/login");

  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).pathname).toBe("/admin/login");

  // The protected layout's header landmark (admin portal badge, sign-out
  // control, "View Live Website" link) must not render on the login route.
  // Match the badge's text exactly — the login page's own subtitle
  // ("Admin Portal Sign In") legitimately contains "Admin Portal" too.
  await expect(page.getByRole("banner")).toHaveCount(0);
  await expect(page.getByText("Admin Portal", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "View Live Website" }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Sign out" })).toHaveCount(0);
});
