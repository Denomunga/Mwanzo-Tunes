// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL missing");

export default defineConfig({
  out: "./migrations",
  schema: "../shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url,
    // Force SSL for Render
    ssl: url.includes("render.com") ? { rejectUnauthorized: false } : false,
  },
  verbose: true,
});