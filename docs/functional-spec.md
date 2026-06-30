# Trace — Functional Specification

> **Status:** Draft v1 · **Audience:** Hackathon team, judges
> **Companion docs:** [technical-spec.md](./technical-spec.md) · [tasks.md](./tasks.md)

## 1. Vision

Trace is an AI-powered engineering reasoning engine.

Given a Jira story, Trace does not produce a checklist or a summary. It builds engineering hypotheses, searches for evidence, attempts to falsify its own conclusions, and presents a structured reasoning report.

The objective is not to replace engineering judgment. The objective is to make reasoning explicit.

> "Trust nothing. Follow the evidence."

## 2. Problem

Engineering teams review Jira stories every day. Most reviews are shallow: someone reads the description, adds a comment, and moves on. Hidden assumptions, missing constraints, unsafe operations, and ambiguous responsibilities are rarely surfaced before implementation begins.

AI tools today either summarize the story or generate a generic checklist. Neither approach exposes the underlying reasoning — and unexplained conclusions are not trustworthy.

## 3. Target users

| Persona | Wants to… |
|---|---|
| Software Engineer | Understand what assumptions a story makes before writing code |
| Tech Lead | Identify risks and missing constraints before refinement |
| QA Engineer | Find edge cases and untested scenarios in the story |
| Engineering Manager | Understand the hidden complexity behind a story |

## 4. Core user flow

1. **Input** a Jira story (paste text or provide a ticket ID).
2. **Watch** Trace run its reasoning pipeline, stage by stage.
3. **Review** the engineering findings: hypotheses, evidence, counter-evidence, confidence, and recommendations.
4. **Understand** exactly why Trace reached each conclusion.

## 5. Functional requirements

### 5.1 Story input (FR-IN)
- **FR-IN-1** Accept a Jira story as pasted text (title + description + acceptance criteria).
- **FR-IN-2** *(Stretch)* Accept a Jira ticket ID and fetch the story via the Atlassian MCP or Jira API (comments, linked issues, description).
- **FR-IN-3** Reject empty or unparseable input with a clear message.
- **FR-IN-4** Show which fields were found (title, AC, comments, linked tasks) before running the pipeline.

### 5.2 Reasoning pipeline (FR-RP)
- **FR-RP-1** Run the pipeline in sequential stages; each stage produces structured data consumed by the next.
- **FR-RP-2** Every stage transition must be visible to the user in real time.
- **FR-RP-3** No stage may produce findings without evidence extracted from the input.
- **FR-RP-4** At least one counter-evidence search must be attempted per hypothesis.
- **FR-RP-5** The pipeline must complete even when evidence is missing — it should report "insufficient evidence" rather than fabricate.

### 5.3 Hypotheses (FR-HY)
- **FR-HY-1** Generate engineering hypotheses, not checklist items.
- **FR-HY-2** Each hypothesis must belong to a category: safety, authorization, transaction, observability, race condition, missing constraint, or other.
- **FR-HY-3** Hypotheses must be falsifiable — they must make a specific claim that evidence can support or contradict.

### 5.4 Findings (FR-FI)
- **FR-FI-1** Each finding contains: hypothesis, supporting evidence, counter-evidence, confidence level, impact, and recommendation.
- **FR-FI-2** Confidence levels: High / Medium / Low / Insufficient evidence.
- **FR-FI-3** Evidence must be quoted directly from the story input — no paraphrasing presented as evidence.
- **FR-FI-4** When counter-evidence exists, confidence must be reduced.

### 5.5 Viewer experience (FR-UX)
- **FR-UX-1** The UI must not look like a chatbot. It must feel like an engineering review tool.
- **FR-UX-2** Pipeline stages are displayed with real-time progress — not a generic spinner.
- **FR-UX-3** Findings are displayed as structured cards, not a wall of text.
- **FR-UX-4** The user can expand the reasoning behind each finding (evidence + counter-evidence).

## 6. Scope

### 6.1 MVP (must-have for the demo)
- Paste a Jira story text → run the pipeline → display findings.
- Real-time pipeline stage visualization.
- At least 3–5 findings per story with full evidence chains.
- Expandable evidence and counter-evidence per finding.

### 6.2 Stretch goals
1. Fetch story directly from Jira by ticket ID (Atlassian MCP / Jira API).
2. Fetch linked issues, comments, and Confluence pages to enrich context.
3. "Ask Trace" — follow-up questions about a specific finding.
4. Export findings as a Confluence page or PR comment.

## 7. Demo success criteria

A successful demo makes the audience think:

> "I understand exactly why Trace reached this conclusion."

not

> "An LLM generated another report."

Specifically, the judges should see:
- A real Jira story pasted into the tool.
- The pipeline running visibly, stage by stage.
- At least one finding where counter-evidence reduces confidence — proving the self-critique is real.
- At least one finding marked "Insufficient evidence" — proving Trace admits uncertainty.

## 8. Non-goals (for the hackathon)

- RAG, vector databases, or historical incident data.
- GitHub, Confluence, or multi-artifact analysis.
- Authentication, user accounts, or persistence.
- Multiple artifact types beyond Jira stories.
- Production-grade error handling, rate limiting, or observability.

## 9. Open questions

- Which Jira story do we use as the canonical demo input?
- Do we go for Jira API integration (stretch) or focus on paste-text for the demo?
- Should findings be ordered by confidence (descending) or by impact?
