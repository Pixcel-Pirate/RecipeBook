import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  base: "./",
  // Classic script, no crossorigin: module scripts are blocked on file:// pages.
  build: { modulePreload: false, rollupOptions: { output: { format: "iife" } } },
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "file-protocol-html",
      enforce: "post",
      transformIndexHtml: (html) =>
        html.replace(/ crossorigin/g, "").replace('<script type="module"', "<script defer"),
    },
  ],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
