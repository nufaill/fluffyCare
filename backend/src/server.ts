import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import "reflect-metadata";
import { initializeDatabase } from "@config/connectDB"; 
import authRoutes from './routes/auth.route';

dotenv.config(); 

const app = express();

async function startApp(): Promise<void> {
  await initializeDatabase();

  // Middleware for cross-origin resource sharing
  app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", 
    credentials: true, // allow cookies and headers
  }));

  // Middleware to parse JSON and cookies
  app.use(express.json());
  app.use(cookieParser());

  // Routes
  app.use("/user", authRoutes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startApp().catch((err) => {
  console.error("❌ Failed to start the app:", err);
});
