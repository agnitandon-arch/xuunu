import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: "lat and lon are required" });
    }

    const apiKey = process.env.AIRNOW_API_KEY;
    
    if (!apiKey) {
      return res.json({ aqi: null, message: "AirNow API key not configured" });
    }

    const response = await fetch(
      `https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${lat}&longitude=${lon}&distance=50&API_KEY=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("AirNow API failed");
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      const pm25 = data.find((d: any) => d.ParameterName === "PM2.5");
      const ozone = data.find((d: any) => d.ParameterName === "O3");
      
      return res.json({
        aqi: pm25?.AQI || ozone?.AQI || null,
        category: pm25?.Category?.Name || ozone?.Category?.Name || null,
        pm25: pm25?.AQI || null,
        ozone: ozone?.AQI || null
      });
    }

    return res.json({ aqi: null, message: "No data available for location" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
