import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), TanStackRouterVite(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: ["albasateen-moments.onrender.com", "localhost"],
  },
  preview: {
    port: 3000,
    host: true,
    allowedHosts: ["albasateen-moments.onrender.com", "localhost"],
  },
});
