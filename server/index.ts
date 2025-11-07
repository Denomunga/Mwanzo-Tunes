// server/index.ts
import "dotenv/config";
import express from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import pkg from "express-openid-connect";
const { auth, requiresAuth } = pkg;
import { createServer } from "http";
import path from "path";
import { db } from "./db.js";
import songsRouter from "./routes/songs.js";
import { sql } from "drizzle-orm";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

/* --------------------- SECURITY HEADERS --------------------- */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:", "wss:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

/* --------------------- CORS CONFIG --------------------- */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.BASE_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean) as string[];

const auth0OriginPattern = /^https:\/\/.*\.auth0\.com$/;

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true); // allow curl/mobile requests

//       const normalizedOrigin = origin.replace(/\/$/, "");
//       const isAllowed =
//         allowedOrigins.some((o) => o.replace(/\/$/, "") === normalizedOrigin) ||
//         auth0OriginPattern.test(normalizedOrigin);

//       if (isAllowed) {
//         callback(null, true);
//       } else {
//         console.warn("Blocked CORS request from:", origin);
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   })
// );

app.options("*", cors());

/* --------------------- BODY PARSERS --------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.disable("x-powered-by");

/* --------------------- RATE LIMIT --------------------- */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* --------------------- AUTH0 CONFIG --------------------- */
const Config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET!,
  baseURL: process.env.BASE_URL!,
  clientID: process.env.CLIENT_ID!,
  issuerBaseURL: process.env.ISSUER_BASE_URL!,
};

app.use(auth(Config)as any);

/* --------------------- LOGIN / CALLBACK --------------------- */
// app.get("/login", (req, res) => {
//   try {
//     if (!req.oidc) return res.status(500).send("OIDC not configured");

//     res.oidc.login({
//       returnTo: `${process.env.FRONTEND_URL}/callback`, // must match allowed callback URLs
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).send("Login failed");
//   }
// });

// app.get("/callback", (req, res) => {
//   try {
//     // Optionally, you can verify the user session here if needed
//     // Then just redirect to frontend callback page
//     res.redirect(`${process.env.FRONTEND_URL}/callback`);
//   } catch (err) {
//     console.error("Callback error:", err);
//     res.status(500).send("Callback failed");
//   }
// });

/* --------------------- LOGOUT ROUTE --------------------- */
app.get("/api/logout", (req: any, res: any) => {
  try {
    if (!req.oidc?.isAuthenticated?.()) {
      return res.status(400).json({ message: "Not authenticated" });
    }
    res.oidc.logout({
      returnTo: process.env.FRONTEND_URL || process.env.BASE_URL || "http://localhost:3000",
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
});

/* --------------------- AUTH USER ENDPOINT --------------------- */
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

    const existing = await db.execute(sql`SELECT * FROM users WHERE auth0_id = ${auth0Id}`);
    let dbUser = existing.rows[0];

    if (!dbUser) {
      const role = "user";
      const inserted = await db.execute(sql`
        INSERT INTO users (auth0_id, email, first_name, last_name, role)
        VALUES (${auth0Id}, ${email}, ${firstName}, ${lastName}, ${role})
        RETURNING *
      `);
      dbUser = inserted.rows[0];
    }

    const { password, ...safeUser } = dbUser as any;
    return res.json({ ...safeUser, name: fullName });
  } catch (err) {
    console.error("Database error in /api/auth/user:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

/* --------------------- STATIC FILES --------------------- */
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"), { dotfiles: "deny", index: false })
);

/* --------------------- REQUEST LOGGER --------------------- */
app.use((req: any, res: any, next: any) => {
  const start = Date.now();
  if (req.path.startsWith("/api")) {
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      res.locals.body = body;
      return originalJson(body);
    };
    res.on("finish", () => {
      const duration = Date.now() - start;
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    });
  }
  next();
});

/* --------------------- START SERVER --------------------- */
async function startServer() {
  const server = createServer(app);

  // Verify DB
  try {
    await db.execute(sql`SELECT 1`);
    log("Database connection verified");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }

  // Register custom routes
  try {
    await registerRoutes(app as any);
    log("Routes registered successfully");
  } catch (err) {
    console.error("Failed to register routes:", err);
  }

  // API routes
  app.use("/api/songs", songsRouter);

  // Protected profile route
  app.get("/profile", requiresAuth(), (req, res) => {
    res.json(req.oidc.user);
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  // Global error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err?.status || err?.statusCode || 500;
    const message =
      process.env.NODE_ENV === "production" ? "Internal Server Error" : err?.message || "Internal Server Error";
    console.error("Express Error:", { status, message });
    res.status(status).json({ message });
  });

  // Frontend serving
  const port = parseInt(process.env.PORT || "4000", 10);
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";

  if (process.env.NODE_ENV === "development") {
    await setupVite(app as any, server as any);
  } else {
    serveStatic(app as any);
    app.get("*", (_req, res) => {
      res.sendFile(path.join(process.cwd(), "client", "dist", "index.html"));
    });
  }

  server.listen(port, host, () => {
    log(`Server running on http://${host}:${port} in ${process.env.NODE_ENV || "development"} mode`);
    log(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
