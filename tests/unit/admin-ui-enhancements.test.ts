// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { metadata } from "@/app/layout";
import { RepeatableList } from "@/components/admin/fields";
import {
  SECTION_ICON_LABELS,
  SECTION_ICON_NAMES,
} from "@/lib/content/sections/icons";

afterEach(cleanup);

describe("Root layout metadata", () => {
  it("configures the school logo as the tab icon (favicon and apple-touch-icon)", () => {
    expect(metadata.icons).toBeDefined();
    const icons = metadata.icons as {
      icon: Array<{ url: string; type?: string }>;
      shortcut: string;
      apple: Array<{ url: string; type?: string }>;
    };

    expect(icons.icon).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "/images/logo/fgs-logo-website-1.webp",
          type: "image/webp",
        }),
      ]),
    );
    expect(icons.shortcut).toBe("/images/logo/fgs-logo-website-1.webp");
    expect(icons.apple).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: "/images/logo/fgs-logo-website-1.webp",
          type: "image/webp",
        }),
      ]),
    );
  });
});

describe("Section icon labels", () => {
  it("provides a non-empty human-readable label for every section icon", () => {
    for (const name of SECTION_ICON_NAMES) {
      const label = SECTION_ICON_LABELS[name];
      expect(label).toBeDefined();
      expect(typeof label).toBe("string");
      expect(label.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("RepeatableList layout flexibility", () => {
  it("renders with grid layout when gridClassName is supplied", () => {
    const { container } = render(
      createElement(RepeatableList<{ id: string; text: string }>, {
        label: "Contact Cards",
        itemLabel: "card",
        items: [{ id: "1", text: "Main Office" }],
        createItem: () => ({ id: "2", text: "" }),
        onChange: () => {},
        gridClassName: "grid-cols-1 md:grid-cols-2 gap-4",
        renderItem: (item: { text: string }) =>
          createElement("div", null, item.text),
      }),
    );

    const gridContainer = container.querySelector(".grid");
    expect(gridContainer).not.toBeNull();
    expect(gridContainer?.className).toContain(
      "grid-cols-1 md:grid-cols-2 gap-4",
    );
  });

  it("defaults to space-y-4 vertical layout when gridClassName is omitted", () => {
    const { container } = render(
      createElement(RepeatableList<{ id: string; text: string }>, {
        label: "Contact Cards",
        itemLabel: "card",
        items: [{ id: "1", text: "Main Office" }],
        createItem: () => ({ id: "2", text: "" }),
        onChange: () => {},
        renderItem: (item: { text: string }) =>
          createElement("div", null, item.text),
      }),
    );

    const spaceContainer = container.querySelector(".space-y-4");
    expect(spaceContainer).not.toBeNull();
  });
});
