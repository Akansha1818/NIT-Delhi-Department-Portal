import mongoose from "mongoose";

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    const MONGODB_URI = process.env.MONGODB_URL;

    if (!MONGODB_URI) {
        console.error("❌ MONGODB_URL is not defined in the environment variables.");
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB Connected");
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;