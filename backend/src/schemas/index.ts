import { z } from "zod";

export const StoryInputSchema = z.object({
  raw: z.string().min(1),
  title: z.string().optional(),
  ticketId: z.string().optional(),
});

export const UnderstandingSchema = z.object({
  summary: z.string().min(1),
  actors: z.array(z.string()),
  systems: z.array(z.string()),
  mainFlow: z.array(z.string()),
  acceptanceCriteria: z.array(z.string()),
  ambiguities: z.array(z.string()),
});

export const FactCategorySchema = z.enum([
  "api",
  "service",
  "business_rule",
  "constraint",
  "dependency",
  "assumption",
]);

export const FactSetSchema = z.object({
  facts: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      category: FactCategorySchema,
      sourceQuote: z.string(),
    })
  ),
});

export const HypothesisCategorySchema = z.enum([
  "safety",
  "authorization",
  "transaction",
  "observability",
  "race_condition",
  "missing_constraint",
  "other",
]);

export const HypothesisSchema = z.object({
  hypotheses: z.array(
    z.object({
      id: z.string(),
      statement: z.string().min(1),
      category: HypothesisCategorySchema,
      relatedFactIds: z.array(z.string()),
    })
  ),
});

export const EvidenceMapSchema = z.object({
  items: z.array(
    z.object({
      hypothesisId: z.string(),
      supportingEvidence: z.array(
        z.object({
          factId: z.string(),
          quote: z.string(),
          reasoning: z.string(),
        })
      ),
      counterEvidence: z.array(
        z.object({
          factId: z.string().nullable(),
          quote: z.string().nullable(),
          reasoning: z.string(),
        })
      ),
      evidenceSufficient: z.boolean(),
    })
  ),
});

export const ConfidenceSchema = z.enum(["high", "medium", "low", "insufficient_evidence"]);
export const ImpactSchema = z.enum(["critical", "high", "medium", "low"]);

export const EngineeringReportSchema = z.object({
  storyTitle: z.string(),
  findings: z.array(
    z.object({
      id: z.string(),
      hypothesis: z.string(),
      category: z.string(),
      confidence: ConfidenceSchema,
      impact: ImpactSchema,
      supportingEvidence: z.array(z.string()),
      counterEvidence: z.array(z.string()),
      recommendation: z.string(),
    })
  ),
  summary: z.object({
    totalFindings: z.number().int().min(0),
    criticalCount: z.number().int().min(0),
    insufficientEvidenceCount: z.number().int().min(0),
  }),
});

export type StoryInput = z.infer<typeof StoryInputSchema>;
export type Understanding = z.infer<typeof UnderstandingSchema>;
export type FactSet = z.infer<typeof FactSetSchema>;
export type Hypothesis = z.infer<typeof HypothesisSchema>;
export type EvidenceMap = z.infer<typeof EvidenceMapSchema>;
export type EngineeringReport = z.infer<typeof EngineeringReportSchema>;
