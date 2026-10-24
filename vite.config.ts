import { defineConfig } from "vite";

const basePath = process.env.VITE_BASE_PATH ?? "/";

if (!basePath.startsWith("/") || !basePath.endsWith("/")) {
  throw new Error("VITE_BASE_PATH must start and end with a slash, for example /game-industry-outreach-tracker/.");
}

export default defineConfig({
  base: basePath,
});
