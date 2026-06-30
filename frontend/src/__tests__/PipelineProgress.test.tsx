import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PipelineProgress } from "../components/PipelineProgress";
import type { StageInfo } from "../types";

const allStages: StageInfo[] = [
  { stage: 1, name: "Understand & Extract Facts", status: "complete" },
  { stage: 2, name: "Generate Hypotheses", status: "complete" },
  { stage: 3, name: "Collect Evidence & Counter-Evidence", status: "running" },
  { stage: 4, name: "Score & Build Report", status: "pending" },
];

describe("PipelineProgress", () => {
  it("renders all stage names", () => {
    render(<PipelineProgress stages={allStages} />);

    expect(screen.getByText("Understand & Extract Facts")).toBeInTheDocument();
    expect(screen.getByText("Generate Hypotheses")).toBeInTheDocument();
    expect(screen.getByText("Collect Evidence & Counter-Evidence")).toBeInTheDocument();
    expect(screen.getByText("Score & Build Report")).toBeInTheDocument();
  });

  it("renders nothing when stages array is empty", () => {
    const { container } = render(<PipelineProgress stages={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("marks complete stages with a checkmark indicator", () => {
    render(<PipelineProgress stages={allStages} />);

    const completeItems = screen.getAllByTestId("stage-complete");
    expect(completeItems).toHaveLength(2);
  });

  it("marks the running stage with a running indicator", () => {
    render(<PipelineProgress stages={allStages} />);

    expect(screen.getByTestId("stage-running")).toBeInTheDocument();
  });

  it("marks pending stages with a pending indicator", () => {
    render(<PipelineProgress stages={allStages} />);

    expect(screen.getByTestId("stage-pending")).toBeInTheDocument();
  });
});
