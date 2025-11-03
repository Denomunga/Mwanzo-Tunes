import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Ensure DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not defined in .env");
}

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Export drizzle ORM instance
export const db = drizzle(pool);

// Optional: check connection on startup
pool.connect()
  .then(() => console.log("✅ Connected to Postgres via Drizzle Baiby!!"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });
