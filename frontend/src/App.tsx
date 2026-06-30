import { useAnalysis } from "./hooks/useAnalysis";
import { StoryInput } from "./components/StoryInput";
import { PipelineProgress } from "./components/PipelineProgress";
import { FindingCard } from "./components/FindingCard";

export default function App() {
  const { status, stages, report, error, analyze } = useAnalysis();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-12 flex flex-col gap-10">

        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Trace</h1>
          <p className="text-sm text-zinc-500 mt-1">Trust nothing. Follow the evidence.</p>
        </header>

        <StoryInput onSubmit={analyze} status={status} />

        {stages.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500">Pipeline</h2>
            <PipelineProgress stages={stages} />
          </section>
        )}

        {error && (
          <div className="rounded-md border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {report && (
          <section className="flex flex-col gap-4">
            <header className="flex items-baseline justify-between">
              <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500">Findings</h2>
              <div className="flex gap-3 text-xs text-zinc-500">
                <span>{report.summary.totalFindings} total</span>
                {report.summary.criticalCount > 0 && (
                  <span className="text-red-400">{report.summary.criticalCount} critical</span>
                )}
                {report.summary.insufficientEvidenceCount > 0 && (
                  <span className="text-zinc-500">{report.summary.insufficientEvidenceCount} insufficient evidence</span>
                )}
              </div>
            </header>

            <ul className="flex flex-col gap-3">
              {report.findings.map((finding) => (
                <li key={finding.id}>
                  <FindingCard finding={finding} />
                </li>
              ))}
            </ul>
          </section>
        )}

      </div>
    </div>
  );
}
