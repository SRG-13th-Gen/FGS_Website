import { expect, test } from "@playwright/test";

// Reveal and the hero entrance must never hide content from users without
// JavaScript or with reduced motion, and must not move the layout.
const invisibleCount = () =>
  [...document.querySelectorAll("main *")].filter((el) => {
    const style = getComputedStyle(el);
    return style.opacity === "0" || style.visibility === "hidden";
  }).length;

test.describe("JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  for (const path of ["/", "/alumni", "/pta"]) {
    test(`${path}: all content is visible and nothing carries a hidden state`, async ({
      page,
    }) => {
      await page.goto(path);
      await page.waitForTimeout(1000);
      expect(await page.evaluate(invisibleCount)).toBe(0);
      expect(await page.locator("[data-reveal]").count()).toBe(0);
    });
  }
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the homepage shows everything immediately, with no transitions applied", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("[data-reveal]")).toHaveCount(0);
    await expect(page.locator("h1.motion-enter")).toHaveCSS(
      "animation-name",
      "none",
    );
    expect(await page.evaluate(invisibleCount)).toBe(0);
  });
});

test.describe("with motion", () => {
  test("only content below the fold is hidden, and it is revealed on scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.waitForTimeout(300);
    const hiddenInView = await page.evaluate(
      () =>
        [...document.querySelectorAll('[data-reveal="hidden"]')].filter(
          (el) => el.getBoundingClientRect().top < innerHeight,
        ).length,
    );
    expect(hiddenInView).toBe(0);
    expect(
      await page.locator('[data-reveal="hidden"]').count(),
    ).toBeGreaterThan(0);

    const height = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    for (let y = 0; y < height; y += 350) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(80);
    }
    await expect(page.locator("[data-reveal]")).toHaveCount(0);
  });

  test("scrolling through the page causes no layout shift", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as {
          value: number;
          hadRecentInput: boolean;
        }[])
          if (!entry.hadRecentInput)
            (window as unknown as { __cls: number }).__cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const height = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    for (let y = 0; y < height; y += 350) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(800);
    const shift = await page.evaluate(
      () => (window as unknown as { __cls: number }).__cls,
    );
    expect(shift).toBeLessThan(0.01);
  });

  test("a deep link leaves the content above the target visible", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/#contact");
    await page.waitForTimeout(1000);
    const hiddenAbove = await page.evaluate(
      () =>
        [...document.querySelectorAll('[data-reveal="hidden"]')].filter(
          (el) => el.getBoundingClientRect().bottom < 0,
        ).length,
    );
    expect(hiddenAbove).toBe(0);
  });
});
