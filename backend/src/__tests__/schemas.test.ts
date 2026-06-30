import { describe, it, expect } from "vitest";
import {
  StoryInputSchema,
  UnderstandingSchema,
  FactSetSchema,
  HypothesisSchema,
  EvidenceMapSchema,
  EngineeringReportSchema,
} from "../schemas";

// --- StoryInput ---

describe("StoryInputSchema", () => {
  it("accepts raw text only", () => {
    const result = StoryInputSchema.safeParse({ raw: "As a user I want..." });
    expect(result.success).toBe(true);
  });

  it("accepts raw text with optional fields", () => {
    const result = StoryInputSchema.safeParse({
      raw: "As a user I want...",
      title: "User login",
      ticketId: "EHS-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing raw", () => {
    const result = StoryInputSchema.safeParse({ title: "No raw field" });
    expect(result.success).toBe(false);
  });

  it("rejects empty raw string", () => {
    const result = StoryInputSchema.safeParse({ raw: "" });
    expect(result.success).toBe(false);
  });
});

// --- Understanding ---

describe("UnderstandingSchema", () => {
  const valid = {
    summary: "User can log in with email and password",
    actors: ["User", "Auth Service"],
    systems: ["Frontend", "Auth API"],
    mainFlow: ["User enters credentials", "System validates"],
    acceptanceCriteria: ["Given valid credentials, user is redirected to dashboard"],
    ambiguities: ["Token expiry not specified"],
  };

  it("accepts valid understanding", () => {
    expect(UnderstandingSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts empty arrays for optional list fields", () => {
    const result = UnderstandingSchema.safeParse({ ...valid, ambiguities: [] });
    expect(result.success).toBe(true);
  });

  it("rejects missing summary", () => {
    const { summary: _, ...rest } = valid;
    expect(UnderstandingSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects non-string items in actors array", () => {
    const result = UnderstandingSchema.safeParse({ ...valid, actors: [1, 2] });
    expect(result.success).toBe(false);
  });
});

// --- FactSet ---

describe("FactSetSchema", () => {
  const validFact = {
    id: "f1",
    text: "The API uses POST /login",
    category: "api",
    sourceQuote: "calls POST /login endpoint",
  };

  it("accepts valid fact set", () => {
    const result = FactSetSchema.safeParse({ facts: [validFact] });
    expect(result.success).toBe(true);
  });

  it("accepts empty facts array", () => {
    expect(FactSetSchema.safeParse({ facts: [] }).success).toBe(true);
  });

  it("rejects invalid category", () => {
    const result = FactSetSchema.safeParse({
      facts: [{ ...validFact, category: "unknown" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects fact missing sourceQuote", () => {
    const { sourceQuote: _, ...noQuote } = validFact;
    expect(FactSetSchema.safeParse({ facts: [noQuote] }).success).toBe(false);
  });

  it("accepts all valid categories", () => {
    const categories = ["api", "service", "business_rule", "constraint", "dependency", "assumption"];
    for (const category of categories) {
      const result = FactSetSchema.safeParse({ facts: [{ ...validFact, category }] });
      expect(result.success, `category "${category}" should be valid`).toBe(true);
    }
  });
});

// --- Hypothesis ---

describe("HypothesisSchema", () => {
  const validHypothesis = {
    id: "h1",
    statement: "Retries are assumed to be safe",
    category: "safety",
    relatedFactIds: ["f1"],
  };

  it("accepts valid hypothesis list", () => {
    const result = HypothesisSchema.safeParse({ hypotheses: [validHypothesis] });
    expect(result.success).toBe(true);
  });

  it("accepts empty relatedFactIds", () => {
    const result = HypothesisSchema.safeParse({
      hypotheses: [{ ...validHypothesis, relatedFactIds: [] }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid category", () => {
    const result = HypothesisSchema.safeParse({
      hypotheses: [{ ...validHypothesis, category: "magic" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty statement", () => {
    const result = HypothesisSchema.safeParse({
      hypotheses: [{ ...validHypothesis, statement: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid categories", () => {
    const categories = ["safety", "authorization", "transaction", "observability", "race_condition", "missing_constraint", "other"];
    for (const category of categories) {
      const result = HypothesisSchema.safeParse({
        hypotheses: [{ ...validHypothesis, category }],
      });
      expect(result.success, `category "${category}" should be valid`).toBe(true);
    }
  });
});

// --- EvidenceMap ---

describe("EvidenceMapSchema", () => {
  const validItem = {
    hypothesisId: "h1",
    supportingEvidence: [
      { factId: "f1", quote: "retries on failure", reasoning: "implies retry logic exists" },
    ],
    counterEvidence: [
      { factId: null, quote: null, reasoning: "no idempotency key mentioned" },
    ],
    evidenceSufficient: true,
  };

  it("accepts valid evidence map", () => {
    const result = EvidenceMapSchema.safeParse({ items: [validItem] });
    expect(result.success).toBe(true);
  });

  it("accepts empty supporting and counter evidence arrays", () => {
    const result = EvidenceMapSchema.safeParse({
      items: [{ ...validItem, supportingEvidence: [], counterEvidence: [] }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts null factId and quote in counter evidence", () => {
    const result = EvidenceMapSchema.safeParse({
      items: [{ ...validItem, counterEvidence: [{ factId: null, quote: null, reasoning: "absent" }] }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects counter evidence missing reasoning", () => {
    const result = EvidenceMapSchema.safeParse({
      items: [{ ...validItem, counterEvidence: [{ factId: null, quote: null }] }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing evidenceSufficient", () => {
    const { evidenceSufficient: _, ...rest } = validItem;
    expect(EvidenceMapSchema.safeParse({ items: [rest] }).success).toBe(false);
  });
});

// --- EngineeringReport ---

describe("EngineeringReportSchema", () => {
  const validFinding = {
    id: "fi1",
    hypothesis: "Retries are assumed safe",
    category: "safety",
    confidence: "medium",
    impact: "high",
    supportingEvidence: ["retries on failure mentioned in AC"],
    counterEvidence: ["no idempotency key mentioned"],
    recommendation: "Add idempotency key to the retry mechanism",
  };

  const validReport = {
    storyTitle: "User Login",
    findings: [validFinding],
    summary: { totalFindings: 1, criticalCount: 0, insufficientEvidenceCount: 0 },
  };

  it("accepts valid report", () => {
    expect(EngineeringReportSchema.safeParse(validReport).success).toBe(true);
  });

  it("accepts empty findings array", () => {
    const result = EngineeringReportSchema.safeParse({
      ...validReport,
      findings: [],
      summary: { totalFindings: 0, criticalCount: 0, insufficientEvidenceCount: 0 },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid confidence level", () => {
    const result = EngineeringReportSchema.safeParse({
      ...validReport,
      findings: [{ ...validFinding, confidence: "very_high" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid impact level", () => {
    const result = EngineeringReportSchema.safeParse({
      ...validReport,
      findings: [{ ...validFinding, impact: "catastrophic" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid confidence levels", () => {
    const levels = ["high", "medium", "low", "insufficient_evidence"];
    for (const confidence of levels) {
      const result = EngineeringReportSchema.safeParse({
        ...validReport,
        findings: [{ ...validFinding, confidence }],
      });
      expect(result.success, `confidence "${confidence}" should be valid`).toBe(true);
    }
  });

  it("accepts all valid impact levels", () => {
    const levels = ["critical", "high", "medium", "low"];
    for (const impact of levels) {
      const result = EngineeringReportSchema.safeParse({
        ...validReport,
        findings: [{ ...validFinding, impact }],
      });
      expect(result.success, `impact "${impact}" should be valid`).toBe(true);
    }
  });

  it("rejects missing summary", () => {
    const { summary: _, ...rest } = validReport;
    expect(EngineeringReportSchema.safeParse(rest).success).toBe(false);
  });
});
