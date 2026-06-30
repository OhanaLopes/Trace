import { describe, it, expect, vi } from "vitest";
import { runUnderstand } from "../pipeline/understand";
import type { AnthropicClient } from "../llm/client";
import type { StoryInput } from "../schemas";

const mockStory: StoryInput = {
  raw: "As a customer, I want failed payments to be automatically retried.",
  title: "Payment retry",
};

function toolUseResponse(input: unknown) {
  return {
    stop_reason: "tool_use",
    content: [{ type: "tool_use", name: "output", input }],
  };
}

const mockUnderstanding = {
  summary: "Implement payment retry logic",
  actors: ["Customer", "Payment Service"],
  systems: ["Order Service", "Payment API"],
  mainFlow: ["Payment fails", "Retry up to 3 times"],
  acceptanceCriteria: ["Retry 3 times on failure"],
  ambiguities: ["Which errors trigger retry?"],
};

const mockFactSet = {
  facts: [
    {
      id: "f1",
      text: "Retry up to 3 times",
      category: "business_rule",
      sourceQuote: "retried up to 3 times",
    },
  ],
};

function makeClient(understandingResponse: unknown, factSetResponse: unknown): AnthropicClient {
  const create = vi
    .fn()
    .mockResolvedValueOnce(toolUseResponse(understandingResponse))
    .mockResolvedValueOnce(toolUseResponse(factSetResponse));
  return { messages: { create } };
}

describe("runUnderstand()", () => {
  it("returns understanding and factSet from two LLM calls", async () => {
    const client = makeClient(mockUnderstanding, mockFactSet);

    const result = await runUnderstand(mockStory, client);

    expect(result.understanding.summary).toBe("Implement payment retry logic");
    expect(result.factSet.facts).toHaveLength(1);
  });

  it("makes exactly two LLM calls", async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce(toolUseResponse(mockUnderstanding))
      .mockResolvedValueOnce(toolUseResponse(mockFactSet));
    const client = { messages: { create } };

    await runUnderstand(mockStory, client);

    expect(create).toHaveBeenCalledTimes(2);
  });

  it("includes raw story text in the first prompt", async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce(toolUseResponse(mockUnderstanding))
      .mockResolvedValueOnce(toolUseResponse(mockFactSet));
    const client = { messages: { create } };

    await runUnderstand(mockStory, client);

    const firstCallMessages = create.mock.calls[0][0].messages as { role: string; content: string }[];
    const userContent = firstCallMessages.find((m) => m.role === "user")?.content ?? "";
    expect(userContent).toContain(mockStory.raw);
  });

  it("returns understanding output validated against UnderstandingSchema", async () => {
    const client = makeClient(mockUnderstanding, mockFactSet);

    const result = await runUnderstand(mockStory, client);

    expect(result.understanding).toMatchObject({
      summary: expect.any(String),
      actors: expect.any(Array),
      systems: expect.any(Array),
      mainFlow: expect.any(Array),
      acceptanceCriteria: expect.any(Array),
      ambiguities: expect.any(Array),
    });
  });

  it("throws if first LLM call returns invalid Understanding shape", async () => {
    const create = vi
      .fn()
      .mockResolvedValue(toolUseResponse({ invalid: "shape" }));
    const client = { messages: { create } };

    await expect(runUnderstand(mockStory, client)).rejects.toThrow();
  });
});
