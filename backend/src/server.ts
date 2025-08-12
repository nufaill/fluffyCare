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
import { swaggerUi, swaggerSpec } from './config/swagger';
import { morganLogger } from "./config/logs";
import { initializeSocket } from './shared/socket.io-handler';
import { createServer } from "http";


dotenv.config();

const app = express();
const server = createServer(app);
// Initialize Socket.IO
const socketHandler = initializeSocket(server);

async function startApp(): Promise<void> {
  await initializeDatabase();

  app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }));

  app.use(express.json());
  app.use(cookieParser());
  app.use(morganLogger);

  if (process.env.NODE_ENV !== "production") {
    const morgan = await import("morgan");
    app.use(morgan.default("dev"));
  }

  // Routes
  app.use("/auth", authRoutes);
  app.use("/user", userRoutes);
  app.use("/shop", shopRoutes);
  app.use("/admin", adminRoutes);
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "FluffyCare API Documentation"
  }));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
}

startApp().catch((err) => {
  console.error("❌ Failed to start the app:", err);
});