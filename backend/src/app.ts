import express from "express";
import cors from "cors";
import analyzeRouter from "./routes/analyze";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", analyzeRouter);

export default app;
