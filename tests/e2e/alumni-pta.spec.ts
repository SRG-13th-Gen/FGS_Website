import { expect, test } from "@playwright/test";

// Default runs have no content database, so these pages show their unavailable
// state. With a database they show the empty state or content. Either way the
// page must say which, never render blank, and keep its own canonical.
const cases = [
  {
    path: "/alumni",
    title: /^Alumni \|/,
    canonical: "/alumni",
    heading: "Alumni Achievements",
    messages: [
      /Alumni achievements are unavailable right now/,
      /No alumni achievements have been published yet/,
    ],
  },
  {
    path: "/pta",
    title: /^PTA \|/,
    canonical: "/pta",
    heading: "PTA Activities",
    messages: [
      /PTA activities are unavailable right now/,
      /No PTA activities have been published yet/,
    ],
  },
] as const;

for (const c of cases) {
  test(`${c.path} renders with its own title and canonical and a truthful state`, async ({
    page,
  }) => {
    const response = await page.goto(c.path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(c.title);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: c.heading }),
    ).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`${c.canonical}$`),
    );
    await expect(
      page.getByText(c.messages[0]).or(page.getByText(c.messages[1])),
    ).toBeVisible();
  });
}

test("/alumni shows an Alumni Activities section", async ({ page }) => {
  await page.goto("/alumni");
  await expect(
    page.getByRole("heading", { level: 2, name: "Alumni Activities" }),
  ).toBeVisible();
});
