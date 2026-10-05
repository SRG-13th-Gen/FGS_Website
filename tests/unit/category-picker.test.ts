// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// The picker module pulls in the media picker (server actions); stub it.
vi.mock("@/components/admin/media-picker", () => ({
  MediaPickerDialog: () => null,
}));

import { ArticleCategoryPicker } from "@/components/admin/article-fields";
import { ARTICLE_CATEGORIES } from "@/lib/content/types";

afterEach(cleanup);

describe("ArticleCategoryPicker layout", () => {
  const renderPicker = () =>
    render(
      createElement(ArticleCategoryPicker, {
        value: "announcements",
        onChange: () => {},
      }),
    );

  it("renders one card per category", () => {
    const { container } = renderPicker();
    expect(container.querySelectorAll("button")).toHaveLength(
      ARTICLE_CATEGORIES.length,
    );
  });

  it("keeps every card the same size, with no full-width card", () => {
    const { container } = renderPicker();
    const grid = container.querySelector("button")!.parentElement!;
    // Equal rows make every card as tall as the tallest one.
    expect(grid.className).toContain("auto-rows-fr");
    // One column on phones, two from sm.
    expect(grid.className).toContain("sm:grid-cols-2");
    expect(grid.className).not.toMatch(/grid-cols-3/);
    // No card (the fifth included) spans more than one column.
    expect(grid.className).not.toMatch(/col-span|last-child|nth-child/);
    for (const button of container.querySelectorAll("button")) {
      expect(button.className).toContain("h-full");
      expect(button.className).toContain("w-full");
      expect(button.className).not.toMatch(/col-span/);
    }
  });
});
