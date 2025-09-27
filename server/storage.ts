import {
  users,
  events,
  eventLikes,
  aboutContent,
  contacts,
  songs,
  socialMedia,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type EventLike,
  type AboutContent,
  type InsertAboutContent,
  type Contact,
  type InsertContact,
  type Song,
  type InsertSong,
  type SocialMedia,
  type InsertSocialMedia,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Events operations
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  likeEvent(eventId: string, userId: string): Promise<void>;
  unlikeEvent(eventId: string, userId: string): Promise<void>;
  getUserEventLike(eventId: string, userId: string): Promise<EventLike | undefined>;
  
  // About operations
  getAboutContent(): Promise<AboutContent | undefined>;
  upsertAboutContent(content: InsertAboutContent): Promise<AboutContent>;
  
  // Contact operations
  getContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  deleteContact(id: string): Promise<void>;
  
  // Song operations
  getSongs(): Promise<Song[]>;
  createSong(song: InsertSong): Promise<Song>;
  deleteSong(id: string): Promise<void>;
  
  // Social media operations
  getSocialMedia(): Promise<SocialMedia[]>;
  upsertSocialMedia(social: InsertSocialMedia): Promise<SocialMedia>;
  deleteSocialMedia(id: string): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Initialize default admin
  initializeDefaultAdmin(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Events operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(eventLikes).where(eq(eventLikes.eventId, id));
    await db.delete(events).where(eq(events.id, id));
  }

  async likeEvent(eventId: string, userId: string): Promise<void> {
    await db.insert(eventLikes).values({ eventId, userId });
    await db
      .update(events)
      .set({ likes: sql`${events.likes} + 1` })
      .where(eq(events.id, eventId));
  }

  async unlikeEvent(eventId: string, userId: string): Promise<void> {
    await db.delete(eventLikes).where(
      and(eq(eventLikes.eventId, eventId), eq(eventLikes.userId, userId))
    );
    await db
      .update(events)
      .set({ likes: sql`GREATEST(${events.likes} - 1, 0)` })
      .where(eq(events.id, eventId));
  }

  async getUserEventLike(eventId: string, userId: string): Promise<EventLike | undefined> {
    const [like] = await db
      .select()
      .from(eventLikes)
      .where(and(eq(eventLikes.eventId, eventId), eq(eventLikes.userId, userId)));
    return like;
  }

  // About operations
  async getAboutContent(): Promise<AboutContent | undefined> {
    const [content] = await db.select().from(aboutContent).limit(1);
    return content;
  }

  async upsertAboutContent(content: InsertAboutContent): Promise<AboutContent> {
    const existing = await this.getAboutContent();
    if (existing) {
      const [updated] = await db
        .update(aboutContent)
        .set({ 
          content: content.content,
          stats: content.stats as any,
          updatedBy: content.updatedBy,
          updatedAt: new Date() 
        })
        .where(eq(aboutContent.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(aboutContent).values({
        content: content.content,
        stats: content.stats as any,
        updatedBy: content.updatedBy,
      }).returning();
      return created;
    }
  }

  // Contact operations
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }

  async deleteContact(id: string): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  // Song operations
  async getSongs(): Promise<Song[]> {
    return await db.select().from(songs).orderBy(desc(songs.createdAt));
  }

  async createSong(song: InsertSong): Promise<Song> {
    const [newSong] = await db.insert(songs).values(song).returning();
    return newSong;
  }

  async deleteSong(id: string): Promise<void> {
    await db.delete(songs).where(eq(songs.id, id));
  }

  // Social media operations
  async getSocialMedia(): Promise<SocialMedia[]> {
    return await db.select().from(socialMedia).orderBy(desc(socialMedia.updatedAt));
  }

  async upsertSocialMedia(social: InsertSocialMedia): Promise<SocialMedia> {
    const [existing] = await db
      .select()
      .from(socialMedia)
      .where(eq(socialMedia.platform, social.platform))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(socialMedia)
        .set({ ...social, updatedAt: new Date() })
        .where(eq(socialMedia.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(socialMedia).values(social).returning();
      return created;
    }
  }

  async deleteSocialMedia(id: string): Promise<void> {
    await db.delete(socialMedia).where(eq(socialMedia.id, id));
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Initialize default admin
  async initializeDefaultAdmin(): Promise<void> {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, "Admin@kiarutara.com"))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(users).values({
        id: "admin-default",
        email: "Admin@kiarutara.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      });
    }
  }
}

export const storage = new DatabaseStorage();
