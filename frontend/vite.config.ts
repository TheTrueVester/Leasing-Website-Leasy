import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

declare const __dirname: string; // Add this line

export default defineConfig({
  base: "/",
  server: {
    watch: {
      usePolling: true,
    },
    hmr: {
      clientPort: 5173,
      host: "localhost",
    },
    host: `0.0.0.0`,
    strictPort: true,
    port: 5173,
    origin: "http://0.0.0.0:5173",
  },
  preview: {
    port: 5173, // default is 4173, set to 5173 for Docker
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
