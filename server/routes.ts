import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertEventSchema, 
  insertAboutContentSchema,
  insertContactSchema,
  insertSongSchema,
  insertSocialMediaSchema 
} from "@shared/schema";
import multer from "multer";
import path from "path";

const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(mp3|mp4|wav|ogg|m4a|webm)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio and video files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize default admin
  await storage.initializeDefaultAdmin();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Events routes
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const eventData = insertEventSchema.parse({ ...req.body, createdBy: user.id });
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.delete('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      await storage.deleteEvent(req.params.id);
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  app.post('/api/events/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = req.params.id;
      
      const existingLike = await storage.getUserEventLike(eventId, userId);
      if (existingLike) {
        await storage.unlikeEvent(eventId, userId);
        res.json({ liked: false });
      } else {
        await storage.likeEvent(eventId, userId);
        res.json({ liked: true });
      }
    } catch (error) {
      console.error("Error toggling event like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  // About routes
  app.get('/api/about', async (req, res) => {
    try {
      const content = await storage.getAboutContent();
      res.json(content);
    } catch (error) {
      console.error("Error fetching about content:", error);
      res.status(500).json({ message: "Failed to fetch about content" });
    }
  });

  app.put('/api/about', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const contentData = insertAboutContentSchema.parse({ ...req.body, updatedBy: user.id });
      const content = await storage.upsertAboutContent(contentData);
      res.json(content);
    } catch (error) {
      console.error("Error updating about content:", error);
      res.status(500).json({ message: "Failed to update about content" });
    }
  });

  // Contact routes
  app.get('/api/contacts', async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const contactData = insertContactSchema.parse({ ...req.body, createdBy: user.id });
      const contact = await storage.createContact(contactData);
      res.json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  app.delete('/api/contacts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteContact(req.params.id);
      res.json({ message: "Contact deleted successfully" });
    } catch (error) {
      console.error("Error deleting contact:", error);
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Song routes
  app.get('/api/songs', async (req, res) => {
    try {
      const songs = await storage.getSongs();
      res.json(songs);
    } catch (error) {
      console.error("Error fetching songs:", error);
      res.status(500).json({ message: "Failed to fetch songs" });
    }
  });

  app.post('/api/songs', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const songData = insertSongSchema.parse({ ...req.body, createdBy: user.id });
      const song = await storage.createSong(songData);
      res.json(song);
    } catch (error) {
      console.error("Error creating song:", error);
      res.status(500).json({ message: "Failed to create song" });
    }
  });

  app.post('/api/songs/upload', isAuthenticated, upload.array('files'), async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const files = req.files as Express.Multer.File[];
      const songs = [];

      for (const file of files) {
        const songData = {
          title: path.parse(file.originalname).name,
          localFileUrl: `/uploads/${file.filename}`,
          createdBy: user.id,
        };
        const song = await storage.createSong(songData);
        songs.push(song);
      }

      res.json(songs);
    } catch (error) {
      console.error("Error uploading songs:", error);
      res.status(500).json({ message: "Failed to upload songs" });
    }
  });

  app.delete('/api/songs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteSong(req.params.id);
      res.json({ message: "Song deleted successfully" });
    } catch (error) {
      console.error("Error deleting song:", error);
      res.status(500).json({ message: "Failed to delete song" });
    }
  });

  // Social media routes
  app.get('/api/social-media', async (req, res) => {
    try {
      const socialMedia = await storage.getSocialMedia();
      res.json(socialMedia);
    } catch (error) {
      console.error("Error fetching social media:", error);
      res.status(500).json({ message: "Failed to fetch social media" });
    }
  });

  app.post('/api/social-media', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const socialData = insertSocialMediaSchema.parse({ ...req.body, updatedBy: user.id });
      const social = await storage.upsertSocialMedia(socialData);
      res.json(social);
    } catch (error) {
      console.error("Error creating/updating social media:", error);
      res.status(500).json({ message: "Failed to create/update social media" });
    }
  });

  app.delete('/api/social-media/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteSocialMedia(req.params.id);
      res.json({ message: "Social media link deleted successfully" });
    } catch (error) {
      console.error("Error deleting social media:", error);
      res.status(500).json({ message: "Failed to delete social media" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { role } = req.body;
      if (!['user', 'staff', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const updatedUser = await storage.updateUserRole(req.params.id, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.delete('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Prevent admin from deleting themselves
      if (req.params.id === user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await storage.deleteUser(req.params.id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
