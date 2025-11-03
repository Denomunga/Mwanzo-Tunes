// server/drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";

// Load .env that lives next to this file (server/.env)
dotenv.config({ path: path.resolve(__dirname, ".env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing – make sure the DB is provisioned");
}

export default defineConfig({
  out: "./migrations",                     // → server/migrations/
  schema: "./src/schema.ts",           // correct relative path
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,                           // <-- nice for Render logs
});