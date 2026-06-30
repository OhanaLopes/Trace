import { describe, it, expect, vi } from "vitest";
import { runEvidence } from "../pipeline/evidence";
import type { AnthropicClient } from "../llm/client";
import type { Hypothesis, FactSet } from "../schemas";

const mockFactSet: FactSet = {
  facts: [
    { id: "f1", text: "Retry up to 3 times", category: "business_rule", sourceQuote: "retried up to 3 times" },
    { id: "f2", text: "Same payment intent ID reused", category: "constraint", sourceQuote: "same payment intent ID is reused" },
  ],
};

const mockHypothesis: Hypothesis = {
  hypotheses: [
    { id: "h1", statement: "POST /payments is assumed idempotent", category: "safety", relatedFactIds: ["f2"] },
    { id: "h2", statement: "All failures trigger a retry", category: "missing_constraint", relatedFactIds: ["f1"] },
  ],
};

const mockEvidenceMap = {
  items: [
    {
      hypothesisId: "h1",
      supportingEvidence: [{ factId: "f2", quote: "same payment intent ID is reused", reasoning: "reuse implies idempotency assumption" }],
      counterEvidence: [{ factId: null, quote: null, reasoning: "idempotency not explicitly confirmed" }],
      evidenceSufficient: true,
    },
    {
      hypothesisId: "h2",
      supportingEvidence: [{ factId: "f1", quote: "retried up to 3 times", reasoning: "no failure type filter mentioned" }],
      counterEvidence: [],
      evidenceSufficient: true,
    },
  ],
};

function toolUseResponse(input: unknown) {
  return { stop_reason: "tool_use", content: [{ type: "tool_use", name: "output", input }] };
}

describe("runEvidence()", () => {
  it("returns evidence map from one LLM call", async () => {
    const create = vi.fn().mockResolvedValue(toolUseResponse(mockEvidenceMap));
    const client: AnthropicClient = { messages: { create } };

    const result = await runEvidence(mockHypothesis, mockFactSet, client);

    expect(result.items).toHaveLength(2);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("includes all hypothesis statements in the prompt", async () => {
    const create = vi.fn().mockResolvedValue(toolUseResponse(mockEvidenceMap));
    const client: AnthropicClient = { messages: { create } };

    await runEvidence(mockHypothesis, mockFactSet, client);

    const messages = create.mock.calls[0][0].messages as { role: string; content: string }[];
    const userContent = messages.find((m) => m.role === "user")?.content ?? "";
    expect(userContent).toContain("h1");
    expect(userContent).toContain("h2");
  });

  it("includes all facts in the prompt", async () => {
    const create = vi.fn().mockResolvedValue(toolUseResponse(mockEvidenceMap));
    const client: AnthropicClient = { messages: { create } };

    await runEvidence(mockHypothesis, mockFactSet, client);

    const messages = create.mock.calls[0][0].messages as { role: string; content: string }[];
    const userContent = messages.find((m) => m.role === "user")?.content ?? "";
    expect(userContent).toContain("f1");
    expect(userContent).toContain("f2");
  });

  it("throws if LLM returns invalid evidence map shape", async () => {
    const create = vi.fn().mockResolvedValue(toolUseResponse({ wrong: "shape" }));
    const client: AnthropicClient = { messages: { create } };

    await expect(runEvidence(mockHypothesis, mockFactSet, client)).rejects.toThrow();
  });
});
