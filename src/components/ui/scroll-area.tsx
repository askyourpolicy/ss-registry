"use client";

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import type * as React from "react";

import { cn } from "@/lib/utils";

// Fades the content out at each edge that has more beyond it, over the distance there is left to
// scroll (at most --scroll-area-fade), so nothing fades at an edge the content has reached. The
// distances are Base UI's, set on the viewport as it scrolls.
const FADE = [
  "[--scroll-area-fade:1.5rem] [mask-composite:intersect]",
  "[mask-image:linear-gradient(to_bottom,transparent,black_min(var(--scroll-area-fade),var(--scroll-area-overflow-y-start,0px)),black_calc(100%_-_min(var(--scroll-area-fade),var(--scroll-area-overflow-y-end,0px))),transparent),linear-gradient(to_right,transparent,black_min(var(--scroll-area-fade),var(--scroll-area-overflow-x-start,0px)),black_calc(100%_-_min(var(--scroll-area-fade),var(--scroll-area-overflow-x-end,0px))),transparent)]",
].join(" ");

function ScrollArea({
  className,
  children,
  fade = false,
  scrollbar = true,
  viewportRef,
  ...props
}: ScrollAreaPrimitive.Root.Props & {
  /** Fade the content out at the edges that have more to scroll to. */
  fade?: boolean;
  /** Show a scrollbar while the area is in use. Without one, a fade says there is more. */
  scrollbar?: boolean;
  /** The element that scrolls, to read or set its position. */
  viewportRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        ref={viewportRef}
        className={cn(
          "size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
          fade && FADE,
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {scrollbar ? <ScrollBar /> : null}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none p-px opacity-0 transition-opacity select-none data-hovering:opacity-100 data-scrolling:opacity-100 data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };
