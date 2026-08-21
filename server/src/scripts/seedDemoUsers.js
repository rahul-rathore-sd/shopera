import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../models/User.js";

const demoUsers = [
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

async function seedDemoUsers() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const usersToInsert = [];
  let skipped = 0;

  for (const demoUser of demoUsers) {
    const existingUser = await User.findOne({ email: demoUser.email }).select("_id").lean();

    if (existingUser) {
      skipped += 1;
      continue;
    }

    usersToInsert.push({
      ...demoUser,
      password: await bcrypt.hash(demoUser.password, 12),
      isVerified: true,
    });
  }

  if (usersToInsert.length > 0) {
    await User.insertMany(usersToInsert, { ordered: true });
  }

  console.log(`Demo user seed complete: ${usersToInsert.length} created, ${skipped} already existed.`);
}

seedDemoUsers()
  .then(() => {
    console.log("Admin login: admin@shopera.demo / Admin@12345");
    console.log("Customer login: customer@shopera.demo / Customer@12345");
  })
  .catch((error) => {
    console.error(`Demo user seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });