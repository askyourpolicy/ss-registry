"use client";

import { useId } from "react";

import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

/**
 * A filter question as one joined control: the label is a prefix on the
 * select, so it reads "Status | All" rather than as loose text beside it.
 */
function FilterSelect({
  label,
  onChange,
  options,
  title,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ count?: number; key: string; label: string }>;
  /** Hover text for the control. Defaults to "Filter by <label>."; pass your own to translate it. */
  title?: string;
  value: string;
}) {
  const id = useId();
  return (
    <ButtonGroup className="shrink-0" title={title ?? `Filter by ${label.toLowerCase()}.`}>
      <ButtonGroupText
        className="border-input font-normal text-muted-foreground dark:bg-input/50"
        render={<label htmlFor={id} />}
      >
        {label}
      </ButtonGroupText>
      <NativeSelect
        className="max-w-40 [&>select]:rounded-l-none [&>select]:border-l-0 [&>select]:[field-sizing:content]"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <NativeSelectOption key={option.key} value={option.key}>
            {option.label}
            {option.count !== undefined ? ` (${option.count})` : ""}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </ButtonGroup>
  );
}

export { FilterSelect };
