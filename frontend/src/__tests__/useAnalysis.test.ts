import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAnalysis } from "../hooks/useAnalysis";

// Helpers to build mock SSE streams

function sseChunk(type: string, data: unknown): string {
  return `data: ${JSON.stringify({ type, data })}\n\n`;
}

function makeStream(events: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(event));
      }
      controller.close();
    },
  });
}

function mockFetch(events: string[], status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      body: makeStream(events),
    })
  );
}

const stageStartEvents = [1, 2, 3, 4].map((n) =>
  sseChunk("stage_start", { stage: n, name: `Stage ${n}` })
);
const stageCompleteEvents = [1, 2, 3, 4].map((n) =>
  sseChunk("stage_complete", { stage: n, name: `Stage ${n}`, durationMs: 100 })
);
const mockReport = {
  storyTitle: "Payment retry",
  findings: [],
  summary: { totalFindings: 0, criticalCount: 0, insufficientEvidenceCount: 0 },
};

describe("useAnalysis()", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it("starts in idle state with no stages", () => {
    const { result } = renderHook(() => useAnalysis());

    expect(result.current.status).toBe("idle");
    expect(result.current.stages).toEqual([]);
    expect(result.current.report).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("sets status to running when analyze is called", async () => {
    mockFetch([
      ...stageStartEvents,
      ...stageCompleteEvents,
      sseChunk("report", mockReport),
    ]);

    const { result } = renderHook(() => useAnalysis());

    act(() => {
      result.current.analyze({ raw: "story text" });
    });

    expect(result.current.status).toBe("running");
  });

  it("adds stages as stage_start events arrive", async () => {
    mockFetch([
      ...stageStartEvents,
      ...stageCompleteEvents,
      sseChunk("report", mockReport),
    ]);

    const { result } = renderHook(() => useAnalysis());

    await act(async () => {
      result.current.analyze({ raw: "story text" });
    });

    await waitFor(() => expect(result.current.stages).toHaveLength(4));
  });

  it("marks stages complete as stage_complete events arrive", async () => {
    mockFetch([
      ...stageStartEvents,
      ...stageCompleteEvents,
      sseChunk("report", mockReport),
    ]);

    const { result } = renderHook(() => useAnalysis());

    await act(async () => {
      result.current.analyze({ raw: "story text" });
    });

    await waitFor(() =>
      expect(result.current.stages.every((s) => s.status === "complete")).toBe(true)
    );
  });

  it("sets report and status done when report event arrives", async () => {
    mockFetch([
      ...stageStartEvents,
      ...stageCompleteEvents,
      sseChunk("report", mockReport),
    ]);

    const { result } = renderHook(() => useAnalysis());

    await act(async () => {
      result.current.analyze({ raw: "story text" });
    });

    await waitFor(() => expect(result.current.status).toBe("done"));
    expect(result.current.report).toMatchObject({ storyTitle: "Payment retry" });
  });

  it("sets error and status error when error event arrives", async () => {
    mockFetch([sseChunk("error", { message: "Pipeline failed", stage: 2 })]);

    const { result } = renderHook(() => useAnalysis());

    await act(async () => {
      result.current.analyze({ raw: "story text" });
    });

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toContain("Pipeline failed");
  });

  it("sets error when fetch response is not ok", async () => {
    mockFetch([], 400);

    const { result } = renderHook(() => useAnalysis());

    await act(async () => {
      result.current.analyze({ raw: "story text" });
    });

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBeTruthy();
  });

  it("POSTs to /api/analyze with the story input", async () => {
    mockFetch([
      ...stageStartEvents,
      ...stageCompleteEvents,
      sseChunk("report", mockReport),
    ]);

    const { result } = renderHook(() => useAnalysis());

    await act(async () => {
      result.current.analyze({ raw: "my story", ticketId: "EHS-1" });
    });

    await waitFor(() => expect(result.current.status).toBe("done"));

    const fetchCall = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(fetchCall[0]).toBe("/api/analyze");
    expect(fetchCall[1].method).toBe("POST");
    expect(JSON.parse(fetchCall[1].body)).toMatchObject({ raw: "my story", ticketId: "EHS-1" });
  });
});
