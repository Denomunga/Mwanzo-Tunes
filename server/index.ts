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
import cors from "cors";

const allowedOrigins = [
  "https://mwanzo-tunes.vercel.app",
  "https://mwanzo-tunes-geaf86nql-denos-projects-1cfdba9d.vercel.app",
  "http://localhost:5173",
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// --------------------
// Middleware
// --------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// --------------------
// Health Check Endpoint (CRITICAL FOR RENDER)
// --------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// --------------------
// Auth0 configuration
// --------------------
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET ?? "change_me",
  baseURL: process.env.BASE_URL ?? "https://mwanzo-tunes-server.onrender.com",
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
// Force login route
// --------------------
app.get("/login", (req: any, res: Response) => {
  // Force Auth0 login page
  res.oidc.login({
    returnTo: "/", // redirect here after login
    authorizationParams: {
      prompt: "login", // always show login page
    },
  });
});

// --------------------
// Logout route
// --------------------
app.get("/logout", (req: any, res: Response) => {
  try {
    res.oidc.logout({
      returnTo: process.env.BASE_URL ?? "https://mwanzo-tunes.vercel.app",
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
});

// --------------------
// Root endpoint
// --------------------
app.get("/", (_req: Request, res: Response) => {
  res.json({ 
    message: "Mwanzo-Tunes API Server", 
    status: "running",
    timestamp: new Date().toISOString()
  });
});

// --------------------
// Authenticated user endpoint
// --------------------
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

    // Check if user exists in DB
    const existing = await db.execute(
      sql`SELECT * FROM users WHERE auth0_id = ${auth0Id}`
    );
    let dbUser = existing.rows[0];

    // Insert user if not found
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
    const originalJson = res.json.bind(res);
    res.json = (body: any) => originalJson(body);

    res.on("finish", () => {
      const duration = Date.now() - start;
      log(`${req.method} ${url} ${res.statusCode} in ${duration}ms`);
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
// Protected profile route
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
// 404 handler for API routes
// --------------------
app.use("/api/*", (_req: Request, res: Response) => {
  res.status(404).json({ message: "API endpoint not found" });
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

  const port = parseInt(process.env.PORT || "10000", 10);

  // In production, we don't serve the frontend - it's on Vercel
  if (app.get("env") === "development") {
    await setupVite(app as any, server);
    log("Development mode: Vite server setup");
  } else {
    log("Production mode: Frontend is deployed on Vercel. Skipping local static hosting.");
    // In production, only serve API routes
    // Remove any static file serving for client/dist since frontend is on Vercel
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