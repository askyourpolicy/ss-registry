"use client";

import * as React from "react";

import { TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type RowNavigationContextValue = {
  href: string;
  onNavigate?: (href: string) => void;
};

const RowNavigationContext = React.createContext<RowNavigationContextValue | null>(null);

type NavigableTableRowProps = Omit<React.ComponentProps<typeof TableRow>, "onClick"> & {
  href: string;
  onClick?: React.MouseEventHandler<HTMLTableRowElement>;
  onNavigate?: (href: string) => void;
};

function NavigableTableRow({
  className,
  href,
  onClick,
  onNavigate,
  ...props
}: NavigableTableRowProps) {
  return (
    <RowNavigationContext value={{ href, onNavigate }}>
      <TableRow
        className={cn("cursor-pointer", className)}
        data-slot="navigable-table-row"
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || event.button !== 0 || isInteractiveTarget(event.target)) {
            return;
          }

          if (event.metaKey || event.ctrlKey || event.shiftKey) {
            globalThis.open(href, "_blank", "noopener,noreferrer");
            return;
          }

          if (onNavigate) {
            onNavigate(href);
          } else {
            globalThis.location.assign(href);
          }
        }}
        {...props}
      />
    </RowNavigationContext>
  );
}

type NavigableTableRowLinkProps = Omit<React.ComponentProps<"a">, "href">;

function NavigableTableRowLink({ className, onClick, ...props }: NavigableTableRowLinkProps) {
  const navigation = React.useContext(RowNavigationContext);
  if (!navigation) {
    throw new Error("NavigableTableRowLink must be used inside NavigableTableRow.");
  }

  const { href, onNavigate } = navigation;
  return (
    <a
      className={cn(
        "font-medium focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
      data-slot="navigable-table-row-link"
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          !onNavigate ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.currentTarget.hasAttribute("download") ||
          (event.currentTarget.target !== "" && event.currentTarget.target !== "_self")
        ) {
          return;
        }

        event.preventDefault();
        onNavigate(href);
      }}
      {...props}
    />
  );
}

function isInteractiveTarget(target: EventTarget) {
  return (
    target instanceof Element &&
    target.closest(
      "a, button, input, label, select, summary, textarea, [role='button'], [role='link'], [contenteditable='true'], [data-row-action]",
    ) !== null
  );
}

export {
  NavigableTableRow,
  NavigableTableRowLink,
  type NavigableTableRowLinkProps,
  type NavigableTableRowProps,
};
