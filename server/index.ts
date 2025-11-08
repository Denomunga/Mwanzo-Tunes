import "dotenv/config";
import express from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { auth } from "express-openid-connect";
import { createServer } from "http";
import path from "path";
import { db } from "./db.js";
import songsRouter from "./routes/songs.js";
import { sql } from "drizzle-orm";

const app = express();

// Security: Express middleware setup
app.use(express.json({ limit: "10mb" })); // Limit payload size
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Auth0 Configuration for secure authentication
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET ?? "change_me",
  baseURL: process.env.BASE_URL ?? "http://localhost:4000",
  clientID: process.env.CLIENT_ID ?? "",
  issuerBaseURL: process.env.ISSUER_BASE_URL ?? "",
};

// Security: Attach Auth0 Middleware for authentication
app.use(auth(config) as any);

// Secure logout route
app.get("/api/logout", (req: any, res: any) => {
  try {
    res.oidc.logout({
      returnTo: process.env.BASE_URL ?? "http://localhost:4000",
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
});

// User authentication endpoint with database synccc
app.get("/api/auth/user", async (req: any, res: any) => {
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

    // Check if user exists in databasee
    const existing = await db.execute(
      sql`SELECT * FROM users WHERE auth0_id = ${auth0Id}`
    );
    let dbUser = existing.rows[0];

    // Create new user if doesn't exist
    if (!dbUser) {
      const role = "user"; // Default role for new users
      const inserted = await db.execute(sql`
        INSERT INTO users (auth0_id, email, first_name, last_name, role)
        VALUES (${auth0Id}, ${email}, ${firstName}, ${lastName}, ${role})
        RETURNING *
      `);
      dbUser = inserted.rows[0];
    }

    return res.json({
      ...dbUser,
      name: fullName,
    });
  } catch (err) {
    console.error("Database error in /api/auth/user:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

// Security: Serve uploaded files with static middleware
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API request logger (only logs API requests, not static files)
app.use((req: any, res: any, next: any) => {
  const start = Date.now();
  const url = req.path;

  // Only log API requests
  if (url.startsWith("/api")) {
    let capturedJsonResponse: any = undefined;

    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      capturedJsonResponse = body;
      return originalJson(body);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      let line = `${req.method} ${url} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse)
        line ;//+= ` :: ${JSON.stringify(capturedJsonResponse)}`;
     // if (line.length > 400) line = line.slice(0, 399) + "…";
      log(line);
    });
  }

  next();
});

async function startServer() {
  const server = createServer(app);

  // Security: Verify database connection before starting
  try {
    await db.execute(sql`SELECT 1`);
    log("Database connection verified nigga!");
  } catch (err) {
    console.error("Database connection failed: check you code man", err);
    process.exit(1);
  }

  // Register all API routes
  try {
    await registerRoutes(app as any);
    log("Routes registered successfully.But Damn JavaScript is Hard Man!");
  } catch (err) {
    console.error("Failed to register routes:", err);
  }

  // API routes
  app.use("/api/songs", songsRouter);

  // Security: Protected route 
  app.get("/profile", (req: any, res: any) => {
    if (!req.oidc?.isAuthenticated?.()) {
      return res.status(401).send("Unauthorized");
    }
    res.json(req.oidc.user);
  });

  // Security: Global error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    console.error("Express Error:", { status, message });
    // Security: Don't expose stack traces in production
    res.status(status).json({ message });
  });

  const port = parseInt(process.env.PORT || "4000", 10);

  // Development vs Production setup
  if (app.get("env") === "development") {
    await setupVite(app as any, server as any);
  } else {
    serveStatic(app as any);
    app.get("*", (_req, res) => {
      res.sendFile(path.join(process.cwd(), "client", "dist", "index.html"));
    });
  }

  // Security: Prevent double server starts
  if (!(app as any).__serverStarted) {
    server.listen(port, "0.0.0.0", () => {
      log(`Server running on http://0.0.0.0:${port} Cool RIGHT!!`);
      (app as any).__serverStarted = true;
    });
  }
}

// Start the server with error handling
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});