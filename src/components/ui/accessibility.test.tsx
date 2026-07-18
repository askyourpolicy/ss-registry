import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EmptyDescription } from "@/components/ui/empty";
import { JsonViewer } from "@/components/ui/json-viewer";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { StatusIndicator } from "@/components/ui/status-indicator";

describe("component accessibility semantics", () => {
  it("uses keyboard-operable disclosure buttons in the JSON viewer", async () => {
    const user = userEvent.setup();
    render(<JsonViewer data={{ nested: { value: 1 } }} />);

    const rootToggle = screen.getByRole("button", { name: "Expand root" });
    expect(rootToggle).toHaveAttribute("aria-expanded", "false");

    rootToggle.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: "Collapse root" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: "Expand nested" })).toBeInTheDocument();
  });

  it("keeps paragraph and heading semantics in empty and page-header content", () => {
    render(
      <>
        <PageHeader title="Registry catalog" />
        <EmptyDescription>No registry items match.</EmptyDescription>
      </>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Registry catalog" })).toBeInTheDocument();
    expect(screen.getByText("No registry items match.").tagName).toBe("P");
  });

  it("always renders a textual status label", () => {
    render(<StatusIndicator label="Operational" tone="success" />);

    const indicator = screen.getByText("Operational").closest("[data-slot='status-indicator']");
    expect(indicator).toHaveTextContent("Operational");
    expect(indicator?.querySelector("[aria-hidden='true']")).toBeInTheDocument();
  });

  it("marks the current page and disables movement for empty results", () => {
    const onPageChange = vi.fn();
    const { rerender } = render(
      <PaginationControls onPageChange={onPageChange} page={2} pageSize={10} totalItems={25} />,
    );

    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to page 2" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    rerender(
      <PaginationControls onPageChange={onPageChange} page={8} pageSize={10} totalItems={0} />,
    );

    expect(screen.getByText("0 items")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Go to next page" })).toBeDisabled();
  });
});
