import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage, cors } from "../_lib/storage.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id, email, username } = req.body;
    
    if (!id || !username) {
      return res.status(400).json({ error: "id and username are required" });
    }

    let user = await storage.getUser(id);
    
    if (!user) {
      user = await storage.createUser({
        id,
        username,
        email: email || null,
        preferredUnits: "imperial",
        isAdmin: false,
      });
    }

    return res.json(user);
  } catch (error: any) {
    console.error("Error syncing user:", error);
    const errorMessage = error?.message || "Internal server error";
    const statusCode = error?.message?.includes("FIREBASE_SERVICE_ACCOUNT_KEY") ? 503 : 500;
    return res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? error?.stack : undefined
    });
  }
}
