import { WarningCircleIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PageLoadingProps = ComponentProps<"div"> & {
  label?: string;
};

/**
 * A page while it waits for its content: the header's title and description, then a content
 * block, so the page lands where this sat. The same shape while the page's code loads and while
 * its data does, so one skeleton never gives way to another kind of wait.
 */
function PageLoading({ className, label = "Loading page", ...props }: PageLoadingProps) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className={cn("flex flex-col gap-6", className)}
      data-slot="page-loading"
      role="status"
      {...props}
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}

/** A section of a page while it waits for its content: one block where the content will sit. */
function BlockLoading({ className, label = "Loading", ...props }: PageLoadingProps) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className={cn("w-full", className)}
      data-slot="block-loading"
      role="status"
      {...props}
    >
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}

type PageErrorProps = Omit<ComponentProps<typeof Alert>, "children" | "title" | "variant"> & {
  action?: ReactNode;
  error?: unknown;
  message?: ReactNode;
  title?: ReactNode;
};

function PageError({
  action,
  className,
  error,
  message,
  title = "Something went wrong",
  ...props
}: PageErrorProps) {
  return (
    <Alert {...props} className={className} data-slot="page-error" variant="destructive">
      <WarningCircleIcon aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message ?? getErrorMessage(error)}</AlertDescription>
      {action != null ? <AlertAction>{action}</AlertAction> : null}
    </Alert>
  );
}

type PageEmptyProps = Omit<ComponentProps<typeof Empty>, "children" | "title"> & {
  actions?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
};

function PageEmpty({ actions, className, description, icon, title, ...props }: PageEmptyProps) {
  return (
    <Empty
      className={cn("min-h-64 border border-border-subtle", className)}
      data-slot="page-empty"
      {...props}
    >
      <EmptyHeader>
        {icon != null ? <EmptyMedia variant="icon">{icon}</EmptyMedia> : null}
        <EmptyTitle>{title}</EmptyTitle>
        {description != null ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {actions != null ? <EmptyContent>{actions}</EmptyContent> : null}
    </Empty>
  );
}

function getErrorMessage(error: unknown, fallback = "An unexpected error occurred.") {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.trim()
  ) {
    return error.message;
  }
  return fallback;
}

export {
  BlockLoading,
  PageEmpty,
  PageError,
  PageLoading,
  getErrorMessage,
  type PageEmptyProps,
  type PageErrorProps,
  type PageLoadingProps,
};
