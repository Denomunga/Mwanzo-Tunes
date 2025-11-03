import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 5173,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: mode === 'development' ? {
      "/api": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
      "/callback": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
      "/login": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
      "/logout": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
      },
    } : undefined,
  },
  define: {
    'import.meta.env.VITE_API_URL': mode === 'production' 
      ? JSON.stringify(process.env.VITE_API_URL) 
      : JSON.stringify('http://127.0.0.1:4000')
  }
}));