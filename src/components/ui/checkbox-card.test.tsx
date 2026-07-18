import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CheckboxCard } from "@/components/ui/checkbox-card";

describe("CheckboxCard", () => {
  it("disables interaction and exposes busy state while pending", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <CheckboxCard
        checked={false}
        label="Enable exports"
        onCheckedChange={onCheckedChange}
        pending
      />,
    );

    const card = screen.getByText("Enable exports").closest("label");
    const checkbox = screen.getByRole("checkbox", { name: "Enable exports" });

    expect(card).toHaveAttribute("aria-busy", "true");
    expect(card).toHaveAttribute("aria-disabled", "true");
    expect(checkbox).toHaveAttribute("aria-disabled", "true");

    await user.click(card!);
    expect(onCheckedChange).not.toHaveBeenCalled();

    rerender(
      <CheckboxCard checked={false} label="Enable exports" onCheckedChange={onCheckedChange} />,
    );
    await user.click(screen.getByRole("checkbox", { name: "Enable exports" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
