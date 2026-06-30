import type { StoryInput } from "../schemas";
import { mockEngineeringReport } from "../fixtures";
import { runUnderstand } from "./understand";
import { runHypothesize } from "./hypothesize";
import { runEvidence } from "./evidence";
import { runReport } from "./report";

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

export async function runPipeline(input: StoryInput, emit: Emitter): Promise<void> {
  const storyTitle = input.title ?? "Untitled Story";

  emit("stage_start", { stage: 1, name: STAGES[0].name });
  const { understanding, factSet } = await runUnderstand(input);
  emit("stage_complete", { stage: 1, name: STAGES[0].name });

  emit("stage_start", { stage: 2, name: STAGES[1].name });
  const hypothesis = await runHypothesize(understanding, factSet);
  emit("stage_complete", { stage: 2, name: STAGES[1].name });

  emit("stage_start", { stage: 3, name: STAGES[2].name });
  const evidenceMap = await runEvidence(hypothesis, factSet);
  emit("stage_complete", { stage: 3, name: STAGES[2].name });

  emit("stage_start", { stage: 4, name: STAGES[3].name });
  const report = await runReport(storyTitle, hypothesis, evidenceMap);
  emit("stage_complete", { stage: 4, name: STAGES[3].name });

  emit("report", report);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
