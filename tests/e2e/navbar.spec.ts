import { expect, test, type Page } from "@playwright/test";

const ORDER = [
  "Home",
  "About Us",
  "Admission",
  "News & Events",
  "PTA",
  "Alumni",
  "Clubs",
  "Gallery",
  "Contact Us",
];

// The inline list (xl and up) and the mobile menu are two lists in the DOM.
const inlineNav = (page: Page) => page.locator("#main-navbar ul").first();
const mobileMenu = (page: Page) => page.locator("#mobile-menu");
const inViewport = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return rect.top < innerHeight && rect.bottom > 0;
  });

test.describe("desktop (1280px and up)", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("shows the nine items inline in the agreed order, without a hamburger", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(inlineNav(page).getByRole("link")).toHaveText(ORDER);
    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
  });

  test("PTA and Alumni are route links that open their pages", async ({
    page,
  }) => {
    await page.goto("/");
    await inlineNav(page).getByRole("link", { name: "PTA" }).click();
    await page.waitForURL(/\/pta$/);
    await inlineNav(page).getByRole("link", { name: "Alumni" }).click();
    await page.waitForURL(/\/alumni$/);
  });

  test("the active tab follows the route, with aria-current=page", async ({
    page,
  }) => {
    for (const [path, label] of [
      ["/pta", "PTA"],
      ["/alumni", "Alumni"],
    ] as const) {
      await page.goto(path);
      const current = inlineNav(page).locator("[aria-current]");
      await expect(current).toHaveCount(1);
      await expect(current).toHaveText(label);
      await expect(current).toHaveAttribute("aria-current", "page");
    }
  });

  test("on the homepage the highlight follows the section in view", async ({
    page,
  }) => {
    await page.goto("/");
    const current = inlineNav(page).locator("[aria-current]");
    await expect(current).toHaveText("Home");
    await expect(current).toHaveAttribute("aria-current", "location");
    await inlineNav(page).getByRole("link", { name: "Clubs" }).click();
    await expect(current).toHaveText("Clubs");
    await expect(page).toHaveURL(/\/#clubs$/);
  });

  test("a section link from /pta lands on the homepage section", async ({
    page,
  }) => {
    await page.goto("/pta");
    await inlineNav(page).getByRole("link", { name: "Gallery" }).click();
    await page.waitForURL(/\/#gallery$/);
    await expect.poll(() => inViewport(page, "#gallery")).toBe(true);
  });

  test("no tab is current on an article page", async ({ page }) => {
    await gotoArticle(page);
    await expect(inlineNav(page).locator("[aria-current]")).toHaveCount(0);
  });

  test("keyboard: Tab walks the nine links in order", async ({ page }) => {
    await page.goto("/");
    const seen: string[] = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      seen.push(
        (await page.evaluate(() => document.activeElement?.textContent)) ?? "",
      );
    }
    const first = seen.findIndex((t) => t.trim() === "Home");
    expect(seen.slice(first, first + 9).map((t) => t.trim())).toEqual(ORDER);
  });

  test("reduced motion scrolls to the section without animation", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await inlineNav(page).getByRole("link", { name: "Contact Us" }).click();
    // No smooth scroll: the section is reached within a frame or two.
    await expect
      .poll(() => page.evaluate(() => scrollY), { timeout: 400 })
      .toBeGreaterThan(1000);
  });
});

test.describe("fit at each width", () => {
  for (const width of [768, 1024, 1280, 1440]) {
    for (const path of ["/", "/pta", "/alumni"]) {
      test(`${width}px ${path}: no overlap, no wrapping, no horizontal scroll`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);
        if (path === "/") {
          // Scroll past the hero so the school name is visible too.
          await page.evaluate(() => window.scrollTo(0, 900));
          await page.waitForTimeout(500);
        }
        const fit = await page.evaluate(() => {
          const nav = document.querySelector("#main-navbar nav")!;
          const brand = nav.querySelector("a")!.getBoundingClientRect();
          const list = nav.querySelector("ul")!;
          const inline = getComputedStyle(list).display !== "none";
          const links = inline ? [...list.querySelectorAll("a")] : [];
          return {
            inline,
            overlap: inline && brand.right > list.getBoundingClientRect().left,
            wrapped: links.some((a) => a.getBoundingClientRect().height > 44),
            overflow: document.documentElement.scrollWidth > innerWidth,
            brandHeight: brand.height,
          };
        });
        expect(fit.inline).toBe(width >= 1280);
        expect(fit.overlap).toBe(false);
        expect(fit.wrapped).toBe(false);
        expect(fit.overflow).toBe(false);
        expect(fit.brandHeight).toBeLessThanOrEqual(44);
      });
    }
  }
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("opens with all nine items fully visible", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(mobileMenu(page).getByRole("link")).toHaveText(ORDER);
    // Wait out the slide-down transition before measuring.
    await expect
      .poll(() =>
        mobileMenu(page).evaluate((el) => el.scrollHeight > el.clientHeight),
      )
      .toBe(false);
  });

  test("Escape closes it and returns focus to the menu button", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.keyboard.press("Escape");
    const button = page.getByRole("button", { name: "Open menu" });
    await expect(button).toBeVisible();
    await expect(button).toBeFocused();
  });

  test("closes after a route link navigates", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await mobileMenu(page).getByRole("link", { name: "Alumni" }).click();
    await page.waitForURL(/\/alumni$/);
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  });

  test("closes after a section link and lands on the section", async ({
    page,
  }) => {
    await page.goto("/pta");
    await page.getByRole("button", { name: "Open menu" }).click();
    await mobileMenu(page).getByRole("link", { name: "Admission" }).click();
    await page.waitForURL(/\/#admission$/);
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect.poll(() => inViewport(page, "#admission")).toBe(true);
  });
});

// Without a content database an unknown article slug renders the
// "unavailable" page, which still has the navbar and footer. With a database
// the same slug is a real 404 without them, so these tests skip.
async function gotoArticle(page: Page) {
  const response = await page.goto("/news/any-slug-at-all");
  test.skip(response?.status() === 404, "Needs the no-database article state.");
}

test.describe("section links from a non-homepage route", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("navbar section link goes to the homepage section", async ({ page }) => {
    await gotoArticle(page);
    await inlineNav(page).getByRole("link", { name: "About Us" }).click();
    await page.waitForURL(/\/#about$/);
    await expect.poll(() => inViewport(page, "#about")).toBe(true);
  });

  test("footer quick link goes to the homepage section", async ({ page }) => {
    await gotoArticle(page);
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Admission" })
      .click();
    await page.waitForURL(/\/#admission$/);
    await expect.poll(() => inViewport(page, "#admission")).toBe(true);
  });
});
