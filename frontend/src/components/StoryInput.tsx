import { useState } from "react";
import type { AnalysisStatus, StoryInput as StoryInputType } from "../types";

interface Props {
  onSubmit: (input: StoryInputType) => void;
  status: AnalysisStatus;
}

export function StoryInput({ onSubmit, status }: Props) {
  const [raw, setRaw] = useState("");

  const isRunning = status === "running";
  const isEmpty = raw.trim().length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEmpty && !isRunning) {
      onSubmit({ raw: raw.trim() });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="relative">
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="Paste your Jira story here — title, description, acceptance criteria..."
          rows={10}
          disabled={isRunning}
          className="w-full rounded-md border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-none disabled:opacity-50 transition-colors leading-relaxed"
        />
        {raw.length > 0 && (
          <span className="absolute bottom-3 right-3 text-xs text-zinc-600">
            {raw.length} chars
          </span>
        )}
      </div>
      <div className="flex items-center justify-end gap-3">
        {status === "done" && (
          <span className="text-xs text-zinc-500">Analysis complete — edit the story to run again</span>
        )}
        <button
          type="submit"
          disabled={isEmpty || isRunning}
          className="rounded-md bg-zinc-100 px-5 py-2 text-sm font-medium text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors"
        >
          {isRunning ? "Analyzing..." : "Analyze"}
        </button>
      </div>
    </form>
  );
}
