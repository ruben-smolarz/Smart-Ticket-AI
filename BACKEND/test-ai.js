import dotenv from 'dotenv';
import analyzeTicket from './utils/ai.js';

dotenv.config();

const test = async () => {
    console.log("Testing connection with Gemini...");
    const result = await analyzeTicket({
        title: "Windows Blue Screen of Death",
        description: "My computer restarts unexpectedly showing a memory management error."
    });
    console.log("Result:", result);
};

test();