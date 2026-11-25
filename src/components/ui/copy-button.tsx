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
  /**
   * A copy control inside a line of text, such as a page's facts: its text reads at the size and
   * weight of the text beside it, and the ghost button's own padding sits outside the line's edge.
   */
  inline?: boolean;
  /** What a text button reads for a moment after copying. `null` keeps its own text. */
  copiedText?: React.ReactNode;
  /** What a text button reads for a moment when the browser refuses. `null` keeps its own text. */
  errorText?: React.ReactNode;
  /** Called after each copy with whether it worked, so the caller can offer the value by hand. */
  onCopyResult?: (copied: boolean) => void;
};

const INLINE = "-my-1 -ml-2 text-sm font-normal [&_svg:not([class*='size-'])]:size-3.5";

function CopyButton({
  children,
  className,
  copiedText = "Copied",
  errorText = "Couldn't copy",
  inline = false,
  label,
  onCopyResult,
  size = inline ? "xs" : "icon-xs",
  value,
  variant = "ghost",
  ...props
}: CopyButtonProps) {
  const { copy, status } = useCopyToClipboard();
  // Button padding only tightens for an icon that sits beside content.
  const iconPlacement = children ? "inline-end" : undefined;
  const text =
    children && status === "copied" && copiedText !== null
      ? copiedText
      : children && status === "error" && errorText !== null
        ? errorText
        : children;

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
        className={cn(inline && INLINE, className)}
        data-slot="copy-button"
        data-status={status}
        onClick={async () => {
          const copied = await copy(value);
          onCopyResult?.(copied);
        }}
        size={size}
        type="button"
        variant={variant}
        {...props}
      >
        {text}
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
