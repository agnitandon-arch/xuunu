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

      const snapshot = await db.collection("medications")
        .where("userId", "==", userId)
        .where("isActive", "==", 1)
        .orderBy("createdAt", "desc")
        .get();

      const medications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.json(medications);
    }

    if (req.method === "POST") {
      const { userId, name, dosage, frequency, scheduledTimes, notes, isActive } = req.body;

      if (!userId || !name || !dosage || !frequency) {
        return res.status(400).json({ error: "userId, name, dosage, and frequency are required" });
      }

      const docRef = await db.collection("medications").add({
        userId,
        name,
        dosage,
        frequency,
        scheduledTimes: scheduledTimes || [],
        notes: notes || "",
        isActive: isActive ?? 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return res.status(201).json({ id: docRef.id, message: "Medication created" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Medications API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
