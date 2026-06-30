import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const MODEL = "claude-sonnet-4-6";

export interface AnthropicClient {
  messages: {
    create: (params: Anthropic.MessageCreateParamsNonStreaming) => Promise<Anthropic.Message>;
  };
}

function defaultClient(): AnthropicClient {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function structured<T>(
  schema: z.ZodType<T>,
  userPrompt: string,
  systemPrompt?: string,
  client: AnthropicClient = defaultClient()
): Promise<T> {
  const jsonSchema = zodToJsonSchema(schema);

  const buildMessages = (extraUserMessage?: string): Anthropic.MessageParam[] => {
    const messages: Anthropic.MessageParam[] = [{ role: "user", content: userPrompt }];
    if (extraUserMessage) {
      messages.push({ role: "assistant", content: "I will correct the output." });
      messages.push({ role: "user", content: extraUserMessage });
    }
    return messages;
  };

  const callParams = (messages: Anthropic.MessageParam[]): Anthropic.MessageCreateParamsNonStreaming => ({
    model: MODEL,
    max_tokens: 4096,
    tools: [{ name: "output", description: "Return the structured output", input_schema: jsonSchema as Anthropic.Tool["input_schema"] }],
    tool_choice: { type: "tool", name: "output" },
    ...(systemPrompt
      ? { system: [{ type: "text" as const, text: systemPrompt, cache_control: { type: "ephemeral" as const } }] }
      : {}),
    messages,
  });

  const first = await client.messages.create(callParams(buildMessages()));

  if (first.stop_reason !== "tool_use") {
    throw new Error(`Unexpected stop_reason: ${first.stop_reason}`);
  }

  const firstParse = schema.safeParse(extractToolInput(first));
  if (firstParse.success) return firstParse.data;

  const errorMessage = `The previous output failed validation. Fix it.\n\nvalidation error: ${JSON.stringify(firstParse.error.issues)}`;
  const second = await client.messages.create(callParams(buildMessages(errorMessage)));

  if (second.stop_reason !== "tool_use") {
    throw new Error(`Unexpected stop_reason on retry: ${second.stop_reason}`);
  }

  const secondParse = schema.safeParse(extractToolInput(second));
  if (secondParse.success) return secondParse.data;

  throw new Error(`LLM output failed validation after 2 attempts: ${JSON.stringify(secondParse.error.issues)}`);
}

function extractToolInput(response: Anthropic.Message): unknown {
  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("No tool_use block in response");
  }
  return toolUse.input;
}

function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value);
      if (!(value instanceof z.ZodOptional)) required.push(key);
    }
    return { type: "object", properties, required };
  }
  if (schema instanceof z.ZodArray) return { type: "array", items: zodToJsonSchema(schema.element) };
  if (schema instanceof z.ZodString) return { type: "string" };
  if (schema instanceof z.ZodNumber) return { type: "number" };
  if (schema instanceof z.ZodBoolean) return { type: "boolean" };
  if (schema instanceof z.ZodEnum) return { type: "string", enum: schema.options };
  if (schema instanceof z.ZodOptional) return zodToJsonSchema(schema.unwrap());
  if (schema instanceof z.ZodNullable) return { ...zodToJsonSchema(schema.unwrap()), nullable: true };
  return {};
}
