import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

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
  title: ReactNode;
};

function PageHeader({
  actions,
  breadcrumbs,
  className,
  classNames,
  description,
  eyebrow,
  title,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      // The title's tall line box already spaces it from the breadcrumbs; this gap makes the
      // breadcrumbs sit as close above the title as the description sits below it.
      className={cn("flex min-w-0 flex-col gap-0.5", classNames?.root, className)}
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
          "flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between",
          classNames?.row,
        )}
      >
        {/* From sm up the actions sit beside the title while the title fits at its full width,
            and wrap below it when it does not, so they never squeeze the title. The content
            starts at the title's width, then grows to fill the row. */}
        <div
          data-slot="page-header-content"
          className={cn("min-w-0 max-w-3xl flex-auto", classNames?.content)}
        >
          {eyebrow != null ? (
            <div
              data-slot="page-header-eyebrow"
              className={cn(
                "mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase",
                classNames?.eyebrow,
              )}
            >
              {eyebrow}
            </div>
          ) : null}
          {/* One title size across the app: a screen has three sizes, 12, 14 and this one. The
              page title is the one heavier weight. */}
          <h1
            data-slot="page-header-title"
            className={cn(
              "font-heading text-2xl leading-tight font-semibold tracking-tight text-balance",
              classNames?.title,
            )}
          >
            {title}
          </h1>
          {description != null ? (
            <div
              data-slot="page-header-description"
              // The description takes the width the title and the row give it and never widens
              // the content, so a long one does not push the actions below the title.
              className={cn(
                "mt-1 text-sm leading-snug text-balance text-muted-foreground contain-inline-size",
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
            // An action that renders nothing (no permission here) leaves no gap under the title.
            className={cn(
              "flex min-w-0 flex-wrap items-center gap-2 empty:hidden",
              classNames?.actions,
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export { PageHeader, type PageHeaderClassNames, type PageHeaderProps };
