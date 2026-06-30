# Trace

> Trust nothing. Follow the evidence.

Trace is an AI-powered engineering reasoning engine. Given a Jira story, it builds engineering hypotheses, searches for evidence, attempts to falsify its own conclusions, and presents structured findings — with full reasoning visible at every step.

The objective is not to replace engineering judgment. The objective is to make reasoning explicit.

---

## How it works

```
Story Input
    ↓
Stage 1 — Understand & Extract Facts
    ↓
Stage 2 — Generate Hypotheses
    ↓
Stage 3 — Collect Evidence & Counter-Evidence
    ↓
Stage 4 — Score & Build Report
    ↓
Engineering Findings
```

Each stage runs as a separate LLM call and streams progress to the UI in real time. Every finding includes the hypothesis, supporting evidence, counter-evidence, confidence level, and a specific recommendation.

---

## Running locally

**Requirements:** Node.js 18+, an Anthropic API key.

```bash
# Backend
cd backend
cp .env.example .env        # add your ANTHROPIC_API_KEY
npm install
npm run dev                 # http://localhost:3001

# Frontend (separate terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Open `http://localhost:5173`, paste a Jira story, and click **Analyze**.

A demo story is available at [`docs/demo-story.md`](docs/demo-story.md).

---

## Running tests

```bash
# Backend (60 tests)
cd backend && npm test

# Frontend (32 tests)
cd frontend && npm test
```

---

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | Vite · React · TypeScript · Tailwind CSS |
| Backend | Node.js · Express · TypeScript |
| LLM | Claude (`claude-sonnet-4-6`) via Anthropic SDK |
| Validation | Zod |
| Tests | Vitest · Testing Library |

---

## Project structure

```
Trace/
├── backend/
│   └── src/
│       ├── llm/          # Claude client with structured output helper
│       ├── pipeline/     # 4 reasoning stages + orchestrator
│       ├── prompts/      # Prompt functions per stage
│       ├── schemas/      # Zod schemas for all pipeline contracts
│       ├── fixtures/     # Mock data for development
│       └── routes/       # Express routes (POST /api/analyze)
├── frontend/
│   └── src/
│       ├── components/   # StoryInput, PipelineProgress, FindingCard, EvidenceDrawer
│       ├── hooks/        # useAnalysis (SSE stream consumer)
│       └── types/        # Shared TypeScript types
└── docs/
    ├── functional-spec.md
    ├── technical-spec.md
    ├── tasks.md
    └── demo-story.md
```

---

## Environment variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `PORT` | Backend port (default: `3001`) |
| `USE_MOCK_PIPELINE` | Set to `true` to skip LLM calls and return fixture data |
