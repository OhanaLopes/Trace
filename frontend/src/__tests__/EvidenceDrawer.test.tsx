import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EvidenceDrawer } from "../components/EvidenceDrawer";

describe("EvidenceDrawer", () => {
  it("renders supporting evidence quotes", () => {
    render(
      <EvidenceDrawer
        supportingEvidence={["same intent ID is reused", "retried up to 3 times"]}
        counterEvidence={[]}
      />
    );

    expect(screen.getByText("same intent ID is reused")).toBeInTheDocument();
    expect(screen.getByText("retried up to 3 times")).toBeInTheDocument();
  });

  it("renders counter-evidence reasoning", () => {
    render(
      <EvidenceDrawer
        supportingEvidence={[]}
        counterEvidence={["idempotency not explicitly confirmed"]}
      />
    );

    expect(screen.getByText("idempotency not explicitly confirmed")).toBeInTheDocument();
  });

  it("shows a message when there is no counter-evidence", () => {
    render(
      <EvidenceDrawer
        supportingEvidence={["some evidence"]}
        counterEvidence={[]}
      />
    );

    expect(screen.getByText(/no counter-evidence/i)).toBeInTheDocument();
  });

  it("shows a message when there is no supporting evidence", () => {
    render(
      <EvidenceDrawer
        supportingEvidence={[]}
        counterEvidence={["some counter"]}
      />
    );

    expect(screen.getByText(/no supporting evidence/i)).toBeInTheDocument();
  });

  it("renders section labels for supporting and counter evidence", () => {
    render(
      <EvidenceDrawer
        supportingEvidence={["evidence"]}
        counterEvidence={["counter"]}
      />
    );

    expect(screen.getByText(/supporting evidence/i)).toBeInTheDocument();
    expect(screen.getByText(/counter-evidence/i)).toBeInTheDocument();
  });
});
