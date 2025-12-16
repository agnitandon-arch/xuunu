import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getDb() {
  if (getApps().length === 0) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is required");
    }
    initializeApp({
      credential: cert(JSON.parse(serviceAccountKey)),
    });
  }
  return getFirestore();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const db = getDb();

    if (req.method === "GET") {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const snapshot = await db.collection("medicationLogs")
        .where("userId", "==", userId)
        .orderBy("takenAt", "desc")
        .limit(100)
        .get();

      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.json(logs);
    }

    if (req.method === "POST") {
      const { userId, medicationId, takenAt, scheduledTime, notes } = req.body;

      if (!userId || !medicationId) {
        return res.status(400).json({ error: "userId and medicationId are required" });
      }

      const docRef = await db.collection("medicationLogs").add({
        userId,
        medicationId,
        takenAt: takenAt || new Date().toISOString(),
        scheduledTime: scheduledTime || null,
        notes: notes || "",
        createdAt: new Date().toISOString(),
      });

      return res.status(201).json({ id: docRef.id, message: "Medication log created" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Medication logs API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
