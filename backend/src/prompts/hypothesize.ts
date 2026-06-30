export const HYPOTHESIZE_SYSTEM = `You are a senior software engineer performing a critical engineering review.
Your job is to generate falsifiable engineering hypotheses — specific claims that can be supported or contradicted by evidence.
Focus on: safety assumptions, missing authorization, transaction boundaries, observability gaps, race conditions, and missing constraints.
Do not generate generic advice. Each hypothesis must be a specific, testable claim about THIS story.`;

export function hypothesizePrompt(summary: string, facts: { id: string; text: string; category: string }[]): string {
  const factList = facts.map((f) => `[${f.id}] (${f.category}) ${f.text}`).join("\n");

  return `Generate engineering hypotheses for the following story.

SUMMARY:
${summary}

EXTRACTED FACTS:
${factList}

For each hypothesis:
- Make a specific, falsifiable claim about an engineering assumption or risk
- Reference the fact IDs that are related
- Assign a category: safety, authorization, transaction, observability, race_condition, missing_constraint, or other

Generate between 3 and 6 hypotheses. Prioritize the most impactful risks.`;
}
