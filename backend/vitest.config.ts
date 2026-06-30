import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      USE_MOCK_PIPELINE: "true",
    },
  },
});
