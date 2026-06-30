# TRACE

> Trust nothing. Follow the evidence.

## Vision

Trace is an AI-powered engineering reasoning engine.

Unlike traditional AI assistants that answer questions or review code, Trace builds engineering hypotheses, searches for evidence, attempts to falsify its own conclusions, and only then presents findings.

The objective is **not** to replace engineering judgment.

The objective is to improve engineering decisions by making reasoning explicit.

---

# MVP Goal

For the hackathon, Trace will focus on a single artifact:

- Jira Story

The goal is not to support every engineering artifact.

The goal is to demonstrate a compelling reasoning pipeline.

---

# Core Principles

## Evidence first

Every finding must be backed by explicit evidence extracted from the artifact.

No unsupported conclusions.

---

## Hypothesis-driven

Trace does not produce checklists.

It generates engineering hypotheses.

Example:

"The implementation assumes retries are safe."

---

## Self-critique

Whenever possible, Trace searches for evidence that disproves its own hypothesis.

This reduces hallucinations and increases confidence.

---

## Explainability

The reasoning process should be visible.

Users should understand how Trace reached every conclusion.

---

## Confidence over certainty

Trace should admit uncertainty.

It is acceptable to say:

"I cannot determine because evidence is missing."

---

# Tech Stack

## Frontend

- Next.js
- TypeScript
- TailwindCSS
- shadcn/ui

---

## Backend

Separate backend project.

- Node.js
- Express
- TypeScript

The backend exposes REST endpoints only.

No authentication.

No database.

Everything runs locally.

---

## LLM

Use OpenAI API.

Responses should be structured JSON whenever possible.

Avoid markdown responses from the model.

---

## Validation

Zod

All LLM outputs should be validated.

---

# Architecture

```
Frontend

↓

Backend API

↓

Reasoning Pipeline

↓

LLM
```

The frontend never communicates directly with the LLM.

---

# Project Structure

Backend

```
src/

    pipeline/

        understand/

        facts/

        reasoners/

        evidence/

        confidence/

        report/

    prompts/

    schemas/

    routes/

    services/

    types/

    utils/
```

Frontend

```
app/

components/

hooks/

types/

services/
```

---

# Reasoning Pipeline

The pipeline is the product.

Each stage has a single responsibility.

```
Story

↓

Understanding

↓

Fact Extraction

↓

Hypothesis Generation

↓

Evidence Collection

↓

Counter-Evidence Search

↓

Confidence Scoring

↓

Engineering Report
```

Each stage returns structured data.

---

# Pipeline Stages

## 1. Understanding

Understand the Jira Story.

Output:

- Summary
- Actors
- Systems
- Main Flow

---

## 2. Fact Extraction

Extract objective facts only.

Examples:

- APIs
- Services
- Business Rules
- Constraints
- Dependencies

Facts should never contain opinions.

---

## 3. Hypothesis Generation

Generate engineering hypotheses.

Examples:

- Retry safety
- Authorization
- Transaction boundaries
- Missing monitoring
- Race conditions

---

## 4. Evidence Collection

Search the extracted facts for evidence supporting each hypothesis.

Every hypothesis must contain evidence.

---

## 5. Counter-Evidence

Attempt to invalidate each hypothesis.

If evidence against the hypothesis exists, reduce confidence.

---

## 6. Confidence Scoring

Assign confidence.

High

Medium

Low

The score depends on available evidence.

---

## 7. Engineering Report

Produce the final review.

Each finding contains:

- hypothesis
- evidence
- counter evidence
- confidence
- impact
- recommendation

---

# UI

The UI should not feel like ChatGPT.

The UI should feel like an engineering review.

Main screen:

Upload Story

↓

Pipeline Visualization

↓

Engineering Findings

↓

Questions

---

# Pipeline Visualization

Every stage should be visible.

Example:

✓ Understanding

✓ Facts Extracted

✓ Hypotheses Generated

✓ Evidence Collected

✓ Counter Evidence

✓ Confidence

✓ Report Ready

Avoid generic loading spinners.

The reasoning process is part of the product.

---

# Findings

Each finding contains:

Hypothesis

Evidence

Counter Evidence

Confidence

Impact

Recommendation

---

# Engineering Philosophy

Trace does not answer:

"What should I do?"

Trace answers:

"What assumptions exist?"

"What evidence supports this?"

"What evidence contradicts this?"

"What information is missing?"

---

# Non Goals

For the hackathon we intentionally exclude:

- RAG
- GitHub integration
- Jira integration
- Confluence
- Database
- Authentication
- Multi-agent systems
- Vector databases
- Historical incidents
- Multiple artifact types

The objective is depth, not breadth.

---

# Success Criteria

A successful demo makes the audience think:

"I understand exactly why Trace reached this conclusion."

not

"An LLM generated another report."

The reasoning process is the product.