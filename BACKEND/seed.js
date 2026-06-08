import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import User from './models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
  try {
    // Connect to the database (Atlas or local in-memory)
    // Note: If the backend is running, it connects to the same database.
    // Since the backend runs in memory if Atlas fails, we run this via an HTTP request
    // so that it registers in the active in-memory database of the backend server.
    
    console.log("🌱 Starting registration of test users...");
    
    const register = async (name, email, password, role, skills) => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role, skills })
        });
        const data = await res.json();
        if (res.ok) {
          console.log(`✅ Registered successfully: ${name} (${email})`);
        } else {
          console.log(`⚠️ Registration failed for ${name}:`, data.message || data);
        }
      } catch (e) {
        console.error(`❌ Error connecting to the server to register ${name}:`, e.message);
      }
    };

    // Register a moderator with technical skills
    await register(
      "John Moderator", 
      "john@moderator.com", 
      "Password123", 
      "moderator", 
      ["Windows", "Memory", "Hardware", "Support"]
    );

    // Register a standard user
    await register(
      "Alice User", 
      "alice@user.com", 
      "Password123", 
      "user", 
      []
    );

    console.log("🌱 Seed process completed.");
  } catch (error) {
    console.error("❌ Error in seed script:", error);
  }
};

seed();
