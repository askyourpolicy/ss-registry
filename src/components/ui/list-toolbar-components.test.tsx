import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { CatalogCard, CatalogTile } from "@/components/ui/catalog-card";
import { FilterSelect } from "@/components/ui/filter-select";
import { PageBackButton } from "@/components/ui/page-back-button";
import { ToolbarSearch } from "@/components/ui/toolbar-search";

function Glyph({ className }: { className?: string }) {
  return <svg className={className} />;
}

describe("list toolbar and catalog components", () => {
  it("labels the filter select with its prefix and reports the chosen key", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterSelect
        label="Status"
        onChange={onChange}
        options={[
          { key: "all", label: "All", count: 3 },
          { key: "live", label: "Live", count: 1 },
        ]}
        value="all"
      />,
    );

    const select = screen.getByRole("combobox", { name: "Status" });
    expect(screen.getByRole("option", { name: "Live (1)" })).toBeInTheDocument();
    await user.selectOptions(select, "live");
    expect(onChange).toHaveBeenCalledWith("live");
  });

  it("shows a clear button only while the search has a query", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <ToolbarSearch label="Search items" onChange={onChange} value="" />,
    );

    expect(screen.getByRole("textbox", { name: "Search items" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();

    rerender(
      <ToolbarSearch clearLabel="Clear" label="Search items" onChange={onChange} value="abc" />,
    );
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("renders a catalog card as a link only when it has a destination", () => {
    const { rerender } = render(
      <CatalogCard media={<CatalogTile icon={Glyph} />} subtitle="Rulebook" title="Claims" />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    rerender(
      <CatalogCard
        href="/rulebooks/1"
        media={<CatalogTile icon={Glyph} />}
        meta={["3 rules", "v2"]}
        subtitle="Rulebook"
        title="Claims"
      />,
    );
    expect(screen.getByRole("link", { name: /Claims/ })).toHaveAttribute("href", "/rulebooks/1");

    rerender(
      <CatalogCard
        media={<CatalogTile icon={Glyph} />}
        render={<a data-router="" href="/rulebooks/2" />}
        subtitle="Rulebook"
        title="Claims"
      />,
    );
    expect(screen.getByRole("link", { name: /Claims/ })).toHaveAttribute("href", "/rulebooks/2");
  });

  it("falls back to the given route when there is no history to go back to", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [
        { path: "/", element: <p>Home</p> },
        { path: "/detail", element: <PageBackButton fallback="/" /> },
      ],
      { initialEntries: ["/detail"] },
    );
    render(<RouterProvider router={router} />);

    await user.click(screen.getByRole("button", { name: "Go back" }));
    expect(await screen.findByText("Home")).toBeInTheDocument();
  });
});
