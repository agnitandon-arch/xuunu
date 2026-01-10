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
    const { lat, lon, lng } = req.query;
    // Support both 'lon' and 'lng' for compatibility
    const longitude = lon || lng;

    if (!lat || !longitude) {
      return res.status(400).json({ error: "lat and lng/lon are required" });
    }

    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${longitude}&localityLanguage=en`
    );

    if (!response.ok) {
      throw new Error("Geocoding API failed");
    }

    const data = await response.json();
    // Format location string for display
    const city = data.city || data.locality || "Unknown";
    const state = data.principalSubdivision || null;
    const country = data.countryName || "Unknown";
    const formatted = state 
      ? `${city}, ${state}` 
      : `${city}, ${country}`;
    
    return res.json({
      city: city,
      country: country,
      state: state,
      formatted: formatted
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
