import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { fileURLToPath } from "url";

// ES Module __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// In development, we'll assume client runs separately on Vite dev server
export async function setupVite(app: Express, server: Server) {
  log("Client should be running separately on Vite dev server!!!!");
  //log("Make sure to run 'npm run dev' in the client folder as well");
  
  // In development, we only serve API routes
  // The client will be handled by Vite dev server on another port
  app.use((req, res, next) => {
    if (!req.path.startsWith("/api")) {
      return res.status(503).send(`
        <html>
          <body>
            <h1>Development Mode</h1>
            <p>Please run the client development server separately:</p>
            <code>cd client && npm run dev</code>
            <p>Then visit <a href="http://localhost:5173">http://localhost:5173</a></p>
          </body>
        </html>
      `);
    }
    next();
  });
}

// In production, serve static files from client build
export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "../client/dist");

  if (!fs.existsSync(distPath)) {
    log(`WARNING: Client build not found at ${distPath}`);
    log("Run 'npm run build' in the client folder first");
    return;
  }

  app.use(express.static(distPath));

  // Serve index.html for all non-API routes (client-side routing)
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.resolve(distPath, "index.html"));
  });
  
  log(`Serving static files from: ${distPath}`);
}