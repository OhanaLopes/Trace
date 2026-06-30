import { Router, Request, Response } from "express";
import { StoryInputSchema } from "../schemas";
import { runMockPipeline, runPipeline } from "../pipeline";

const router = Router();

router.post("/analyze", async (req: Request, res: Response) => {
  const parse = StoryInputSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input", issues: parse.error.issues });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const emit = (type: string, data: unknown) => {
    res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
  };

  if (process.env.USE_MOCK_PIPELINE === "true") {
    await runMockPipeline(parse.data, emit, 300);
  } else {
    await runPipeline(parse.data, emit);
  }

  res.end();
});

export default router;
