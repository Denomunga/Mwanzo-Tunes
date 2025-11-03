import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { storage } from "./storage.js";
import {
  insertEventSchema,
  insertAboutContentSchema,
  insertContactSchema,
  insertSongSchema,
  insertSocialMediaSchema,
} from "./src/schema.js";
import { isAuthenticated as isAuthenticatedMiddleware, requireAdmin } from "./auth.js";

// Configure upload directory for storing images and files
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ✅ FIXED: Custom disk storage for event images to preserve file extension
const eventDiskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// ✅ FIXED: Updated Multer for event images with custom storage
const eventImageUpload = multer({
  storage: eventDiskStorage, // Use custom storage instead of dest
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for images
  fileFilter: (_req, file, cb) => {
    // Security: Only allow image files for events to prevent malicious uploads
    const allowed = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Invalid file type. Only images allowed for events."));
    }
  },
});

// ✅ FIXED: Custom disk storage for songs to preserve file extension (for consistency)
const songDiskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Multer configuration for song uploads (audio/video files)
const upload = multer({
  storage: songDiskStorage, // Use custom storage instead of dest
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for audio/video
  fileFilter: (_req, file, cb) => {
    // Security: Only allow audio/video files
    const allowed = /\.(mp3|mp4|wav|ogg|m4a|webm)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio/video allowed."));
    }
  },
});

