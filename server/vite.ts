import express, { type Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";

/**
 * Simple logger with timestamp
 * @param message Message to log
 * @param source Source of the log (default "express")
 */
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * Development: Show message if frontend not running on Vite dev server
 * @param app Express app instance
 * @param server HTTP server instance
 */
export async function setupVite(app: Express, server: Server) {
  log("Client runs separately with Vite dev server.");

  app.use((req: Request, res: Response, next: NextFunction) => {
    // Only show message for non-API requests
    if (!req.path.startsWith("/api")) {
      return res.status(503).send(`
        <html>
          <body style="font-family:sans-serif;text-align:center;margin-top:50px;">
            <h1>Development Mode</h1>
            <p>Frontend should run separately with Vite:</p>
            <code>cd client && npm run dev</code>
            <p>Then open <a href="http://localhost:5173">http://localhost:5173</a></p>
          </body>
        </html>
      `);
    }
    next();
  });
}

/**
 * Production: Skip serving frontend locally if deployed elsewhere (like Vercel)
 * @param app Express app instance
 */
export function serveStatic(app: Express) {
  log("Frontend is deployed on Vercel. Skipping local static hosting.");
  // Do nothing, because frontend is handled externally
}
