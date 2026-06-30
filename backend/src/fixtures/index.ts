import type {
  StoryInput,
  Understanding,
  FactSet,
  Hypothesis,
  EvidenceMap,
  EngineeringReport,
} from "../schemas";

export const mockStoryInput: StoryInput = {
  raw: `Title: Integrate payment retry mechanism

As a customer, I want failed payments to be automatically retried so that temporary errors don't cancel my order.

Acceptance Criteria:
- When a payment fails, the system retries up to 3 times with exponential backoff
- If all retries fail, the order is marked as payment_failed and the customer is notified
- Payment service is called via POST /payments endpoint
- Each retry attempt is logged for audit purposes
- The same payment intent ID is reused across retries`,
  title: "Integrate payment retry mechanism",
  ticketId: "EHS-4201",
};

export const mockUnderstanding: Understanding = {
  summary:
    "Implement automatic payment retry logic with exponential backoff, reusing the same payment intent across attempts.",
  actors: ["Customer", "Order Service", "Payment Service"],
  systems: ["Order Service", "Payment API (POST /payments)", "Notification Service", "Audit Log"],
  mainFlow: [
    "Payment attempt is made via POST /payments",
    "On failure, retry up to 3 times with exponential backoff",
    "Reuse same payment intent ID across retries",
    "If all retries fail, mark order as payment_failed",
    "Notify customer of failure",
    "Log each attempt for audit",
  ],
  acceptanceCriteria: [
    "Retry up to 3 times with exponential backoff on failure",
    "Mark order as payment_failed if all retries fail",
    "Notify customer on final failure",
    "Log every retry attempt",
    "Reuse same payment intent ID across retries",
  ],
  ambiguities: [
    "Which failure codes trigger a retry vs. immediate failure (e.g. card declined vs. network error)?",
    "Is the retry logic synchronous or async (queue-based)?",
    "Who owns the payment intent — order service or payment service?",
  ],
};

export const mockFactSet: FactSet = {
  facts: [
    {
      id: "f1",
      text: "Payment service is called via POST /payments",
      category: "api",
      sourceQuote: "Payment service is called via POST /payments endpoint",
    },
    {
      id: "f2",
      text: "Retry up to 3 times with exponential backoff",
      category: "business_rule",
      sourceQuote: "the system retries up to 3 times with exponential backoff",
    },
    {
      id: "f3",
      text: "Same payment intent ID is reused across retries",
      category: "constraint",
      sourceQuote: "The same payment intent ID is reused across retries",
    },
    {
      id: "f4",
      text: "Each retry attempt must be logged for audit",
      category: "business_rule",
      sourceQuote: "Each retry attempt is logged for audit purposes",
    },
    {
      id: "f5",
      text: "Order is marked payment_failed if all retries fail",
      category: "business_rule",
      sourceQuote: "the order is marked as payment_failed and the customer is notified",
    },
  ],
};

export const mockHypothesis: Hypothesis = {
  hypotheses: [
    {
      id: "h1",
      statement: "POST /payments is assumed to be idempotent when reusing the same payment intent ID",
      category: "safety",
      relatedFactIds: ["f1", "f3"],
    },
    {
      id: "h2",
      statement: "All payment failures trigger a retry, regardless of failure type",
      category: "missing_constraint",
      relatedFactIds: ["f2"],
    },
    {
      id: "h3",
      statement: "Retry logic runs synchronously within the request lifecycle",
      category: "transaction",
      relatedFactIds: ["f2"],
    },
    {
      id: "h4",
      statement: "No authorization check is defined for who can trigger a retry",
      category: "authorization",
      relatedFactIds: [],
    },
  ],
};

export const mockEvidenceMap: EvidenceMap = {
  items: [
    {
      hypothesisId: "h1",
      supportingEvidence: [
        {
          factId: "f3",
          quote: "The same payment intent ID is reused across retries",
          reasoning: "Reusing the same intent ID only makes sense if the endpoint is idempotent; otherwise duplicate charges could occur.",
        },
      ],
      counterEvidence: [
        {
          factId: null,
          quote: null,
          reasoning: "The story does not explicitly state that POST /payments is idempotent — it is an implicit assumption.",
        },
      ],
      evidenceSufficient: true,
    },
    {
      hypothesisId: "h2",
      supportingEvidence: [
        {
          factId: "f2",
          quote: "the system retries up to 3 times with exponential backoff",
          reasoning: "No failure codes are specified, implying all failures are retried uniformly.",
        },
      ],
      counterEvidence: [],
      evidenceSufficient: true,
    },
    {
      hypothesisId: "h3",
      supportingEvidence: [],
      counterEvidence: [
        {
          factId: null,
          quote: null,
          reasoning: "The story does not specify whether retries are synchronous or async. The exponential backoff pattern hints at async execution, but this is not confirmed.",
        },
      ],
      evidenceSufficient: false,
    },
    {
      hypothesisId: "h4",
      supportingEvidence: [],
      counterEvidence: [],
      evidenceSufficient: false,
    },
  ],
};

export const mockEngineeringReport: EngineeringReport = {
  storyTitle: "Integrate payment retry mechanism",
  findings: [
    {
      id: "fi1",
      hypothesis: "POST /payments is assumed to be idempotent when reusing the same payment intent ID",
      category: "safety",
      confidence: "medium",
      impact: "critical",
      supportingEvidence: [
        "The same payment intent ID is reused across retries",
      ],
      counterEvidence: [
        "The story does not explicitly confirm that POST /payments is idempotent.",
      ],
      recommendation:
        "Explicitly confirm with the payment service team that POST /payments is idempotent for the same intent ID, or add deduplication logic in the order service.",
    },
    {
      id: "fi2",
      hypothesis: "All payment failures trigger a retry, regardless of failure type",
      category: "missing_constraint",
      confidence: "high",
      impact: "high",
      supportingEvidence: [
        "the system retries up to 3 times with exponential backoff — no failure code filtering mentioned",
      ],
      counterEvidence: [],
      recommendation:
        "Define which HTTP status codes and error types should trigger a retry (e.g. 5xx, network timeout) versus hard failures that should not be retried (e.g. 402 card declined).",
    },
    {
      id: "fi3",
      hypothesis: "Retry logic runs synchronously within the request lifecycle",
      category: "transaction",
      confidence: "insufficient_evidence",
      impact: "high",
      supportingEvidence: [],
      counterEvidence: [
        "Exponential backoff pattern hints at async execution but is unconfirmed.",
      ],
      recommendation:
        "Clarify whether retries are synchronous (blocking the original request) or async (queue-based). Synchronous retries with exponential backoff will cause slow responses or timeouts.",
    },
    {
      id: "fi4",
      hypothesis: "No authorization check is defined for who can trigger a retry",
      category: "authorization",
      confidence: "insufficient_evidence",
      impact: "medium",
      supportingEvidence: [],
      counterEvidence: [],
      recommendation:
        "Clarify whether retry initiation is internal-only (triggered by the system) or if it can be triggered externally. If external, define authorization requirements.",
    },
  ],
  summary: {
    totalFindings: 4,
    criticalCount: 1,
    insufficientEvidenceCount: 2,
  },
};
