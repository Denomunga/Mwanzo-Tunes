# Overview

This is a full-stack music artist portfolio application built for "Kiarutara MWANZOBOYS". The application serves as a comprehensive platform for showcasing events, music, about content, and contact information. It features both public-facing pages and an admin interface for content management.

The application is designed as a modern web platform with user authentication, content management capabilities, and media handling for both audio files and YouTube videos. It includes a landing page for unauthenticated users and a full dashboard experience for authenticated users.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: TailwindCSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and bundling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints under `/api` prefix
- **Session Management**: Express sessions with PostgreSQL store
- **File Handling**: Multer for audio/video file uploads with 50MB limit

## Authentication System
- **Provider**: Replit Auth using OpenID Connect
- **Strategy**: Passport.js with OpenID strategy
- **Authorization**: Role-based access control (user, staff, admin)
- **Session Storage**: PostgreSQL-backed sessions with 1-week TTL

## Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Centralized in `shared/schema.ts` for type sharing
- **Key Entities**:
  - Users (authentication and roles)
  - Events (with like functionality)
  - Songs (supporting both uploaded files and YouTube videos)
  - About content (with statistics)
  - Contacts (categorized contact information)
  - Social media links
  - Sessions (for authentication)

## Content Management
- **Media Support**: Audio files (mp3, wav, ogg, m4a) and video files (mp4, webm)
- **YouTube Integration**: Embedded YouTube videos with custom player interface
- **File Storage**: Local file system with organized upload structure
- **Rich Content**: JSONB fields for flexible content structure (e.g., about page statistics)

## Project Structure
- **Monorepo**: Single repository with shared types and schemas
- **Client**: React application in `client/` directory
- **Server**: Express backend in `server/` directory  
- **Shared**: Common types and schemas in `shared/` directory
- **Component Library**: shadcn/ui components in `client/src/components/ui/`

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL database
- **Connection**: @neondatabase/serverless with WebSocket support

## Authentication
- **Auth0**: OpenID Connect authentication provider
- **Session Store**: connect-pg-simple for PostgreSQL session storage

## Media & Content
- **YouTube**: Embedded video player integration
- **File Upload**: Multer middleware for handling audio/video uploads
- **Media Types**: Support for common audio formats and video files

## UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for UI elements
- **Google Fonts**: Inter, Fira Code, and other web fonts

## Development Tools
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Server-side bundling for production
- **Drizzle Kit**: Database migration and schema management