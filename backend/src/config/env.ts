// backend/src/config/env.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development'
  },
  database: {
    URI: process.env.MONGO_CONNECTION_STRING!,
    NAME: process.env.MONGO_DB_NAME || 'fluffyCare'
  },
  jwt: {
    SECRET: process.env.JWT_SECRET!,
    ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
    REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d'
  },
  client: {
    URL: process.env.CLIENT_URL || 'http://localhost:5173'
  },
  google: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!
  },
  cloudinary: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
    API_KEY: process.env.CLOUDINARY_API_KEY!,
    API_SECRET: process.env.CLOUDINARY_API_SECRET!
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'MONGO_CONNECTION_STRING',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}