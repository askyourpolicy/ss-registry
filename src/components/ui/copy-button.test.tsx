import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CopyButton } from "@/components/ui/copy-button";

function refuseClipboard() {
  return vi
    .spyOn(navigator.clipboard, "writeText")
    .mockRejectedValue(new DOMException("Write permission denied.", "NotAllowedError"));
}

function stubExecCommand(result: boolean) {
  const execCommand = vi.fn((_command: string) => result);
  Object.defineProperty(document, "execCommand", { configurable: true, value: execCommand });
  return execCommand;
}

afterEach(() => {
  Reflect.deleteProperty(document, "execCommand");
});

describe("CopyButton", () => {
  it("copies the value and says so on a text button", async () => {
    const user = userEvent.setup();
    const onCopyResult = vi.fn();
    render(
      <CopyButton label="reference" onCopyResult={onCopyResult} value="ss_ref_1">
        Copy
      </CopyButton>,
    );

    await user.click(screen.getByRole("button", { name: "Copy reference" }));

    await expect(navigator.clipboard.readText()).resolves.toBe("ss_ref_1");
    expect(screen.getByRole("button", { name: "reference copied" })).toHaveTextContent(/^Copied$/);
    expect(screen.getByRole("status")).toHaveTextContent("reference copied to clipboard.");
    expect(onCopyResult).toHaveBeenCalledWith(true);
  });

  it("keeps its own text when copiedText is null", async () => {
    const user = userEvent.setup();
    render(
      <CopyButton copiedText={null} label="run" value="run_1">
        run_1
      </CopyButton>,
    );

    await user.click(screen.getByRole("button", { name: "Copy run" }));

    expect(screen.getByRole("button", { name: "run copied" })).toHaveTextContent(/^run_1$/);
  });

  it("shows a visible failure and reports it when the browser refuses", async () => {
    const user = userEvent.setup();
    refuseClipboard();
    const execCommand = stubExecCommand(false);
    const onCopyResult = vi.fn();
    render(
      <CopyButton label="reference" onCopyResult={onCopyResult} value="ss_ref_1">
        Copy
      </CopyButton>,
    );

    await user.click(screen.getByRole("button", { name: "Copy reference" }));

    const button = screen.getByRole("button", { name: "Copy reference failed. Try again" });
    expect(button).toHaveTextContent(/^Couldn't copy$/);
    expect(button).toHaveAttribute("data-status", "error");
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(onCopyResult).toHaveBeenCalledWith(false);
  });

  it("falls back to a selection copy and keeps focus on the button", async () => {
    const user = userEvent.setup();
    refuseClipboard();
    let selected = "";
    const execCommand = stubExecCommand(true);
    execCommand.mockImplementation(() => {
      const field = document.activeElement;
      selected = field instanceof HTMLTextAreaElement ? field.value : "";
      return true;
    });
    const onCopyResult = vi.fn();
    render(
      <CopyButton label="reference" onCopyResult={onCopyResult} value="ss_ref_1">
        Copy
      </CopyButton>,
    );

    await user.click(screen.getByRole("button", { name: "Copy reference" }));

    expect(selected).toBe("ss_ref_1");
    expect(document.querySelector("textarea")).toBeNull();
    const button = screen.getByRole("button", { name: "reference copied" });
    expect(button).toHaveFocus();
    expect(button).toHaveTextContent(/^Copied$/);
    expect(onCopyResult).toHaveBeenCalledWith(true);
  });

  it("changes only its icon when it has no text", async () => {
    const user = userEvent.setup();
    render(<CopyButton label="token" value="t" />);

    await user.click(screen.getByRole("button", { name: "Copy token" }));

    expect(screen.getByRole("button", { name: "token copied" })).toHaveTextContent(/^$/);
  });
});
