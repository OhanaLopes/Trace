import type { StageInfo } from "../types";

interface Props {
  stages: StageInfo[];
}

export function PipelineProgress({ stages }: Props) {
  if (stages.length === 0) return <></>;

  return (
    <ol className="flex flex-col">
      {stages.map((stage, i) => (
        <li key={stage.stage} className="flex gap-4">
          <div className="flex flex-col items-center">
            <StageIndicator status={stage.status} />
            {i < stages.length - 1 && (
              <div className={`w-px flex-1 mt-1 ${stage.status === "complete" ? "bg-zinc-600" : "bg-zinc-800"}`} />
            )}
          </div>
          <div className="pb-5 pt-0.5">
            <span className={`text-sm ${
              stage.status === "complete" ? "text-zinc-300" :
              stage.status === "running"  ? "text-zinc-100 font-medium" :
              "text-zinc-600"
            }`}>
              {stage.name}
            </span>
            {stage.status === "running" && (
              <p className="text-xs text-zinc-500 mt-0.5 animate-pulse">Processing...</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function StageIndicator({ status }: { status: StageInfo["status"] }) {
  if (status === "complete") {
    return (
      <span
        data-testid="stage-complete"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-green-400 text-xs"
      >
        ✓
      </span>
    );
  }
  if (status === "running") {
    return (
      <span
        data-testid="stage-running"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-500 bg-zinc-900"
      >
        <span className="h-2 w-2 rounded-full bg-zinc-300 animate-pulse" />
      </span>
    );
  }
  return (
    <span
      data-testid="stage-pending"
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950"
    />
  );
}
