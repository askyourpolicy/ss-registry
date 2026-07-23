import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AccountMenu, AccountMenuAvatar } from "@/components/ui/account-menu";
import {
  AuthShell,
  AuthShellBrand,
  AuthShellCard,
  AuthShellContent,
  AuthShellHeader,
} from "@/components/ui/auth-shell";
import {
  DataTableCard,
  DataTableCardContent,
  DataTableCardControls,
  DataTableCardDescription,
  DataTableCardEmptyRow,
  DataTableCardEmptyState,
  DataTableCardHeading,
  DataTableCardTable,
  DataTableCardTitle,
  DataTableCardToolbar,
} from "@/components/ui/data-table-card";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { BrandLockup, StitchMark } from "@/components/ui/stitch-brand";
import { TableBody } from "@/components/ui/table";

describe("catalog component semantics", () => {
  it("renders a valid empty table row with one horizontal scroll container", () => {
    const { container } = render(
      <DataTableCard>
        <DataTableCardContent>
          <DataTableCardTable>
            <TableBody>
              <DataTableCardEmptyRow colSpan={4}>
                <DataTableCardEmptyState>
                  <EmptyHeader>
                    <EmptyTitle>No results</EmptyTitle>
                    <EmptyDescription>Try changing the filters.</EmptyDescription>
                  </EmptyHeader>
                </DataTableCardEmptyState>
              </DataTableCardEmptyRow>
            </TableBody>
          </DataTableCardTable>
        </DataTableCardContent>
      </DataTableCard>,
    );

    expect(screen.getByRole("cell")).toHaveAttribute("colspan", "4");
    expect(screen.getByText("No results")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-slot='table-container']")).toHaveLength(1);
  });

  it("composes table headings and controls inside the table surface", () => {
    render(
      <DataTableCard>
        <DataTableCardToolbar>
          <DataTableCardHeading>
            <DataTableCardTitle>Recent files</DataTableCardTitle>
            <DataTableCardDescription>
              Files received from connected sources.
            </DataTableCardDescription>
          </DataTableCardHeading>
          <DataTableCardControls>
            <button type="button">Refresh</button>
          </DataTableCardControls>
        </DataTableCardToolbar>
      </DataTableCard>,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Recent files" });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText("Files received from connected sources.").tagName).toBe("P");
    expect(heading.closest("[data-slot='data-table-card-heading']")).toHaveClass("gap-0");
    expect(heading.closest("[data-slot='data-table-card-toolbar']")).toHaveClass("sm:items-start");
    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
  });

  it("provides accessible brand and authentication layout semantics", () => {
    render(
      <>
        <StitchMark title="Stitch mark" />
        <AuthShell>
          <AuthShellBrand>
            <BrandLockup applicationName="Console" subtitle="Secure access" />
          </AuthShellBrand>
          <AuthShellCard>
            <AuthShellHeader>Sign in</AuthShellHeader>
            <AuthShellContent>Form fields</AuthShellContent>
          </AuthShellCard>
        </AuthShell>
      </>,
    );

    const mark = screen.getByRole("img", { name: "Stitch mark" });
    expect(mark).toHaveAttribute("viewBox", "0 0 27 26");
    expect(mark.querySelector("g")).toHaveAttribute("fill", "currentColor");
    expect([...mark.querySelectorAll("path")].map((path) => path.getAttribute("d"))).toEqual([
      "M26.7548 0H.0765533v7.72974H26.7548z",
      "M.0771675 26H26.7555v-7.7297H.0771675z",
      "M7.85772 0H.0765533v14.2883H7.85772z",
      "M26.7555 26h-7.7812V11.7117h7.7812z",
    ]);
    expect(screen.getByRole("main")).toHaveAttribute("data-slot", "auth-shell");
    expect(screen.getByText("Console")).toBeInTheDocument();
    expect(screen.getByText("Secure access")).toBeInTheDocument();
  });

  it("opens account actions from the keyboard without prescribing behavior", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AccountMenu
        avatar={<AccountMenuAvatar fallback="AL" />}
        description="ada@example.com"
        name="Ada Lovelace"
      >
        <DropdownMenuItem onClick={onSelect}>Preferences</DropdownMenuItem>
      </AccountMenu>,
    );

    screen.getByRole("button", { name: "Open account menu" }).focus();
    await user.keyboard("{Enter}");
    await user.click(await screen.findByRole("menuitem", { name: "Preferences" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
