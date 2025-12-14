import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage, cors } from "./_lib/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      const { userId, medicationId, startDate, endDate } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const logs = await storage.getMedicationLogs(
        userId as string,
        medicationId as string,
        startDate as string,
        endDate as string
      );
      return res.json(logs);
    }

    if (req.method === "POST") {
      const log = await storage.createMedicationLog(req.body);
      return res.json(log);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
