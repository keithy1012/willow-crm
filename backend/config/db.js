import mongoose from "mongoose";
import { logEvent } from "../utils/logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log("✅ MongoDB Connected");
    logEvent(
      "MongoDB Connection",
      `Server successfully connected to MongoDB`,
      `SERVER`,
      `SERVER`
    );
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
    console.error("Full error details:", err);
    logEvent(
      "MongoDB Connection",
      `Server failed to connect to MongoDB`,
      `Server`
    );
    process.exit(1);
  }
};

export default connectDB;
