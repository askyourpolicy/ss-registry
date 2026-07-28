import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { describe, expect, it } from "vitest";

import { Calendar } from "@/components/ui/calendar";

describe("Calendar", () => {
  // Rebuilding the grid on every selection would detach the button under the pointer, which reads as
  // a click outside to any popover hosting the calendar and dismisses it mid-range.
  it("keeps the clicked day in place across a selection", async () => {
    const user = userEvent.setup();
    render(<ControlledRange />);

    const day = dayButton("7/9/2026");
    await user.click(day);

    expect(day.isConnected).toBe(true);
    expect(day).toHaveFocus();
    expect(dayButton("7/9/2026")).toBe(day);
  });

  it("marks the ends of a finished range", async () => {
    const user = userEvent.setup();
    render(<ControlledRange />);

    await user.click(dayButton("7/9/2026"));
    await user.click(dayButton("7/14/2026"));

    expect(dayButton("7/9/2026")).toHaveAttribute("data-range-start", "true");
    expect(dayButton("7/14/2026")).toHaveAttribute("data-range-end", "true");
  });
});

function dayButton(day: string) {
  const button = screen
    .getAllByRole("button")
    .find((candidate) => candidate.getAttribute("data-day") === day);
  if (!button) throw new Error(`No day button for ${day}`);
  return button;
}

function ControlledRange() {
  const [value, setValue] = React.useState<DateRange | undefined>(undefined);
  return (
    <Calendar
      defaultMonth={new Date(2026, 6, 1)}
      mode="range"
      onSelect={setValue}
      selected={value}
    />
  );
}