export async function registerRoutes(app: any): Promise<void> {
  // ===== EVENTS ROUTES =====
  
  // GET /api/events - Get all events
  app.get("/api/events", async (_req: any, res: any) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (err) {
      console.error("Error fetching events", err);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // POST /api/events - Create a new event (Admin only)
  app.post(
    "/api/events",
    isAuthenticatedMiddleware as any, // Check if user is authenticated
    requireAdmin, // Check if user has admin role
    eventImageUpload.single("image"), // Handle single image upload for event poster
    async (req: any, res: any) => {
      try {
        const user = req.user;

        // Extract form data from request body
        const { title, description, date, location } = req.body;
        
        // Handle location if it comes as an array
        const locationString = Array.isArray(location) ? location[0] : location;

        // Build image URL if file was uploaded
        let imageUrl = null;
        if (req.file) {
          // Construct the URL where the image can be accessed
          imageUrl = `/uploads/${req.file.filename}`;
        }

        // Prepare the event payload with all required fields
        const payload = {
          title,
          description,
          date,
          location: locationString,
          imageUrl,
          coordinates: "", // Currently not used, can be added later for maps
          createdBy: user.id // Track which user created the event
        };

        // Validate the payload against the schema
        const parsed = insertEventSchema.parse(payload);
        // Create the event in the database
        const ev = await storage.createEvent(parsed);
        res.json(ev);
      } catch (err) {
        console.error("Error creating event", err);
        res.status(500).json({ message: "Failed to create event" });
      }
    }
  );

  // DELETE /api/events/:id - Delete an event (Admin only)
  app.delete("/api/events/:id", isAuthenticatedMiddleware as any, requireAdmin, async (req: any, res: any) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.json({ message: "Event deleted successfully" });
    } catch (err) {
      console.error("Error deleting event", err);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // POST /api/events/:id/like - Like or unlike an event (Authenticated users only)
  app.post("/api/events/:id/like", isAuthenticatedMiddleware as any, async (req: any, res: any) => {
    try {
      // Use the user from auth middleware
      const userId = req.user.id;
      const eventId = req.params.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const existing = await storage.getUserEventLike(eventId, userId);
      if (existing) {
        await storage.unlikeEvent(eventId, userId);
        res.json({ liked: false });
      } else {
        await storage.likeEvent(eventId, userId);
        res.json({ liked: true });
      }
    } catch (err) {
      console.error("Error toggling like", err);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // ===== ABOUT ROUTES =====
  
  // GET /api/about - Get about page content
  app.get("/api/about", async (_req: any, res: any) => {
    try {
      const content = await storage.getAboutContent();
      res.json(content ?? null);
    } catch (err) {
      console.error("Error fetching about", err);
      res.status(500).json({ message: "Failed to fetch about content" });
    }
  });

  // PUT /api/about - Update about page content (Admin only)
  app.put("/api/about", isAuthenticatedMiddleware as any, requireAdmin, async (req: any, res: any) => {
    try {
      const user = req.user;
      
      const payload = { ...req.body, updatedBy: user.id };
      const parsed = insertAboutContentSchema.parse(payload);
      const updated = await storage.upsertAboutContent(parsed);
      res.json(updated);
    } catch (err) {
      console.error("Error updating about", err);
      res.status(500).json({ message: "Failed to update about content" });
    }
  });

  // ===== CONTACTS ROUTES =====  //
  
  // GET /api/contacts - Get all contacts
  app.get("/api/contacts", async (_req: any, res: any) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (err) {
      console.error("Error fetching contacts", err);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  // POST /api/contacts - Create a new contact (Admin only)
  app.post("/api/contacts", isAuthenticatedMiddleware as any, requireAdmin, async (req: any, res: any) => {
    try {
      const user = req.user;
      
      const parsed = insertContactSchema.parse({ ...req.body, createdBy: user.id });
      const created = await storage.createContact(parsed);
      res.json(created);
    } catch (err) {
      console.error("Error creating contact", err);
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  // DELETE /api/contacts/:id - Delete a contact (Admin only)
  app.delete("/api/contacts/:id", isAuthenticatedMiddleware as any, requireAdmin, async (req: any, res: any) => {
    try {
      await storage.deleteContact(req.params.id);
      res.json({ message: "Contact deleted successfully" });
    } catch (err) {
      console.error("Error deleting contact", err);
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // ===== SONGS ROUTES =====
  
  // GET /api/songs - Get all songs
  app.get("/api/songs", async (_req: any, res: any) => {
    try {
      const songs = await storage.getSongs();
      res.json(songs);
    } catch (err) {
      console.error("Error fetching songs", err);
      res.status(500).json({ message: "Failed to fetch songs" });
    }
  });

  // POST /api/songs - Create a new song (Admin only)
  app.post("/api/songs", isAuthenticatedMiddleware as any, requireAdmin, async (req: any, res: any) => {
    try {
      const user = req.user;
      
      const parsed = insertSongSchema.parse({ ...req.body, createdBy: user.id });
      const created = await storage.createSong(parsed);
      res.json(created);
    } catch (err) {
      console.error("Error creating song", err);
      res.status(500).json({ message: "Failed to create song" });
    }
  });

  // POST /api/songs/upload - Upload song files (Admin only)
  app.post(
    "/api/songs/upload",
    isAuthenticatedMiddleware as any,
    requireAdmin,
    upload.array("files") as any,
    async (req: any, res: any) => {
      try {
        const user = req.user;
        const files = req.files as Express.Multer.File[];
        const created: any[] = [];
        
        // Process each uploaded file
        for (const f of files) {
          const songData = {
            title: path.parse(f.originalname).name, // Use filename as song title
            localFileUrl: `/uploads/${f.filename}`, // Store file path
            createdBy: user.id,
          };
          const s = await storage.createSong(insertSongSchema.parse(songData));
          created.push(s);
        }

        res.json(created);
      } catch (err) {
        console.error("Error uploading songs", err);
        res.status(500).json({ message: "Failed to upload songs" });
      }
    }
  );

  // DELETE /api/songs/:id - Delete a song (Admin only)
  app.delete("/api/songs/:id", isAuthenticatedMiddleware as any, requireAdmin, async (req: any, res: any) => {
    try {
      await storage.deleteSong(req.params.id);
      res.json({ message: "Song deleted successfully" });
    } catch (err) {
      console.error("Error deleting song", err);
      res.status(500).json({ message: "Failed to delete song" });
    }
  });

  // ===== SOCIAL MEDIA ROUTES =====
  
  // GET /api/social-media - Get all social media links
  app.get("/api/social-media", async (_req: any, res: any) => {
    try {
      const sm = await storage.getSocialMedia();
      res.json(sm);
    } catch (err) {
      console.error("Error fetching social media", err);
      res.status(500).json({ message: "Failed to fetch social media" });
    }
  });

  // POST /api/social-media - Create or update social media link (Admin only)
  app.post("/api/social-media", isAuthenticatedMiddleware as any, requireAdmin, async (req: any, res: any) => {
    try {
      const user = req.user;
      
      const parsed = insertSocialMediaSchema.parse({ ...req.body, updatedBy: user.id });
      const upserted = await storage.upsertSocialMedia(parsed);
      res.json(upserted);
    } catch (err) {
      console.error("Error upserting social media", err);
      res.status(500).json({ message: "Failed to upsert social media" });
    }
  });

  // DELETE /api/social-media/:id - Delete social media link (Admin only)
  app.delete("/api/social-media/:id", isAuthenticatedMiddleware as any, requireAdmin, async (req: any, res: any) => {
    try {
      await storage.deleteSocialMedia(req.params.id);
      res.json({ message: "Social media deleted successfully" });
    } catch (err) {
      console.error("Error deleting social media", err);
      res.status(500).json({ message: "Failed to delete social media" });
    }
  });

  // ===== ADMIN USER MANAGEMENT ROUTES =====
  
  // GET /api/admin/users - Get all users (Admin only)
  app.get("/api/admin/users", requireAdmin, async (req: any, res: any) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (err) {
      console.error("Error fetching users", err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // PUT /api/admin/users/:id/role - Update user role (Admin only)
  app.put("/api/admin/users/:id/role", isAuthenticatedMiddleware as any, requireAdmin, async (req: any, res: any) => {
    try {
      const { role } = req.body;
      // Security: Validate role input to prevent invalid roles
      if (!["user", "staff", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const updated = await storage.updateUserRole(req.params.id, role);
      res.json(updated);
    } catch (err) {
      console.error("Error updating role", err);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // DELETE /api/admin/users/:id - Delete user (Admin only)
  app.delete("/api/admin/users/:id", isAuthenticatedMiddleware as any, requireAdmin, async (req: any, res: any) => {
    try {
      const actorId = req.oidc.user?.sub;
      
      // Security: Prevent users from deleting their own account
      if (req.params.id === actorId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await storage.deleteUser(req.params.id);
      res.json({ message: "User deleted" });
    } catch (err) {
      console.error("Error deleting user", err);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Serve uploaded files statically from uploads directory
  // This makes images and files accessible via URLs like /uploads/filename.jpg
  app.use("/uploads", express.static(UPLOAD_DIR));
}