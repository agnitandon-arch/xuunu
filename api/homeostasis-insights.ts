import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
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

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, homeostasisLevel, healthData, environmentalData } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.json({ insights: "AI insights are currently unavailable. Please check your OpenAI API configuration.", cached: false });
    }

    const db = getDb();
    const today = getTodayDateString();
    const cacheDocId = `${userId}_${today}`;
    const cacheRef = db.collection("homeostasisInsightsCache").doc(cacheDocId);
    
    // Check for existing cached insight for today
    const cachedDoc = await cacheRef.get();
    
    if (cachedDoc.exists) {
      const cachedData = cachedDoc.data();
      return res.json({ 
        insights: cachedData?.insights || "Cached insight unavailable.",
        cached: true,
        cachedAt: cachedData?.createdAt,
        message: "Using cached insight (limit: 1 AI call per day)"
      });
    }

    // Generate new insight via OpenAI
    const prompt = `You are a health advisor for a diabetes and chronic illness tracking app called Xuunu. 
Based on the following data, provide a brief, personalized insight (2-3 sentences) about the user's current homeostasis level.

Homeostasis Level: ${homeostasisLevel}/100
Health Data: ${JSON.stringify(healthData)}
Environmental Data: ${JSON.stringify(environmentalData)}

Focus on:
- How their current metrics affect their body's balance
- One actionable suggestion to improve their homeostasis
- Be encouraging but realistic
- Keep the response concise and actionable`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    const insights = response.choices[0]?.message?.content || "Unable to generate insights.";

    // Cache the insight for today
    await cacheRef.set({
      userId,
      insights,
      homeostasisLevel,
      healthDataSnapshot: healthData,
      environmentalDataSnapshot: environmentalData,
      createdAt: new Date().toISOString(),
      date: today,
    });

    return res.json({ insights, cached: false });
  } catch (error: any) {
    console.error("Error generating insights:", error);
    
    // Handle OpenAI quota/rate limit errors gracefully
    if (error?.code === 'insufficient_quota' || error?.status === 429) {
      return res.json({ 
        insights: "AI insights are temporarily unavailable due to API limits. Please try again later.",
        cached: false,
        error: "quota_exceeded"
      });
    }
    
    return res.status(500).json({ error: "Failed to generate insights" });
  }
}
