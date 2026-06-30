import { structured, type AnthropicClient } from "../llm/client";
import { EvidenceMapSchema, type Hypothesis, type FactSet, type EvidenceMap } from "../schemas";
import { evidencePrompt, EVIDENCE_SYSTEM } from "../prompts/evidence";

export async function runEvidence(
  hypothesis: Hypothesis,
  factSet: FactSet,
  client?: AnthropicClient
): Promise<EvidenceMap> {
  return structured(
    EvidenceMapSchema,
    evidencePrompt(hypothesis.hypotheses, factSet.facts),
    EVIDENCE_SYSTEM,
    client
  );
}
