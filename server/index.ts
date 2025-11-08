import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import path from "path";
import { db } from "./db.js";
import { sql } from "drizzle-orm";
import { registerRoutes } from "./routes.js";
import songsRouter from "./routes/songs.js";
import { setupVite, log, serveStatic } from "./vite.js";
import { auth } from "express-openid-connect";

const app = express();

// --------------------
// Middleware
// --------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// --------------------
// Auth0 configuration
// --------------------
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET ?? "change_me",
  baseURL: process.env.BASE_URL ?? "https://mwanzo-tunes.vercel.app",
  clientID: process.env.CLIENT_ID ?? "",
  issuerBaseURL: process.env.ISSUER_BASE_URL ?? "",
  authorizationParams: {
    response_type: "code",
    scope: "openid profile email",
  },
};

// Attach Auth0 middleware
app.use(auth(config) as any);

// --------------------
// Auth Routes
// --------------------

// GET /api/auth/user - get current user and sync with DB
app.get("/api/auth/user", async (req: any, res: Response) => {
  try {
    if (!req.oidc?.isAuthenticated() || !req.oidc.user) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const user = req.oidc.user as Record<string, any>;
    const auth0Id = user.sub;
    const email = user.email;
    const firstName = user.given_name || "User";
    const lastName = user.family_name || "";
    const fullName = `${firstName} ${lastName}`.trim();

    // Check if user exists in database
    const existing = await db.execute(
      sql`SELECT * FROM users WHERE auth0_id = ${auth0Id}`
    );
    let dbUser = existing.rows[0];

    // Create new user if not found
    if (!dbUser) {
      const role = "user";
      const inserted = await db.execute(sql`
        INSERT INTO users (auth0_id, email, first_name, last_name, role)
        VALUES (${auth0Id}, ${email}, ${firstName}, ${lastName}, ${role})
        RETURNING *
      `);
      dbUser = inserted.rows[0];
    }

    return res.json({ ...dbUser, name: fullName });
  } catch (err) {
    console.error("Database error in /api/auth/user:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

// Logout route
app.get("/api/logout", (req: any, res: Response) => {
  try {
    res.oidc.logout({
      returnTo: process.env.BASE_URL ?? "https://mwanzo-tunes.vercel.app",
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
});

// Optional: catch /callback and redirect to frontend
app.get("/callback", (req: Request, res: Response) => {
  res.redirect(process.env.FRONTEND_URL ?? "https://mwanzo-tunes.vercel.app");
});

// --------------------
// Serve uploads
// --------------------
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// --------------------
// API request logger
// --------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const url = req.path;

  if (url.startsWith("/api")) {
    let capturedJsonResponse: any;
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      capturedJsonResponse = body;
      return originalJson(body);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      const line = `${req.method} ${url} ${res.statusCode} in ${duration}ms`;
      log(line);
    });
  }

  next();
});

// --------------------
// API routes
// --------------------
app.use("/api/songs", songsRouter);
registerRoutes(app as any)
  .then(() => log("Routes registered successfully"))
  .catch((err) => console.error("Failed to register routes:", err));

// --------------------
// Protected profile route example
// --------------------
app.get("/profile", (req: any, res: Response) => {
  if (!req.oidc?.isAuthenticated?.()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(req.oidc.user);
});

// --------------------
// Global error handler
// --------------------
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err?.status || 500;
  const message = err?.message || "Internal Server Error";
  console.error("Express Error:", { status, message });
  res.status(status).json({ message });
});

// --------------------
// Start server
// --------------------
async function startServer() {
  const server = createServer(app);

  try {
    await db.execute(sql`SELECT 1`);
    log("Database connection verified!");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }

  const port = parseInt(process.env.PORT || "4000", 10);

  if (app.get("env") === "development") {
    await setupVite(app as any, server);
  } else {
    serveStatic(app);
    app.get("*", (_req, res) => {
      res.sendFile(path.join(process.cwd(), "client", "dist", "index.html"));
    });
  }

  if (!(app as any).__serverStarted) {
    server.listen(port, "0.0.0.0", () => {
      log(`Server running on http://0.0.0.0:${port}`);
      (app as any).__serverStarted = true;
    });
  }
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
