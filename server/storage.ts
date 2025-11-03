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
  type InsertAboutContent,
  type Contact,
  type InsertContact,
  type Song,
  type InsertSong,
  type SocialMedia,
  type InsertSocialMedia,
  type AboutStats,
} from "./src/schema.js";

import { db } from "./db.js";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  likeEvent(eventId: string, userId: string): Promise<void>;
  unlikeEvent(eventId: string, userId: string): Promise<void>;
  getUserEventLike(eventId: string, userId: string): Promise<EventLike | undefined>;
  getAboutContent(): Promise<any | undefined>;
  upsertAboutContent(content: InsertAboutContent): Promise<any>;
  getContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  deleteContact(id: string): Promise<void>;
  getSongs(): Promise<Song[]>;
  createSong(song: InsertSong): Promise<Song>;
  deleteSong(id: string): Promise<void>;
  getSocialMedia(): Promise<SocialMedia[]>;
  upsertSocialMedia(social: InsertSocialMedia): Promise<SocialMedia>;
  deleteSocialMedia(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // -------------------------
  // USERS
  // -------------------------
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values({
          auth0Id: userData.auth0Id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName ?? null,
          profileImageUrl: userData.profileImageUrl ?? null,
          role: userData.role ?? "user",
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            auth0Id: userData.auth0Id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName ?? null,
            profileImageUrl: userData.profileImageUrl ?? null,
            updatedAt: new Date(),
            // Exclude role to preserve existing value
          },
        })
        .returning();

      if (!user) throw new Error("Failed to upsert user");
      return user;
    } catch (err) {
      console.error("❌ Error in upsertUser:", err);
      throw err;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new Error("Failed to update user role");
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(eventLikes).where(eq(eventLikes.userId, id));
      await tx.delete(users).where(eq(users.id, id));
    });
  }

  // -------------------------
  // EVENTS
  // -------------------------
  async getEvents(): Promise<Event[]> {
    return db.select().from(events).orderBy(desc(events.createdAt));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    if (!newEvent) throw new Error("Failed to create event");
    return newEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.delete(eventLikes).where(eq(eventLikes.eventId, id));
      await tx.delete(events).where(eq(events.id, id));
    });
  }
//store likes
  async likeEvent(eventId: string, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      const [existingLike] = await tx
        .select()
        .from(eventLikes)
        .where(and(eq(eventLikes.eventId, eventId), eq(eventLikes.userId, userId)));

      if (existingLike) return;

      await tx.insert(eventLikes).values({ eventId, userId });

      await tx
        .update(events)
        .set({ likes: sql`${events.likes} + 1` })
        .where(eq(events.id, eventId));
    });
  }
//Remove like SECURE
  async unlikeEvent(eventId: string, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      const [existingLike] = await tx
        .select()
        .from(eventLikes)
        .where(and(eq(eventLikes.eventId, eventId), eq(eventLikes.userId, userId)));

      if (!existingLike) return;

      await tx
        .delete(eventLikes)
        .where(and(eq(eventLikes.eventId, eventId), eq(eventLikes.userId, userId)));

      await tx
        .update(events)
        .set({ likes: sql`GREATEST(${events.likes} - 1, 0)` })
        .where(eq(events.id, eventId));
    });
  }
//Load no oflikes
  async getUserEventLike(eventId: string, userId: string): Promise<EventLike | undefined> {
    const [like] = await db
      .select()
      .from(eventLikes)
      .where(and(eq(eventLikes.eventId, eventId), eq(eventLikes.userId, userId)));
    return like;
  }

  // -------------------------
  // ABOUT CONTENT
  // -------------------------
  async getAboutContent(): Promise<any | undefined> {
    const [content] = await db.select().from(aboutContent).limit(1);
    return content;
  }

  async upsertAboutContent(content: InsertAboutContent): Promise<any> {
    const existing = await this.getAboutContent();
    if (existing) {
      const [updated] = await db
        .update(aboutContent)
        .set({
          content: content.content,
          stats: content.stats as AboutStats,
          updatedBy: content.updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(aboutContent.id, existing.id))
        .returning();
      if (!updated) throw new Error("Failed to update about content");
      return updated;
    } else {
      const [created] = await db
        .insert(aboutContent)
        .values({
          content: content.content,
          stats: content.stats as AboutStats,
          updatedBy: content.updatedBy,
        })
        .returning();
      if (!created) throw new Error("Failed to create about content");
      return created;
    }
  }

  // -------------------------
  // CONTACTS
  // -------------------------
  async getContacts(): Promise<Contact[]> {
    return db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    if (!newContact) throw new Error("Failed to create contact");
    return newContact;
  }

  async deleteContact(id: string): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  // -------------------------
  // SONGS
  // -------------------------
  async getSongs(): Promise<Song[]> {
    return db.select().from(songs).orderBy(desc(songs.createdAt));
  }

  async createSong(song: InsertSong): Promise<Song> {
    const [newSong] = await db.insert(songs).values(song).returning();
    if (!newSong) throw new Error("Failed to create song");
    return newSong;
  }

  async deleteSong(id: string): Promise<void> {
    await db.delete(songs).where(eq(songs.id, id));
  }

  // -------------------------
  // SOCIAL MEDIA
  // -------------------------
  async getSocialMedia(): Promise<SocialMedia[]> {
    return db.select().from(socialMedia).orderBy(desc(socialMedia.updatedAt));
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
      if (!updated) throw new Error("Failed to update social media");
      return updated;
    } else {
      const [created] = await db.insert(socialMedia).values(social).returning();
      if (!created) throw new Error("Failed to create social media");
      return created;
    }
  }

  async deleteSocialMedia(id: string): Promise<void> {
    await db.delete(socialMedia).where(eq(socialMedia.id, id));
  }
}

export const storage = new DatabaseStorage();