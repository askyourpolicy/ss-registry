"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useLocation, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** The one back affordance for pages: goes back in history, or to `fallback`
 *  when the page was opened directly and there is nothing in-app to go back to. */
function PageBackButton({
  className,
  fallback = "/",
  label = "Go back",
  onClick,
}: {
  className?: string;
  fallback?: string;
  label?: string;
  onClick?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Button
      aria-label={label}
      className={cn("-ml-2 text-muted-foreground hover:text-foreground", className)}
      onClick={
        onClick ??
        (() => {
          // React Router keys the first entry of a session "default": nothing in-app to go back to.
          if (location.key === "default") void navigate(fallback);
          else void navigate(-1);
        })
      }
      size="icon"
      title={label}
      type="button"
      variant="ghost"
    >
      <ArrowLeftIcon />
    </Button>
  );
}

export { PageBackButton };
