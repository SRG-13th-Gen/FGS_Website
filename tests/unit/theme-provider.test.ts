// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Providers } from "@/components/providers";

// The site has one light design (DEC-122): the provider must keep the .dark
// class off whatever the OS or a stored theme says.
function stubPreferences(prefersDark: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("prefers-color-scheme: dark") && prefersDark,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
}

beforeEach(() => {
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Providers", () => {
  it("does not add the dark class when the OS prefers dark", () => {
    stubPreferences(true);
    render(createElement(Providers, null, createElement("p", null, "x")));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("ignores a dark theme stored by an earlier visit", () => {
    stubPreferences(true);
    localStorage.setItem("theme", "dark");
    render(createElement(Providers, null, createElement("p", null, "x")));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("is light when the OS prefers light too", () => {
    stubPreferences(false);
    render(createElement(Providers, null, createElement("p", null, "x")));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
