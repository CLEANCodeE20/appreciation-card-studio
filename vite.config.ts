import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig((config) => {
  config.preview ??= {};
  config.preview.allowedHosts = [
    "albasateen-moments.onrender.com",
  ];

  config.server ??= {};
  config.server.allowedHosts = [
    "albasateen-moments.onrender.com",
  ];

  return {
    ...config,

    tanstackStart: {
      server: { entry: "server" },
    },
  };
});
