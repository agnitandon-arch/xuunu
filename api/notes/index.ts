import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage, cors } from "../_lib/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "POST") {
      const { userId, content } = req.body;
      if (!userId || !content) {
        return res.status(400).json({ error: "userId and content are required" });
      }
      const note = await storage.createNote(req.body);
      return res.json(note);
    }

    if (req.method === "GET") {
      const userId = req.query.userId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const notes = await storage.getUserNotes(userId, limit);
      return res.json(notes);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
