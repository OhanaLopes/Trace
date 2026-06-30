import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";

function parseSseEvents(body: string) {
  return body
    .split("\n\n")
    .filter(Boolean)
    .map((block) => {
      const dataLine = block.split("\n").find((l) => l.startsWith("data:"));
      if (!dataLine) return null;
      return JSON.parse(dataLine.replace("data: ", ""));
    })
    .filter(Boolean);
}

describe("POST /api/analyze", () => {
  it("returns 400 when body is missing raw field", async () => {
    const res = await request(app).post("/api/analyze").send({});
    expect(res.status).toBe(400);
  });

  it("returns 400 when raw is empty string", async () => {
    const res = await request(app).post("/api/analyze").send({ raw: "" });
    expect(res.status).toBe(400);
  });

  it("sets SSE headers on valid request", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({ raw: "As a user I want to pay for my order" })
      .buffer(true)
      .parse((res, callback) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk.toString()));
        res.on("end", () => callback(null, data));
      });

    expect(res.headers["content-type"]).toContain("text/event-stream");
    expect(res.headers["cache-control"]).toBe("no-cache");
    expect(res.headers["connection"]).toBe("keep-alive");
  });

  it("emits 4 stage_start and 4 stage_complete events", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({ raw: "As a user I want to pay for my order" })
      .buffer(true)
      .parse((res, callback) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk.toString()));
        res.on("end", () => callback(null, data));
      });

    const events = parseSseEvents(res.body as string);
    const starts = events.filter((e) => e.type === "stage_start");
    const completes = events.filter((e) => e.type === "stage_complete");

    expect(starts).toHaveLength(4);
    expect(completes).toHaveLength(4);
  });

  it("emits a report event as the last event", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({ raw: "As a user I want to pay for my order" })
      .buffer(true)
      .parse((res, callback) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk.toString()));
        res.on("end", () => callback(null, data));
      });

    const events = parseSseEvents(res.body as string);
    const last = events[events.length - 1];

    expect(last.type).toBe("report");
    expect(last.data).toHaveProperty("findings");
    expect(last.data).toHaveProperty("summary");
  });

  it("stage_start events have correct stage numbers and names", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .send({ raw: "As a user I want to pay for my order" })
      .buffer(true)
      .parse((res, callback) => {
        let data = "";
        res.on("data", (chunk: Buffer) => (data += chunk.toString()));
        res.on("end", () => callback(null, data));
      });

    const events = parseSseEvents(res.body as string);
    const starts = events.filter((e) => e.type === "stage_start");

    expect(starts[0].data.stage).toBe(1);
    expect(starts[1].data.stage).toBe(2);
    expect(starts[2].data.stage).toBe(3);
    expect(starts[3].data.stage).toBe(4);
    starts.forEach((e) => expect(e.data.name).toBeTruthy());
  });
});
