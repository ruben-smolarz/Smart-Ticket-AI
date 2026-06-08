import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/users.js';
import ticketRoutes from './routes/tickets.js';
import { inngest } from "./inngest/client.js";
import { onSignup } from "./inngest/functions/on-signup.js";
import { onTicketCreated } from "./inngest/functions/on-ticket-create.js";
import { serve } from "inngest/express";
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

if (process.env.NODE_ENV !== "production") {
  delete process.env.INNGEST_SIGNING_KEY;
}

// Ensure port 5000 matches the frontend
const PORT = process.env.PORT || 5000; 

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes with API prefix
app.use("/api/auth", userRoutes);
app.use("/api/tickets", ticketRoutes);

// Inngest route
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onSignup, onTicketCreated],
    skipSignatureValidation: true,
  })
);

let mongoServer;

const connectDb = async () => {
  try {
    // Attempt to connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ MongoDB connected successfully to Atlas!");
  } catch (err) {
    console.warn("⚠️ MongoDB connection to Atlas failed. Starting In-Memory database fallback for local review...");
    try {
      mongoServer = await MongoMemoryServer.create();
      const localUri = mongoServer.getUri();
      await mongoose.connect(localUri);
      console.log("✅ In-Memory MongoDB connected successfully! (Local registration/login will work but data won't persist across restarts)");
    } catch (memErr) {
      console.error("❌ Failed to start In-Memory MongoDB:", memErr.message);
    }
  }
};

connectDb();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});