// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

const embla = vi.hoisted(() => {
  const listeners = new Map<string, Set<() => void>>();
  return {
    listeners,
    api: {
      canScrollPrev: vi.fn(() => false),
      canScrollNext: vi.fn(() => true),
      scrollPrev: vi.fn(),
      scrollNext: vi.fn(),
      on: (event: string, callback: () => void) => {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event)?.add(callback);
      },
      off: (event: string, callback: () => void) => {
        listeners.get(event)?.delete(callback);
      },
    },
  };
});

vi.mock("embla-carousel-react", () => ({
  default: () => [() => {}, embla.api],
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("registry subscription compatibility", () => {
  it("tracks media-query changes and removes listeners on unmount", () => {
    let matches = false;
    const listeners = new Set<() => void>();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        get matches() {
          return matches;
        },
        addEventListener: (_: string, callback: () => void) =>
          listeners.add(callback),
        removeEventListener: (_: string, callback: () => void) =>
          listeners.delete(callback),
      })),
    );

    function Viewport() {
      return createElement("span", null, useIsMobile() ? "mobile" : "desktop");
    }

    const { unmount } = render(createElement(Viewport));
    expect(screen.getByText("desktop")).toBeTruthy();
    act(() => {
      matches = true;
      listeners.forEach((callback) => callback());
    });
    expect(screen.getByText("mobile")).toBeTruthy();
    unmount();
    expect(listeners.size).toBe(0);
  });

  it("updates carousel navigation and cleans up both Embla event subscriptions", () => {
    const { unmount } = render(
      createElement(
        Carousel,
        null,
        createElement(CarouselPrevious),
        createElement(CarouselNext),
      ),
    );

    const previous = screen.getByRole("button", { name: "Previous slide" });
    const next = screen.getByRole("button", { name: "Next slide" });
    expect(previous.hasAttribute("disabled")).toBe(true);
    expect(next.hasAttribute("disabled")).toBe(false);

    act(() => {
      embla.api.canScrollPrev.mockReturnValue(true);
      embla.api.canScrollNext.mockReturnValue(false);
      embla.listeners.get("select")?.forEach((callback) => callback());
    });
    expect(previous.hasAttribute("disabled")).toBe(false);
    expect(next.hasAttribute("disabled")).toBe(true);

    act(() => {
      embla.api.canScrollPrev.mockReturnValue(false);
      embla.api.canScrollNext.mockReturnValue(true);
      embla.listeners.get("reInit")?.forEach((callback) => callback());
    });
    expect(previous.hasAttribute("disabled")).toBe(true);
    expect(next.hasAttribute("disabled")).toBe(false);
    unmount();
    expect(embla.listeners.get("select")?.size).toBe(0);
    expect(embla.listeners.get("reInit")?.size).toBe(0);
  });
});
