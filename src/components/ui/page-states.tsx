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
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type PageLoadingProps = ComponentProps<"div"> & {
  label?: string;
};

function PageLoading({ className, label = "Loading page", ...props }: PageLoadingProps) {
  return (
    <div
      aria-live="polite"
      className={cn("grid min-h-64 w-full place-items-center py-16", className)}
      data-slot="page-loading"
      role="status"
      {...props}
    >
      <Spinner aria-hidden="true" className="size-6 text-muted-foreground" />
      <span className="sr-only">{label}</span>
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
  PageEmpty,
  PageError,
  PageLoading,
  getErrorMessage,
  type PageEmptyProps,
  type PageErrorProps,
  type PageLoadingProps,
};
