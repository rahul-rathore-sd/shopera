import "dotenv/config";
import mongoose from "mongoose";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";

const imageUrls = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  "https://images.unsplash.com/photo-1546435770-a3e426bf472b",
  "https://images.unsplash.com/photo-1556228578-8c89e6adf883",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
  "https://images.unsplash.com/photo-1560343090-f0409e92791a",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b",
];

const demoProducts = [
  ["Aurora Minimal Watch", "Accessories", "Northstar", 3499, 2799, 24],
  ["Metro Chronograph Watch", "Accessories", "Northstar", 5999, 4799, 16],
  ["CloudWalk Everyday Sneakers", "Footwear", "Stride Lab", 4299, 3499, 31],
  ["Terra Trail Running Shoes", "Footwear", "Stride Lab", 6499, 5299, 18],
  ["Canvas Weekend Backpack", "Bags", "Field Notes", 2499, 1999, 27],
  ["Commuter Laptop Backpack", "Bags", "Field Notes", 3999, 3199, 20],
  ["Linen Relaxed Shirt", "Fashion", "Atelier One", 1899, 1499, 42],
  ["Everyday Oxford Shirt", "Fashion", "Atelier One", 2299, 1799, 35],
  ["Classic Denim Jacket", "Fashion", "Atelier One", 3599, 2899, 19],
  ["Ribbed Cotton Hoodie", "Fashion", "Atelier One", 2799, 2199, 28],
  ["Stoneware Coffee Set", "Home & Living", "Hearth & Co", 1599, 1299, 22],
  ["Walnut Desk Organizer", "Home & Living", "Hearth & Co", 1199, 949, 34],
  ["Glow Table Lamp", "Home & Living", "Hearth & Co", 2899, 2399, 14],
  ["Aroma Soy Candle Set", "Home & Living", "Hearth & Co", 999, 799, 46],
  ["Pulse Wireless Headphones", "Electronics", "Signal Works", 7999, 6499, 12],
  ["Pocket Bluetooth Speaker", "Electronics", "Signal Works", 2999, 2399, 25],
  ["Focus Mechanical Keyboard", "Electronics", "Signal Works", 5499, 4499, 17],
  ["Everyday Ceramic Bottle", "Accessories", "Northstar", 899, 699, 51],
  ["Orbit Polarized Sunglasses", "Accessories", "Northstar", 1799, 1399, 29],
  ["Daily Journal Hardcover", "Books", "Paper & Pine", 699, 549, 60],
].map(([title, category, brand, basePrice, baseDiscountPrice, stock], index) => ({
  title,
  category,
  brand,
  basePrice,
  baseDiscountPrice,
  stock,
  imageUrl: `${imageUrls[index % imageUrls.length]}?auto=format&fit=crop&w=900&q=80`,
}));

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function getCategoryIds() {
  const categories = new Map();

  for (const categoryName of [...new Set(demoProducts.map((product) => product.category))]) {
    const category = await Category.findOneAndUpdate(
      { name: categoryName },
      {
        $setOnInsert: {
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
          description: `Demo ${categoryName.toLowerCase()} products`,
          isActive: true,
        },
      },
      { returnDocument: "after", upsert: true, runValidators: true }
    );
    categories.set(categoryName, category._id);
  }

  return categories;
}

async function seedDemoProducts() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const categoryIds = await getCategoryIds();
  let created = 0;
  let skipped = 0;

  const productsToInsert = [];
  for (const product of demoProducts) {
    const existingProduct = await Product.findOne({ title: product.title }).select("_id").lean();

    if (existingProduct) {
      skipped += 1;
      continue;
    }

    productsToInsert.push({
      title: product.title,
      slug: slugify(product.title),
      description: `A thoughtfully designed ${product.title.toLowerCase()} made for everyday use.`,
      brand: product.brand,
      category: categoryIds.get(product.category),
      images: [{ url: product.imageUrl, publicId: `demo/${slugify(product.title)}`, isPrimary: true }],
      basePrice: product.basePrice,
      baseDiscountPrice: product.baseDiscountPrice,
      stock: product.stock,
      tags: ["demo", product.category.toLowerCase(), product.brand.toLowerCase()],
      ratingsAverage: 4.2 + (created % 8) / 10,
      ratingsQuantity: 8 + created,
      isPublished: true,
      featured: productsToInsert.length < 6,
    });
  }

  if (productsToInsert.length > 0) {
    await Product.insertMany(productsToInsert, { ordered: true });
  }
  created = productsToInsert.length;

  console.log(`Demo product seed complete: ${created} created, ${skipped} already existed.`);
}

seedDemoProducts()
  .catch((error) => {
    console.error(`Demo product seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });