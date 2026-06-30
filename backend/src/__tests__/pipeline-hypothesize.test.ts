import { describe, it, expect, vi } from "vitest";
import { runHypothesize } from "../pipeline/hypothesize";
import type { AnthropicClient } from "../llm/client";
import type { Understanding, FactSet } from "../schemas";

const mockUnderstanding: Understanding = {
  summary: "Implement payment retry logic with exponential backoff",
  actors: ["Customer", "Payment Service"],
  systems: ["Order Service", "Payment API"],
  mainFlow: ["Payment fails", "Retry up to 3 times"],
  acceptanceCriteria: ["Retry 3 times on failure"],
  ambiguities: ["Which errors trigger retry?"],
};

const mockFactSet: FactSet = {
  facts: [
    { id: "f1", text: "Retry up to 3 times", category: "business_rule", sourceQuote: "retried up to 3 times" },
    { id: "f2", text: "Same payment intent ID reused", category: "constraint", sourceQuote: "same payment intent ID is reused" },
  ],
};

const mockHypotheses = {
  hypotheses: [
    { id: "h1", statement: "POST /payments is assumed idempotent", category: "safety", relatedFactIds: ["f2"] },
    { id: "h2", statement: "All failures trigger a retry", category: "missing_constraint", relatedFactIds: ["f1"] },
  ],
};

function toolUseResponse(input: unknown) {
  return { stop_reason: "tool_use", content: [{ type: "tool_use", name: "output", input }] };
}

describe("runHypothesize()", () => {
  it("returns hypotheses from one LLM call", async () => {
    const create = vi.fn().mockResolvedValue(toolUseResponse(mockHypotheses));
    const client: AnthropicClient = { messages: { create } };

    const result = await runHypothesize(mockUnderstanding, mockFactSet, client);

    expect(result.hypotheses).toHaveLength(2);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("includes facts in the prompt", async () => {
    const create = vi.fn().mockResolvedValue(toolUseResponse(mockHypotheses));
    const client: AnthropicClient = { messages: { create } };

    await runHypothesize(mockUnderstanding, mockFactSet, client);

    const messages = create.mock.calls[0][0].messages as { role: string; content: string }[];
    const userContent = messages.find((m) => m.role === "user")?.content ?? "";
    expect(userContent).toContain("f1");
    expect(userContent).toContain("f2");
  });

  it("includes summary in the prompt", async () => {
    const create = vi.fn().mockResolvedValue(toolUseResponse(mockHypotheses));
    const client: AnthropicClient = { messages: { create } };

    await runHypothesize(mockUnderstanding, mockFactSet, client);

    const messages = create.mock.calls[0][0].messages as { role: string; content: string }[];
    const userContent = messages.find((m) => m.role === "user")?.content ?? "";
    expect(userContent).toContain(mockUnderstanding.summary);
  });

  it("throws if LLM returns invalid hypothesis shape", async () => {
    const create = vi.fn().mockResolvedValue(toolUseResponse({ wrong: "shape" }));
    const client: AnthropicClient = { messages: { create } };

    await expect(runHypothesize(mockUnderstanding, mockFactSet, client)).rejects.toThrow();
  });

  it("returns empty hypotheses array when LLM finds none", async () => {
    const create = vi.fn().mockResolvedValue(toolUseResponse({ hypotheses: [] }));
    const client: AnthropicClient = { messages: { create } };

    const result = await runHypothesize(mockUnderstanding, mockFactSet, client);

    expect(result.hypotheses).toEqual([]);
  });
});
