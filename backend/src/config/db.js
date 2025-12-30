const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not defined in .env file");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("\n📋 Troubleshooting steps:");
    console.error("1. Check if your IP address is whitelisted in MongoDB Atlas:");
    console.error("   https://www.mongodb.com/docs/atlas/security-whitelist/");
    console.error("2. Verify your MONGO_URI in the .env file is correct");
    console.error("3. Check your MongoDB Atlas cluster is running");
    console.error("4. For development, you can whitelist 0.0.0.0/0 (allow all IPs) - NOT recommended for production\n");
    process.exit(1);
  }
};

module.exports = connectDB;
