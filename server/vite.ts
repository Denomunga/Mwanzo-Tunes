import express, { type Express } from "express";
import { type Server } from "http";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Development mode message only
export async function setupVite(app: Express, server: Server) {
  log("Client runs separately with Vite dev server.");
  app.use((req, res, next) => {
    if (!req.path.startsWith("/api")) {
      return res.status(503).send(`
        <html>
          <body>
            <h1>Development Mode</h1>
            <p>Run the frontend separately:</p>
            <code>cd client && npm run dev</code>
          </body>
        </html>
      `);
    }
    next();
  });
}

// Production mode: Do NOT serve client (client is on Vercel)
export function serveStatic(app: Express) {
  log("Frontend is deployed on Vercel. Skipping local static hosting.");
}
