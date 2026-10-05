// @vitest-environment jsdom
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Reveal as RevealComponent } from "@/components/public/reveal";

// Loosely typed so children can be passed the way createElement expects.
const Reveal = RevealComponent as unknown as ComponentType<
  Record<string, unknown>
>;

// ---- Browser doubles -------------------------------------------------------
type Callback = (entries: { isIntersecting: boolean }[]) => void;
class FakeObserver {
  static instances: FakeObserver[] = [];
  observed: Element[] = [];
  disconnected = false;
  constructor(private callback: Callback) {
    FakeObserver.instances.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  disconnect() {
    this.disconnected = true;
  }
  trigger(isIntersecting: boolean) {
    this.callback([{ isIntersecting }]);
  }
}

let reduceMotion = false;
let motionListeners: Array<() => void> = [];
const VIEWPORT = 800;

function placeAt(top: number) {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    top,
    bottom: top + 100,
    left: 0,
    right: 100,
    width: 100,
    height: 100,
    x: 0,
    y: top,
    toJSON: () => ({}),
  });
}

function mount(props: { step?: number; className?: string; as?: "li" } = {}) {
  const view = render(
    createElement(
      Reveal,
      { ...props, className: props.className ?? "card" },
      createElement("p", null, "Card text"),
    ),
  );
  return view.container.firstElementChild as HTMLElement;
}

function transitionEnd(el: HTMLElement, propertyName = "opacity") {
  const event = new Event("transitionend", { bubbles: true });
  Object.defineProperty(event, "propertyName", { value: propertyName });
  act(() => {
    el.dispatchEvent(event);
  });
}

beforeEach(() => {
  FakeObserver.instances = [];
  reduceMotion = false;
  motionListeners = [];
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  vi.stubGlobal("innerHeight", VIEWPORT);
  vi.stubGlobal("matchMedia", (query: string) => ({
    // A getter, so a later change in the preference is seen.
    get matches() {
      return query.includes("prefers-reduced-motion") && reduceMotion;
    },
    addEventListener: (_: string, listener: () => void) =>
      motionListeners.push(listener),
    removeEventListener: (_: string, listener: () => void) => {
      motionListeners = motionListeners.filter((l) => l !== listener);
    },
  }));
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Reveal: visible by default", () => {
  it("server HTML has no hidden state, inline style or aria-hidden", () => {
    const html = renderToStaticMarkup(
      createElement(
        Reveal,
        { className: "card", step: 2 },
        createElement("p", null, "Card text"),
      ),
    );
    expect(html).toBe('<div class="card"><p>Card text</p></div>');
  });

  it("keeps the content in the DOM, never display none or aria-hidden", () => {
    placeAt(5000);
    const el = mount();
    expect(el.textContent).toBe("Card text");
    expect(el.getAttribute("aria-hidden")).toBeNull();
    expect(el.style.display).toBe("");
    expect(el.style.visibility).toBe("");
  });

  it("stays visible when IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    placeAt(5000);
    const el = mount();
    expect(el.style.opacity).toBe("");
    expect(el.dataset.reveal).toBeUndefined();
  });

  it("renders the requested element and class", () => {
    placeAt(5000);
    const view = render(
      createElement(
        "ul",
        null,
        createElement(
          Reveal,
          { as: "li", className: "item" },
          createElement("span", null, "x"),
        ),
      ),
    );
    expect(view.container.querySelector("li.item")).not.toBeNull();
  });
});

describe("Reveal: elements already in view are never hidden", () => {
  it.each([
    ["at the top of the viewport", 0],
    ["partly inside the viewport", VIEWPORT - 1],
    ["above the viewport", -500],
  ])("an element %s is left alone", (_label, top) => {
    placeAt(top);
    const el = mount();
    expect(el.style.opacity).toBe("");
    expect(el.style.transform).toBe("");
    expect(el.dataset.reveal).toBeUndefined();
    expect(FakeObserver.instances).toHaveLength(0);
  });
});

describe("Reveal: below the viewport", () => {
  it("hides after mount, then reveals once it scrolls into view", () => {
    placeAt(VIEWPORT + 400);
    const el = mount({ step: 2 });
    expect(el.dataset.reveal).toBe("hidden");
    expect(el.style.opacity).toBe("0");
    expect(el.style.transform).toBe("translateY(var(--motion-distance))");
    // Timing comes from the shared variables, staggered by step.
    expect(el.style.transition).toContain("var(--motion-duration)");
    expect(el.style.transition).toContain("var(--motion-stagger) * 2");

    const observer = FakeObserver.instances[0];
    expect(observer.observed).toEqual([el]);

    act(() => observer.trigger(false));
    expect(el.dataset.reveal).toBe("hidden");

    act(() => observer.trigger(true));
    expect(el.dataset.reveal).toBe("revealing");
    expect(el.style.opacity).toBe("1");
    expect(el.style.transform).toBe("translateY(0)");
    expect(observer.disconnected).toBe(true);
  });

  it("drops its inline styles when the transition ends", () => {
    placeAt(VIEWPORT + 400);
    const el = mount();
    act(() => FakeObserver.instances[0].trigger(true));
    transitionEnd(el);
    expect(el.style.cssText).toBe("");
    expect(el.dataset.reveal).toBeUndefined();
  });

  it("ignores transitions that bubble up from inside the card", () => {
    placeAt(VIEWPORT + 400);
    const el = mount();
    act(() => FakeObserver.instances[0].trigger(true));
    transitionEnd(el, "transform");
    expect(el.dataset.reveal).toBe("revealing");
  });

  it("caps the stagger so a long grid never waits long", () => {
    placeAt(VIEWPORT + 400);
    const el = mount({ step: 40 });
    expect(el.style.transition).toContain("var(--motion-stagger) * 3");
  });

  it("stops observing when it unmounts", () => {
    placeAt(VIEWPORT + 400);
    const view = render(
      createElement(Reveal, null, createElement("p", null, "x")),
    );
    view.unmount();
    expect(FakeObserver.instances[0].disconnected).toBe(true);
  });
});

describe("Reveal: reduced motion", () => {
  it("shows content immediately with no transition, even below the fold", () => {
    reduceMotion = true;
    placeAt(VIEWPORT + 400);
    const el = mount();
    expect(el.style.opacity).toBe("");
    expect(el.style.transition).toBe("");
    expect(el.dataset.reveal).toBeUndefined();
    expect(FakeObserver.instances).toHaveLength(0);
  });

  it("reveals at once if the preference turns on while hidden", () => {
    placeAt(VIEWPORT + 400);
    const el = mount();
    expect(el.dataset.reveal).toBe("hidden");
    reduceMotion = true;
    act(() => motionListeners.forEach((listener) => listener()));
    expect(el.style.cssText).toBe("");
    expect(el.dataset.reveal).toBeUndefined();
    expect(FakeObserver.instances[0].disconnected).toBe(true);
  });
});
