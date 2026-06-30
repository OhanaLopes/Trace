export interface StageInfo {
  stage: number;
  name: string;
  status: "pending" | "running" | "complete";
}

export interface Finding {
  id: string;
  hypothesis: string;
  category: string;
  confidence: "high" | "medium" | "low" | "insufficient_evidence";
  impact: "critical" | "high" | "medium" | "low";
  supportingEvidence: string[];
  counterEvidence: string[];
  recommendation: string;
}

export interface EngineeringReport {
  storyTitle: string;
  findings: Finding[];
  summary: {
    totalFindings: number;
    criticalCount: number;
    insufficientEvidenceCount: number;
  };
}

export interface StoryInput {
  raw: string;
  ticketId?: string;
}

export type AnalysisStatus = "idle" | "running" | "done" | "error";
