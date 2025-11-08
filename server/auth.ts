import { auth } from "express-openid-connect";
import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";
import { db } from "./db.js";
import { users } from "./src/schema.js";
import { eq } from "drizzle-orm";
import { storage } from "./storage.js";

dotenv.config();

// --------------------
// Auth0 Configuration
// --------------------
export const authConfig = {
  authRequired: false, // Only protect routes that require auth
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
export const authMiddleware = auth(authConfig);

// --------------------
// Middleware: Ensure user is authenticated
// --------------------
export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.oidc?.isAuthenticated() || !req.oidc.user) {
      // Force login
      return res.oidc.login({
        returnTo: req.originalUrl || "/",
        authorizationParams: { prompt: "login" },
      });
    }

    const userData = req.oidc.user as Record<string, any>;
    const auth0Id = userData.sub;
    const email = userData.email;
    const firstName = userData.given_name || "User";
    const lastName = userData.family_name || "";

    // Check if user exists in DB
    const existing = await db.select().from(users).where(eq(users.auth0Id, auth0Id)).limit(1);
    let user;
    if (existing.length > 0) {
      user = existing[0]; // existing user
    } else {
      // Create new user with default role
      user = await storage.upsertUser({
        auth0Id,
        email,
        firstName,
        lastName,
        role: "user",
      });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (err) {
    console.error("Error in isAuthenticated middleware:", err);
    res.status(500).json({ message: "Server error while authenticating user" });
  }
}

// --------------------
// Middleware: Require admin role
// --------------------
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.oidc?.isAuthenticated() || !req.oidc.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const auth0Id = req.oidc.user.sub;
    const result = await db.select().from(users).where(eq(users.auth0Id, auth0Id)).limit(1);
    const user = result[0];

    if (!user) {
      return res.status(403).json({ message: "User not found, admin access denied" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin required" });
    }

    (req as any).user = user;
    next();
  } catch (err) {
    console.error("Error in requireAdmin middleware:", err);
    res.status(500).json({ message: "Server error while checking admin role" });
  }
}

// --------------------
// Helper: Get current user info
// --------------------
export async function getCurrentUser(req: Request, res: Response) {
  if (!req.oidc?.isAuthenticated() || !req.oidc.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const userData = req.oidc.user as Record<string, any>;
  const auth0Id = userData.sub;
  const email = userData.email;
  const firstName = userData.given_name || "User";
  const lastName = userData.family_name || "";

  try {
    const existing = await db.select().from(users).where(eq(users.auth0Id, auth0Id)).limit(1);
    let user = existing[0];

    if (!user) {
      user = await storage.upsertUser({
        auth0Id,
        email,
        firstName,
        lastName,
        role: "user",
      });
    }

    return res.json(user);
  } catch (err) {
    console.error("Error fetching current user:", err);
    return res.status(500).json({ error: "Database error" });
  }
}
