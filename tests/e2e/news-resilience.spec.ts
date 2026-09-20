import { expect, test } from "@playwright/test";

// The production build's WORDPRESS_URL is local http (docs/DOCKER.md), which
// src/lib/env/schema.ts deliberately rejects outside development. The home
// page and article routes must still render a calm, truthful "unavailable"
// state rather than fail — see docs/specs/003-team-admin.md.
test("the home page renders and shows a truthful unavailable state when WordPress reads are rejected", async ({
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
