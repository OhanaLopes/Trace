import type { StoryInput } from "../schemas";
import { mockEngineeringReport } from "../fixtures";

const STAGES = [
  { stage: 1, name: "Understand & Extract Facts" },
  { stage: 2, name: "Generate Hypotheses" },
  { stage: 3, name: "Collect Evidence & Counter-Evidence" },
  { stage: 4, name: "Score & Build Report" },
];

type Emitter = (type: string, data: unknown) => void;

export async function runMockPipeline(_input: StoryInput, emit: Emitter, stageDelayMs = 300): Promise<void> {
  for (const stage of STAGES) {
    emit("stage_start", { stage: stage.stage, name: stage.name });
    await delay(stageDelayMs);
    emit("stage_complete", { stage: stage.stage, name: stage.name, durationMs: stageDelayMs });
  }

  emit("report", { ...mockEngineeringReport });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
