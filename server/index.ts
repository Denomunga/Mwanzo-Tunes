import express from "express";
import pkg from "express-openid-connect";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { storage } from "./storage.js";
import {
  insertEventSchema,
  insertAboutContentSchema,
  insertContactSchema,
  insertSongSchema,
  insertSocialMediaSchema,
} from "./src/schema.js";

dotenv.config();

const { auth, requiresAuth } = pkg;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------- Auth0 Setup -----------------
const config = {
  authRequired: false, // public access allowed
  auth0Logout: true,
  secret: process.env.SECRET!,
  baseURL: process.env.BASE_URL!,
  clientID: process.env.CLIENT_ID!,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
};
app.use(auth(config));

// ----------------- Uploads -----------------
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});

const songStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});

const uploadImages = multer({ storage: imageStorage });
const uploadSongs = multer({ storage: songStorage });
app.use("/uploads", express.static(UPLOAD_DIR));

// ----------------- Auth Helpers -----------------
function isAuthenticatedMiddleware(req: any, res: any, next: any) {
  if (!req.oidc.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
  req.user = req.oidc.user;
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  // Example: check if user has admin role in your storage DB
  if (!req.user || req.user?.role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
}

// ----------------- Routes -----------------

// Home & profile
app.get("/", (_req, res) => res.send('<a href="/login">Login with Auth0</a>'));
app.get("/profile", requiresAuth(), (req, res) => res.json(req.oidc.user));

// ----------------- EVENTS -----------------
app.get("/api/events", async (_req, res) => {
  try {
    const events = await storage.getEvents();
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

app.post(
  "/api/events",
  isAuthenticatedMiddleware,
  requireAdmin,
  uploadImages.single("image"),
  async (req: any, res) => {
    try {
      const { title, description, date, location } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
      const payload = insertEventSchema.parse({
        title,
        description,
        date,
        location,
        imageUrl,
        createdBy: req.user.sub,
      });
      const ev = await storage.createEvent(payload);
      res.json(ev);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create event" });
    }
  }
);

app.delete("/api/events/:id", isAuthenticatedMiddleware, requireAdmin, async (req: any, res) => {
  try {
    await storage.deleteEvent(req.params.id);
    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

app.post("/api/events/:id/like", isAuthenticatedMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.sub;
    const eventId = req.params.id;
    const existing = await storage.getUserEventLike(eventId, userId);
    if (existing) {
      await storage.unlikeEvent(eventId, userId);
      res.json({ liked: false });
    } else {
      await storage.likeEvent(eventId, userId);
      res.json({ liked: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle like" });
  }
});

// ----------------- ABOUT -----------------
app.get("/api/about", async (_req, res) => {
  try {
    const content = await storage.getAboutContent();
    res.json(content ?? null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch about" });
  }
});

app.put("/api/about", isAuthenticatedMiddleware, requireAdmin, async (req: any, res) => {
  try {
    const payload = insertAboutContentSchema.parse({ ...req.body, updatedBy: req.user.sub });
    const updated = await storage.upsertAboutContent(payload);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update about" });
  }
});

// ----------------- CONTACTS -----------------
app.get("/api/contacts", async (_req, res) => {
  try {
    const contacts = await storage.getContacts();
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
});

app.post("/api/contacts", isAuthenticatedMiddleware, requireAdmin, async (req: any, res) => {
  try {
    const payload = insertContactSchema.parse({ ...req.body, createdBy: req.user.sub });
    const created = await storage.createContact(payload);
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create contact" });
  }
});

app.delete("/api/contacts/:id", isAuthenticatedMiddleware, requireAdmin, async (req: any, res) => {
  try {
    await storage.deleteContact(req.params.id);
    res.json({ message: "Contact deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete contact" });
  }
});

// ----------------- SONGS -----------------
app.get("/api/songs", async (_req, res) => {
  try {
    const songs = await storage.getSongs();
    res.json(songs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch songs" });
  }
});

app.post("/api/songs", isAuthenticatedMiddleware, requireAdmin, async (req: any, res) => {
  try {
    const payload = insertSongSchema.parse({ ...req.body, createdBy: req.user.sub });
    const created = await storage.createSong(payload);
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create song" });
  }
});

app.post("/api/songs/upload", isAuthenticatedMiddleware, requireAdmin, uploadSongs.array("files"), async (req: any, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const created: any[] = [];
    for (const f of files) {
      const songData = insertSongSchema.parse({
        title: path.parse(f.originalname).name,
        localFileUrl: `/uploads/${f.filename}`,
        createdBy: req.user.sub,
      });
      const s = await storage.createSong(songData);
      created.push(s);
    }
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload songs" });
  }
});

app.delete("/api/songs/:id", isAuthenticatedMiddleware, requireAdmin, async (req: any, res) => {
  try {
    await storage.deleteSong(req.params.id);
    res.json({ message: "Song deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete song" });
  }
});

// ----------------- SOCIAL MEDIA -----------------
app.get("/api/social-media", async (_req, res) => {
  try {
    const sm = await storage.getSocialMedia();
    res.json(sm);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch social media" });
  }
});

app.post("/api/social-media", isAuthenticatedMiddleware, requireAdmin, async (req: any, res) => {
  try {
    const payload = insertSocialMediaSchema.parse({ ...req.body, updatedBy: req.user.sub });
    const upserted = await storage.upsertSocialMedia(payload);
    res.json(upserted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upsert social media" });
  }
});

app.delete("/api/social-media/:id", isAuthenticatedMiddleware, requireAdmin, async (req: any, res) => {
  try {
    await storage.deleteSocialMedia(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete social media" });
  }
});

// ----------------- ADMIN USER MANAGEMENT -----------------
app.get("/api/admin/users", isAuthenticatedMiddleware, requireAdmin, async (_req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

app.put("/api/admin/users/:id/role", isAuthenticatedMiddleware, requireAdmin, async (req: any, res) => {
  try {
    const { role } = req.body;
    if (!["user", "staff", "admin"].includes(role)) return res.status(400).json({ message: "Invalid role" });
    const updated = await storage.updateUserRole(req.params.id, role);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update role" });
  }
});

app.delete("/api/admin/users/:id", isAuthenticatedMiddleware, requireAdmin, async (req: any, res) => {
  try {
    if (req.params.id === req.user.sub) return res.status(400).json({ message: "Cannot delete your own account" });
    await storage.deleteUser(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// ----------------- ERROR HANDLER -----------------
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// ----------------- START SERVER -----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
