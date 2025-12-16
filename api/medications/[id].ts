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
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const db = getDb();
    const id = req.query.id as string;
    const userId = req.query.userId as string;

    if (!id) {
      return res.status(400).json({ error: "id is required" });
    }

    if (req.method === "GET") {
      const doc = await db.collection("medications").doc(id).get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Medication not found" });
      }

      return res.json({ id: doc.id, ...doc.data() });
    }

    if (req.method === "DELETE") {
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const docRef = db.collection("medications").doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Medication not found" });
      }

      const data = doc.data();
      if (data?.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await docRef.update({ isActive: 0, updatedAt: new Date().toISOString() });

      return res.json({ message: "Medication deleted" });
    }

    if (req.method === "PATCH") {
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const docRef = db.collection("medications").doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Medication not found" });
      }

      const data = doc.data();
      if (data?.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { name, dosage, frequency, scheduledTimes, notes, isActive } = req.body;
      const updates: any = { updatedAt: new Date().toISOString() };

      if (name !== undefined) updates.name = name;
      if (dosage !== undefined) updates.dosage = dosage;
      if (frequency !== undefined) updates.frequency = frequency;
      if (scheduledTimes !== undefined) updates.scheduledTimes = scheduledTimes;
      if (notes !== undefined) updates.notes = notes;
      if (isActive !== undefined) updates.isActive = isActive;

      await docRef.update(updates);

      return res.json({ message: "Medication updated" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Medication API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
