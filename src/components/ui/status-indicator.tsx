import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatusIndicatorTone = "neutral" | "info" | "success" | "warning" | "destructive" | "draft";
/** Both read the same: a dot and the text. Kept so callers that pass it still type-check. */
type StatusIndicatorPresentation = "dot" | "badge";

type StatusIndicatorProps = Omit<ComponentProps<"span">, "children"> & {
  label: ReactNode;
  /** @deprecated A status is always a dot and its text. */
  presentation?: StatusIndicatorPresentation;
  tone?: StatusIndicatorTone;
};

const DOTS: Record<StatusIndicatorTone, string> = {
  neutral: "bg-muted-foreground/60",
  info: "bg-status-info",
  success: "bg-status-success",
  warning: "bg-status-warning",
  destructive: "bg-destructive",
  // Not live yet: an outline, not a fill.
  draft: "border border-muted-foreground/70",
};

/** A status: one coloured dot and its text, the same in a table, a header or a line of text. */
function StatusIndicator({ className, label, tone = "neutral", ...props }: StatusIndicatorProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-1.5 text-sm leading-snug font-normal whitespace-nowrap",
        className,
      )}
      data-slot="status-indicator"
      data-tone={tone}
      {...props}
    >
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", DOTS[tone])} />
      <span className="min-w-0 truncate">{label}</span>
    </span>
  );
}

export { StatusIndicator, type StatusIndicatorProps, type StatusIndicatorTone };
