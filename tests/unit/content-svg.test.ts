import { describe, it, expect } from "vitest";
import { isSafeSvg } from "@/lib/content/svg";
const bytes = (text: string) => new TextEncoder().encode(text);
describe("imported static SVG icons", () => {
  it("allows static geometry and local gradients", () =>
    expect(
      isSafeSvg(
        bytes(
          '<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fill"><stop stop-color="green"/></linearGradient></defs><path fill="url(#fill)" d="M0 0h10v10z"/></svg>',
        ),
      ),
    ).toBe(true));
  it.each([
    "<svg><script>bad()</script></svg>",
    '<svg onload="bad()"/>',
    "<svg><foreignObject>active</foreignObject></svg>",
    "<!DOCTYPE svg><svg/>",
    '<svg><image href="https://external.example/a.png"/></svg>',
    '<svg><path fill="url(https://external.example/a)"/></svg>',
    "<html/>",
  ])("rejects active or external markup %s", (text) =>
    expect(isSafeSvg(bytes(text))).toBe(false),
  );
});
