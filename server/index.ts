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
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

// Security: Helmet for security headers
app.use(helmet({
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
  crossOriginEmbedderPolicy: false
}));

// CORS configuration for Vercel and Render [citation:1]
const allowedOrigins = [
  process.env.FRONTEND_URL, // Your Vercel frontend URL
  process.env.BASE_URL,     // Your Render backend URL
  'http://localhost:3000',  // Local development
  'http://localhost:5173'   // Vite default port
].filter(Boolean) as string[];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests globally
app.options('*', cors());

// Rate limiting [citation:9]
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing with limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Remove X-Powered-By header
app.disable('x-powered-by');

// Auth0 Configuration
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};

if (process.env.AUTH0_SECRET) {
  app.use(auth(config as any));
} else {
  console.warn('Auth0 secret not found - authentication disabled');
}

// Secure logout route
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

// User authentication endpoint with PostgreSQL [citation:7]
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

    // Check if user exists in database
    const existing = await db.execute(
      sql`SELECT * FROM users WHERE auth0_id = ${auth0Id}`
    );
    let dbUser = existing.rows[0];

    // Create new user if doesn't exist
    if (!dbUser) {
      const role = "user";
      const inserted = await db.execute(sql`
        INSERT INTO users (auth0_id, email, first_name, last_name, role)
        VALUES (${auth0Id}, ${email}, ${firstName}, ${lastName}, ${role})
        RETURNING *
      `);
      dbUser = inserted.rows[0];
    }

    // Remove sensitive data before sending response
    const { password, ...safeUser } = dbUser as any;

    return res.json({
      ...safeUser,
      name: fullName,
    });
  } catch (err) {
    console.error("Database error in /api/auth/user:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

// Serve uploaded files securely
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"), {
  dotfiles: 'deny',
  index: false
}));

// API request logger
app.use((req: any, res: any, next: any) => {
  const start = Date.now();
  const url = req.path;

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
      log(line);
    });
  }

  next();
});

async function startServer() {
  const server = createServer(app);

  // Verify PostgreSQL database connection [citation:7]
  try {
    await db.execute(sql`SELECT 1`);
    log("Database connection verified");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }

  // Register all API routes
  try {
    await registerRoutes(app as any);
    log("Routes registered successfully");
  } catch (err) {
    console.error("Failed to register routes:", err);
  }

  // API routes
  app.use("/api/songs", songsRouter);

  // Protected route
  app.get("/profile", (req: any, res: any) => {
    if (!req.oidc?.isAuthenticated?.()) {
      return res.status(401).send("Unauthorized");
    }
    res.json(req.oidc.user);
  });

  // Health check endpoint for monitoring
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Global error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err?.status || err?.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
      ? "Internal Server Error" 
      : err?.message || "Internal Server Error";
    
    console.error("Express Error:", { status, message });
    
    res.status(status).json({ message });
  });

  const port = parseInt(process.env.PORT || "4000", 10);

  // Development vs Production setup
  if (process.env.NODE_ENV === 'development') {
    await setupVite(app as any, server as any);
  } else {
    serveStatic(app as any);
    app.get("*", (_req, res) => {
      res.sendFile(path.join(process.cwd(), "client", "dist", "index.html"));
    });
  }

  if (!(app as any).__serverStarted) {
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
    
    server.listen(port, host, () => {
      log(`Server running on http://${host}:${port} in ${process.env.NODE_ENV || 'development'} mode`);
      log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
      (app as any).__serverStarted = true;
    });
  }
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});