import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 - this is critical for SSL issues
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
    console.error("Full error details:", err);
    process.exit(1);
  }
};

export default connectDB;