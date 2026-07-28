import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { describe, expect, it } from "vitest";

import { DateRangePicker, formatDateRange } from "@/components/ui/date-range-picker";

const from = new Date(2026, 6, 1);
const to = new Date(2026, 6, 28);

// ICU pads the range dash with a thin space on some engines and a plain one on others.
function normalize(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ") ?? null;
}

describe("formatDateRange", () => {
  it("collapses the parts a range shares", () => {
    expect(normalize(formatDateRange({ from, to }, "en-US"))).toBe("Jul 1 – 28, 2026");
    expect(normalize(formatDateRange({ from, to: new Date(2026, 8, 3) }, "en-US"))).toBe(
      "Jul 1 – Sep 3, 2026",
    );
  });

  it("reads as a single day until an end is picked", () => {
    expect(normalize(formatDateRange({ from, to: undefined }, "en-US"))).toBe("Jul 1, 2026");
  });

  it("has nothing to show for an empty range", () => {
    expect(formatDateRange(undefined, "en-US")).toBeNull();
    expect(formatDateRange({ from: undefined }, "en-US")).toBeNull();
  });
});

describe("DateRangePicker", () => {
  it("falls back to the placeholder while no range is set", () => {
    render(<DateRangePicker onValueChange={() => undefined} value={undefined} />);

    expect(screen.getByRole("button", { name: "Any date" })).toBeInTheDocument();
  });

  it("labels the trigger with the selected range", () => {
    render(<DateRangePicker locale="en-US" onValueChange={() => undefined} value={{ from, to }} />);

    expect(normalize(screen.getByRole("button").textContent)).toBe("Jul 1 – 28, 2026");
  });

  it("stays open across both clicks so a range can be finished", async () => {
    const user = userEvent.setup();
    render(<Controlled />);

    await user.click(screen.getByRole("button", { name: "Any date" }));
    // Selecting rerenders the grid, so the buttons have to be looked up again each time.
    const start = dayButtons()[9]!.getAttribute("data-day");
    await user.click(dayButtons()[9]!);
    // The first click already reads as a one-day range, which must not dismiss the calendar.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    const end = dayButtons()[14]!.getAttribute("data-day");
    await user.click(dayButtons()[14]!);

    expect(screen.getByTestId("range").textContent).toBe(`${start}/${end}`);

    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("empties the range from the footer", async () => {
    const user = userEvent.setup();
    render(<Controlled initial={{ from, to }} />);

    await user.click(screen.getByRole("button", { name: /Jul/ }));
    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.getByTestId("range").textContent).toBe("/");
  });
});

function dayButtons() {
  return screen.getAllByRole("button").filter((button) => button.getAttribute("data-day") !== null);
}

function Controlled({ initial }: { initial?: DateRange }) {
  const [value, setValue] = React.useState<DateRange | undefined>(initial);
  return (
    <>
      <DateRangePicker locale="en-US" onValueChange={setValue} value={value} />
      <output data-testid="range">
        {`${value?.from?.toLocaleDateString("en-US") ?? ""}/${
          value?.to?.toLocaleDateString("en-US") ?? ""
        }`}
      </output>
    </>
  );
}
