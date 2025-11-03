import "dotenv/config";
import express from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { auth, requiresAuth } from "express-openid-connect";
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
  process.env.FRONTEND_URL, // Vercel frontend
  process.env.BASE_URL, // Render backend
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.options("*", cors());

/* --------------------- RATE LIMITER --------------------- */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

/* --------------------- BODY PARSERS --------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.disable("x-powered-by");

/* --------------------- AUTH0 CONFIG --------------------- */
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL, // e.g. https://mwanzo-tunes-server.onrender.com
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`, // e.g. dev-b7iml26mefi4x8a4.us.auth0.com
  routes: {
    login: "/login",
    callback: "/callback",
    logout: "/logout",
  },
  authorizationParams: {
    response_type: "code",
    scope: "openid profile email",
  },
};

if (process.env.AUTH0_SECRET) {
  app.use(auth(config as any));
  log("✅ Auth0 configured successfully");
} else {
  console.warn("⚠️ Auth0 secret not found - authentication disabled");
}

/* --------------------- LOGOUT --------------------- */
app.get("/api/logout", (req: any, res: any) => {
  try {
    if (!req.oidc?.isAuthenticated?.()) {
      return res.status(400).json({ message: "Not authenticated" });
    }

    res.oidc.logout({
      returnTo:
        process.env.FRONTEND_URL ||
        process.env.BASE_URL ||
        "http://localhost:3000",
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
});

/* --------------------- USER AUTH ROUTE --------------------- */
app.get("/api/auth/user", async (req: any, res: any) => {
  try {
    if (!req.oidc?.isAuthenticated() || !req.oidc.user) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const user = req.oidc.user;
    const auth0Id = user.sub;
    const email = user.email;
    const firstName = user.given_name || "User";
    const lastName = user.family_name || "";
    const fullName = `${firstName} ${lastName}`.trim();

    // Check or insert user in database
    const existing = await db.execute(
      sql`SELECT * FROM users WHERE auth0_id = ${auth0Id}`
    );
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

/* --------------------- FILE SERVING --------------------- */
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"), {
    dotfiles: "deny",
    index: false,
  })
);

/* --------------------- HEALTH CHECK --------------------- */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

/* --------------------- PROTECTED ROUTE EXAMPLE --------------------- */
app.get("/profile", requiresAuth(), (req: any, res: any) => {
  res.json(req.oidc.user);
});

/* --------------------- MAIN SERVER FUNCTION --------------------- */
async function startServer() {
  const server = createServer(app);

  try {
    await db.execute(sql`SELECT 1`);
    log("✅ Database connection verified");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }

  try {
    await registerRoutes(app as any);
    log("✅ Routes registered successfully");
  } catch (err) {
    console.error("Failed to register routes:", err);
  }

  app.use("/api/songs", songsRouter);

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
    log(
      `🚀 Server running on http://${host}:${port} in ${
        process.env.NODE_ENV || "development"
      } mode`
    );
    log(`✅ Allowed CORS origins: ${allowedOrigins.join(", ")}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
