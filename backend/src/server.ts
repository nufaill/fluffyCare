import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import "reflect-metadata";
import { initializeDatabase } from "@config/connectDB";
import authRoutes from './routes/auth.route'; 
import userRoutes from './routes/user.route'; 
import shopRoutes from './routes/shop.route';
import adminRoutes from './routes/admin.route';

dotenv.config();

const app = express();

async function startApp(): Promise<void> {
  await initializeDatabase();

  app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, 
  }));

  // Middleware to parse JSON and cookies
  app.use(express.json());
  app.use(cookieParser());

  // Routes
  app.use("/auth", authRoutes);
  app.use("/user", userRoutes);
  app.use("/shop", shopRoutes);
  app.use("/admin", adminRoutes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startApp().catch((err) => {
  console.error("❌ Failed to start the app:", err);
});
