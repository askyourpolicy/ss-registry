import { describe, expect, it } from "vitest";

import {
  clampPage,
  getPageCount,
  getPaginationItems,
  getPaginationRange,
} from "@/components/ui/pagination-controls";

describe("pagination helpers", () => {
  it("calculates page counts and safely handles zero or invalid values", () => {
    expect(getPageCount(0, 25)).toBe(0);
    expect(getPageCount(-10, 25)).toBe(0);
    expect(getPageCount(51, 25)).toBe(3);
    expect(getPageCount(3, 0)).toBe(3);
  });

  it("clamps one-indexed pages, including an empty result set", () => {
    expect(clampPage(-2, 5)).toBe(1);
    expect(clampPage(8, 5)).toBe(5);
    expect(clampPage(3, 0)).toBe(1);
  });

  it("returns stable item ranges for empty and out-of-range pages", () => {
    expect(getPaginationRange(4, 20, 0)).toEqual({
      firstItem: 0,
      lastItem: 0,
      page: 1,
      pageCount: 0,
      totalItems: 0,
    });
    expect(getPaginationRange(99, 20, 45)).toEqual({
      firstItem: 41,
      lastItem: 45,
      page: 3,
      pageCount: 3,
      totalItems: 45,
    });
  });

  it("builds compact page lists with useful edge ranges", () => {
    expect(getPaginationItems(1, 4)).toEqual([1, 2, 3, 4]);
    expect(getPaginationItems(1, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
    expect(getPaginationItems(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
    expect(getPaginationItems(10, 10)).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
  });
});
