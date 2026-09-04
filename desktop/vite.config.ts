import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: currentDir,
  base: "./",
  plugins: [react()],
  build: {
    outDir: path.resolve(currentDir, "../release/renderer"),
    emptyOutDir: true,
  },
  server: {
    port: 4173,
    strictPort: true,
  },
});
