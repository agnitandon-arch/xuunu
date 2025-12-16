import { Router, Request, Response } from "express";
import OpenAI from "openai";
import { getFirestoreDb, toDate } from "../utils/firestore.js";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function calculateHomeostasis(healthData: any, environmentalData: any): number {
  let score = 0;
  let factors = 0;

  if (healthData.glucose) {
    const glucoseScore = Math.max(0, 100 - Math.abs(healthData.glucose - 100) * 0.8);
    score += glucoseScore;
    factors++;
  }

  if (healthData.hrv) {
    const hrvScore = Math.min(100, healthData.hrv * 1.5);
    score += hrvScore;
    factors++;
  }

  if (healthData.sleepHours) {
    const sleepScore = Math.min(100, healthData.sleepHours * 12.5);
    score += sleepScore;
    factors++;
  }

  if (healthData.heartRate) {
    const hrScore = healthData.heartRate >= 60 && healthData.heartRate <= 100 
      ? 100 - Math.abs(healthData.heartRate - 70) 
      : 50;
    score += hrScore;
    factors++;
  }

  if (environmentalData.aqi) {
    const aqiScore = Math.max(0, 100 - environmentalData.aqi * 0.5);
    score += aqiScore;
    factors++;
  }

  if (environmentalData.temperature) {
    const tempScore = environmentalData.temperature >= 65 && environmentalData.temperature <= 75 
      ? 100 
      : Math.max(0, 100 - Math.abs(environmentalData.temperature - 70) * 2);
    score += tempScore;
    factors++;
  }

  return factors > 0 ? Math.round(score / factors) : 0;
}

router.get("/calculate", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const db = getFirestoreDb();

    const healthSnapshot = await db.collection("healthEntries")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    const envSnapshot = await db.collection("environmentalReadings")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    const healthData = healthSnapshot.empty ? {} : healthSnapshot.docs[0].data();
    const environmentalData = envSnapshot.empty ? {} : envSnapshot.docs[0].data();

    const homeostasisLevel = calculateHomeostasis(healthData, environmentalData);

    return res.json({
      homeostasisLevel,
      healthData,
      environmentalData,
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error calculating homeostasis:", error);
    return res.status(500).json({ error: "Failed to calculate homeostasis" });
  }
});

router.post("/insights", async (req: Request, res: Response) => {
  try {
    const { userId, homeostasisLevel, healthData, environmentalData } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const prompt = `You are a health advisor for a diabetes and chronic illness tracking app. 
Based on the following data, provide a brief, personalized insight (2-3 sentences) about the user's current homeostasis level.

Homeostasis Level: ${homeostasisLevel}/100
Health Data: ${JSON.stringify(healthData)}
Environmental Data: ${JSON.stringify(environmentalData)}

Focus on:
- How their current metrics affect their body's balance
- One actionable suggestion to improve their homeostasis
- Be encouraging but realistic`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    const insights = response.choices[0]?.message?.content || "Unable to generate insights.";

    return res.json({ insights });
  } catch (error) {
    console.error("Error generating insights:", error);
    return res.status(500).json({ error: "Failed to generate insights" });
  }
});

export default router;
