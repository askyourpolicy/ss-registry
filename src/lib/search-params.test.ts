import { describe, expect, it } from "vitest";

import { buildSearchParamsHref, patchSearchParams } from "@/lib/search-params";

describe("search parameter helpers", () => {
  it("patches a clone with primitive values and removes nullish values", () => {
    const current = new URLSearchParams("query=old&page=3&archived=true&cursor=next");

    const next = patchSearchParams(current, {
      archived: false,
      cursor: undefined,
      limit: 25,
      page: null,
      query: "new",
    });

    expect(next.toString()).toBe("query=new&archived=false&limit=25");
    expect(current.toString()).toBe("query=old&page=3&archived=true&cursor=next");
  });

  it("applies reset keys before patches and omits configured defaults", () => {
    const current = new URLSearchParams("page=1&cursor=next&sort=name&archived=false");

    const next = patchSearchParams(
      current,
      {
        page: 2,
        query: "stitch",
        sort: "name",
      },
      {
        defaults: {
          archived: false,
          page: 1,
          sort: "name",
        },
        resetKeys: ["page", "cursor"],
      },
    );

    expect(next.toString()).toBe("page=2&query=stitch");
  });

  it("builds hrefs without a dangling query and preserves fragments", () => {
    const current = new URLSearchParams("query=stitch&page=1");

    expect(
      buildSearchParamsHref(
        "/catalog#results",
        current,
        { exact: true, page: 2 },
        { defaults: { page: 1 } },
      ),
    ).toBe("/catalog?query=stitch&page=2&exact=true#results");

    expect(
      buildSearchParamsHref(
        "/catalog#results",
        new URLSearchParams("page=1"),
        {},
        { defaults: { page: 1 } },
      ),
    ).toBe("/catalog#results");
  });
});
