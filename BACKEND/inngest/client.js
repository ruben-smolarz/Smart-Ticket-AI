import { Inngest } from "inngest";
import dotenv from 'dotenv';

// Load environment variables to read the KEY
dotenv.config();

if (process.env.NODE_ENV !== "production") {
  delete process.env.INNGEST_SIGNING_KEY;
}

export const inngest = new Inngest({
    id: "ticketing-system",
    name: "SmartTicket AI",
    // THIS LINE WAS MISSING AND CAUSED THE ERROR:
    eventKey: process.env.INNGEST_EVENT_KEY,
    isDev: process.env.NODE_ENV !== "production",
});