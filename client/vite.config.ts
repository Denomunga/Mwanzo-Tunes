// client/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },

  root: __dirname,

  // Build output
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: true,
  },

  // Development proxy (only in dev)
  server: {
    port: 5173,
    fs: { strict: true, deny: ["**/.*"] },
    proxy: mode === "development"
      ? {
          "/api": {
            target: "http://127.0.0.1:4000",
            changeOrigin: true,
          },
          "/callback": { target: "http://127.0.0.1:4000", changeOrigin: true },
          "/login":    { target: "http://127.0.0.1:4000", changeOrigin: true },
          "/logout":   { target: "http://127.0.0.1:4000", changeOrigin: true },
        }
      : undefined,
  },

  // Inject VITE_API_URL at build time
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify(
      mode === "production"
        ? process.env.VITE_API_URL // Vercel injects this
        : "http://127.0.0.1:4000"
    ),
  },
}));