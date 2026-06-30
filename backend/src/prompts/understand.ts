export const UNDERSTAND_SYSTEM = `You are an expert software engineer analyzing a Jira story.
Extract a precise, structured understanding of what the story describes.
Be objective. Do not add opinions or recommendations.`;

export function understandPrompt(raw: string): string {
  return `Analyze the following Jira story and extract a structured understanding.

STORY:
${raw}

Extract:
- summary: one sentence describing what this story implements
- actors: people or systems that interact in this story
- systems: technical systems, services, or APIs involved
- mainFlow: ordered list of steps describing the main flow
- acceptanceCriteria: the explicit acceptance criteria from the story
- ambiguities: things the story leaves unclear or undefined`;
}

export const FACTS_SYSTEM = `You are an expert software engineer extracting objective facts from a Jira story.
Facts must be objective — no opinions, no interpretations.
Every fact must include the exact quote from the story that supports it.`;

export function factsPrompt(raw: string, summary: string): string {
  return `Extract objective engineering facts from the following Jira story.

STORY:
${raw}

SUMMARY (for context):
${summary}

Extract facts about: APIs, services, business rules, constraints, dependencies, and assumptions.
For each fact, include the exact verbatim quote from the story.`;
}
