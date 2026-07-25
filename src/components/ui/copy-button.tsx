"use client";

import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

type CopyButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick" | "value"> & {
  /** Names what is being copied, e.g. "setup key" renders "Copy setup key". */
  label: string;
  value: string;
};

function CopyButton({
  children,
  label,
  size = "icon-xs",
  value,
  variant = "ghost",
  ...props
}: CopyButtonProps) {
  const { copy, status } = useCopyToClipboard();
  // Button padding only tightens for an icon that sits beside content.
  const iconPlacement = children ? "inline-end" : undefined;

  return (
    <>
      <Button
        aria-label={
          status === "copied"
            ? `${label} copied`
            : status === "error"
              ? `Copy ${label} failed. Try again`
              : `Copy ${label}`
        }
        data-slot="copy-button"
        onClick={() => void copy(value)}
        size={size}
        type="button"
        variant={variant}
        {...props}
      >
        {children}
        {status === "copied" ? (
          <CheckIcon className="text-status-success" data-icon={iconPlacement} weight="bold" />
        ) : (
          <CopyIcon
            className={cn("text-muted-foreground", status === "error" && "text-destructive")}
            data-icon={iconPlacement}
          />
        )}
      </Button>
      <span aria-live="polite" className="sr-only" role="status">
        {status === "copied"
          ? `${label} copied to clipboard.`
          : status === "error"
            ? `${label} could not be copied. Try again.`
            : ""}
      </span>
    </>
  );
}

export { CopyButton };
