import * as React from "react";

import { Card } from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

function DataTableCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      data-component="data-table-card"
      className={cn(
        "gap-0 bg-muted/20 py-0 ring-border-subtle has-data-[empty-state]:border has-data-[empty-state]:border-dashed has-data-[empty-state]:border-border-subtle has-data-[empty-state]:ring-0",
        className,
      )}
      {...props}
    />
  );
}

function DataTableCardToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-table-card-toolbar"
      className={cn(
        "flex min-h-14 flex-col gap-4 border-b border-border-subtle bg-muted/30 p-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
      {...props}
    />
  );
}

function DataTableCardHeading({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-table-card-heading"
      className={cn("flex min-w-0 flex-1 flex-col gap-0", className)}
      {...props}
    />
  );
}

function DataTableCardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="data-table-card-title"
      className={cn("font-heading text-base leading-snug font-medium text-balance", className)}
      {...props}
    />
  );
}

function DataTableCardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="data-table-card-description"
      className={cn(
        "max-w-prose text-sm leading-snug text-balance text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function DataTableCardControls({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-table-card-controls"
      className={cn(
        "flex min-w-0 shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DataTableCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-table-card-content"
      className={cn("min-w-0 bg-card/80", className)}
      {...props}
    />
  );
}

function DataTableCardTable({ className, ...props }: React.ComponentProps<typeof Table>) {
  return (
    <Table
      data-component="data-table-card-table"
      className={cn(
        "min-w-full [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4",
        className,
      )}
      {...props}
    />
  );
}

function DataTableCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="data-table-card-footer"
      className={cn(
        "flex min-h-12 flex-col gap-3 border-t border-border-subtle bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      {...props}
    />
  );
}

type DataTableCardEmptyRowProps = Omit<React.ComponentProps<typeof TableRow>, "children"> & {
  cellClassName?: string;
  children: React.ReactNode;
  colSpan: number;
};

function DataTableCardEmptyRow({
  cellClassName,
  children,
  className,
  colSpan,
  ...props
}: DataTableCardEmptyRowProps) {
  return (
    <TableRow className={cn("hover:bg-transparent", className)} {...props}>
      <TableCell className={cn("h-40 p-0 whitespace-normal", cellClassName)} colSpan={colSpan}>
        {children}
      </TableCell>
    </TableRow>
  );
}

// A card holding an empty state trades its ring for a dashed border, which reads as "nothing here"
// rather than a surface with content. A card still waiting on data must not read that way, so the two
// are separate components: naming the state at the call site is what selects the treatment.
function DataTableCardEmptyState({ className, ...props }: React.ComponentProps<typeof Empty>) {
  return (
    <Empty
      data-component="data-table-card-empty-state"
      data-empty-state=""
      className={cn("min-h-40 rounded-none border-0 px-4 py-10", className)}
      {...props}
    />
  );
}

type DataTableCardLoadingStateProps = Omit<React.ComponentProps<typeof Empty>, "children"> & {
  label?: string;
};

function DataTableCardLoadingState({
  className,
  label = "Loading",
  ...props
}: DataTableCardLoadingStateProps) {
  return (
    <Empty
      aria-live="polite"
      data-component="data-table-card-loading-state"
      className={cn("min-h-40 gap-2 rounded-none border-0 px-4 py-10", className)}
      role="status"
      {...props}
    >
      <Spinner aria-hidden="true" className="text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </Empty>
  );
}

export {
  DataTableCard,
  DataTableCardContent,
  DataTableCardControls,
  DataTableCardDescription,
  DataTableCardEmptyRow,
  DataTableCardEmptyState,
  DataTableCardFooter,
  DataTableCardHeading,
  DataTableCardLoadingState,
  DataTableCardTable,
  DataTableCardTitle,
  DataTableCardToolbar,
  type DataTableCardEmptyRowProps,
  type DataTableCardLoadingStateProps,
};
