import mongoose from "mongoose";

import { env } from "./env.js";

export async function connectDatabase() {
  try {
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected.");
  } catch (error) {
    console.error(
      "MongoDB connection failed. Start MongoDB or update MONGODB_URI.",
    );

    console.error(error);

    process.exit(1);
  }
}
