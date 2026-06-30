# Trace — Technical Specification

> **Status:** Draft v1 · **Companion docs:** [functional-spec.md](./functional-spec.md) · [tasks.md](./tasks.md)

---

## 1. System architecture

```
┌─────────────────────────────┐
│        Next.js Frontend     │
│   Input · Pipeline View ·   │
│         Findings            │
└──────────────┬──────────────┘
               │ REST / SSE
               ▼
┌─────────────────────────────┐
│     Node.js + Express API   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      Reasoning Pipeline     │
│  understand → hypothesize   │
│  → evidence → report        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│    Claude API (Anthropic)   │
└─────────────────────────────┘
```

The frontend never communicates directly with the LLM.

### 1.1 Tech stack

- **Frontend:** Vite · React · TypeScript · TailwindCSS · shadcn/ui · SSE for real-time pipeline progress.
- **Backend:** Node.js · Express · TypeScript.
- **LLM:** `claude-sonnet-4-6` via the official `@anthropic-ai/sdk`. Structured outputs enforced via `claude-sonnet-4-6`'s tool use / JSON mode. All calls validated with Zod.
- **State:** In-memory per-request. No database.

---

## 2. AI pipeline

The pipeline is the product. Each stage has a single responsibility and returns structured data consumed by the next stage.

```
Story Input (paste)
       │
       ▼
┌─────────────────────────────────┐
│  Stage 1: Understand + Extract  │  → Understanding + FactSet
└─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Stage 2: Hypothesize           │  → Hypothesis[]
└─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Stage 3: Evidence + Critique   │  → EvidenceMap[]
└─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Stage 4: Score + Report        │  → EngineeringReport
└─────────────────────────────────┘
```

Each stage emits an SSE event when it completes so the frontend can update the pipeline visualization in real time.

---

## 3. LLM conventions

All LLM calls go through a single `src/llm/client.ts` module.

- **Model:** `claude-sonnet-4-6`.
- **Structured outputs:** Use `tools` with `input_schema` + `tool_choice: { type: "tool" }` to force the model to return a specific JSON shape. All outputs validated with Zod before passing to the next stage.
- **Prompt caching:** The story input is reused across all 4 stages. Pass it at the top of the prompt with `cache_control: { type: "ephemeral" }` to avoid paying for it 4 times.
- **Retries:** On Zod validation failure, retry the call once with the validation error appended to the prompt. Fail hard after 2 attempts.
- **Error handling:** Check `stop_reason` before reading content. Handle `max_tokens` and `tool_use` stops explicitly. Never swallow errors silently.

Example (structured output via tool use):
```typescript
const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 4096,
  tools: [{ name: "output", input_schema: HYPOTHESIS_SCHEMA }],
  tool_choice: { type: "tool", name: "output" },
  system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
  messages: [{ role: "user", content: storyPrompt }],
});
```

---

## 4. Inter-module data contracts

These are the integration backbone. Define them first; implement against mocks.

### 4.1 `StoryInput` — API → Pipeline

```typescript
{
  raw: string;           // full pasted story text
  title?: string;        // extracted or inferred
  ticketId?: string;     // e.g. "EHS-1234", optional
}
```

### 4.2 `Understanding` — Stage 1 output

```typescript
{
  summary: string;
  actors: string[];
  systems: string[];
  mainFlow: string[];       // ordered steps
  acceptanceCriteria: string[];
  ambiguities: string[];    // things the story leaves unclear
}
```

### 4.3 `FactSet` — Stage 1 output (alongside Understanding)

```typescript
{
  facts: {
    id: string;
    text: string;           // objective, no opinion
    category: "api" | "service" | "business_rule" | "constraint" | "dependency" | "assumption";
    sourceQuote: string;    // verbatim excerpt from the story
  }[];
}
```

### 4.4 `Hypothesis` — Stage 2 output

```typescript
{
  hypotheses: {
    id: string;
    statement: string;      // falsifiable claim, e.g. "Retries are assumed safe"
    category: "safety" | "authorization" | "transaction" | "observability" | "race_condition" | "missing_constraint" | "other";
    relatedFactIds: string[];
  }[];
}
```

### 4.5 `EvidenceMap` — Stage 3 output

