import * as React from "react";

import { cn } from "@/lib/utils";

function Timeline({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      className={cn("m-0 flex list-none flex-col p-0", className)}
      data-slot="timeline"
      {...props}
    />
  );
}

function TimelineItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      className={cn("grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3", className)}
      data-slot="timeline-item"
      {...props}
    />
  );
}

function TimelineRail({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-h-full flex-col items-center", className)}
      data-slot="timeline-rail"
      {...props}
    />
  );
}

function TimelineIndicator({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground",
        className,
      )}
      data-slot="timeline-indicator"
      {...props}
    />
  );
}

function TimelineConnector({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn("mt-1 w-px flex-1 bg-border-subtle", className)}
      data-slot="timeline-connector"
      {...props}
    />
  );
}

function TimelineContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("min-w-0 pb-4", className)} data-slot="timeline-content" {...props} />;
}

export {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineIndicator,
  TimelineItem,
  TimelineRail,
};
