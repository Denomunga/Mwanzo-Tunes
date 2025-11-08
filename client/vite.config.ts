// client/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

// Proper ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },

  // Remove the root property - let Vite use the current directory
  // root: __dirname, // COMMENT THIS OUT OR REMOVE

  // Build output
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
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

  // Environment variables - use envDir instead
  envDir: __dirname,
}));