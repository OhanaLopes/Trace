import { useState, useCallback } from "react";
import type { StageInfo, EngineeringReport, StoryInput, AnalysisStatus } from "../types";

interface AnalysisState {
  status: AnalysisStatus;
  stages: StageInfo[];
  report: EngineeringReport | null;
  error: string | null;
}

interface SseEvent {
  type: string;
  data: unknown;
}

const INITIAL_STATE: AnalysisState = {
  status: "idle",
  stages: [],
  report: null,
  error: null,
};

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>(INITIAL_STATE);

  const analyze = useCallback(async (input: StoryInput) => {
    setState({ ...INITIAL_STATE, status: "running" });

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        setState((s) => ({ ...s, status: "error", error: `Request failed with status ${response.status}` }));
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const dataLine = part.split("\n").find((l) => l.startsWith("data:"));
          if (!dataLine) continue;

          const event: SseEvent = JSON.parse(dataLine.replace("data: ", ""));

          switch (event.type) {
            case "stage_start": {
              const { stage, name } = event.data as { stage: number; name: string };
              setState((s) => ({
                ...s,
                stages: [...s.stages, { stage, name, status: "running" }],
              }));
              break;
            }
            case "stage_complete": {
              const { stage } = event.data as { stage: number };
              setState((s) => ({
                ...s,
                stages: s.stages.map((st) =>
                  st.stage === stage ? { ...st, status: "complete" } : st
                ),
              }));
              break;
            }
            case "report": {
              setState((s) => ({
                ...s,
                status: "done",
                report: event.data as EngineeringReport,
              }));
              break;
            }
            case "error": {
              const { message } = event.data as { message: string };
              setState((s) => ({ ...s, status: "error", error: message }));
              break;
            }
          }
        }
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, []);

  return { ...state, analyze };
}
