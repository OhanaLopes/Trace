import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { structured, type AnthropicClient } from "../llm/client";

const TestSchema = z.object({ name: z.string(), value: z.number() });

function makeClient(createFn: ReturnType<typeof vi.fn>): AnthropicClient {
  return { messages: { create: createFn } };
}

function toolUseResponse(input: unknown) {
  return {
    stop_reason: "tool_use",
    content: [{ type: "tool_use", name: "output", input }],
  };
}

describe("structured()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns parsed data when LLM response is valid", async () => {
    const create = vi.fn().mockResolvedValue(toolUseResponse({ name: "hello", value: 42 }));
    const client = makeClient(create);

    const result = await structured(TestSchema, "test prompt", undefined, client);

    expect(result).toEqual({ name: "hello", value: 42 });
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("retries once when first response fails Zod validation", async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce(toolUseResponse({ name: "hello", value: "not-a-number" }))
      .mockResolvedValueOnce(toolUseResponse({ name: "hello", value: 42 }));
    const client = makeClient(create);

    const result = await structured(TestSchema, "test prompt", undefined, client);

    expect(result).toEqual({ name: "hello", value: 42 });
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("includes validation error in retry prompt", async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce(toolUseResponse({ name: "hello", value: "bad" }))
      .mockResolvedValueOnce(toolUseResponse({ name: "hello", value: 1 }));
    const client = makeClient(create);

    await structured(TestSchema, "original prompt", undefined, client);

    const retryMessages = create.mock.calls[1][0].messages as { role: string; content: string }[];
    const lastUserMessage = retryMessages[retryMessages.length - 1].content as string;
    expect(lastUserMessage).toContain("validation error");
  });

  it("throws after two consecutive validation failures", async () => {
    const create = vi.fn().mockResolvedValue(toolUseResponse({ name: "hello", value: "always-bad" }));
    const client = makeClient(create);

    await expect(structured(TestSchema, "test prompt", undefined, client)).rejects.toThrow();
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("throws when stop_reason is not tool_use", async () => {
    const create = vi.fn().mockResolvedValue({ stop_reason: "max_tokens", content: [] });
    const client = makeClient(create);

    await expect(structured(TestSchema, "test prompt", undefined, client)).rejects.toThrow("max_tokens");
  });

  it("passes system prompt when provided", async () => {
    const create = vi.fn().mockResolvedValue(toolUseResponse({ name: "x", value: 1 }));
    const client = makeClient(create);

    await structured(TestSchema, "user prompt", "system instructions", client);

    const call = create.mock.calls[0][0];
    expect(call.system).toBeDefined();
    expect(call.system[0].text).toBe("system instructions");
  });
});
