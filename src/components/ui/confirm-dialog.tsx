"use client";

import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

type ConfirmDialogVariant = "default" | "destructive";

type ConfirmDialogProps = {
  cancelLabel?: React.ReactNode;
  children?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  contentProps?: Omit<React.ComponentProps<typeof AlertDialogContent>, "children">;
  defaultOpen?: boolean;
  description?: React.ReactNode;
  errorMessage?: (error: unknown) => React.ReactNode;
  media?: React.ReactNode;
  onConfirm: () => Promise<void> | void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  pendingLabel?: React.ReactNode;
  title: React.ReactNode;
  trigger?: React.ReactElement;
  variant?: ConfirmDialogVariant;
};

function getDefaultErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return "The action could not be completed. Try again.";
}

function ConfirmDialog({
  cancelLabel = "Cancel",
  children,
  confirmLabel = "Confirm",
  contentProps,
  defaultOpen = false,
  description,
  errorMessage = getDefaultErrorMessage,
  media,
  onConfirm,
  onOpenChange,
  open,
  pendingLabel = "Confirming…",
  title,
  trigger,
  variant = "default",
}: ConfirmDialogProps) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<React.ReactNode | null>(null);
  const pendingRef = React.useRef(false);
  const resolvedOpen = open ?? internalOpen;

  React.useEffect(() => {
    if (!resolvedOpen) {
      setError(null);
    }
  }, [resolvedOpen]);

  function updateOpen(nextOpen: boolean) {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    if (!nextOpen) {
      setError(null);
    }

    onOpenChange?.(nextOpen);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (pendingRef.current && !nextOpen) {
      return;
    }

    if (nextOpen) {
      setError(null);
    }

    updateOpen(nextOpen);
  }

  async function handleConfirm() {
    if (pendingRef.current) {
      return;
    }

    pendingRef.current = true;
    setError(null);
    setPending(true);

    try {
      await onConfirm();
      updateOpen(false);
    } catch (confirmError) {
      setError(errorMessage(confirmError));
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return (
    <AlertDialog open={resolvedOpen} onOpenChange={handleOpenChange}>
      {trigger ? <AlertDialogTrigger render={trigger} /> : null}
      <AlertDialogContent {...contentProps}>
        <AlertDialogHeader>
          {media != null ? <AlertDialogMedia>{media}</AlertDialogMedia> : null}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description != null ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        {children != null || error != null ? (
          <div
            data-slot="confirm-dialog-content"
            className="row-start-2 flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain"
          >
            {children}
            {error != null ? (
              <div
                aria-live="assertive"
                data-slot="confirm-dialog-error"
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm leading-snug text-destructive"
              >
                {error}
              </div>
            ) : null}
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            aria-busy={pending || undefined}
            disabled={pending}
            onClick={handleConfirm}
            type="button"
            variant={variant}
          >
            {pending ? (
              <>
                <Spinner aria-hidden="true" />
                {pendingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export {
  ConfirmDialog,
  getDefaultErrorMessage,
  type ConfirmDialogProps,
  type ConfirmDialogVariant,
};
