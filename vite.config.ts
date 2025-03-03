import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [deno()],
  build: {
    target: "esnext",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        chat: "./scripts/chat.js",
        modelSelector: "./scripts/modelSelector.js",
      },
      output: {
        entryFileNames: (_) => {
          return "scripts/[name].js";
        },
        assetFileNames: (_) => {
          return "[name][extname]";
        },
        dir: "./static",
      },
    },
  },
});
