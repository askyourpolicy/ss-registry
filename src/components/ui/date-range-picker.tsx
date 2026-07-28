"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarBlankIcon } from "@phosphor-icons/react";

type DateRangePickerProps = {
  align?: React.ComponentProps<typeof PopoverContent>["align"];
  className?: string;
  clearLabel?: string;
  disabled?: boolean;
  disabledDays?: React.ComponentProps<typeof Calendar>["disabled"];
  doneLabel?: string;
  endMonth?: Date;
  id?: string;
  locale?: string;
  months?: number;
  onValueChange: (value: DateRange | undefined) => void;
  placeholder?: string;
  startMonth?: Date;
  value: DateRange | undefined;
};

function DateRangePicker({
  align = "start",
  className,
  clearLabel = "Clear",
  disabled,
  disabledDays,
  doneLabel = "Done",
  endMonth,
  id,
  locale,
  months = 2,
  onValueChange,
  placeholder = "Any date",
  startMonth,
  value,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const label = formatDateRange(value, locale);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            className={cn(
              "justify-start font-normal",
              label ? undefined : "text-muted-foreground",
              className,
            )}
            disabled={disabled}
            id={id}
            variant="outline"
          />
        }
      >
        <CalendarBlankIcon />
        <span className="truncate">{label ?? placeholder}</span>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-auto max-w-[calc(100vw-2rem)] gap-0 overflow-auto p-0"
        data-slot="date-range-picker"
      >
        <Calendar
          autoFocus
          defaultMonth={value?.from}
          disabled={disabledDays}
          endMonth={endMonth}
          mode="range"
          numberOfMonths={months}
          onSelect={onValueChange}
          selected={value}
          startMonth={startMonth}
        />
        {/* The first click already yields a one-day range, so closing on a "complete" range would
            shut the calendar before the end date could be picked. Closing stays manual. */}
        <div className="flex items-center justify-between gap-2 border-t border-border-subtle p-2">
          <Button
            disabled={!value?.from}
            onClick={() => onValueChange(undefined)}
            size="sm"
            variant="ghost"
          >
            {clearLabel}
          </Button>
          <Button onClick={() => setOpen(false)} size="sm" variant="ghost">
            {doneLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Intl renders a range in the shortest form the locale allows, collapsing a shared month or year.
function formatDateRange(value: DateRange | undefined, locale?: string) {
  if (!value?.from) return null;
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return value.to ? formatter.formatRange(value.from, value.to) : formatter.format(value.from);
}

export { DateRangePicker, formatDateRange };
export type { DateRangePickerProps };
