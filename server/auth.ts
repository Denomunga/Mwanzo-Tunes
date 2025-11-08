// server/auth.ts
import { auth } from "express-openid-connect";
import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";
import { db } from "./db.js";
import { users } from "./src/schema.js";
import { eq } from "drizzle-orm";
import { storage } from "./storage.js";

dotenv.config();

// === FIXED AUTH0 CONFIGURATION ===
export const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET!,
  baseURL: process.env.BASE_URL || "https://mwanzo-tunes-server.onrender.com",
  clientID: process.env.AUTH0_CLIENT_ID || process.env.CLIENT_ID!,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || process.env.ISSUER_BASE_URL!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  authorizationParams: {
    response_type: "code",
    scope: "openid profile email"
  },
  // ✅ Let the library handle routes automatically
  routes: {
    callback: "/callback", // Explicitly define callback path
    login: "/login", // Explicitly define login path  
    logout: "/api/logout" // Explicitly define logout path
  },
  // ✅ Session configuration
  session: {
    absoluteDuration: 7 * 24 * 60 * 60, // 7 days
  },
  // ✅ After callback handling
  afterCallback: (req: any, res: any, session: any) => {
    console.log("Auth0 callback successful for user:", session.user?.email);
    return session;
  }
};

export const authMiddleware = auth(authConfig);

// === LOGIN HANDLER ===
export function handleLogin(req: Request, res: Response) {
  try {
    console.log("Redirecting to Auth0 login...");
    return res.oidc.login({
      returnTo: process.env.FRONTEND_URL || "https://mwanzo-tunes.vercel.app",
    });
  } catch (error) {
    console.error("Login handler error:", error);
    res.status(500).json({ message: "Login failed" });
  }
}

// === CALLBACK HANDLER ===
export function handleCallback(req: Request, res: Response) {
  try {
    console.log("Auth0 callback received");
    
    if (req.oidc?.isAuthenticated()) {
      console.log("User authenticated:", req.oidc.user?.email);
      // Redirect to frontend after successful authentication
      const frontendUrl = process.env.FRONTEND_URL || "https://mwanzo-tunes.vercel.app";
      return res.redirect(frontendUrl);
    } else {
      console.log("Authentication failed");
      const frontendUrl = process.env.FRONTEND_URL || "https://mwanzo-tunes.vercel.app";
      return res.redirect(`${frontendUrl}?error=auth_failed`);
    }
  } catch (error) {
    console.error("Callback handler error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "https://mwanzo-tunes.vercel.app";
    return res.redirect(`${frontendUrl}?error=server_error`);
  }
}

// === MIDDLEWARE: CHECK AUTH + SYNC USER ===
export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.oidc?.isAuthenticated() || !req.oidc.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const auth0Id = req.oidc.user.sub;
  const email = req.oidc.user.email;
  const firstName = req.oidc.user.given_name || email?.split("@")[0] || "User";
  const lastName = req.oidc.user.family_name || "";

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.auth0Id, auth0Id))
      .limit(1);

    let user;
    if (existingUser.length > 0) {
      user = existingUser[0];
    } else {
      user = await storage.upsertUser({
        auth0Id,
        email,
        firstName,
        lastName,
        role: "user",
      });
    }

    (req as any).user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// === MIDDLEWARE: REQUIRE ADMIN ===
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.oidc?.isAuthenticated() || !req.oidc.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const auth0Id = req.oidc.user.sub;
    const result = await db
      .select()
      .from(users)
      .where(eq(users.auth0Id, auth0Id))
      .limit(1);

    const user = result[0];
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    (req as any).user = user;
    next();
  } catch (err) {
    console.error("requireAdmin error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// === ROUTE: GET CURRENT USER ===
export async function userRoute(req: Request, res: Response) {
  if (!req.oidc?.isAuthenticated() || !req.oidc.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const auth0Id = req.oidc.user.sub;

  try {
    let dbUser = await db
      .select()
      .from(users)
      .where(eq(users.auth0Id, auth0Id))
      .limit(1)
      .then(rows => rows[0]);

    if (!dbUser) {
      dbUser = await storage.upsertUser({
        auth0Id,
        email: req.oidc.user.email,
        firstName: req.oidc.user.given_name || "User",
        lastName: req.oidc.user.family_name || "",
        role: "user",
      });
    }

    return res.json(dbUser);
  } catch (err) {
    console.error("userRoute error:", err);
    return res.status(500).json({ error: "Database error" });
  }
}

// === CHECK AUTH STATUS ===
export function checkAuthStatus(req: Request, res: Response) {
  if (req.oidc?.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: req.oidc.user
    });
  } else {
    res.json({
      isAuthenticated: false,
      user: null
    });
  }
}