import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mergeConfig } from "vite";

export default mergeConfig(
  defineConfig({
    tanstackStart: {
      server: { entry: "server" },
    },
  }),
  {
    preview: {
      allowedHosts: ["albasateen-moments.onrender.com"],
    },
  }
);
