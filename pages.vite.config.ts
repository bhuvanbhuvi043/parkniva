import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL("./pages-demo", import.meta.url)),
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  base: "/parkthara/",
  plugins: [react()],
  define: { __PARKTHARA_PROJECT_DEMO__: "true" },
  build: {
    outDir: fileURLToPath(new URL("./outputs/github-pages", import.meta.url)),
    emptyOutDir: true,
    sourcemap: false,
  },
});
