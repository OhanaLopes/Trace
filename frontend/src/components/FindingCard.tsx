import { useState } from "react";
import type { Finding } from "../types";
import { EvidenceDrawer } from "./EvidenceDrawer";

interface Props {
  finding: Finding;
  onExpand?: (id: string) => void;
}

const CONFIDENCE_STYLES: Record<Finding["confidence"], string> = {
  high: "bg-green-900 text-green-300",
  medium: "bg-yellow-900 text-yellow-300",
  low: "bg-orange-900 text-orange-300",
  insufficient_evidence: "bg-zinc-800 text-zinc-400",
};

const IMPACT_STYLES: Record<Finding["impact"], string> = {
  critical: "bg-red-900 text-red-300",
  high: "bg-orange-900 text-orange-300",
  medium: "bg-yellow-900 text-yellow-300",
  low: "bg-zinc-800 text-zinc-400",
};

export function FindingCard({ finding, onExpand }: Props) {
  const [expanded, setExpanded] = useState(false);

  function handleToggle() {
    setExpanded((v) => !v);
    onExpand?.(finding.id);
  }

  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-3">
      <header className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-zinc-100 leading-snug">{finding.hypothesis}</p>
        <div className="flex gap-2 shrink-0">
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${CONFIDENCE_STYLES[finding.confidence]}`}>
            {finding.confidence.replace("_", " ")}
          </span>
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${IMPACT_STYLES[finding.impact]}`}>
            {finding.impact}
          </span>
        </div>
      </header>

      <p className="text-sm text-zinc-400">{finding.recommendation}</p>

      <button
        onClick={handleToggle}
        className="self-start text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        aria-label={expanded ? "Hide evidence" : "Show evidence"}
      >
        {expanded ? "▲ Hide evidence" : "▼ Show evidence"}
      </button>

      {expanded && (
        <EvidenceDrawer
          supportingEvidence={finding.supportingEvidence}
          counterEvidence={finding.counterEvidence}
        />
      )}
    </article>
  );
}
