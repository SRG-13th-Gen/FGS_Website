import { expect, test } from "@playwright/test";

// This smoke suite runs without a configured content database. Public pages
// must report unavailable content honestly rather than invent missing records.
test("the home page renders and shows a truthful unavailable state when the content database reads are rejected", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("main")).toBeVisible();
  await expect(
    page.getByText("News is unavailable right now. Please check back soon."),
  ).toBeVisible();
});

test("an article request shows the unavailable state rather than a false not-found during an outage", async ({
  page,
}) => {
  // Since reads are rejected upstream, the app cannot tell a missing slug
  // apart from any other slug — it must not claim a false 404 either way.
  const response = await page.goto("/news/any-slug-at-all");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByText(
      "This article is unavailable right now. Please check back soon.",
    ),
  ).toBeVisible();
});
