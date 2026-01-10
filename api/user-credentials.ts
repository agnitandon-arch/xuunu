import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage, cors } from "./_lib/storage.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const credentials = await storage.getUserApiCredentials(userId);
      return res.json(credentials || {});
    }

    if (req.method === "POST" || req.method === "PUT") {
      const { userId, ...credentials } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const result = await storage.upsertUserApiCredentials(userId, credentials);
      return res.json(result);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("User credentials API error:", error);
    const errorMessage = error?.message || "Internal server error";
    const statusCode = error?.message?.includes("FIREBASE_SERVICE_ACCOUNT_KEY") ? 503 : 500;
    return res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? error?.stack : undefined
    });
  }
}
