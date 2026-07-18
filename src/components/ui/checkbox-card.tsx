"use client";

import { useId, type ReactNode } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type CheckboxCardProps = {
  checked: boolean;
  className?: string;
  description?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  id?: string;
  label: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
  pending?: boolean;
};

function CheckboxCard({
  checked,
  className,
  description,
  disabled = false,
  icon,
  id,
  label,
  onCheckedChange,
  pending = false,
}: CheckboxCardProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  const interactionDisabled = disabled || pending;

  return (
    <Label
      aria-busy={pending}
      aria-disabled={interactionDisabled}
      className={cn(
        "flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-border-subtle p-3 transition-colors data-[state=checked]:border-primary/40 data-[state=checked]:bg-primary/5",
        !interactionDisabled && "hover:bg-muted/50",
        disabled && !pending && "cursor-not-allowed opacity-50",
        pending && "cursor-wait bg-muted/30",
        className,
      )}
      data-state={checked ? "checked" : "unchecked"}
      htmlFor={checkboxId}
    >
      <Checkbox
        checked={checked}
        disabled={interactionDisabled}
        id={checkboxId}
        onCheckedChange={(value) => {
          if (!pending) onCheckedChange?.(value === true);
        }}
      />
      {icon != null ? (
        <span
          aria-hidden="true"
          className="flex size-5 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-5"
        >
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-snug font-medium text-balance">{label}</span>
        {description != null ? (
          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
      {pending ? <Spinner aria-hidden="true" className="shrink-0 text-muted-foreground" /> : null}
    </Label>
  );
}

export { CheckboxCard, type CheckboxCardProps };
