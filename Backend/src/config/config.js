// backend/config.js
import dotenv from "dotenv";

// Load environment variables before anything else
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const TICKETMASTER_KEY = process.env.TICKETMASTER_KEY;

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_KEY = process.env.SUPABASE_KEY;
// Debug (only in dev)
if (NODE_ENV === "development") {
  console.log("🌍 Loaded env:", {
    PORT,
    FRONTEND_URL,
    TICKETMASTER_KEY: TICKETMASTER_KEY ? "✔️ Present" : "❌ Missing"
  });
}