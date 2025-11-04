// server/auth.ts
import { auth } from "express-openid-connect";
import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";
import { db } from "./db.js";
import { users } from "./src/schema.js";
import { eq } from "drizzle-orm";
import { storage } from "./storage.js";

dotenv.config();

// === AUTH0 CONFIGURATION (SECURE + BACKEND-ONLY) ===
export const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET!,
  baseURL: process.env.BASE_URL!, // RENDER URL: https://mwanzo-tunes-server.onrender.com
  clientID: process.env.CLIENT_ID!,
  issuerBaseURL: process.env.ISSUER_BASE_URL!,

  // CUSTOM ROUTES
  routes: {
    login: false as const,  // We handle /api/login manually
    callback: "/api/callback",
    logout: "/api/logout",
  },

  // SECURE HTTP-ONLY COOKIE
 session: {
  name: "mwanzo_auth",
  rolling: true,
  absoluteDuration: 24 * 60 * 60, // // ← 24 hours
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  },
}, // 24 hours

  // AFTER LOGIN: Redirect to frontend
  afterCallback: (req: any, res: any, session: any) => {
    const frontend = process.env.FRONTEND_URL || "https://mwanzotunes.vercel.app";
    res.setHeader('Location', frontend);
    return session;
  },
};

export const authMiddleware = auth(authConfig);

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