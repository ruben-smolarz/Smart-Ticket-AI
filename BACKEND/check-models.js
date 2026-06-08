import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  console.log("🔍 Searching for CHAT models available in your account...");
  
  try {
    const response = await ai.models.list();
    
    console.log("\n👇 USE ONE OF THESE NAMES IN YOUR CODE 👇");
    console.log("==========================================");
    
    // Filter to hide 'embedding' and 'aqa' models that are not needed
    const chatModels = [];
    for await (const model of response) {
      if (
        (model.supportedActions?.includes("generateContent") || model.supportedGenerationMethods?.includes("generateContent")) &&
        model.name.includes("gemini")
      ) {
        chatModels.push(model);
      }
    }

    if (chatModels.length === 0) {
        console.log("❌ You do not have chat models enabled. Create a new API Key.");
    }

    chatModels.forEach(model => {
      // Clean up the name for easy copying
      console.log(`✅ ${model.name.replace('models/', '')}`);
    });
    console.log("==========================================");

  } catch (error) {
    console.error("❌ Connection error:", error.message);
  }
}

main();