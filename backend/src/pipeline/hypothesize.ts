import { structured, type AnthropicClient } from "../llm/client";
import { HypothesisSchema, type Understanding, type FactSet, type Hypothesis } from "../schemas";
import { hypothesizePrompt, HYPOTHESIZE_SYSTEM } from "../prompts/hypothesize";

export async function runHypothesize(
  understanding: Understanding,
  factSet: FactSet,
  client?: AnthropicClient
): Promise<Hypothesis> {
  return structured(
    HypothesisSchema,
    hypothesizePrompt(understanding.summary, factSet.facts),
    HYPOTHESIZE_SYSTEM,
    client
  );
}
