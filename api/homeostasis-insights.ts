import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

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
      return res.json({ insights: "AI insights are currently unavailable. Please check your OpenAI API configuration." });
    }

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

    return res.json({ insights });
  } catch (error) {
    console.error("Error generating insights:", error);
    return res.status(500).json({ error: "Failed to generate insights" });
  }
}
