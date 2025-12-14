import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage, cors } from "../_lib/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "POST") {
      const { userId, title, scheduledAt } = req.body;
      if (!userId || !title || !scheduledAt) {
        return res.status(400).json({ error: "userId, title, and scheduledAt are required" });
      }
      const reminder = await storage.createReminder(req.body);
      return res.json(reminder);
    }

    if (req.method === "GET") {
      const userId = req.query.userId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const reminders = await storage.getUserReminders(userId, limit);
      return res.json(reminders);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
