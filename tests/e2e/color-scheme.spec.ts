import { expect, test, type Page } from "@playwright/test";

// The site has one light design (DEC-122). With the visitor's OS in dark mode
// the page must not get the .dark class and must look the same as in light.
test.use({ colorScheme: "dark" });

/** Resolve any CSS color (including lab/oklch) to sRGB [r, g, b, a] via canvas. */
async function lightness(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const toRgba = (css: string) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return { r, g, b, a: a / 255 };
      };
      // Composite the element's background over its ancestors, then white.
      let r = 255;
      let g = 255;
      let b = 255;
      const chain: Element[] = [];
      for (let node: Element | null = el; node; node = node.parentElement)
        chain.unshift(node);
      for (const node of chain) {
        const c = toRgba(getComputedStyle(node).backgroundColor);
        r = c.r * c.a + r * (1 - c.a);
        g = c.g * c.a + g * (1 - c.a);
        b = c.b * c.a + b * (1 - c.a);
      }
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    });
}

async function expectLight(page: Page) {
  const html = page.locator("html");
  await expect(html).not.toHaveClass(/(^|\s)dark(\s|$)/);
  await expect(html).toHaveCSS("color-scheme", "light");
  expect(await lightness(page, "body")).toBeGreaterThan(0.95);
}

/** Wait for client-rendered parts (the Clubs carousel dots) so both snapshots match. */
async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page
    .locator('#clubs [aria-label^="Go to slide"]')
    .first()
    .waitFor({ timeout: 3000 })
    .catch(() => {});
}

/** Every element's text, background and border colors, for a before/after comparison. */
const colorSnapshot = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("body *")]
      // Skip custom elements such as the Next.js dev overlay.
      .filter((el) => !el.localName.includes("-"))
      .map((el) => {
        const style = getComputedStyle(el);
        return [style.color, style.backgroundColor, style.borderTopColor].join(
          "|",
        );
      }),
  );

for (const path of ["/", "/alumni", "/pta"]) {
  test(`${path} stays light when the OS prefers dark`, async ({ page }) => {
    await page.goto(path);
    await expectLight(page);
    // The section and page surfaces are light, not the dark token.
    expect(await lightness(page, "main")).toBeGreaterThan(0.95);
  });
}

test("/alumni activities section has a light surface", async ({ page }) => {
  await page.goto("/alumni");
  expect(await lightness(page, "#alumni-activities")).toBeGreaterThan(0.95);
});

test("an article page (or its unavailable state) stays light", async ({
  page,
}) => {
  // Use a real article when the content database has one.
  await page.goto("/");
  const first = page.locator('a[href^="/news/"]').first();
  const href = (await first.count()) ? await first.getAttribute("href") : null;
  const response = await page.goto(href ?? "/news/any-slug-at-all");
  test.skip(response?.status() === 404, "No article page available here.");
  await expectLight(page);
  expect(await lightness(page, "main")).toBeGreaterThan(0.95);
});

test("a missing page stays light", async ({ page }) => {
  await page.goto("/news/definitely-not-an-article");
  await expectLight(page);
});

test("the homepage looks the same in dark and light OS modes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await settle(page);
  const dark = await colorSnapshot(page);
  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  await settle(page);
  const light = await colorSnapshot(page);
  expect(dark).toEqual(light);
});

test("a stored dark theme from before is ignored", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.goto("/");
  await expectLight(page);
});
