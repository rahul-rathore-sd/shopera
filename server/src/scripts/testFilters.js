import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";

async function testFilters() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  // 1. Price <= 2000
  const under2000 = await Product.countDocuments({ isPublished: true, basePrice: { $lte: 2000 } });
  console.log("1. Price <= 2000:", under2000, "products");

  // 2. Price 2000 - 5000
  const between2k5k = await Product.countDocuments({ isPublished: true, basePrice: { $gte: 2000, $lte: 5000 } });
  console.log("2. Price 2000 - 5000:", between2k5k, "products");

  // 3. Price >= 8000
  const above8k = await Product.countDocuments({ isPublished: true, basePrice: { $gte: 8000 } });
  console.log("3. Price >= 8000:", above8k, "products");

  // 4. Rating >= 4
  const rating4 = await Product.countDocuments({ isPublished: true, ratingsAverage: { $gte: 4 } });
  console.log("4. Rating >= 4:", rating4, "products");

  // 5. Tag: deals
  const deals = await Product.countDocuments({ isPublished: true, tags: { $in: ["deals"] } });
  console.log("5. Tag: deals:", deals, "products");

  // 6. Tag: sale
  const sale = await Product.countDocuments({ isPublished: true, tags: { $in: ["sale"] } });
  console.log("6. Tag: sale:", sale, "products");

  // 7. Tag: bestseller
  const bestseller = await Product.countDocuments({ isPublished: true, tags: { $in: ["bestseller"] } });
  console.log("7. Tag: bestseller:", bestseller, "products");

  // 8. Featured
  const featured = await Product.countDocuments({ isPublished: true, featured: true });
  console.log("8. Featured:", featured, "products");

  // 9. In Stock
  const inStock = await Product.countDocuments({ isPublished: true, stock: { $gt: 0 } });
  console.log("9. In Stock:", inStock, "products");

  // 10. Category Electronics
  const cat = await Category.findOne({ slug: "electronics" });
  const electronicsCount = await Product.countDocuments({ isPublished: true, category: cat._id });
  console.log("10. Category Electronics:", electronicsCount, "products");

  await mongoose.disconnect();
}

testFilters().catch(console.error);
