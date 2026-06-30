# Trace — Tasks

> **Status:** Draft v1 · **Team:** 1 developer · **Companion docs:** [functional-spec.md](./functional-spec.md) · [technical-spec.md](./technical-spec.md)

## Execution order

Build in this sequence. Each phase unblocks the next. Do not start Phase 2 before Phase 1 is working end-to-end with mocks.

---

## Phase 0 — Foundations

- [ ] **P0.1** Scaffold `/backend` (Node.js + Express + TypeScript) and `/frontend` (Next.js + TypeScript + Tailwind + shadcn/ui).
- [ ] **P0.2** Write all Zod schemas from [technical-spec §4](./technical-spec.md#4-inter-module-data-contracts): `StoryInput`, `Understanding`, `FactSet`, `Hypothesis`, `EvidenceMap`, `EngineeringReport`.
- [ ] **P0.3** Commit one mock fixture per contract (static JSON files in `/backend/src/fixtures/`).
- [ ] **P0.4** `src/llm/client.ts`: Claude client init, `ANTHROPIC_API_KEY` from env, a `structured<T>(schema, prompt, system?)` helper using tool use + Zod validation + 1 retry on failure.
- [ ] **P0.5** `POST /api/analyze` route returning a mock SSE stream (hardcoded stage events + mock report). Verify SSE works in the browser before touching the pipeline.

---

## Phase 1 — Backend pipeline

Build each stage against real LLM calls. Test with a pasted story before wiring to the frontend.

- [ ] **P1.1** `src/prompts/understand.ts` + `src/pipeline/understand.ts` → `Understanding` + `FactSet`.
- [ ] **P1.2** `src/prompts/hypothesize.ts` + `src/pipeline/hypothesize.ts` → `Hypothesis[]`.
- [ ] **P1.3** `src/prompts/evidence.ts` + `src/pipeline/evidence.ts` → `EvidenceMap[]`.
- [ ] **P1.4** `src/prompts/report.ts` + `src/pipeline/report.ts` → `EngineeringReport`.
- [ ] **P1.5** `src/pipeline/index.ts`: orchestrator that runs P1.1–P1.4 in sequence and emits SSE events between stages.
- [ ] **P1.6** Wire orchestrator into `POST /api/analyze`. End-to-end test with a real story.

---

## Phase 2 — Frontend

Build against the mock SSE stream from P0.5 first. Swap for real backend last.

- [ ] **P2.1** `StoryInput.tsx`: textarea for story paste + submit button. Clean, minimal — not a chatbot UI.
- [ ] **P2.2** `useAnalysis.ts` hook: opens SSE connection, parses events, exposes `{ stages, report, error }` state.
- [ ] **P2.3** `PipelineProgress.tsx`: displays 4 stages with ✓ / loading / pending states. No generic spinners.
- [ ] **P2.4** `FindingCard.tsx`: renders one finding — hypothesis, confidence badge, impact badge, recommendation.
- [ ] **P2.5** `EvidenceDrawer.tsx`: expandable panel per finding showing supporting evidence + counter-evidence quotes.
- [ ] **P2.6** Wire all components together on `app/page.tsx`. Test full flow with mock data.
- [ ] **P2.7** Swap mock SSE for real backend. End-to-end test.

---

## Phase 3 — Polish & demo prep

- [ ] **P3.1** Choose the canonical demo story (a real Jira ticket with enough complexity to generate 4+ findings).
- [ ] **P3.2** Run the full pipeline on the demo story. Tune prompts until findings are sharp and evidence is accurate.
- [ ] **P3.3** Verify at least one finding has counter-evidence that reduces confidence.
- [ ] **P3.4** Verify at least one finding is marked `insufficient_evidence`.
- [ ] **P3.5** Fallback: save the `EngineeringReport` JSON for the demo story. If API is slow during the demo, load from cache.
- [ ] **P3.6** Rehearse the demo beat: paste story → watch pipeline → expand one finding's evidence chain.

---

## Demo storyline

Paste a real Jira story → watch the 4 stages light up one by one → scroll through findings → expand a finding to show the evidence and counter-evidence that drove the confidence score.

The moment that wins: a finding where Trace says *"I found evidence for this hypothesis — but also found evidence against it, so confidence is Medium."*
