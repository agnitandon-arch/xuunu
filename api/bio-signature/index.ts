import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage, cors } from "../_lib/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "POST") {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const snapshot = await storage.createBioSignatureSnapshot(req.body);
      return res.json(snapshot);
    }

    if (req.method === "GET") {
      const userId = req.query.userId as string;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const snapshot = await storage.getLatestBioSignatureSnapshot(userId);
      return res.json(snapshot || null);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
