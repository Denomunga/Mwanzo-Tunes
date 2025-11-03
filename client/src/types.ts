
// client/src/types.ts
// Client-side types only (no database dependencies)

export interface AboutStats {
  albums?: number;
  concerts?: string;
  fans?: string;
}

export interface User {
  id: string;
  auth0Id: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface UpsertUser {
  auth0Id: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  profileImageUrl?: string | null;
  role?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  imageUrl: string | null;
  likes: number | null;
  createdBy: string | null;
  createdAt: Date | null;
}

export interface InsertEvent {
  title: string;
  description?: string | null;
  date: string;
  location: string;
  imageUrl?: string | null;
  createdBy?: string | null;
}

export interface EventLike {
  id: string;
  eventId: string;
  userId: string;
  createdAt: Date | null;
}

export interface AboutContent {
  id: string;
  content: string;
  stats: AboutStats | null;
  updatedBy: string | null;
  updatedAt: Date | null;
}

export interface InsertAboutContent {
  content: string;
  stats?: AboutStats | null;
  updatedBy?: string | null;
}

export interface Contact {
  id: string;
  type: string;
  label: string;
  value: string;
  icon: string;
  createdBy: string | null;
  createdAt: Date | null;
}

export interface InsertContact {
  type: string;
  label: string;
  value: string;
  icon: string;
  createdBy?: string | null;
}

export interface Song {
  id: string;
  title: string;
  artist: string | null;
  youtubeUrl: string | null;
  localFileUrl: string | null;
  thumbnailUrl: string | null;
  likes: number | null;
  views: number | null;
  createdBy: string | null;
  createdAt: Date | null;
}

export interface InsertSong {
  title: string;
  artist?: string | null;
  youtubeUrl?: string | null;
  localFileUrl?: string | null;
  thumbnailUrl?: string | null;
  createdBy?: string | null;
}

export interface SocialMedia {
  id: string;
  platform: string;
  url: string;
  isActive: boolean | null;
  updatedBy: string | null;
  updatedAt: Date | null;
}

export interface InsertSocialMedia {
  platform: string;
  url: string;
  isActive?: boolean | null;
  updatedBy?: string | null;
}