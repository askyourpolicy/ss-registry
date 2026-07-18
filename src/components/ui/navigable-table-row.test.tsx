import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NavigableTableRow, NavigableTableRowLink } from "@/components/ui/navigable-table-row";
import { Table, TableBody, TableCell } from "@/components/ui/table";

describe("NavigableTableRow", () => {
  it("navigates from non-interactive cells and the title link", () => {
    const onNavigate = vi.fn();
    renderTable(onNavigate);

    fireEvent.click(screen.getByText("Other data"));
    fireEvent.click(screen.getByRole("link", { name: "Example record" }));

    expect(onNavigate).toHaveBeenNthCalledWith(1, "/details");
    expect(onNavigate).toHaveBeenNthCalledWith(2, "/details");
  });

  it("leaves nested controls independent from row navigation", () => {
    const onNavigate = vi.fn();
    const onAction = vi.fn();
    renderTable(onNavigate, onAction);

    fireEvent.click(screen.getByRole("button", { name: "Row action" }));

    expect(onAction).toHaveBeenCalledOnce();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("retains a real destination for native link behavior", () => {
    renderTable(vi.fn());

    expect(screen.getByRole("link", { name: "Example record" })).toHaveAttribute(
      "href",
      "/details",
    );
  });
});

function renderTable(onNavigate: (href: string) => void, onAction = vi.fn()) {
  render(
    <Table>
      <TableBody>
        <NavigableTableRow href="/details" onNavigate={onNavigate}>
          <TableCell>
            <NavigableTableRowLink>Example record</NavigableTableRowLink>
          </TableCell>
          <TableCell>Other data</TableCell>
          <TableCell>
            <button onClick={onAction} type="button">
              Row action
            </button>
          </TableCell>
        </NavigableTableRow>
      </TableBody>
    </Table>,
  );
}
