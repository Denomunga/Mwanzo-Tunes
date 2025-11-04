// server/index.ts
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pkg from "express-openid-connect";
const { auth, requiresAuth } = pkg;
import { registerRoutes } from "./routes.js";
import songsRouter from "./routes/songs.js";
import { db } from "./db.js";
import { sql } from "drizzle-orm";
import { setupVite, log } from "./vite.js";

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

/* --------------------- AUTH0 CONFIG --------------------- */
const authConfig = {
  authRequired: false, // users can access public routes without login
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET!,
  baseURL: process.env.BASE_URL!, // your server URL
  clientID: process.env.CLIENT_ID!,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
};
app.use(auth(authConfig));

/* --------------------- AUTH / USER ROUTES --------------------- */
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

/* --------------------- STATIC FILE SERVING --------------------- */
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"), {
    dotfiles: "deny",
    index: false,
  })
);

/* --------------------- REGISTER API ROUTES --------------------- */
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
