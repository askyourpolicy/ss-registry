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
  label,
  onChange,
  title,
  value,
}: {
  className?: string;
  /** Accessible name of the clear button. */
  clearLabel?: string;
  /** Accessible name and placeholder of the input. */
  label: string;
  onChange: (value: string) => void;
  title?: string;
  value: string;
}) {
  return (
    <InputGroup className={cn("min-w-56 flex-1", className)}>
      <InputGroupAddon>
        <MagnifyingGlassIcon />
      </InputGroupAddon>
      <InputGroupInput
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        title={title}
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
