import "dotenv/config";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import { autoSeedIfEmpty } from "./src/scripts/seedProducts.js";
import { seedDemoUsers } from "./src/scripts/seedDemoUsers.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(async () => {
    await autoSeedIfEmpty();
    await seedDemoUsers({ isStandalone: false, forceReset: false });
    app.listen(PORT, () => {
      console.log(`Shopera server running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });