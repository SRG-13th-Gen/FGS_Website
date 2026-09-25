import { describe, expect, it } from "vitest";

import { reorderArray } from "@/lib/wordpress/sections/reorder";

describe("reorderArray", () => {
  it("moves an item up", () => {
    expect(reorderArray(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
  });

  it("moves an item down", () => {
    expect(reorderArray(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"]);
  });

  it("is a no-op moving the first item up", () => {
    expect(reorderArray(["a", "b", "c"], 0, -1)).toEqual(["a", "b", "c"]);
  });

  it("is a no-op moving the last item down", () => {
    expect(reorderArray(["a", "b", "c"], 2, 1)).toEqual(["a", "b", "c"]);
  });

  it("does not mutate the original array", () => {
    const original = ["a", "b", "c"];
    reorderArray(original, 0, 1);
    expect(original).toEqual(["a", "b", "c"]);
  });

  it("is a no-op on an out-of-range index", () => {
    expect(reorderArray(["a", "b"], 5, 1)).toEqual(["a", "b"]);
  });
});
