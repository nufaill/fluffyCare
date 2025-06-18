import mongoose from "mongoose";

export async function initializeDatabase(): Promise<void> {
  const mongoUri: string | undefined = process.env.MONGO_CONNECTION_STRING;

  if (!mongoUri) {
    console.error("❌ MongoDB connection URI is missing in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGO_DB_NAME || undefined,
    });

    console.log("✅ Successfully connected to MongoDB.");
  } catch (connectionError) {
    console.error("❌ Failed to connect to MongoDB:", connectionError);
    process.exit(1);
  }
}
