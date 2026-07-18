"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CheckCircleIcon as CircleCheckIcon,
  InfoIcon,
  WarningIcon as TriangleAlertIcon,
  XCircleIcon as OctagonXIcon,
  SpinnerGapIcon as Loader2Icon,
} from "@phosphor-icons/react";

const Toaster = ({ theme = "system", ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border-subtle)",
          "--border-radius": "var(--radius-xl)",
          maxWidth: "calc(100vw - 2rem)",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          alignItems: "center",
          background: "var(--popover)",
          borderColor: "var(--border-subtle)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-raised)",
          color: "var(--popover-foreground)",
          fontSize: "0.875rem",
          gap: "0.75rem",
          maxWidth: "calc(100vw - 2rem)",
          padding: "0.75rem",
          paddingInlineEnd: "1rem",
          width: "fit-content",
        },
        classNames: {
          toast: "cn-toast",
          title: "leading-snug!",
          description: "text-xs! leading-snug! text-muted-foreground!",
          icon: "m-0! size-5! text-muted-foreground! [&_svg]:mx-0!",
          success: "[&_[data-icon]]:text-status-success!",
          info: "[&_[data-icon]]:text-status-info!",
          warning: "[&_[data-icon]]:text-status-warning!",
          error: "[&_[data-icon]]:text-destructive!",
          actionButton:
            "rounded-md! bg-primary! font-medium! text-primary-foreground! hover:bg-primary/90!",
          cancelButton:
            "rounded-md! bg-muted! font-medium! text-muted-foreground! hover:bg-muted/80!",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
