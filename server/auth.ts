import { auth } from "express-openid-connect";
import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";
import { db } from "./db.js";
import { users } from "./src/schema.js";
import { eq } from "drizzle-orm";
import { storage } from "./storage.js";

dotenv.config();

// Auth0 configuration for secure authenticationn
export const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET!,
  baseURL: process.env.BASE_URL!,
  clientID: process.env.CLIENT_ID!,
  issuerBaseURL: process.env.ISSUER_BASE_URL!,
};

export const authMiddleware = auth(authConfig);

// Middleware to check if user is authenticated
export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.oidc?.isAuthenticated() || !req.oidc.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const auth0Id = req.oidc.user.sub;
  const email = req.oidc.user.email;
  const firstName = req.oidc.user.given_name || req.oidc.user.email || "User";
  const lastName = req.oidc.user.family_name || "";

  // Check if user exists
  const existingUser = await db.select().from(users).where(eq(users.auth0Id, auth0Id)).limit(1);
  let user;
  if (existingUser.length > 0) {
    user = existingUser[0]; // Use existing user, preserving role
    console.log('User role after sync:', users.role); // Debug log
  } else {
    // Create new user with default role
    user = await storage.upsertUser({
      auth0Id: auth0Id,
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: "user",
    });
  }
  (req as any).user = user;
  next();
}

// Middleware to require admin privileges
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

// User route handler
export async function userRoute(req: Request, res: Response) {
  if (req.oidc?.isAuthenticated() && req.oidc.user) {
    const user = req.oidc.user as Record<string, any>;
    const auth0Id = user.sub;
    const email = user.email;
    const firstName = user.given_name || "Unnamed";
    const lastName = user.family_name || "";
    try {
      const result = await db.select().from(users).where(eq(users.auth0Id, auth0Id)).limit(1);
      let dbUser = result[0];
      if (!dbUser) {
        dbUser = await storage.upsertUser({
          auth0Id,
          email,
          firstName,
          lastName,
          role: "user",
        });
      }
      return res.json(dbUser);
    } catch (err) {
      console.error("Database error in userRoute:", err);
      return res.status(500).json({ error: "Database error" });
    }
  }
  return res.status(401).json({ error: "Not logged in" });
}