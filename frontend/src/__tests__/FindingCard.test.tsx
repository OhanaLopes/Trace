import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FindingCard } from "../components/FindingCard";
import type { Finding } from "../types";

const mockFinding: Finding = {
  id: "fi1",
  hypothesis: "POST /payments is assumed idempotent",
  category: "safety",
  confidence: "medium",
  impact: "critical",
  supportingEvidence: ["same intent ID is reused across retries"],
  counterEvidence: ["idempotency not explicitly confirmed"],
  recommendation: "Confirm idempotency with the payment team",
};

describe("FindingCard", () => {
  it("renders the hypothesis text", () => {
    render(<FindingCard finding={mockFinding} />);

    expect(screen.getByText("POST /payments is assumed idempotent")).toBeInTheDocument();
  });

  it("renders the confidence badge", () => {
    render(<FindingCard finding={mockFinding} />);

    expect(screen.getByText(/medium/i)).toBeInTheDocument();
  });

  it("renders the impact badge", () => {
    render(<FindingCard finding={mockFinding} />);

    expect(screen.getByText(/critical/i)).toBeInTheDocument();
  });

  it("renders the recommendation", () => {
    render(<FindingCard finding={mockFinding} />);

    expect(screen.getByText("Confirm idempotency with the payment team")).toBeInTheDocument();
  });

  it("does not show evidence section by default", () => {
    render(<FindingCard finding={mockFinding} />);

    expect(screen.queryByText("same intent ID is reused across retries")).not.toBeInTheDocument();
  });

  it("shows evidence section when expand button is clicked", () => {
    render(<FindingCard finding={mockFinding} />);

    fireEvent.click(screen.getByRole("button", { name: /evidence/i }));

    expect(screen.getByText("same intent ID is reused across retries")).toBeInTheDocument();
  });

  it("hides evidence section when expand button is clicked again", () => {
    render(<FindingCard finding={mockFinding} />);

    fireEvent.click(screen.getByRole("button", { name: /evidence/i }));
    fireEvent.click(screen.getByRole("button", { name: /evidence/i }));

    expect(screen.queryByText("same intent ID is reused across retries")).not.toBeInTheDocument();
  });

  it("calls onExpand when provided and evidence button is clicked", () => {
    const onExpand = vi.fn();
    render(<FindingCard finding={mockFinding} onExpand={onExpand} />);

    fireEvent.click(screen.getByRole("button", { name: /evidence/i }));

    expect(onExpand).toHaveBeenCalledWith("fi1");
  });
});
