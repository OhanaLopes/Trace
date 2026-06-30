import type { StageInfo } from "../types";

interface Props {
  stages: StageInfo[];
}

export function PipelineProgress({ stages }: Props) {
  if (stages.length === 0) return <></>;

  return (
    <ol className="flex flex-col gap-2">
      {stages.map((stage) => (
        <li key={stage.stage} className="flex items-center gap-3 text-sm">
          <StageIndicator status={stage.status} />
          <span className={stage.status === "pending" ? "text-zinc-500" : "text-zinc-100"}>
            {stage.name}
          </span>
        </li>
      ))}
    </ol>
  );
}

function StageIndicator({ status }: { status: StageInfo["status"] }) {
  if (status === "complete") {
    return (
      <span data-testid="stage-complete" className="text-green-400 w-5 text-center">✓</span>
    );
  }
  if (status === "running") {
    return (
      <span data-testid="stage-running" className="w-5 text-center animate-spin inline-block text-zinc-300">◌</span>
    );
  }
  return (
    <span data-testid="stage-pending" className="text-zinc-600 w-5 text-center">○</span>
  );
}
