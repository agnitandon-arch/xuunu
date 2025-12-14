import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage, cors } from "../_lib/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Note ID is required" });
  }

  try {
    if (req.method === "GET") {
      const note = await storage.getNote(id);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      return res.json(note);
    }

    if (req.method === "PATCH") {
      const note = await storage.updateNote(id, req.body);
      return res.json(note);
    }

    if (req.method === "DELETE") {
      await storage.deleteNote(id);
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
