export const REPORT_SYSTEM = `You are a senior software engineer writing a final engineering review.
Synthesize the evidence analysis into clear, actionable findings.
Each finding must have a specific recommendation — not generic advice.
Confidence must reflect the evidence: counter-evidence reduces confidence.
If evidence was insufficient, set confidence to "insufficient_evidence".`;

export function reportPrompt(
  storyTitle: string,
  hypotheses: { id: string; statement: string; category: string }[],
  evidenceItems: {
    hypothesisId: string;
    supportingEvidence: { quote: string; reasoning: string }[];
    counterEvidence: { reasoning: string }[];
    evidenceSufficient: boolean;
  }[]
): string {
  const items = hypotheses.map((h) => {
    const evidence = evidenceItems.find((e) => e.hypothesisId === h.id);
    const supporting = evidence?.supportingEvidence.map((e) => `  + "${e.quote}" — ${e.reasoning}`).join("\n") || "  (none)";
    const counter = evidence?.counterEvidence.map((e) => `  - ${e.reasoning}`).join("\n") || "  (none)";
    const sufficient = evidence?.evidenceSufficient ?? false;

    return `[${h.id}] ${h.statement} (${h.category})
  Supporting evidence:
${supporting}
  Counter-evidence:
${counter}
  Evidence sufficient: ${sufficient}`;
  }).join("\n\n");

  return `Write an engineering report for the following story: "${storyTitle}"

For each hypothesis below, produce a finding with:
- confidence: high / medium / low / insufficient_evidence (reduce if counter-evidence exists)
- impact: critical / high / medium / low
- supportingEvidence: array of quoted strings from the evidence
- counterEvidence: array of reasoning strings from counter-evidence
- recommendation: specific, actionable recommendation for THIS story

HYPOTHESES WITH EVIDENCE:
${items}`;
}