```typescript
{
  items: {
    hypothesisId: string;
    supportingEvidence: {
      factId: string;
      quote: string;
      reasoning: string;
    }[];
    counterEvidence: {
      factId: string | null;   // null when counter-evidence is an absence of information
      quote: string | null;
      reasoning: string;
    }[];
    evidenceSufficient: boolean;
  }[];
}
```

### 4.6 `EngineeringReport` — Stage 4 output (final)

```typescript
{
  storyTitle: string;
  findings: {
    id: string;
    hypothesis: string;
    category: string;
    confidence: "high" | "medium" | "low" | "insufficient_evidence";
    impact: "critical" | "high" | "medium" | "low";
    supportingEvidence: string[];   // quoted excerpts
    counterEvidence: string[];
    recommendation: string;
  }[];
  summary: {
    totalFindings: number;
    criticalCount: number;
    insufficientEvidenceCount: number;
  };
}
```

---

## 5. API surface (Express)

| Method | Path | Purpose | Returns |
|---|---|---|---|
| `POST` | `/api/analyze` | Submit a story; runs the full pipeline. | SSE stream |
| `GET` | `/api/health` | Health check. | `{ status: "ok" }` |

### `POST /api/analyze`

**Request body:**
```json
{ "raw": "string", "ticketId": "string (optional)" }
```

**Response:** SSE stream. Each event has a `type` and a `data` payload.

| Event type | Payload | When |
|---|---|---|
| `stage_start` | `{ stage: 1-4, name: string }` | Stage begins |
| `stage_complete` | `{ stage: 1-4, name: string, durationMs: number }` | Stage ends |
| `report` | `EngineeringReport` | Pipeline complete |
| `error` | `{ message: string, stage?: number }` | Any failure |

---

## 6. Module map

| Module | Path | Consumes | Produces |
|---|---|---|---|
| LLM client | `src/llm/client.ts` | — | Claude responses |
| Stage 1 | `src/pipeline/understand.ts` | `StoryInput` | `Understanding` + `FactSet` |
| Stage 2 | `src/pipeline/hypothesize.ts` | `Understanding` + `FactSet` | `Hypothesis` |
| Stage 3 | `src/pipeline/evidence.ts` | `Hypothesis` + `FactSet` | `EvidenceMap` |
| Stage 4 | `src/pipeline/report.ts` | `EvidenceMap` + `Hypothesis` | `EngineeringReport` |
| Pipeline orchestrator | `src/pipeline/index.ts` | `StoryInput` | SSE events + `EngineeringReport` |
| Schemas | `src/schemas/` | — | Zod schemas for all contracts |
| Analyze route | `src/routes/analyze.ts` | HTTP request | SSE stream |

---

## 7. Project structure

```
backend/
  src/
    llm/
      client.ts
    pipeline/
      index.ts
      understand.ts
      hypothesize.ts
      evidence.ts
      report.ts
    prompts/
      understand.ts
      hypothesize.ts
      evidence.ts
      report.ts
    schemas/
      storyInput.ts
      understanding.ts
      factSet.ts
      hypothesis.ts
      evidenceMap.ts
      engineeringReport.ts
    routes/
      analyze.ts
    types/
      index.ts
    app.ts
    server.ts

frontend/
  app/
    page.tsx
    layout.tsx
  components/
    StoryInput.tsx
    PipelineProgress.tsx
    FindingCard.tsx
    EvidenceDrawer.tsx
  hooks/
    useAnalysis.ts
  types/
    index.ts
  services/
    api.ts
```

---

## 8. Cross-cutting decisions

- **SSE over WebSockets:** simpler to implement, sufficient for one-directional pipeline updates.
- **No streaming LLM responses to the client:** each stage completes fully before the SSE event fires. This keeps the pipeline state machine simple and avoids partial JSON on the client.
- **Zod everywhere:** all LLM outputs and all API request bodies validated with Zod. No untyped data crosses module boundaries.
- **Prompts as code:** prompts live in `src/prompts/` as TypeScript functions, not in a database or config file. They receive typed inputs and return strings.
- **Secrets:** `ANTHROPIC_API_KEY` via environment variable only. Never sent to the frontend.
- **No silent failures:** every stage must either return valid structured data or throw. The orchestrator catches and emits an `error` SSE event with the failing stage number.
