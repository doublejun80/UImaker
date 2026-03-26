import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@uiverse/schema": path.resolve(__dirname, "packages/schema/src/index.ts"),
      "@uiverse/exporter": path.resolve(__dirname, "packages/exporter/src/index.ts"),
      "@uiverse/cli": path.resolve(__dirname, "packages/cli/src/index.ts"),
      "@": path.resolve(__dirname, "apps/web")
    }
  },
  test: {
    globals: true,
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts"]
  }
});
