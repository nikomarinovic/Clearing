import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Keep the build output structure clean: only index.html (and, via a
// postbuild step, 404.html) live at the root of dist/. Every other build
// artifact — JS, CSS, and any hashed assets — is emitted under dist/assets/.
export default defineConfig({
  plugins: [react()],
  build: {
    assetsDir: "assets",
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (id.includes("recharts") || id.includes("d3-")) return "charts";
            if (id.includes("framer-motion")) return "motion";
            if (id.includes("react-router") || id.includes("/react/") || id.includes("/react-dom/")) return "vendor";
          }
        },
      },
    },
  },
});
