import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  AppNavigation,
  AppNavigationLink,
  isNavigationPathActive,
} from "@/components/ui/app-navigation";
import { JsonCard } from "@/components/ui/json-card";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineIndicator,
  TimelineItem,
  TimelineRail,
} from "@/components/ui/timeline";

describe("AppNavigation", () => {
  it("renders header and sidebar variants with explicit active semantics", () => {
    const { rerender } = render(
      <AppNavigation variant="header">
        <AppNavigationLink active href="/cases">
          Cases
        </AppNavigationLink>
      </AppNavigation>,
    );

    expect(screen.getByRole("navigation")).toHaveAttribute("data-variant", "header");
    expect(screen.getByRole("link", { name: "Cases" })).toHaveAttribute("aria-current", "page");

    rerender(
      <AppNavigation variant="sidebar">
        <AppNavigationLink href="/agents" icon={<svg data-testid="agent-icon" />} trailing="3">
          Agents
        </AppNavigationLink>
      </AppNavigation>,
    );

    expect(screen.getByRole("navigation")).toHaveAttribute("data-variant", "sidebar");
    expect(screen.getByTestId("agent-icon")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("matches exact roots and nested route aliases", () => {
    expect(isNavigationPathActive("/", ["/", "/definitions"])).toBe(true);
    expect(isNavigationPathActive("/definitions/42", ["/", "/definitions"])).toBe(true);
    expect(isNavigationPathActive("/agents/42", ["/agents"])).toBe(true);
    expect(isNavigationPathActive("/agent-settings", ["/agents"])).toBe(false);
  });
});

describe("JsonCard", () => {
  it("composes a titled card with the shared JSON viewer", () => {
    render(<JsonCard title="Payload" value={{ status: "ready" }} />);

    expect(screen.getByText("Payload")).toBeInTheDocument();
    expect(document.querySelector("[data-component='json-card']")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='json-viewer']")).toBeInTheDocument();
  });

  it("announces clipboard failures without rejecting the interaction", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockRejectedValue(new Error("Clipboard denied"));

    render(<JsonCard title="Payload" value={{ status: "ready" }} />);
    await user.click(screen.getByRole("button", { name: "Copy root" }));

    expect(writeText).toHaveBeenCalledOnce();
    expect(await screen.findByRole("status")).toHaveTextContent(
      "root could not be copied. Try again.",
    );
    expect(screen.getByRole("button", { name: "Copy root failed. Try again" })).toBeInTheDocument();
    writeText.mockRestore();
  });
});

describe("Timeline", () => {
  it("provides semantic list structure and composable visual slots", () => {
    render(
      <Timeline aria-label="Activity">
        <TimelineItem>
          <TimelineRail>
            <TimelineIndicator>1</TimelineIndicator>
            <TimelineConnector />
          </TimelineRail>
          <TimelineContent>Created</TimelineContent>
        </TimelineItem>
      </Timeline>,
    );

    expect(screen.getByRole("list", { name: "Activity" })).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='timeline-indicator']")).toHaveTextContent("1");
    expect(document.querySelector("[data-slot='timeline-connector']")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
