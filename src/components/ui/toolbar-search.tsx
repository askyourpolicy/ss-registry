"use client";

import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

/** List-toolbar search: icon prefix, clear button once there's a query. */
function ToolbarSearch({
  className,
  clearLabel = "Clear search",
  invalid,
  label,
  onChange,
  title,
  type = "text",
  value,
}: {
  className?: string;
  /** Accessible name of the clear button. */
  clearLabel?: string;
  /** The server refused this text. */
  invalid?: boolean;
  /** Accessible name and placeholder of the input. */
  label: string;
  onChange: (value: string) => void;
  title?: string;
  /** "search" makes the box a searchbox for assistive tech. The browser's own clear button stays hidden. */
  type?: "text" | "search";
  value: string;
}) {
  return (
    <InputGroup className={cn("min-w-56 flex-1", className)}>
      <InputGroupAddon>
        <MagnifyingGlassIcon />
      </InputGroupAddon>
      <InputGroupInput
        aria-invalid={invalid || undefined}
        aria-label={label}
        className="[&::-webkit-search-cancel-button]:appearance-none"
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        title={title}
        type={type}
        value={value}
      />
      {value ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label={clearLabel} onClick={() => onChange("")} size="icon-xs">
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}

export { ToolbarSearch };
