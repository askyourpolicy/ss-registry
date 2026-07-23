import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatusIndicatorTone = "neutral" | "info" | "success" | "warning" | "destructive";
type StatusIndicatorPresentation = "dot" | "badge";

type StatusIndicatorProps = Omit<ComponentProps<"span">, "children"> & {
  label: ReactNode;
  presentation?: StatusIndicatorPresentation;
  tone?: StatusIndicatorTone;
};

const toneClasses: Record<
  StatusIndicatorTone,
  {
    badge: string;
    dot: string;
  }
> = {
  neutral: {
    badge: "border-border-subtle bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/60 dark:bg-muted-foreground/80",
  },
  info: {
    badge: "border-status-info/25 bg-status-info-muted text-status-info-muted-foreground",
    dot: "bg-status-info/60 dark:bg-status-info/80",
  },
  success: {
    badge: "border-status-success/25 bg-status-success-muted text-status-success-muted-foreground",
    dot: "bg-status-success/60 dark:bg-status-success/80",
  },
  warning: {
    badge: "border-status-warning/25 bg-status-warning-muted text-status-warning-muted-foreground",
    dot: "bg-status-warning/60 dark:bg-status-warning/80",
  },
  destructive: {
    badge: "border-destructive/20 bg-destructive/10 text-destructive",
    dot: "bg-destructive/60 dark:bg-destructive/80",
  },
};

function StatusIndicator({
  className,
  label,
  presentation = "dot",
  tone = "neutral",
  ...props
}: StatusIndicatorProps) {
  const styles = toneClasses[tone];

  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-1.5 text-sm leading-snug font-medium",
        presentation === "badge" && "rounded-full border px-2 py-0.5 text-xs whitespace-nowrap",
        presentation === "badge" && styles.badge,
        className,
      )}
      data-presentation={presentation}
      data-slot="status-indicator"
      data-tone={tone}
      {...props}
    >
      <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", styles.dot)} />
      <span className="min-w-0 text-balance">{label}</span>
    </span>
  );
}

export {
  StatusIndicator,
  type StatusIndicatorPresentation,
  type StatusIndicatorProps,
  type StatusIndicatorTone,
};
