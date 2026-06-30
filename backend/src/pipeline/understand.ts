import { structured, type AnthropicClient } from "../llm/client";
import { UnderstandingSchema, FactSetSchema, type StoryInput, type Understanding, type FactSet } from "../schemas";
import { understandPrompt, UNDERSTAND_SYSTEM, factsPrompt, FACTS_SYSTEM } from "../prompts/understand";

export interface Stage1Output {
  understanding: Understanding;
  factSet: FactSet;
}

export async function runUnderstand(input: StoryInput, client?: AnthropicClient): Promise<Stage1Output> {
  const understanding = await structured(
    UnderstandingSchema,
    understandPrompt(input.raw),
    UNDERSTAND_SYSTEM,
    client
  );

  const factSet = await structured(
    FactSetSchema,
    factsPrompt(input.raw, understanding.summary),
    FACTS_SYSTEM,
    client
  );

  return { understanding, factSet };
}
