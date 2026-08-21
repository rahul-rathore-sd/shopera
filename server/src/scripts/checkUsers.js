import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/User.js";

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({}, "name email role password");
  console.log("Total users in DB:", users.length);
  for (const u of users) {
    const isPwMatchAdmin = await u.isPasswordCorrect("Admin@12345");
    const isPwMatchCust = await u.isPasswordCorrect("Customer@12345");
    console.log(`User: ${u.email} [${u.role}] -> Admin@12345: ${isPwMatchAdmin}, Customer@12345: ${isPwMatchCust}`);
  }
  await mongoose.disconnect();
}
check().catch(console.error);
