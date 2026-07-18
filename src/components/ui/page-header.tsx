import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderSize = "sm" | "default" | "lg";

type PageHeaderClassNames = {
  actions?: string;
  breadcrumbs?: string;
  content?: string;
  description?: string;
  eyebrow?: string;
  root?: string;
  row?: string;
  title?: string;
};

type PageHeaderProps = Omit<ComponentProps<"header">, "title"> & {
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  classNames?: PageHeaderClassNames;
  description?: ReactNode;
  eyebrow?: ReactNode;
  size?: PageHeaderSize;
  title: ReactNode;
};

const titleSizeClasses: Record<PageHeaderSize, string> = {
  sm: "text-xl",
  default: "text-2xl",
  lg: "text-3xl sm:text-4xl",
};

function PageHeader({
  actions,
  breadcrumbs,
  className,
  classNames,
  description,
  eyebrow,
  size = "default",
  title,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-size={size}
      data-slot="page-header"
      className={cn("flex min-w-0 flex-col gap-3", classNames?.root, className)}
      {...props}
    >
      {breadcrumbs != null ? (
        <div
          data-slot="page-header-breadcrumbs"
          className={cn("text-sm text-muted-foreground", classNames?.breadcrumbs)}
        >
          {breadcrumbs}
        </div>
      ) : null}
      <div
        data-slot="page-header-row"
        className={cn(
          "flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
          classNames?.row,
        )}
      >
        <div
          data-slot="page-header-content"
          className={cn("min-w-0 max-w-3xl", classNames?.content)}
        >
          {eyebrow != null ? (
            <div
              data-slot="page-header-eyebrow"
              className={cn(
                "mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase",
                classNames?.eyebrow,
              )}
            >
              {eyebrow}
            </div>
          ) : null}
          <h1
            data-slot="page-header-title"
            className={cn(
              "font-heading leading-tight font-semibold tracking-tight text-balance",
              titleSizeClasses[size],
              classNames?.title,
            )}
          >
            {title}
          </h1>
          {description != null ? (
            <div
              data-slot="page-header-description"
              className={cn(
                "mt-1 text-sm leading-snug text-balance text-muted-foreground",
                size === "lg" && "sm:text-base",
                classNames?.description,
              )}
            >
              {description}
            </div>
          ) : null}
        </div>
        {actions != null ? (
          <div
            data-slot="page-header-actions"
            className={cn("flex shrink-0 flex-wrap items-center gap-2", classNames?.actions)}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export { PageHeader, type PageHeaderClassNames, type PageHeaderProps, type PageHeaderSize };
