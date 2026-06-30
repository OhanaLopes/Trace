import { describe, it, expect, vi } from "vitest";
import { runReport } from "../pipeline/report";
import type { AnthropicClient } from "../llm/client";
import type { Hypothesis, EvidenceMap } from "../schemas";

const mockHypothesis: Hypothesis = {
  hypotheses: [
    { id: "h1", statement: "POST /payments is assumed idempotent", category: "safety", relatedFactIds: ["f2"] },
    { id: "h2", statement: "All failures trigger a retry", category: "missing_constraint", relatedFactIds: ["f1"] },
  ],
};

const mockEvidenceMap: EvidenceMap = {
  items: [
    {
      hypothesisId: "h1",
      supportingEvidence: [{ factId: "f2", quote: "same intent ID reused", reasoning: "implies idempotency" }],
      counterEvidence: [{ factId: null, quote: null, reasoning: "not explicitly confirmed" }],
      evidenceSufficient: true,
    },
    {
      hypothesisId: "h2",
      supportingEvidence: [{ factId: "f1", quote: "retried up to 3 times", reasoning: "no filter" }],
      counterEvidence: [],
      evidenceSufficient: true,
    },
  ],
};

const mockReport = {
  storyTitle: "Payment retry",
  findings: [
    {
      id: "fi1",
      hypothesis: "POST /payments is assumed idempotent",
      category: "safety",
      confidence: "medium",
      impact: "critical",
      supportingEvidence: ["same intent ID reused"],
      counterEvidence: ["not explicitly confirmed"],
      recommendation: "Confirm idempotency with payment team",
    },
    {
      id: "fi2",
      hypothesis: "All failures trigger a retry",
      category: "missing_constraint",
      confidence: "high",
      impact: "high",
      supportingEvidence: ["retried up to 3 times — no filter"],
      counterEvidence: [],
      recommendation: "Define which error codes should retry",
    },
  ],
  summary: { totalFindings: 2, criticalCount: 1, insufficientEvidenceCount: 0 },
};

function toolUseResponse(input: unknown) {
  return { stop_reason: "tool_use", content: [{ type: "tool_use", name: "output", input }] };
}

describe("runReport()", () => {
  it("returns engineering report from one LLM call", async () => {
    const create = vi.fn().mockResolvedValue(toolUseResponse(mockReport));
    const client: AnthropicClient = { messages: { create } };

    const result = await runReport("Payment retry", mockHypothesis, mockEvidenceMap, client);

    expect(result.findings).toHaveLength(2);
    expect(result.summary.totalFindings).toBe(2);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("includes story title in the prompt", async () => {
    const create = vi.fn().mockResolvedValue(toolUseResponse(mockReport));
    const client: AnthropicClient = { messages: { create } };

    await runReport("Payment retry", mockHypothesis, mockEvidenceMap, client);

    const messages = create.mock.calls[0][0].messages as { role: string; content: string }[];
    const userContent = messages.find((m) => m.role === "user")?.content ?? "";
    expect(userContent).toContain("Payment retry");
  });

  it("includes hypothesis IDs in the prompt", async () => {
    const create = vi.fn().mockResolvedValue(toolUseResponse(mockReport));
    const client: AnthropicClient = { messages: { create } };

    await runReport("Payment retry", mockHypothesis, mockEvidenceMap, client);

    const messages = create.mock.calls[0][0].messages as { role: string; content: string }[];
    const userContent = messages.find((m) => m.role === "user")?.content ?? "";
    expect(userContent).toContain("h1");
    expect(userContent).toContain("h2");
  });

  it("throws if LLM returns invalid report shape", async () => {
    const create = vi.fn().mockResolvedValue(toolUseResponse({ wrong: "shape" }));
    const client: AnthropicClient = { messages: { create } };

    await expect(runReport("title", mockHypothesis, mockEvidenceMap, client)).rejects.toThrow();
  });
});
