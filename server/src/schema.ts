// server/src/schema.ts
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define interface for stats JSON
export interface AboutStats {
  albums?: number;
  concerts?: string;
  fans?: string;
}

// -------------------
// Sessions table
// -------------------
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// -------------------
// Users table
// -------------------
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auth0Id: varchar("auth0_id").unique(),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// -------------------
// Events table
// -------------------
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  date: varchar("date").notNull(),
  location: varchar("location").notNull(),
  imageUrl: varchar("image_url"),
  likes: integer("likes").default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// -------------------
// Event Likes
// -------------------
export const eventLikes = pgTable("event_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// -------------------
// About Content
// -------------------
export const aboutContent = pgTable("about_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  stats: jsonb("stats").$type<AboutStats>(),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// -------------------
// Contacts
// -------------------
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(),
  label: varchar("label").notNull(),
  value: varchar("value").notNull(),
  icon: varchar("icon").notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// -------------------
// Songs
// -------------------
export const songs = pgTable("songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  artist: varchar("artist").default("Kiarutara MWANZOBOYS"),
  youtubeUrl: varchar("youtube_url"),
  localFileUrl: varchar("local_file_url"),
  thumbnailUrl: varchar("thumbnail_url"),
  likes: integer("likes").default(0),
  views: integer("views").default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// -------------------
// Social Media
// -------------------
export const socialMedia = pgTable("social_media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: varchar("platform").notNull(),
  url: varchar("url").notNull(),
  isActive: boolean("is_active").default(true),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// -------------------
// Insert Schemas
// -------------------
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  likes: true,
  createdAt: true,
});

export const insertAboutContentSchema = createInsertSchema(aboutContent).omit({
  id: true,
  updatedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
  likes: true,
  views: true,
  createdAt: true,
});

export const insertSocialMediaSchema = createInsertSchema(socialMedia).omit({
  id: true,
  updatedAt: true,
});

// -------------------
// Types
// -------------------
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type EventLike = typeof eventLikes.$inferSelect;
export type InsertAboutContent = z.infer<typeof insertAboutContentSchema>;
export type AboutContent = typeof aboutContent.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertSong = z.infer<typeof insertSongSchema>;
export type Song = typeof songs.$inferSelect;
export type InsertSocialMedia = z.infer<typeof insertSocialMediaSchema>;
export type SocialMedia = typeof socialMedia.$inferSelect;