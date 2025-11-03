// server/index.ts
import "dotenv/config";
import express from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { createServer } from "http";
import path from "path";
import { db } from "./db.js";
import songsRouter from "./routes/songs.js";
import { sql } from "drizzle-orm";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// IMPORT FROM auth.ts
import { authMiddleware, isAuthenticated, userRoute } from "./auth.js";

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
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked CORS request from:", origin);
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
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
  })
);

/* --------------------- BODY PARSERS --------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.disable("x-powered-by");

/* --------------------- AUTH0: USE FROM auth.ts --------------------- */
app.use(authMiddleware); // ← Uses secure config from auth.ts

/* --------------------- MANUAL LOGIN ROUTE --------------------- */
app.get("/api/login", (req, res) => {
  const auth0Url = new URL(`https://${process.env.AUTH0_DOMAIN}/authorize`);
  auth0Url.searchParams.append("response_type", "code");
  auth0Url.searchParams.append("client_id", process.env.CLIENT_ID!);
  auth0Url.searchParams.append("redirect_uri", `${process.env.BASE_URL}/api/callback`);
  auth0Url.searchParams.append("scope", "openid profile email");
  auth0Url.searchParams.append("state", Math.random().toString(36).substring(7));
  res.redirect(auth0Url.toString());
});

/* --------------------- USER AUTH ROUTE --------------------- */
app.get("/api/auth/user", isAuthenticated, userRoute);

/* --------------------- LOGOUT ROUTE (optional, auth0Logout handles it) --------------------- */
app.get("/api/logout", (req: any, res: any) => {
  res.oidc.logout({
    returnTo: process.env.FRONTEND_URL || "https://mwanzotunes.vercel.app",
  });
});

/* --------------------- FILE SERVING --------------------- */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"), { dotfiles: "deny", index: false }));

/* --------------------- HEALTH CHECK --------------------- */
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString(), environment: process.env.NODE_ENV || "development" });
});

/* --------------------- PROTECTED ROUTE EXAMPLE --------------------- */
app.get("/profile", isAuthenticated, (req: any, res: any) => {
  res.json((req as any).user);
});

/* --------------------- MAIN SERVER FUNCTION --------------------- */
async function startServer() {
  const server = createServer(app);

  try {
    await db.execute(sql`SELECT 1`);
    log("Database connection verified");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }

  try {
    await registerRoutes(app as any);
    log("Routes registered successfully");
  } catch (err) {
    console.error("Failed to register routes:", err);
  }

  app.use("/api/songs", songsRouter);

  const port = parseInt(process.env.PORT || "4000", 10);
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    const clientIndex = path.join(process.cwd(), "client/dist/index.html");
    app.get("*", (_req, res) => {
      res.sendFile(clientIndex, (err) => {
        if (err) {
          res.redirect(process.env.FRONTEND_URL || "https://mwanzotunes.vercel.app");
        }
      });
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