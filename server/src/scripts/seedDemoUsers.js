import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/User.js";

export const demoUsers = [
  {
    name: "Shopera Admin",
    email: "admin@shopera.demo",
    password: "Admin@12345",
    role: "admin",
  },
  {
    name: "Demo Customer",
    email: "customer@shopera.demo",
    password: "Customer@12345",
    role: "customer",
  },
];

export async function seedDemoUsers({ isStandalone = false, forceReset = false } = {}) {
  if (!process.env.MONGO_URI && mongoose.connection.readyState === 0) {
    throw new Error("MONGO_URI is not configured");
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  for (const demoUser of demoUsers) {
    const existingUser = await User.findOne({ email: demoUser.email }).select("+password");

    if (existingUser) {
      if (forceReset) {
        existingUser.password = demoUser.password;
        existingUser.role = demoUser.role;
        existingUser.isVerified = true;
        await existingUser.save();
      }
    } else {
      const user = new User({
        name: demoUser.name,
        email: demoUser.email,
        password: demoUser.password,
        role: demoUser.role,
        isVerified: true,
      });
      await user.save();
    }
  }

  console.log("✓ Demo users verified in DB (admin@shopera.demo / customer@shopera.demo)");

  if (isStandalone) {
    await mongoose.disconnect();
    console.log("✓ MongoDB Disconnected");
  }
}

if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("seedDemoUsers.js")) {
  seedDemoUsers({ isStandalone: true, forceReset: true })
    .then(() => {
      console.log("Admin login: admin@shopera.demo / Admin@12345");
      console.log("Customer login: customer@shopera.demo / Customer@12345");
    })
    .catch((error) => {
      console.error(`Demo user seed failed: ${error.message}`);
      process.exitCode = 1;
    });
}