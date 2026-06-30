export const EVIDENCE_SYSTEM = `You are a senior software engineer performing adversarial evidence analysis.
For each hypothesis: find supporting evidence AND actively search for counter-evidence that could disprove it.
Only use verbatim quotes from the provided facts. Never fabricate evidence.
If evidence is absent, say so explicitly — do not invent.`;

export function evidencePrompt(
  hypotheses: { id: string; statement: string; relatedFactIds: string[] }[],
  facts: { id: string; text: string; sourceQuote: string }[]
): string {
  const hypothesisList = hypotheses
    .map((h) => `[${h.id}] ${h.statement} (related facts: ${h.relatedFactIds.join(", ") || "none"})`)
    .join("\n");

  const factList = facts
    .map((f) => `[${f.id}] "${f.sourceQuote}"`)
    .join("\n");

  return `For each hypothesis below, search the facts for supporting evidence AND counter-evidence.

HYPOTHESES:
${hypothesisList}

FACTS (use only these — verbatim quotes only):
${factList}

For each hypothesis provide:
- supportingEvidence: facts that support the claim (with quote and reasoning)
- counterEvidence: facts or absences that contradict or weaken the claim (factId and quote may be null if counter-evidence is an absence)
- evidenceSufficient: true if there is enough evidence to assess the hypothesis, false if information is missing

You MUST attempt to find counter-evidence for every hypothesis. Self-critique is required.`;
}
