import { structured, type AnthropicClient } from "../llm/client";
import { EngineeringReportSchema, type Hypothesis, type EvidenceMap, type EngineeringReport } from "../schemas";
import { reportPrompt, REPORT_SYSTEM } from "../prompts/report";

export async function runReport(
  storyTitle: string,
  hypothesis: Hypothesis,
  evidenceMap: EvidenceMap,
  client?: AnthropicClient
): Promise<EngineeringReport> {
  return structured(
    EngineeringReportSchema,
    reportPrompt(storyTitle, hypothesis.hypotheses, evidenceMap.items),
    REPORT_SYSTEM,
    client
  );
}
