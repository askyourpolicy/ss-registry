"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";

type AppNavigationVariant = "header" | "sidebar";

const AppNavigationContext = React.createContext<AppNavigationVariant | null>(null);

type AppNavigationProps = React.ComponentProps<"nav"> & {
  variant?: AppNavigationVariant;
};

function AppNavigation({
  "aria-label": ariaLabel = "Primary navigation",
  children,
  className,
  variant = "header",
  ...props
}: AppNavigationProps) {
  return (
    <AppNavigationContext value={variant}>
      <nav
        aria-label={ariaLabel}
        className={cn(
          variant === "header" ? "flex min-w-0 items-center gap-1" : "flex min-w-0 flex-col gap-1",
          className,
        )}
        data-slot="app-navigation"
        data-variant={variant}
        {...props}
      >
        {children}
      </nav>
    </AppNavigationContext>
  );
}

type AppNavigationGroupProps = React.ComponentProps<"div"> & {
  label: React.ReactNode;
};

/** A labelled set of links. The sidebar shows the label above them; the header keeps it for screen readers. */
function AppNavigationGroup({ children, className, label, ...props }: AppNavigationGroupProps) {
  const variant = React.useContext(AppNavigationContext);
  if (!variant) {
    throw new Error("AppNavigationGroup must be used inside AppNavigation.");
  }
  const labelId = React.useId();

  return (
    <div
      aria-labelledby={labelId}
      className={cn(
        variant === "header" ? "flex min-w-0 items-center gap-1" : "mt-3 flex flex-col gap-1",
        className,
      )}
      data-slot="app-navigation-group"
      role="group"
      {...props}
    >
      <div
        className={
          variant === "header" ? "sr-only" : "px-3 pb-1 text-xs font-medium text-muted-foreground"
        }
        data-slot="app-navigation-group-label"
        id={labelId}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

type AppNavigationLinkProps = useRender.ComponentProps<"a"> & {
  active?: boolean;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
};

function AppNavigationLink({
  active = false,
  children,
  className,
  icon,
  render,
  trailing,
  ...props
}: AppNavigationLinkProps) {
  const variant = React.useContext(AppNavigationContext);
  if (!variant) {
    throw new Error("AppNavigationLink must be used inside AppNavigation.");
  }

  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        "aria-current": active ? "page" : undefined,
        children: (
          <>
            {icon != null ? (
              <span
                aria-hidden="true"
                className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4"
                data-slot="app-navigation-link-icon"
              >
                {icon}
              </span>
            ) : null}
            <span
              className={cn("min-w-0 truncate", variant === "header" && "relative top-px")}
              data-slot="app-navigation-link-label"
            >
              {children}
            </span>
            {trailing != null ? (
              <span className="ml-auto shrink-0" data-slot="app-navigation-link-trailing">
                {trailing}
              </span>
            ) : null}
          </>
        ),
        className: cn(
          "outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
          variant === "header"
            ? "flex h-(--app-header-height) items-center gap-1.5 border-b-2 border-transparent px-2 text-sm leading-5 font-medium text-muted-foreground hover:text-foreground focus-visible:border-ring"
            : "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          active &&
            (variant === "header"
              ? "border-foreground text-foreground"
              : "bg-sidebar-accent text-sidebar-accent-foreground"),
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      active,
      slot: "app-navigation-link",
      variant,
    },
  });
}

function isNavigationPathActive(pathname: string, routes: readonly string[]) {
  return routes.some((route) => {
    const normalizedRoute = route === "/" ? route : route.replace(/\/+$/, "");
    return normalizedRoute === "/"
      ? pathname === normalizedRoute
      : pathname === normalizedRoute || pathname.startsWith(`${normalizedRoute}/`);
  });
}

export {
  AppNavigation,
  AppNavigationGroup,
  AppNavigationLink,
  isNavigationPathActive,
  type AppNavigationGroupProps,
  type AppNavigationLinkProps,
  type AppNavigationProps,
  type AppNavigationVariant,
};
