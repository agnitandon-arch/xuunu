import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage, cors } from "../_lib/storage.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Reminder ID is required" });
  }

  try {
    if (req.method === "GET") {
      const reminder = await storage.getReminder(id);
      if (!reminder) {
        return res.status(404).json({ error: "Reminder not found" });
      }
      return res.json(reminder);
    }

    if (req.method === "PATCH") {
      const reminder = await storage.updateReminder(id, req.body);
      return res.json(reminder);
    }

    if (req.method === "DELETE") {
      await storage.deleteReminder(id);
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
