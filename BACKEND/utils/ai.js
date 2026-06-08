import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ 
  vertexai: false,
  apiKey: process.env.GEMINI_API_KEY 
});

const analyzeTicket = async (ticket) => {
  const modelsToTry = [ 
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash-lite"
  ];

  const prompt = `
    You are an IT support AI. Analyze this ticket.
    Ticket Title: "${ticket.title}"
    Ticket Description: "${ticket.description}"

    Return ONLY a JSON object with these 4 fields:
    1. "summary": A short summary (string).
    2. "priority": One of "Low", "Medium", "High" (string).
    3. "helpfulNotes": Short technical advice (string).
    4. "skills": Array of technical skills (strings).

    IMPORTANT: Return raw JSON only. No markdown.
  `;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Attempting to connect with model: ${modelName}...`);
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      let text = "";
      if (response.text && typeof response.text === 'string') text = response.text;
      else if (typeof response.text === 'function') text = response.text();
      else if (response.candidates?.[0]?.content?.parts?.[0]?.text) text = response.candidates[0].content.parts[0].text;

      if (text) {
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        
        console.log(`✅ SUCCESS! Analysis completed with ${modelName}`);
        
        // --- HERE IS THE MAGIC ---
        // Map the AI response (skills) to what your DB uses (relatedSkills)
        return {
            summary: parsed.summary,
            priority: parsed.priority,
            helpfulNotes: parsed.helpfulNotes,
            // Guarantee that relatedSkills always has data
            relatedSkills: parsed.skills || parsed.relatedSkills || [] 
        };
      }

    } catch (error) {
      const errorMsg = error.message ? error.message.split('\n')[0] : "Unknown error";
      console.warn(`⚠️ Failed ${modelName}: ${errorMsg}... Trying next model.`);
    }
  }

  // --- FALLBACK (PLAN B) ---
  console.log("❌ All models failed. Using local fallback.");
  
  const isUrgent = ticket.title.toLowerCase().includes("error") || ticket.title.toLowerCase().includes("urgent");
  return {
    summary: `Automated analysis: ${ticket.title}`,
    priority: isUrgent ? "High" : "Medium",
    helpfulNotes: "AI service busy. A preliminary analysis has been generated.",
    relatedSkills: ["General Support", "Manual Review"] // We use relatedSkills here as well
  };
};

export default analyzeTicket;