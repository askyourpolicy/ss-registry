import * as React from "react";

import { cn } from "@/lib/utils";

type StitchMarkProps = Omit<React.ComponentProps<"svg">, "children"> & {
  title?: string;
};

function StitchMark({ className, title, ...props }: StitchMarkProps) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("size-8 shrink-0", className)}
      data-slot="stitch-mark"
      fill="none"
      role={title ? "img" : undefined}
      viewBox="0 0 27 26"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <g fill="currentColor">
        <path d="M26.7548 0H.0765533v7.72974H26.7548z" />
        <path d="M.0771675 26H26.7555v-7.7297H.0771675z" />
        <path d="M7.85772 0H.0765533v14.2883H7.85772z" />
        <path d="M26.7555 26h-7.7812V11.7117h7.7812z" />
      </g>
    </svg>
  );
}

type BrandLockupProps = Omit<React.ComponentProps<"div">, "children"> & {
  applicationName?: React.ReactNode;
  markClassName?: string;
  subtitle?: React.ReactNode;
};

function BrandLockup({
  applicationName,
  className,
  markClassName,
  subtitle,
  ...props
}: BrandLockupProps) {
  return (
    <div
      className={cn("inline-flex min-w-0 items-center gap-2.5", className)}
      data-slot="brand-lockup"
      {...props}
    >
      <StitchMark className={cn("-translate-y-px self-center text-primary", markClassName)} />
      <div className="min-w-0">
        {/* The title is a line of body text (14px on a 20px line) whatever is in it: "Stitch" sits
            on that line's baseline without making it taller. So text of that size beside the
            lockup, such as the header's navigation, is on the same baseline at any zoom. */}
        <div className="min-w-0 font-sans text-sm leading-5">
          <span className="font-heading text-sm leading-none font-semibold tracking-tight">
            Stitch
          </span>
          {applicationName != null ? (
            <>
              <span aria-hidden="true" className="mx-2 text-border">
                /
              </span>
              <span className="font-medium text-muted-foreground">{applicationName}</span>
            </>
          ) : null}
        </div>
        {subtitle != null ? (
          <div className="mt-1 text-xs leading-snug text-muted-foreground">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}

export { BrandLockup, StitchMark, type BrandLockupProps, type StitchMarkProps };
