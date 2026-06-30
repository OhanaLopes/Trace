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
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="Paste your Jira story here..."
        rows={10}
        className="w-full rounded-md border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 resize-none"
      />
      <button
        type="submit"
        disabled={isEmpty || isRunning}
        className="self-end rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
      >
        {isRunning ? "Analyzing..." : "Analyze"}
      </button>
    </form>
  );
}
